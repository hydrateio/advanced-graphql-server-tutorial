import mongoDataConnector, { convertStringToID } from '../../data-connectors/mongodb';
import { projectFieldMapping } from './patron.constants';

const Patron = {
  getPatronByEmail: async (email) => {
    const db = await mongoDataConnector.getDb();
    const cursor = await db.collection('patrons').aggregate([
      { $match: { email } },
      { $project: projectFieldMapping },
    ]).limit(1);
    const patron = await cursor.next();
    await cursor.close();
    return patron;
  },

  getPatronById: async (id) => {
    const db = await mongoDataConnector.getDb();
    const cursor = await db.collection('patrons').aggregate([
      { $match: { _id: convertStringToID(id) } },
      { $project: projectFieldMapping },
    ]).limit(1);
    const patron = await cursor.next();
    await cursor.close();
    return patron;
  },

  getPatron: async (root, args) => {
    if (args.id) {
      return this.getPatronById(args.id);
    }
    if (args.email) {
      return this.getPatronByEmail(args.email);
    }
    return null;
  },

  getPatrons: async (root, args) => {
    const db = await mongoDataConnector.getDb();
    const match = {};
    if (args.yearRegistered) {
      match.year_registered = args.yearRegistered;
    }

    const cursor = db.collection('patrons').aggregate([
      { $match: match },
      { $project: projectFieldMapping },
    ]);
    if (args.limit) {
      cursor.limit(args.limit);
    }
    const patrons = cursor.toArray();
    return patrons;
  },
};

export default Patron;
