import { ImgurImagesConsumer } from './imgur_handler/api_consumer';
import { sendMemeToUser } from './controllers/sent_memes';
import { changeChoosenType } from './controllers/users';

const models = require('../database/models');

// eslint-disable-next-line import/prefer-default-export
export function chooseCaller(type, lastSearchWord, senderID) {
  changeChoosenType(senderID, type, () => {
    models.SyncDate.findAll({
      limit: 1,
      order: [['createdAt', 'DESC']],
    }).then((lastUpdate) => {
      if (lastUpdate[0]
      && lastUpdate[0].sync_date.setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
      && lastUpdate[0].type === type) {
        sendMemeToUser(senderID);
      } else {
        ImgurImagesConsumer(type, lastSearchWord, senderID);
      }
    });
  });

  if (lastSearchWord == null) {
    lastSearchWord = 'memes'; // special case for send meme
    console.log(`lastSearchWord ${lastSearchWord}`);
  }
}
