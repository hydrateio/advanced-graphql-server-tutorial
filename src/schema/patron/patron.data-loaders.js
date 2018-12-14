import DataLoader from 'dataloader';
import Patron from './patron.model';

export default () => ({
  patronsByEmails: new DataLoader(keys => Patron.getPatronsByEmails(keys)),
});
