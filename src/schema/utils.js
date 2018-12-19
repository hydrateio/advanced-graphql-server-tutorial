import * as util from 'util';
import * as crypto from 'crypto';

export const loaderOptions = {
  cacheKeyFn: key => util.inspect(key),
};

export const mergeKeys = arr => arr.reduce(
  (map, obj) => {
    map.keys.push(obj.key);
    map.args = { ...map.args, ...obj.args };
    return map;
  },
  { keys: [], args: {} },
);

export const getQueryId = (args, user) => {
  const hash = crypto.createHash('md5');
  hash.update(util.inspect(user));
  hash.update(util.inspect(args));
  return hash.digest('hex');
};
