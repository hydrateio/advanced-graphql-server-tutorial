import mongoDataConnector from '../data-connectors/mongodb';

export async function isCacheAvailable(queryId) {
  const db = await mongoDataConnector.getDb();
  const results = await db.collection('querycache').findOne({ _id: queryId }, { _id: 1 });
  return !!results;
}

export async function queryCache(queryId, cursor, count = { $size: '$entries' }) {
  const db = await mongoDataConnector.getDb();
  const mongoResults = await db.collection('querycache')
    .aggregate([
      { $match: { _id: queryId } },
      {
        $project: {
          searchIndex: { $add: [{ $indexOfArray: ['$entries.id', cursor] }, 1] },
          pageInfo: { totalEntries: { $size: '$entries' } },
          entries: '$entries',
        },
      },
      {
        $project: {
          entries: {
            $slice: [
              '$entries',
              { $cond: { if: { $gt: ['$searchIndex', 0] }, then: '$searchIndex', else: 0 } },
              count,
            ],
          },
          pageInfo: {
            totalEntries: '$pageInfo.totalEntries',
            startEntryIndex: { $cond: { if: { $gt: ['$searchIndex', 0] }, then: '$searchIndex', else: 0 } },
          },
        },
      },
    ]).toArray();
  return mongoResults[0];
}

export async function cacheResults(queryId, entries) {
  const db = await mongoDataConnector.getDb();
  await db.collection('querycache').insertOne({ _id: queryId, date_created: new Date(), entries });
  return entries;
}
