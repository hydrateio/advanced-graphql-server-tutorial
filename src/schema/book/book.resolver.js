import Book from './book.model';

export default {
  Query: {
    book: Book.getBook,
    books: Book.getBooks,
  },

  CheckOut: {
    book: (checkout, args, context) => context.loaders.booksByCopyLibraryUpcs.load(checkout.assetUpc),
  },
};
