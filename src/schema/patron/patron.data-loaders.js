import DataLoader from 'dataloader';
import { loaderOptions, mergeKeys } from '../utils';
import { getCheckoutsByPatronEmails } from '../checkout/checkout.data-fetchers';

const getCheckoutsByPatronEmailsLoaderFn = async (data) => {
  const { keys, args } = mergeKeys(data);
  const patrons = await getCheckoutsByPatronEmails(keys, args.currentCheckoutsOnly);
  return patrons;
};

const checkoutsByPatronEmails = () => new DataLoader(keys => getCheckoutsByPatronEmailsLoaderFn(keys), loaderOptions);

export default () => ({
  checkoutsByPatronEmails: checkoutsByPatronEmails(),
});
