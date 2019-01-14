import * as Kafka from 'node-rdkafka';
import { v4 as uuid } from 'uuid';
import { ApolloError } from 'apollo-server-express';
import env from '../env';
import { eventEmitterAsyncIterator } from './event-emitter-to-async-iterator';

const serviceError = new ApolloError('Subscription Service Unavailable', 'SUBSCRIPTION_SYSTEM_ERROR');

export class KafkaPubSub {
  constructor() {
    this.kafkaGlobalConfig = {
      'group.id': uuid(),
      'metadata.broker.list': env.KAFKA_BROKERS,
    };
    this.iterator = null;
    this.subscriptionName = null;
    this.subscribedTopics = [];
    this.producer = null;
    this.producerIsReady = false;
    this.consumer = null;
    this.consumerIsReady = false;
  }

  async publish(topic, message) {
    await this.getProducer();
    try {
      this.producer.produce(
        topic,
        null,
        Buffer.from(JSON.stringify(message)),
      );
    } catch (e) {
      console.error('There was an error sending message');
      console.error(e);
    }
  }

  async addListener(topics, onMessage) {
    await this.getConsumer();
    let wasTopicAdded = false;
    topics.forEach((topic) => {
      if (!this.subscribedTopics.includes(topic)) {
        this.subscribedTopics.push(topic);
        wasTopicAdded = true;
      }
    });
    if (wasTopicAdded) {
      this.consumer.unsubscribe();
      this.consumer.subscribe(this.subscribedTopics);
      this.consumer.consume();
    }
    this.consumer.on('data', (data) => {
      const message = JSON.parse(data.value.toString());
      onMessage({ [this.subscriptionName]: message });
    });
  }

  async removeListener(topics) {
    await this.getConsumer();
    let wasTopicRemoved = false;
    this.subscribedTopics = this.subscribedTopics.filter((topic) => {
      wasTopicRemoved = true;
      return !topics.includes(topic);
    });
    if (wasTopicRemoved) {
      this.consumer.unsubscribe();
      if (this.subscribedTopics.length > 0) {
        this.consumer.subscribe(this.subscribedTopics);
        this.consumer.consume();
      }
    }
  }

  asyncIterator(subscriptionName, topics) {
    this.subscriptionName = subscriptionName;
    this.iterator = eventEmitterAsyncIterator(this, topics);
    return this.iterator;
  }

  async getProducer() {
    if (!this.producer) {
      this.producer = new Kafka.Producer(this.kafkaGlobalConfig);
      this.producer.connect((err) => {
        if (err) {
          console.error('connection error:', err);
        }
      });
      this.producer.on('ready', () => {
        this.producerIsReady = true;
      });
      this.producer.on('event.error', (error) => {
        console.error('producer event error', error);
      });
      this.producer.on('connection.failure', (err) => {
        console.error('producer connection failure:', err);
      });
    }
    await this.waitFor('producer');
    return this.producer;
  }

  async getConsumer() {
    if (!this.consumer) {
      this.consumer = new Kafka.KafkaConsumer(this.kafkaGlobalConfig);
      this.consumer.connect((err) => {
        if (err) {
          console.error('connection error:', err);
          this.iterator.throw(serviceError);
        }
      });
      this.consumer.on('ready', () => {
        this.consumerIsReady = true;
      });
      this.consumer.on('event.error', (error) => {
        console.error('consumer event error', error);
        this.iterator.throw(serviceError);
      });
      this.consumer.on('connection.failure', (err) => {
        console.error('consumer connection failure:', err);
        this.iterator.throw(serviceError);
      });
    }
    await this.waitFor('consumer');
    return this.consumer;
  }

  waitFor(item) {
    return new Promise((resolve) => {
      const checkConnected = () => {
        if (this[`${item}IsReady`]) {
          resolve();
        } else {
          setTimeout(() => checkConnected(), 100);
        }
      };
      checkConnected();
    });
  }
}
