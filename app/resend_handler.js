import { ImgurImagesConsumer } from './imgur_handler/api_consumer';
import { sendMemeToUser } from './controllers/sent_memes';
import { changeChoosenType } from './controllers/users';

const models = require('../database/models');

// eslint-disable-next-line import/prefer-default-export
export function chooseCaller(type, lastSearchWord, senderID) {
  // eslint-disable-next-line no-param-reassign
  lastSearchWord = encodeURIComponent(lastSearchWord);

  changeChoosenType(senderID, type, () => {
    models.SyncDate.findAll({
      limit: 1,
      order: [['createdAt', 'DESC']],
    }).then((lastUpdate) => {
      if (lastUpdate[0]
      && lastUpdate[0].sync_date.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
      && lastUpdate[0].type === type
      && lastUpdate[0].search_word === lastSearchWord) {
        sendMemeToUser(senderID);
      } else {
        ImgurImagesConsumer(type, lastSearchWord, senderID);
      }
    });
  });
}
