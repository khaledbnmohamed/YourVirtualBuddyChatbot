import { getUser } from './controllers/users';

const resend = require('./resend_handler.js');

const tools = require('./helpers/send_functions.js');


/* quick reply send like */
export function sendLike(senderID) {
  getUser(senderID, (user) => {
    resend.chooseCaller(user.choosen_type, user.search_word, senderID);
  });
}
/* quick reply  do nothing* */
export function doNothing(senderID) {
  tools.sendTypingOff(senderID);
  tools.sendTextMessage(senderID, 'Whatever you want <3 ');
}
