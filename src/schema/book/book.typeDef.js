const typeDef = /* GraphQL */`

  extend type Query {
    book(id: ID, isbn13: String): Book
    books: [Book]
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    yearPublished: Int!
    genre: String!
    isbn13: String!
    copies: [BookCopy]
  }

  type BookCopy {
    libraryUPC: String!
    condition: BookCondition!
  }

  enum BookCondition {
    good
    fair
    damaged
  }

  extend type CheckOut {
    book: Book!
  }
`;

export default typeDef;
