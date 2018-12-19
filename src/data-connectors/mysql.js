import mysql from 'mysql';
import { promisify } from 'util';
import env from '../env';

/**
 * This file abstracts out the MySQL connection implementation into an ES6 class singleton that can be imported
 * from anywhere in the codebase to maintain a single pool instance.
 */
class MySQLDataConnector {
  constructor() {
    /**
     * When connecting to any database, we want to be sure to use connection pooling.
     * You can learn more about connection pooling from https://en.wikipedia.org/wiki/Connection_pool.
     */
    const poolConfig = {
      connectionLimit: env.MYSQL_CONNECTION_POOL_LIMIT || 10,
      host: env.MYSQL_HOST,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      timezone: env.MYSQL_TIMEZONE,
    };

    this.currentConnections = [];
    this.pool = mysql.createPool(poolConfig);

    /**
     * In order to provide async/await support, we can wrap the methods provided by the mysql package with Node.js util.promisify.
     * This will help with code readability and maintainability.
     */
    this.pool.query = promisify(this.pool.query);
    this.pool.end = promisify(this.pool.end);
    this.pool.getConnection = promisify(this.pool.getConnection);

    this.pool.on('acquire', (connection) => {
      this.currentConnections.push(connection.threadId);
    });
    this.pool.on('release', (connection) => {
      this.currentConnections.splice(this.currentConnections.indexOf(connection.threadId), 1);
    });

    this.format = mysql.format;
    this.escapeId = mysql.escapeId;
    this.escape = mysql.escape;
  }

  get query() {
    return this.pool.query;
  }

  async closeAllConnections(retryAttempts = 0) {
    if (this.currentConnections.length > 0 && retryAttempts < 5) {
      console.log(`Waiting for ${this.currentConnections.length} MySQL connections to complete queries.`);
      setTimeout(this.closeAllConnection(retryAttempts + 1), 500);
    } else {
      await this.pool.end();
      console.log('all mysql connections closed');
    }
  }


  async getConnection() {
    let connection;
    try {
      connection = await this.pool.getConnection();
    } catch (e) {
      throw e;
    }
    connection.query = promisify(connection.query);
    connection.release = promisify(connection.release);
    return connection;
  }
}

export default new MySQLDataConnector();
