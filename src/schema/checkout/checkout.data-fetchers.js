import { ApolloError } from 'apollo-server-express';
import mysqlDataConnector from '../../data-connectors/mysql';
import { checkoutTableVariablesMap, errors, mappedQueryFields } from './checkout.constants';

/**
 * Writing highly optimized database query strings from user input can become heavy on business logic.
 * Our example query is fairly basic, but this function has the potential to become quite large.
 * As the query string builder grows in size, you're going to want to continue to abstract when pertinent and be certain to cover this logic with good test
 * coverage.
 */
function getQueryStr(args) {
  let queryStr = `select ${mappedQueryFields} from checkouts`;

  /**
   * The args variable are the arguments passed by the user to the GraphQL server.
   * When arguments are passed, we'll want to modify our database query to return only the requested results.
   * Any time user arguments are passed to a database query, they must first be sanitized.
   * Different database drivers have different methods for sanitizing input, but for the MySQL library that we are using, the `format` method is used.
   * To ensure the ordering of arguments in the where clause match up with the passed values, we can use Object.entries().
   */
  const argEntries = Object.entries(args);
  if (argEntries.length > 0) {
    const filters = argEntries.map((arg) => {
      if (arg[1] === null) {
        return `${checkoutTableVariablesMap[arg[0]]} IS NULL`;
      }
      return `${checkoutTableVariablesMap[arg[0]]}=?`;
    });
    const whereClause = `WHERE ${(filters).join(' AND ')}`;
    queryStr = mysqlDataConnector.format(`${queryStr} ${whereClause}`, argEntries.map(arg => arg[1]));
  }
  return queryStr;
}

async function isAssetCheckedOut(assetUpc) {
  const isCheckedOutQuery = mysqlDataConnector.format('SELECT count(*) AS row_count FROM checkouts WHERE asset_upc=? and checkin_date IS NULL', assetUpc);
  const isCheckedOutResults = await mysqlDataConnector.pool.query(isCheckedOutQuery);
  return isCheckedOutResults[0].row_count > 0;
}

export async function getCheckouts(root, args) {
  const query = getQueryStr(args);
  const queryResults = await mysqlDataConnector.pool.query(query);
  return queryResults;
}

export async function getCheckoutByAssetUpc(assetUpc, restrictToCurrentlyCheckedOut) {
  const queryFilter = { assetUpc };
  if (restrictToCurrentlyCheckedOut) {
    queryFilter.checkinDate = null;
  }
  const query = `${getQueryStr(queryFilter)} ORDER BY checkoutDate DESC`;
  const queryResults = await mysqlDataConnector.pool.query(query);
  return queryResults;
}

export async function getCheckoutsByAssetUpcs(assetUpcs, restrictToCurrentlyCheckedOut) {
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
}

export async function getCheckoutByPatronEmail(userEmail, restrictToCurrentlyCheckedOut) {
  const queryFilter = { userEmail };
  if (restrictToCurrentlyCheckedOut) {
    queryFilter.checkinDate = null;
  }
  const query = `${getQueryStr(queryFilter)} ORDER BY checkoutDate DESC`;
  const queryResults = await mysqlDataConnector.pool.query(query);
  return queryResults;
}

export async function getCheckoutsByPatronEmails(userEmails, restrictToCurrentlyCheckedOut) {
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
}

export async function checkoutAsset(root, args) {
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
    return queryResults[0];
  }

  /**
   * If for some reason, the insert query did not affect any rows, we will want to send the client an error.
   */
  return new ApolloError(errors.assetCheckoutFailed.message, errors.assetCheckoutFailed.code);
}

export async function checkinAsset(root, args) {
  const findCheckoutQuery = mysqlDataConnector.format('SELECT row_id FROM checkouts WHERE asset_upc=? and checkin_date IS NULL', args.assetUpc);
  const checkouts = await mysqlDataConnector.pool.query(findCheckoutQuery);
  if (checkouts.length === 0) {
    return new ApolloError(errors.assetNoCheckout.message, errors.assetNoCheckout.code);
  }
  const checkInQuery = mysqlDataConnector.format('UPDATE checkouts SET checkin_date = NOW() WHERE row_id=?', checkouts[0].row_id);
  await mysqlDataConnector.pool.query(checkInQuery);
  const verifyQuery = mysqlDataConnector.format(`SELECT ${mappedQueryFields} FROM checkouts WHERE row_id=?`, checkouts[0].row_id);
  const results = await mysqlDataConnector.pool.query(verifyQuery);
  return results[0];
}
