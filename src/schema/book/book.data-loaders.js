import DataLoader from 'dataloader';
import { getBooksByCopyLibraryUpcs } from './book.data-fetchers';

export default () => ({
  booksByCopyLibraryUpcs: new DataLoader(keys => getBooksByCopyLibraryUpcs(keys)),
});
