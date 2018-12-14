const typeDef = /* GraphQL */`
  extend type Query {
    patron(email: String, id: ID): Patron
    patrons(yearRegistered: Int, limit: Int): [Patron]!
  }

  type Patron {
    id: ID!
    yearRegistered: Int!
    firstName: String!
    lastName: String!
    email: String!
    phoneCell: String!
    checkOuts(currentCheckoutsOnly: Boolean): [CheckOut]
  }
`;

export default typeDef;
