const typeDef = /* GraphQL */`
  extend type Query {
    checkouts(userEmail: String, assetUpc: String): [CheckOut]
  }

  extend type Mutation {
    checkoutAsset(assetUpc: String!, userEmail: String!): CheckOut!
    checkinAsset(assetUpc: String!): CheckOut!
  }

  type CheckOut {
    userEmail: String!
    assetUpc: String!
    checkoutDate: String!
    checkinDate: String
    patron: Patron!
    book: Book!
  }
`;

export default typeDef;
