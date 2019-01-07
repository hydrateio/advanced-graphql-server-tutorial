import DataLoader from 'dataloader';
import { loaderOptions, mergeKeys } from '../utils';
import CheckOut from './checkout.model';

const getCheckoutsByAssetUpcsLoaderFn = async (data) => {
  const { keys, args } = mergeKeys(data);
  const patrons = await CheckOut.getCheckoutsByAssetUpcs(keys, args.currentCheckoutsOnly);
  return patrons;
};

const getCheckoutsByPatronEmailsLoaderFn = async (data) => {
  const { keys, args } = mergeKeys(data);
  const patrons = await CheckOut.getCheckoutsByPatronEmails(keys, args.currentCheckoutsOnly);
  return patrons;
};

export default () => ({
  checkoutsByPatronEmails: new DataLoader(keys => getCheckoutsByPatronEmailsLoaderFn(keys), loaderOptions),
  checkoutsByAssetUpcs: new DataLoader(keys => getCheckoutsByAssetUpcsLoaderFn(keys), loaderOptions),
});
