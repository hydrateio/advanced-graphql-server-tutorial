import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';

const checkouts = [
  {
    userEmail: 'dbernath27@jalbum.net',
    assetUpc: '9000000001',
    checkoutDate: '2000-03-02 14:30:17',
    checkinDate: '2000-03-03 13:25:46',
  },
  {
    userEmail: 'lholyland21@blog.com',
    assetUpc: '9000000001',
    checkoutDate: '2000-06-03 14:55:13',
    checkinDate: '2000-06-11 14:15:31',
  },
  {
    userEmail: 'ggenery22@elegantthemes.com',
    assetUpc: '9000000001',
    checkoutDate: '2000-08-11 11:42:40',
    checkinDate: '2000-08-16 11:41:42',
  },
  {
    userEmail: 'hmacardle23@google.co.uk',
    assetUpc: '9000000001',
    checkoutDate: '2001-03-16 17:06:56',
    checkinDate: '2001-03-31 15:34:38',
  },
  {
    userEmail: 'fayris1d@reddit.com',
    assetUpc: '9000000001',
    checkoutDate: '2001-12-01 11:05:15',
    checkinDate: '2001-12-06 17:07:16',
  },
  {
    userEmail: 'rmeiklem1t@rediff.com',
    assetUpc: '9000000001',
    checkoutDate: '2002-06-06 09:04:26',
    checkinDate: '2002-06-27 10:04:39',
  },
  {
    userEmail: 'wmorecombe1e@timesonline.co.uk',
    assetUpc: '9000000001',
    checkoutDate: '2002-10-27 18:52:23',
    checkinDate: '2002-11-01 14:27:41',
  },
  {
    userEmail: 'cbastie2b@oaic.gov.au',
    assetUpc: '9000000001',
    checkoutDate: '2003-01-01 14:38:50',
    checkinDate: '2003-01-10 16:54:10',
  },
  {
    userEmail: 'binkpin2h@issuu.com',
    assetUpc: '9000000001',
    checkoutDate: '2003-03-10 11:25:11',
    checkinDate: '2003-03-30 13:52:14',
  },
  {
    userEmail: 'ekenworthl@list-manage.com',
    assetUpc: '9000000001',
    checkoutDate: '2003-04-30 12:47:19',
    checkinDate: null,
  },
  {
    userEmail: 'dbernath27@jalbum.net',
    assetUpc: '9000000007',
    checkoutDate: '2001-03-07 17:24:23',
    checkinDate: '2001-03-16 18:19:25',
  },
  {
    userEmail: 'dbernath27@jalbum.net',
    assetUpc: '9000000011',
    checkoutDate: '2004-07-11 17:09:14',
  },
];

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

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    checkouts: (root, args) => {
      const keys = Object.keys(args);
      if (keys.length === 0) {
        return checkouts;
      }
      return checkouts.filter((checkout) => {
        for (const key of keys) {
          if (checkout[key] !== args[key]) {
            return false;
          }
        }
        return true;
      });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

// eslint-disable-next-line no-console
app.listen({ port: 4000 }, () => console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`));
