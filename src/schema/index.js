import { makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash.merge';

import checkoutResolver from './checkout/checkout.resolver';
import checkoutTypeDef from './checkout/checkout.typeDef';

/**
 * Create a base typeDef so other typeDefs can extend them later
 * Types cannot be empty, so we'll define something in each type
 * https://github.com/graphql/graphql-js/issues/937
 */
const baseTypeDef = /* GraphQL */`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

const typeDefs = [
  baseTypeDef,
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
