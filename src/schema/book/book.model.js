import mongoDataConnector, { convertStringToID } from '../../data-connectors/mongodb';

function mongoBookToGraphQLType(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    author: doc.author,
    yearPublished: parseInt(doc.yearPublished, 10),
    genre: doc.genre,
    isbn13: doc.isbn_13,
    copies: doc.copies,
  };
}

const Book = {
  getBookById: async (id) => {
    const db = await mongoDataConnector.getDb();
    const book = await db.collection('books').findOne({ _id: convertStringToID(id) });
    return book ? mongoBookToGraphQLType(book) : null;
  },

  getBookByIsbn13: async (isbn13) => {
    const db = await mongoDataConnector.getDb();
    const book = await db.collection('books').findOne({ isbn_13: isbn13 });
    return book ? mongoBookToGraphQLType(book) : null;
  },

  getBookByCopyLibraryUpc: async (libraryUpc) => {
    const db = await mongoDataConnector.getDb();
    const book = await db.collection('books').findOne({ 'copies.libraryUPC': libraryUpc });
    return book ? mongoBookToGraphQLType(book) : null;
  },

  getBooksByCopyLibraryUpcs: async (libraryUpcs) => {
    const db = await mongoDataConnector.getDb();
    const books = await db.collection('books').find({ 'copies.libraryUPC': { $in: libraryUpcs } }).toArray();
    const upcMap = books.reduce((map, book) => {
      book.copies.forEach((copy) => {
        map[copy.libraryUPC] = mongoBookToGraphQLType(book);
      });
      return map;
    }, {});
    return libraryUpcs.map(upc => upcMap[upc]);
  },

  getBook: async (root, args) => {
    if (args.id) {
      return Book.getBookById(args.id);
    }
    if (args.isbn13) {
      return Book.getBookByIsbn13(args.isbn13);
    }
    return null;
  },

  getBooks: async () => {
    const db = await mongoDataConnector.getDb();
    const books = await db.collection('books').find({}).toArray();
    return books.map(mongoBookToGraphQLType);
  },
};

export default Book;
