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

  Subscription: {
    checkoutStatusUpdate: {
      subscribe: (root, args, context) => context.pubsub.kafka.asyncIterator('checkoutStatusUpdate', ['checkin', 'checkout']),
    },
    checkout: {
      subscribe: (root, args, context) => context.pubsub.kafka.asyncIterator('checkout', ['checkout']),
    },
    checkin: {
      subscribe: (root, args, context) => context.pubsub.kafka.asyncIterator('checkin', ['checkin']),
    },
  },

  CheckOut: {
    checkinDate: (checkout) => {
      if (checkout.checkinDate) {
        let { checkinDate } = checkout;
        if (typeof checkinDate === 'string') {
          checkinDate = new Date(checkout.checkinDate);
        }
        return checkinDate.toISOString();
      }
      return null;
    },
    checkoutDate: (checkout) => {
      let { checkoutDate } = checkout;
      if (typeof checkoutDate === 'string') {
        checkoutDate = new Date(checkout.checkoutDate);
      }
      return checkoutDate.toISOString();
    },
  },

  BookCopy: {
    checkoutHistory: (copy, args, context) => context.loaders.checkoutsByAssetUpcs.load({ key: copy.libraryUPC, args }),
  },

  Patron: {
    checkOuts: (patron, args, context) => context.loaders.checkoutsByPatronEmails.load({ key: patron.email, args }),
  },
};
