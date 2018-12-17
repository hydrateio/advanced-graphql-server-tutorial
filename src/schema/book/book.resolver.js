import { getBook, getBooks } from './book.data-fetchers';

export default {
  Query: {
    book: getBook,
    books: getBooks,
  },

  BookCopy: {
    checkoutHistory: (copy, args, context) => context.loaders.checkoutsByAssetUpcs.load(copy.libraryUPC, args),
  },
};
