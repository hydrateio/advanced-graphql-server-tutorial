const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const checkouts = [
  {
    "user_email": "dbernath27@jalbum.net",
    "asset_upc": "9000000001",
    "checkout_date": "2000-03-02 14:30:17",
    "checkin_date": "2000-03-03 13:25:46"
  },
  {
    "user_email": "lholyland21@blog.com",
    "asset_upc": "9000000001",
    "checkout_date": "2000-06-03 14:55:13",
    "checkin_date": "2000-06-11 14:15:31"
  },
  {
    "user_email": "ggenery22@elegantthemes.com",
    "asset_upc": "9000000001",
    "checkout_date": "2000-08-11 11:42:40",
    "checkin_date": "2000-08-16 11:41:42"
  },
  {
    "user_email": "hmacardle23@google.co.uk",
    "asset_upc": "9000000001",
    "checkout_date": "2001-03-16 17:06:56",
    "checkin_date": "2001-03-31 15:34:38"
  },
  {
    "user_email": "fayris1d@reddit.com",
    "asset_upc": "9000000001",
    "checkout_date": "2001-12-01 11:05:15",
    "checkin_date": "2001-12-06 17:07:16"
  },
  {
    "user_email": "rmeiklem1t@rediff.com",
    "asset_upc": "9000000001",
    "checkout_date": "2002-06-06 09:04:26",
    "checkin_date": "2002-06-27 10:04:39"
  },
  {
    "user_email": "wmorecombe1e@timesonline.co.uk",
    "asset_upc": "9000000001",
    "checkout_date": "2002-10-27 18:52:23",
    "checkin_date": "2002-11-01 14:27:41"
  },
  {
    "user_email": "cbastie2b@oaic.gov.au",
    "asset_upc": "9000000001",
    "checkout_date": "2003-01-01 14:38:50",
    "checkin_date": "2003-01-10 16:54:10"
  },
  {
    "user_email": "binkpin2h@issuu.com",
    "asset_upc": "9000000001",
    "checkout_date": "2003-03-10 11:25:11",
    "checkin_date": "2003-03-30 13:52:14"
  },
  {
    "user_email": "ekenworthl@list-manage.com",
    "asset_upc": "9000000001",
    "checkout_date": "2003-04-30 12:47:19",
    "checkin_date": null
  },
  {
    "user_email": "dbernath27@jalbum.net",
    "asset_upc": "9000000007",
    "checkout_date": "2001-03-07 17:24:23",
    "checkin_date": "2001-03-16 18:19:25"
  },
  {
    "user_email": "dbernath27@jalbum.net",
    "asset_upc": "9000000011",
    "checkout_date": "2004-07-11 17:09:14"
  },
]

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    checkouts(user_email: String, asset_upc: String): [CheckOut]
  }

  type CheckOut {
    user_email: String!
    asset_upc: String!
    checkout_date: String!
    checkin_date: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    checkouts: (root, args) => checkouts.filter(checkout => {
      if (args.user_email && args.user_email !== checkout.user_email) {
        return false;
      }
      if (args.asset_upc && args.asset_upc !== checkout.asset_upc) {
        return false;
      }
      return true;
    }),
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });
 
app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);