import { makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash.merge';

import checkoutResolver from './checkout/checkout.resolver';
import checkoutTypeDef from './checkout/checkout.typeDef';
import patronResolver from './patron/patron.resolver';
import patronTypeDef from './patron/patron.typeDef';
import bookResolver from './book/book.resolver';
import bookTypeDef from './book/book.typeDef';

import { directiveTypeDefs, schemaDirectives } from './directives';

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
  patronTypeDef,
  bookTypeDef,
  ...directiveTypeDefs,
];

const resolvers = merge(
  checkoutResolver,
  patronResolver,
  bookResolver,
);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  schemaDirectives,
});

export default schema;
