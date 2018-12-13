const typeDef = /* GraphQL */`
  type Query {
    checkouts(userEmail: String, assetUpc: String): [CheckOut]
  }

  type Mutation {
    checkoutAsset(assetUpc: String!, userEmail: String!): CheckOut
    checkinAsset(assetUpc: String!): CheckOut
  }

  type CheckOut {
    userEmail: String!
    assetUpc: String!
    checkoutDate: String!
    checkinDate: String
  }
`;

export default typeDef;
