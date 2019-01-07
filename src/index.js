import * as http from 'http';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import env from './env';
import schema from './schema';
import context from './context';
import { authErrorHandler, authMiddleware, getUserFromToken } from './middleware';
import MySQLConnector from './data-connectors/mysql';
import MongoConnector from './data-connectors/mongodb';

let isGracefullyClosing = false;
const app = express();
app.use(authMiddleware, authErrorHandler);
app.use((req, res, next) => {
  // Terminate 'keep-alive' sessions
  if (isGracefullyClosing) {
    res.setHeader('Connection', 'close');
    res.send(502, 'Service is restarting');
  } else {
    next();
  }
});
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

const server = new ApolloServer({
  schema,
  context,
  subscriptions: {
    onConnect: async (connectionParams, webSocket) => {
      process.on('SIGTERM', webSocket.close);
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

httpServer.listen({ port: env.GRAPHQL_SERVER_PORT }, () => console.log(`🚀 Server ready at http://localhost:${env.GRAPHQL_SERVER_PORT}${server.graphqlPath}`));

const gracefulShutdown = async () => {
  isGracefullyClosing = true;
  // Stop accepting new connections
  console.log('Stopping HTTP Server');
  httpServer.close(async () => {
    // Close any other open connections (i.e. database)
    const closeMySql = MySQLConnector.closeAllConnections();
    const closeMongo = MongoConnector.closeConnection();
    await closeMySql;
    await closeMongo;
    console.log('All connections closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Unable to close all connections. Forcing process to exit.');
    process.exit(1);
  }, 60 * 1000);
};

process.on('SIGTERM', gracefulShutdown);
