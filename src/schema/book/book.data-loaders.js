import DataLoader from 'dataloader';
import { loaderOptions, mergeKeys } from '../utils';
import { getCheckoutsByAssetUpcs } from '../checkout/checkout.data-fetchers';

const getCheckoutsByAssetUpcsLoaderFn = async (data) => {
  const { keys, args } = mergeKeys(data);
  const patrons = await getCheckoutsByAssetUpcs(keys, args.currentCheckoutsOnly);
  return patrons;
};

const checkoutsByAssetUpcs = () => new DataLoader(keys => getCheckoutsByAssetUpcsLoaderFn(keys), loaderOptions);

export default () => ({
  checkoutsByAssetUpcs: checkoutsByAssetUpcs(),
});
