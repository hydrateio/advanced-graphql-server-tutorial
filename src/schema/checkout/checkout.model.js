import { ApolloError } from 'apollo-server-express';
import mysqlDataConnector from '../../data-connectors/mysql';
import { checkoutTableVariablesMap, errors, mappedQueryFields } from './checkout.constants';
import { getQueryId } from '../utils';
import { isCacheAvailable, queryCache, cacheResults } from '../cache';

/**
 * Writing highly optimized database query strings from user input can become heavy on business logic.
 * Our example query is fairly basic, but this function has the potential to become quite large.
 * As the query string builder grows in size, you're going to want to continue to abstract when pertinent and be certain to cover this logic with good test
 * coverage.
 */
function getQueryStr(args) {
  const queryStr = `select ${mappedQueryFields} from checkouts`;
  const filterKeys = Object.keys(checkoutTableVariablesMap);

  const filters = [];
  let sorters = [{ field: 'checkoutDate', direction: 'ASC' }];
  let limit;
  Object.entries(args).forEach((arg) => {
    const [key, value] = arg;
    switch (key) {
      case 'next':
        limit = parseInt(value, 10);
        break;
      case 'cursor':
        filters.push({
          key: 'checkout_date',
          comparison: args.sort && args.sort[0].field === 'checkoutDate' && args.sort[0].direction === 'DESC' ? '<' : '>',
          value: `STR_TO_DATE(${mysqlDataConnector.escape(value)}, '%Y-%m-%dT%T')`,
        });
        break;
      case 'sort':
        sorters = value.map(sort => ({
          field: mysqlDataConnector.escapeId(sort.field),
          direction: sort.direction === 'DESC' ? 'DESC' : 'ASC',
        }));
        break;
      default:
        if (filterKeys.includes(key)) {
          filters.push({
            key: mysqlDataConnector.escapeId(checkoutTableVariablesMap[key]),
            comparison: value === null ? '' : '=',
            value: value === null ? ' IS NULL' : mysqlDataConnector.escape(value),
          });
        }
        break;
    }
  });

  const filterStr = filters.length > 0 ? `WHERE ${filters.map(filter => `${filter.key}${filter.comparison}${filter.value}`).join(' AND ')}` : '';
  const orderByStr = `ORDER BY ${sorters.map(sort => `${sort.field} ${sort.direction}`).join(', ')}`;
  const limitStr = limit && !Number.isNaN(limit) ? `LIMIT ${limit}` : '';
  return `${queryStr} ${filterStr} ${orderByStr} ${limitStr}`;
}

async function isAssetCheckedOut(assetUpc) {
  const isCheckedOutQuery = mysqlDataConnector.format('SELECT count(*) AS row_count FROM checkouts WHERE asset_upc=? and checkin_date IS NULL', assetUpc);
  const isCheckedOutResults = await mysqlDataConnector.pool.query(isCheckedOutQuery);
  return isCheckedOutResults[0].row_count > 0;
}

