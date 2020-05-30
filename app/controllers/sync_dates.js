
const models = require('../../database/models');


// eslint-disable-next-line import/prefer-default-export
export function insertToSyncDate(SenderID, type, SearchQuery) {
  try {
    models.SyncDate.create({
      type, user: SenderID, sync_date: new Date(), search_word: SearchQuery,
    })
      .then(() => console.log('Added New record'));
  } catch (error) {
    return ({ error: error.message });
  }
}
