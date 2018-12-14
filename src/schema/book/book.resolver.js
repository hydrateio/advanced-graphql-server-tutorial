import { getBook, getBooks } from './book.data-fetchers';
import { getCheckoutByAssetUpc } from '../checkout/checkout.data-fetchers';

export default {
  Query: {
    book: getBook,
    books: getBooks,
  },

  BookCopy: {
    checkoutHistory: (copy, args) => getCheckoutByAssetUpc(copy.libraryUPC, args.currentCheckoutsOnly),
  },
};
