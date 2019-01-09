import { SchemaDirectiveVisitor } from 'graphql-tools';
import { defaultFieldResolver, GraphQLScalarType, GraphQLNonNull } from 'graphql';
import { ApolloError } from 'apollo-server-express';

export const typeDef = /* GraphQL */`
  directive @email on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION | FIELD_DEFINITION
`;

const emailRegEx = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

class EmailType extends GraphQLScalarType {
  constructor(type) {
    super({
      name: 'Email',
      parseValue: value => type.parseValue(value),
      serialize: value => type.serialize(value),
      parseLiteral: (ast) => {
        if (emailRegEx.test(ast.value)) {
          return type.parseLiteral(ast);
        }
        throw new ApolloError('Email address failed validation', 'INVALID_EMAIL');
      },
    });
  }
}

class EmailDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    this.wrapType(field);
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async (source, args, context, info) => {
      const email = await resolve(source, args, context, info);
      if (emailRegEx.test(email)) {
        return email;
      }
      return new ApolloError('Email address failed validation', 'INVALID_EMAIL');
    };
  }

  visitInputFieldDefinition(field) {
    this.wrapType(field);
  }

  visitArgumentDefinition(argument) {
    this.wrapType(argument);
  }

  wrapType(field) {
    if (field.type instanceof GraphQLNonNull && field.type.ofType instanceof GraphQLScalarType) {
      field.type = new GraphQLNonNull(new EmailType(field.type.ofType));
    } else if (field.type instanceof GraphQLScalarType) {
      field.type = new EmailType(field.type);
    } else {
      throw new Error(`Not a scalar type: ${field.type}`);
    }
  }
}

export const emailDirectives = {
  email: EmailDirective,
};
