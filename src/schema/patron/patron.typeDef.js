const typeDef = /* GraphQL */`
  extend type Query {
    patron(email: String @email, id: ID): Patron
    patrons(yearRegistered: Int, limit: Int): [Patron]!
  }
  
  type Patron {
    id: ID!
    yearRegistered: Int!
    firstName: String!
    lastName: String!
    email: String @email
    phoneCell: String!
  }
  
  extend type CheckOut {
    patron: Patron!
  }
`;

export default typeDef;
