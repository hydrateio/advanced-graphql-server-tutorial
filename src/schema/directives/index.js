import { typeDef as dateTypeDef, dateDirectives } from './date';

export const directiveTypeDefs = [
  dateTypeDef,
];

export const schemaDirectives = {
  ...dateDirectives,
};
