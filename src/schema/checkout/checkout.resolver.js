import DataLoader from 'dataloader';
import { getCheckouts, checkoutAsset, checkinAsset } from './checkout.data-fetchers';
import { getBooksByCopyLibraryUpcs } from '../book/book.data-fetchers';
import { getPatronsByEmails } from '../patron/patron.data-fetchers';

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
    patron: (checkout, args, context) => {
      if (!context.getPatronsByEmailsDataLoader) {
        context.getPatronsByEmailsDataLoader = new DataLoader(keys => getPatronsByEmails(keys));
      }
      return context.getPatronsByEmailsDataLoader.load(checkout.userEmail);
    },
    book: (checkout, args, context) => {
      if (!context.getBooksByCopyLibraryUpcsDataLoader) {
        context.getBooksByCopyLibraryUpcsDataLoader = new DataLoader(keys => getBooksByCopyLibraryUpcs(keys));
      }
      return context.getBooksByCopyLibraryUpcsDataLoader.load(checkout.assetUpc);
    },
  },
};
