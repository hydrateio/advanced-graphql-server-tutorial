import { getCheckouts, checkoutAsset, checkinAsset } from './checkout.data-fetchers';

/**
 * To make our resolver code a little easier to follow, we simply map resolver queries to functions
 * As our resolver grows, this can help to maintain code readability and reusability.
 */
export default {
  Query: {
    checkouts: getCheckouts,
  },

  Mutation: {
    checkoutAsset,
    checkinAsset,
  },

  CheckOut: {
    checkinDate: (checkout) => {
      if (checkout.checkinDate instanceof Date) {
        return checkout.checkinDate.toISOString();
      }
      return null;
    },
    checkoutDate: checkout => checkout.checkoutDate.toISOString(),
  },
};