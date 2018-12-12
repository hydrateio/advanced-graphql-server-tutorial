import mysqlDataConnector from '../../data-connectors/mysql';

/**
 * Our database column names don't always match up with our GraphQL type property names.
 * Here we create a map used to convert one to the other.
 */
const checkoutTableVariablesMap = {
  userEmail: 'user_email',
  assetUpc: 'asset_upc',
  checkoutDate: 'checkout_date',
  checkinDate: 'checkin_date',
};

/**
 * Writing highly optimized database query strings from user input can become heavy on business logic.
 * Our example query is fairly basic, but this function has the potential to become quite large.
 * As the query string builder grows in size, you're going to want to continue to abstract when pertinent and be certain to cover this logic with good test
 * coverage.
 */
function getQueryStr(args) {
  /**
   * First we create our query string mapping table column names to the names of our type declaration.
   */
  const requestedMySQLFields = Object.keys(checkoutTableVariablesMap).map(key => `${checkoutTableVariablesMap[key]} as ${key}`);
  let queryStr = `select ${requestedMySQLFields.join(',')} from checkouts`;

  /**
   * The args variable are the arguments passed by the user to the GraphQL server.
   * When arguments are passed, we'll want to modify our database query to return only the requested results.
   * Any time user arguments are passed to a database query, they must first be sanitized.
   * Different database drivers have different methods for sanitizing input, but for the MySQL library that we are using, the `format` method is used.
   * To ensure the ordering of arguments in the where clause match up with the passed values, we can use Object.entries().
   */
  const argEntries = Object.entries(args);
  if (argEntries.length > 0) {
    const whereClause = `WHERE ${argEntries.map(arg => `${checkoutTableVariablesMap[arg[0]]}=?`).join(' AND ')}`;
    queryStr = mysqlDataConnector.format(`${queryStr} ${whereClause}`, argEntries.map(arg => arg[1]));
  }
  return queryStr;
}

/**
 * With our query string builder abstracted, our resolver method becomes much more manageable.
 */
export async function getCheckouts(root, args) {
  const queryStr = getQueryStr(args);
  const queryResults = await mysqlDataConnector.pool.query(queryStr);
  return queryResults;
}
