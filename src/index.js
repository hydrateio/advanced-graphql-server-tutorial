import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import schema from './schema';
import env from './env';

const server = new ApolloServer({ schema });

const app = express();
server.applyMiddleware({ app });

// eslint-disable-next-line no-console
app.listen({ port: env.GRAPHQL_SERVER_PORT }, () => console.log(`🚀 Server ready at http://localhost:${env.GRAPHQL_SERVER_PORT}${server.graphqlPath}`));
