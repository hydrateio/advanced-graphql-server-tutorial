import { makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash.merge';

import { resolver as checkoutResolver, typeDef as checkoutTypeDef } from './checkout';

const typeDefs = [
  checkoutTypeDef,
];

const resolvers = merge(
  checkoutResolver,
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
