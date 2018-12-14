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

export async function getBookById(id) {
  const db = await mongoDataConnector.getDb();
  const book = await db.collection('books').findOne({ _id: convertStringToID(id) });
  return book ? mongoBookToGraphQLType(book) : null;
}

export async function getBookByIsbn13(isbn13) {
  const db = await mongoDataConnector.getDb();
  const book = await db.collection('books').findOne({ isbn_13: isbn13 });
  return book ? mongoBookToGraphQLType(book) : null;
}

export async function getBookByCopyLibraryUpc(libraryUpc) {
  const db = await mongoDataConnector.getDb();
  const book = await db.collection('books').findOne({ 'copies.libraryUPC': libraryUpc });
  return book ? mongoBookToGraphQLType(book) : null;
}

export async function getBooksByCopyLibraryUpcs(libraryUpcs) {
  const db = await mongoDataConnector.getDb();
  const books = await db.collection('books').find({ 'copies.libraryUPC': { $in: libraryUpcs } }).toArray();
  const upcMap = books.reduce((map, book) => {
    book.copies.forEach((copy) => {
      map[copy.libraryUPC] = book;
    });
    return map;
  }, {});
  return libraryUpcs.map(upc => upcMap[upc]);
}

export async function getBook(root, args) {
  if (args.id) {
    return getBookById(args.id);
  }
  if (args.isbn13) {
    return getBookByIsbn13(args.isbn13);
  }
  return null;
}

export async function getBooks() {
  const db = await mongoDataConnector.getDb();
  const books = await db.collection('books').find({}).toArray();
  return books.map(mongoBookToGraphQLType);
}
