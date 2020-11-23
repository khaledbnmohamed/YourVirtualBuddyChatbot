
import { helpText } from '../../config/constant_messages';
import { chooseCaller } from '../resend_handler';

const tools = require('../helpers/send_functions.js');
// eslint-disable-next-line import/prefer-default-export
export function DialogFlowParameteresHandler(senderID, parameter) {
  // To Handle the search call from the dialogFlow function
  // TODO : Find a template calling theme for cleaner code
  if (parameter === 'surprise me') {
    // To access saved memes on my imgur account
    chooseCaller('account', parameter, senderID);
  } else if (parameter === 'help') {
    tools.sendTextMessage(senderID, helpText);
  } else {
    chooseCaller(parameter ? 'gallery' : 'account', parameter, senderID);
  }
}
