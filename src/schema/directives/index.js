import { typeDef as dateTypeDef, dateDirectives } from './date';
import { typeDef as emailTypeDef, emailDirectives } from './email';

export const directiveTypeDefs = [
  dateTypeDef,
  emailTypeDef,
];

export const schemaDirectives = {
  ...dateDirectives,
  ...emailDirectives,
};