const CheckOut = {

  getCheckouts: async (root, args) => {
    const query = getQueryStr(args);
    const queryResults = await mysqlDataConnector.pool.query(query);
    return queryResults;
  },

  checkoutAsset: async (root, args, context) => {
    /**
     * Before performing some mutations, we may want to perform an additional check to make certain that the mutation is a valid request.
     */
    const assetIsCheckedOut = await isAssetCheckedOut(args.assetUpc);
    if (assetIsCheckedOut) {
      /**
       * Apollo Server provides an ApolloError class to help format responses.
       * We can sent a message as well as an error code back to the client letting them know why their mutation was not completed
       * Since it doesn't make sense to have a single asset be checked out from the library by different people at the same time, we return an error.
       */
      return new ApolloError(errors.assetDuplicateCheckout.message, errors.assetDuplicateCheckout.code);
    }

    /**
     * Here we create the query that will update our database and return the results
     * Different databases have different mechanisms for returning results of the previous insert query.
     * The MySQL driver we are using only returns information about the query, but not information about the data added in the insert query.
     * For MySQL we will check if the insert query affected any rows and then run another query to fetch the inserted results.
     */
    const insertQuery = mysqlDataConnector.format('INSERT INTO checkouts (asset_upc, user_email) VALUES (?, ?);', [args.assetUpc, args.userEmail]);
    const insertResults = await mysqlDataConnector.pool.query(insertQuery);
    if (insertResults.affectedRows === 1) {
      const newRowQuery = mysqlDataConnector.format(`SELECT ${mappedQueryFields} FROM checkouts WHERE asset_upc=? AND checkin_date IS NULL`, args.assetUpc);
      const queryResults = await mysqlDataConnector.pool.query(newRowQuery);
      context.pubsub.kafka.publish('checkout', queryResults[0]);
      return queryResults[0];
    }

    /**
     * If for some reason, the insert query did not affect any rows, we will want to send the client an error.
     */
    return new ApolloError(errors.assetCheckoutFailed.message, errors.assetCheckoutFailed.code);
  },

  checkinAsset: async (root, args, context) => {
    const findCheckoutQuery = mysqlDataConnector.format('SELECT row_id FROM checkouts WHERE asset_upc=? and checkin_date IS NULL', args.assetUpc);
    const checkouts = await mysqlDataConnector.pool.query(findCheckoutQuery);
    if (checkouts.length === 0) {
      return new ApolloError(errors.assetNoCheckout.message, errors.assetNoCheckout.code);
    }
    const checkInQuery = mysqlDataConnector.format('UPDATE checkouts SET checkin_date = NOW() WHERE row_id=?', checkouts[0].row_id);
    await mysqlDataConnector.pool.query(checkInQuery);
    const verifyQuery = mysqlDataConnector.format(`SELECT ${mappedQueryFields} FROM checkouts WHERE row_id=?`, checkouts[0].row_id);
    const results = await mysqlDataConnector.pool.query(verifyQuery);
    context.pubsub.kafka.publish('checkin', results[0]);
    return results[0];
  },

  getCheckoutByAssetUpc: async (assetUpc, restrictToCurrentlyCheckedOut) => {
    const queryFilter = { assetUpc };
    if (restrictToCurrentlyCheckedOut) {
      queryFilter.checkinDate = null;
    }
    const query = `${getQueryStr(queryFilter)} ORDER BY checkoutDate DESC`;
    const queryResults = await mysqlDataConnector.pool.query(query);
    return queryResults;
  },

  getCheckoutByPatronEmail: async (userEmail, restrictToCurrentlyCheckedOut) => {
    const queryFilter = { userEmail };
    if (restrictToCurrentlyCheckedOut) {
      queryFilter.checkinDate = null;
    }
    const query = `${getQueryStr(queryFilter)} ORDER BY checkoutDate DESC`;
    const queryResults = await mysqlDataConnector.pool.query(query);
    return queryResults;
  },

  getCheckoutFeed: async (root, args) => {
    const buildQueryArgs = { ...args };
    if (buildQueryArgs.next) {
      delete buildQueryArgs.next;
    }
    if (buildQueryArgs.cursor) {
      delete buildQueryArgs.cursor;
    }
    const user = 'REPLACE WITH WITH USER FROM CONTEXT IN LATER LESSON';
    const queryId = getQueryId(buildQueryArgs, user);
    const hasCache = await isCacheAvailable(queryId);
    if (!hasCache) {
      const query = getQueryStr(buildQueryArgs);
      const queryResults = await mysqlDataConnector.pool.query(query);
      await cacheResults(queryId, queryResults.map(row => ({ ...row, id: row.id.toString() })));
    }
    const response = await queryCache(queryId, args.cursor, args.next);
    const { entries, pageInfo } = response;
    return {
      pageInfo: {
        queryId,
        currentCursor: args.cursor,
        startEntryIndex: pageInfo.startEntryIndex,
        endEntryIndex: pageInfo.startEntryIndex + entries.length - 1,
        totalEntries: pageInfo.totalEntries,
        hasPreviousPage: pageInfo.startEntryIndex > 0,
        hasNextPage: pageInfo.startEntryIndex + entries.length < pageInfo.totalEntries,
      },
      entries,
    };
  },

  getCheckoutsByAssetUpcs: async (assetUpcs, restrictToCurrentlyCheckedOut) => {
    let filter = 'asset_upc IN (?)';
    if (restrictToCurrentlyCheckedOut) {
      filter = `${filter} AND checkin_date IS NULL`;
    }
    const queryStr = `SELECT ${mappedQueryFields} FROM checkouts WHERE ${filter} ORDER BY checkoutDate DESC`;
    const query = mysqlDataConnector.format(queryStr, [assetUpcs]);
    const queryResults = await mysqlDataConnector.pool.query(query);
    const assetMap = queryResults.reduce((map, result) => {
      if (!map[result.assetUpc]) {
        map[result.assetUpc] = [];
      }
      map[result.assetUpc].push(result);
      return map;
    }, {});
    return assetUpcs.map(upc => assetMap[upc]);
  },

  getCheckoutsByPatronEmails: async (userEmails, restrictToCurrentlyCheckedOut) => {
    let filter = 'user_email IN (?)';
    if (restrictToCurrentlyCheckedOut) {
      filter = `${filter} AND checkin_date IS NULL`;
    }
    const queryStr = `SELECT ${mappedQueryFields} FROM checkouts WHERE ${filter} ORDER BY checkoutDate DESC`;
    const query = mysqlDataConnector.format(queryStr, [userEmails]);
    const queryResults = await mysqlDataConnector.pool.query(query);
    const userEmailMap = queryResults.reduce((map, result) => {
      if (!map[result.userEmail]) {
        map[result.userEmail] = [];
      }
      map[result.userEmail].push(result);
      return map;
    }, {});
    return userEmails.map(email => userEmailMap[email]);
  },
};

export default CheckOut;
