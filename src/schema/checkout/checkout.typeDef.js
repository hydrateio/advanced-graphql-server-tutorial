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
  }

  extend type BookCopy {
    checkoutHistory(currentCheckoutsOnly: Boolean): [CheckOut]
  }
  
  extend type Patron {
    checkOuts(currentCheckoutsOnly: Boolean): [CheckOut]
  }
`;

export default typeDef;
