import getDataLoaders from './data-loaders';
import { KafkaPubSub } from '../data-connectors/kafka';

export default async ({ connection }) => {
  const kafka = new KafkaPubSub();
  if (connection) {
    return {
      ...connection.context,
      loaders: getDataLoaders(),
      pubsub: { kafka },
    };
  }
  return {
    loaders: getDataLoaders(),
    pubsub: { kafka },
  };
};
