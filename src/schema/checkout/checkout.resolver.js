import CheckOut from './checkout.model';

/**
 * To make our resolver code a little easier to follow, we simply map resolver queries to functions
 * As our resolver grows, this can help to maintain code readability and reusability.
 */
export default {
  Query: {
    checkouts: CheckOut.getCheckouts,
    checkoutFeed: CheckOut.getCheckoutFeed,
  },

  Mutation: {
    checkoutAsset: CheckOut.checkoutAsset,
    checkinAsset: CheckOut.checkinAsset,
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

  BookCopy: {
    checkoutHistory: (copy, args, context) => context.loaders.checkoutsByAssetUpcs.load({ key: copy.libraryUPC, args }),
  },

  Patron: {
    checkOuts: (patron, args, context) => context.loaders.checkoutsByPatronEmails.load({ key: patron.email, args }),
  },
};
