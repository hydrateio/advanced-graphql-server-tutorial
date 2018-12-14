import { getPatron, getPatrons } from './patron.data-fetchers';
import { getCheckoutByPatronEmail } from '../checkout/checkout.data-fetchers';

export default {
  Query: {
    patron: getPatron,
    patrons: getPatrons,
  },

  Patron: {
    checkOuts: (patron, args) => getCheckoutByPatronEmail(patron.email, args.currentCheckoutsOnly),
  },
};
