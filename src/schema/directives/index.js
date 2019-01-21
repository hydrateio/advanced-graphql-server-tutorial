import { typeDef as dateTypeDef, dateDirectives } from './date';
import { typeDef as emailTypeDef, emailDirectives, emailResolvers } from './email';

export const directiveResolvers = {
  ...emailResolvers,
};

export const directiveTypeDefs = [
  dateTypeDef,
  emailTypeDef,
];

export const schemaDirectives = {
  ...dateDirectives,
  ...emailDirectives,
};
