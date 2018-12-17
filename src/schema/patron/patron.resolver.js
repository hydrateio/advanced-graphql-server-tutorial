import { getPatron, getPatrons } from './patron.data-fetchers';

export default {
  Query: {
    patron: getPatron,
    patrons: getPatrons,
  },

  Patron: {
    checkOuts: (patron, args, context) => context.loaders.checkoutsByPatronEmails.load({ key: patron.email, args }),
  },
};
