const typeDef = /* GraphQL */`
  extend type Query {
    checkouts(userEmail: String, assetUpc: String): [CheckOut]
  }

  type CheckOut {
    userEmail: String!
    assetUpc: String!
    checkoutDate: String!
    checkinDate: String
  }
`;

export default typeDef;
