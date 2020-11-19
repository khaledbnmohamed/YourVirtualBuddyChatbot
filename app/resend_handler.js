import { ImgurImagesConsumer } from './imgur_handler/api_consumer';
import { RedditImageHandler } from './reddit_handler/api_consumer';

import { sendMemeToUser } from './controllers/sent_memes';
import { changeChoosenType } from './controllers/users';

const models = require('../database/models');

// eslint-disable-next-line import/prefer-default-export
export function chooseCaller(type, lastSearchWord = 'memes', senderID) {
  changeChoosenType(senderID, type, () => {
    models.SyncDate.findAll({
      limit: 1,
      order: [['createdAt', 'DESC']],
    }).then(async (lastUpdate) => {
      if (lastUpdate[0]
      && lastUpdate[0].sync_date.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
      && lastUpdate[0].type === type
      && lastUpdate[0].search_word === lastSearchWord) {
        sendMemeToUser(senderID);
      } else {
        await ImgurImagesConsumer(type, lastSearchWord, senderID);
        await RedditImageHandler(senderID);
        sendMemeToUser(senderID); // send to user after bulk add first time
      }
    });
  });
}
