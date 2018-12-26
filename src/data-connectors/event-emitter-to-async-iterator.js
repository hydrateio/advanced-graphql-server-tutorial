import { $$asyncIterator } from 'iterall';

/**
 * Based on https://github.com/apollographql/graphql-subscriptions/blob/master/src/event-emitter-to-async-iterator.ts
 * Change made to addEventListeners and removeEventListeners to pass handling of multiple events to pubsub engine.
 */
export function eventEmitterAsyncIterator(eventEmitter, eventsNames) {
  const pullQueue = [];
  const pushQueue = [];
  const eventsArray = typeof eventsNames === 'string' ? [eventsNames] : eventsNames;
  let listening = true;
  let addedListeners = false;

  const pushValue = (event) => {
    if (pullQueue.length !== 0) {
      pullQueue.shift()({ value: event, done: false });
    } else {
      pushQueue.push(event);
    }
  };

  const pullValue = () => new Promise((resolve) => {
    if (pushQueue.length !== 0) {
      resolve({ value: pushQueue.shift(), done: false });
    } else {
      pullQueue.push(resolve);
    }
  });

  const addEventListeners = () => {
    eventEmitter.addListener(eventsArray, pushValue);
  };

  const removeEventListeners = () => {
    eventEmitter.removeListener(eventsArray, pushValue);
  };

  const emptyQueue = () => {
    if (listening) {
      listening = false;
      if (addedListeners) { removeEventListeners(); }
      pullQueue.forEach(resolve => resolve({ value: undefined, done: true }));
      pullQueue.length = 0;
      pushQueue.length = 0;
    }
  };

  return {
    next() {
      if (!listening) { return this.return(); }
      if (!addedListeners) {
        addEventListeners();
        addedListeners = true;
      }
      return pullValue();
    },
    return() {
      emptyQueue();

      return Promise.resolve({ value: undefined, done: true });
    },
    throw(error) {
      emptyQueue();

      return Promise.reject(error);
    },
    [$$asyncIterator]() {
      return this;
    },
  };
}
