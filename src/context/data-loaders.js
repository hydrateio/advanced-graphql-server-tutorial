import getPatronDataLoaders from '../schema/patron/patron.data-loaders';
import getCheckoutDataLoaders from '../schema/checkout/checkout.data-loaders';
import getBookDataLoaders from '../schema/book/book.data-loaders';

const getDataLoaders = () => ({
  ...getPatronDataLoaders(),
  ...getCheckoutDataLoaders(),
  ...getBookDataLoaders(),
});
export default getDataLoaders;
