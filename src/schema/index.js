import { makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash.merge';

import checkoutResolver from './checkout/checkout.resolver';
import checkoutTypeDef from './checkout/checkout.typeDef';

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
