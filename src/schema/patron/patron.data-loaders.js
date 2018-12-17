import DataLoader from 'dataloader';
import { getPatronsByEmails } from './patron.data-fetchers';

export default () => ({
  patronsByEmails: new DataLoader(keys => getPatronsByEmails(keys)),
});
