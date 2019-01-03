import getDataLoaders from './data-loaders';
import { KafkaPubSub } from '../data-connectors/kafka';

export default async ({ connection, req }) => {
  const kafka = new KafkaPubSub();

  if (connection) {
    return {
      ...connection.context,
      loaders: getDataLoaders(),
      pubsub: { kafka },
    };
  }

  if (req.errors) {
    throw req.errors;
  }
  return {
    loaders: getDataLoaders(),
    pubsub: { kafka },
    currentUser: req.currentUser,
  };
};
