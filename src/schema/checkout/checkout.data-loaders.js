import DataLoader from 'dataloader';
import { getBooksByCopyLibraryUpcs } from '../book/book.data-fetchers';
import { getPatronsByEmails } from '../patron/patron.data-fetchers';

const booksByCopyLibraryUpcs = () => new DataLoader(keys => getBooksByCopyLibraryUpcs(keys));
const patronsByEmails = () => new DataLoader(keys => getPatronsByEmails(keys));

export default () => ({
  booksByCopyLibraryUpcs: booksByCopyLibraryUpcs(),
  patronsByEmails: patronsByEmails(),
});
