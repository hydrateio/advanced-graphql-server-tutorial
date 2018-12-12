import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeResolvers, mergeTypes } from 'merge-graphql-schemas';
import * as path from 'path';

const schema = makeExecutableSchema({
  typeDefs: mergeTypes(fileLoader(path.join(__dirname, './schemas/**/*.graphql'))),
  resolvers: mergeResolvers(fileLoader(path.join(__dirname, './schemas/**/*.resolver.*'))),
});

const server = new ApolloServer({ schema });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () => console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`));
