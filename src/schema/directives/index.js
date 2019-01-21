import { typeDef as dateTypeDef, dateDirectives } from './date';
import { typeDef as emailTypeDef, emailDirectives, emailResolvers } from './email';
import { typeDef as authTypeDef, authDirectives } from './auth';

export const directiveResolvers = {
  ...emailResolvers,
};

export const directiveTypeDefs = [
  dateTypeDef,
  emailTypeDef,
  authTypeDef,
];

export const schemaDirectives = {
  ...dateDirectives,
  ...authDirectives,
  ...emailDirectives,
};
