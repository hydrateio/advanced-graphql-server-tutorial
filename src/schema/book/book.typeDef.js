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
    checkoutHistory(currentCheckoutsOnly: Boolean): [CheckOut]
  }

  enum BookCondition {
    good
    fair
    damaged
  }
`;

export default typeDef;
