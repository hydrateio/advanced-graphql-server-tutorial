import { typeDef as dateTypeDef, dateDirectives } from './date';
import { typeDef as authTypeDef, authDirectives } from './auth';

export const directiveTypeDefs = [
  dateTypeDef,
  authTypeDef,
];

export const schemaDirectives = {
  ...dateDirectives,
  ...authDirectives,
};
