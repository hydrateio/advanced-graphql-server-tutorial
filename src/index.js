import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import mysqlDataConnector from './data-connectors/mysql';
import env from './env';

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    checkouts(userEmail: String, assetUpc: String): [CheckOut]
  }

  type CheckOut {
    userEmail: String!
    assetUpc: String!
    checkoutDate: String!
    checkinDate: String
  }
`;

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

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    checkouts: async (root, args) => {
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
      const queryResults = await mysqlDataConnector.pool.query(queryStr);
      return queryResults;
    },
  },
  CheckOut: {
    checkinDate: (checkout) => {
      if (checkout.checkinDate instanceof Date) {
        return checkout.checkinDate.toISOString();
      }
      return null;
    },
    checkoutDate: checkout => checkout.checkoutDate.toISOString(),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

// eslint-disable-next-line no-console
app.listen({ port: env.GRAPHQL_SERVER_PORT }, () => console.log(`🚀 Server ready at http://localhost:${env.GRAPHQL_SERVER_PORT}${server.graphqlPath}`));
