import DataLoader from 'dataloader';
import Book from './book.model';

export default () => ({
  booksByCopyLibraryUpcs: new DataLoader(keys => Book.getBooksByCopyLibraryUpcs(keys)),
});
