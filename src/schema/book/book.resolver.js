import Book from './book.model';

export default {
  Query: {
    book: Book.getBook,
    books: Book.getBooks,
  },

  CheckOut: {
    book: checkout => Book.getBookByCopyLibraryUpc(checkout.assetUpc),
  },
};
