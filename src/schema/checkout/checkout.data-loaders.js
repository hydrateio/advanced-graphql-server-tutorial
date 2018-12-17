import DataLoader from 'dataloader';
import { loaderOptions, mergeKeys } from '../utils';
import { getCheckoutsByAssetUpcs, getCheckoutsByPatronEmails } from './checkout.data-fetchers';

const getCheckoutsByAssetUpcsLoaderFn = async (data) => {
  const { keys, args } = mergeKeys(data);
  const patrons = await getCheckoutsByAssetUpcs(keys, args.currentCheckoutsOnly);
  return patrons;
};

const getCheckoutsByPatronEmailsLoaderFn = async (data) => {
  const { keys, args } = mergeKeys(data);
  const patrons = await getCheckoutsByPatronEmails(keys, args.currentCheckoutsOnly);
  return patrons;
};

export default () => ({
  checkoutsByPatronEmails: new DataLoader(keys => getCheckoutsByPatronEmailsLoaderFn(keys), loaderOptions),
  checkoutsByAssetUpcs: new DataLoader(keys => getCheckoutsByAssetUpcsLoaderFn(keys), loaderOptions),
});
