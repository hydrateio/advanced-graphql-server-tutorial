const typeDef = /* GraphQL */`
  extend type Query {
    checkouts(
      userEmail: String @email
      assetUpc: String
      cursor: String
      next: Int
    ): [CheckOut] @auth(requires: USER)

    checkoutFeed(
      userEmail: String @email
      assetUpc: String
      sort: [SortObject!]
      cursor: String
      next: Int
      queryId: ID
    ): Feed
  }

  extend type Mutation {

    "Check an asset out of the library. User must have role USER"
    checkoutAsset(assetUpc: String!, userEmail: String! @email): CheckOut! @auth(requires: USER)

    "Check an asset back into the library. User must have role LIBRARIAN"
    checkinAsset(assetUpc: String!): CheckOut! @auth(requires: LIBRARIAN)
  }

  extend type Subscription {
    checkoutStatusUpdate: CheckOut
    checkout: CheckOut
    checkin: CheckOut
  }

  type CheckOut {
    id: ID!
    userEmail: String!
    assetUpc: String!
    checkoutDate: String! @date
    checkinDate: String @date
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
