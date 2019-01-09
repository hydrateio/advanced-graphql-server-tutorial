const typeDef = /* GraphQL */`
  extend type Query {
    "Query for patron information. Must have role LIBRARIAN"
    patron(email: String @email, id: ID): Patron @auth(requires: LIBRARIAN, allowSelf: true)
    patrons(yearRegistered: Int, limit: Int): [Patron]! @auth(requires: LIBRARIAN)
  }

  type Patron {
    id: ID!
    yearRegistered: Int
    firstName: String
    lastName: String
    email: String @email @auth(requires: ADMIN, allowSelf: true)
    phoneCell: String @auth(requires: ADMIN, allowSelf: true)
  }
  
  extend type CheckOut {
    patron: Patron!
  }
`;

export default typeDef;
