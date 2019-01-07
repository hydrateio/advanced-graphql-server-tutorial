import Patron from './patron.model';

export default {
  Query: {
    patron: Patron.getPatron,
    patrons: Patron.getPatrons,
  },

  CheckOut: {
    patron: checkout => Patron.getPatronByEmail(checkout.userEmail),
  },
};
