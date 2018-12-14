import DataLoader from 'dataloader';
import { getBook, getBooks } from './book.data-fetchers';
import { getCheckoutsByAssetUpcs } from '../checkout/checkout.data-fetchers';

export default {
  Query: {
    book: getBook,
    books: getBooks,
  },

  BookCopy: {
    checkoutHistory: (copy, args, context) => {
      if (!context.getCheckoutsByAssetUpcsDataLoader) {
        context.getCheckoutsByAssetUpcsDataLoader = new DataLoader(keys => getCheckoutsByAssetUpcs(keys, args.currentCheckoutsOnly));
      }
      return context.getCheckoutsByAssetUpcsDataLoader.load(copy.libraryUPC);
    },
  },
};
