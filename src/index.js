import * as http from 'http';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import env from './env';
import schema from './schema';
import context from './context';
import { authErrorHandler, authMiddleware, getUserFromToken } from './middleware';

const app = express();
app.use(authMiddleware, authErrorHandler);

const server = new ApolloServer({
  schema,
  context,
  subscriptions: {
    onConnect: async (connectionParams) => {
      if (connectionParams.authToken) {
        const currentUser = await getUserFromToken(connectionParams.authToken);
        return { currentUser };
      }
      return {};
    },
  },
});

server.applyMiddleware({ app });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

// eslint-disable-next-line no-console
httpServer.listen({ port: env.GRAPHQL_SERVER_PORT }, () => console.log(`🚀 Server ready at http://localhost:${env.GRAPHQL_SERVER_PORT}${server.graphqlPath}`));
