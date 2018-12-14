import * as util from 'util';

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
