const typeDef = /* GraphQL */`
  extend type Query {
    checkouts(
      userEmail: String
      assetUpc: String
      cursor: String
      next: Int
    ): [CheckOut]

    checkoutFeed(
      userEmail: String
      assetUpc: String
      sort: [SortObject!]
      cursor: String
      next: Int
      queryId: ID
    ): Feed
  }

  extend type Mutation {
    checkoutAsset(assetUpc: String!, userEmail: String!): CheckOut!
    checkinAsset(assetUpc: String!): CheckOut!
  }

  type CheckOut {
    id: ID!
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

  type Feed {
    pageInfo: PageInfo
    entries: [CheckOut]
  }

  input SortObject {
    field: SortField!
    direction: SortDirection
  }

  enum SortField {
    userEmail
    assetUpc
    checkinDate
    checkoutDate
  }

  enum SortDirection {
    ASC
    DESC
  }

  type PageInfo {
    queryId: ID!
    currentCursor: String
    startEntryIndex: Int!
    endEntryIndex: Int!
    totalEntries: Int!
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }
`;

export default typeDef;
