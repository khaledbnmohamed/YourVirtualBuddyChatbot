import { ImgurImagesConsumer } from './imgur_handler/api_consumer';
import { RedditImageHandler } from './reddit_handler/api_consumer';

import { sendMemeToUser } from './controllers/sent_memes';
import { changeChoosenType } from './controllers/users';

const models = require('../database/models');

// eslint-disable-next-line import/prefer-default-export
export function chooseCaller(type, lastSearchWord = 'memes', senderID) {
  // eslint-disable-next-line no-param-reassign
  lastSearchWord = lastSearchWord.toLowerCase();
  changeChoosenType(senderID, type, () => {
    models.SyncDate.findOrCreate({
      where:
      {
        sync_date: new Date().setHours(0, 0, 0, 0),
        type,
        search_word: lastSearchWord,
      },
      defaults: { user: senderID },
    }).spread(async (object, created) => {
      if (created) {
        await ImgurImagesConsumer(type, lastSearchWord, senderID);
        if (type === 'gallery') { await RedditImageHandler(senderID); }
      }
      sendMemeToUser(senderID); // send to user after bulk add first time
    });
  });
}
