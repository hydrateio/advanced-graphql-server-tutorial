import DataLoader from 'dataloader';
import { getPatron, getPatrons } from './patron.data-fetchers';
import { getCheckoutsByPatronEmails } from '../checkout/checkout.data-fetchers';

export default {
  Query: {
    patron: getPatron,
    patrons: getPatrons,
  },

  Patron: {
    checkOuts: (patron, args, context) => {
      if (!context.getCheckoutsByPatronEmailsDataLoader) {
        context.getCheckoutsByPatronEmailsDataLoader = new DataLoader(keys => getCheckoutsByPatronEmails(keys, args.currentCheckoutsOnly));
      }
      return context.getCheckoutsByPatronEmailsDataLoader.load(patron.email);
    },
  },
};
