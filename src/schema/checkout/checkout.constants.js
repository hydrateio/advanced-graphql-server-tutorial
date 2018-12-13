/**
 * Our database column names don't always match up with our GraphQL type property names.
 * Here we create a map used to convert one to the other.
 */
export const checkoutTableVariablesMap = {
  id: 'row_id',
  userEmail: 'user_email',
  assetUpc: 'asset_upc',
  checkoutDate: 'checkout_date',
  checkinDate: 'checkin_date',
};

export const mappedQueryFields = Object.keys(checkoutTableVariablesMap)
  .map(key => `${checkoutTableVariablesMap[key]} as ${key}`)
  .join(', ');

export const errors = {
  assetDuplicateCheckout: {
    code: 'ASSET_DUPLICATE_CHECKOUT_ATTEMPTED',
    message: 'This asset appears to already be checked out, please check it back in first',
  },

  assetNoCheckout: {
    code: 'ASSET_NO_CHECKOUT_FOUND',
    message: 'This asset does not appear be checked out',
  },

  assetCheckoutFailed: {
    code: 'ASSET_CHECKOUT_FAILURE',
    message: 'There was an error checking out the asset',
  },

};
