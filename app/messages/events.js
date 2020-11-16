import { handlePayload } from './payload';

const crypto = require('crypto');

const tools = require('../helpers/send_functions');

// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET)
  ? process.env.MESSENGER_APP_SECRET
  : process.env.APP_SECRET;


/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
 *
 */
export function receivedAuthentication(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfAuth = event.timestamp;
  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger'
  // plugin.
  const passThroughParam = event.optin.ref;

  console.log('Received authentication for user %d and page %d with pass '
      + "through param '%s' at %d", senderID, recipientID, passThroughParam,
  timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  tools.sendTextMessage(senderID, 'Authentication successful');
}

/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
export function verifyRequestSignature(req, res, buf) {
  const signature = req.headers['x-hub-signature'];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    const elements = signature.split('=');
    const method = elements[0];
    const signatureHash = elements[1];

    const expectedHash = crypto.createHmac('sha1', APP_SECRET)
      .update(buf)
      .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
 *
 */
export function receivedPostback(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfPostback = event.timestamp;
  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  const { payload } = event.postback;
  if (event.postback) {
    handlePayload(event.postback.payload, senderID);
  }

  console.log("Received postback for user %d and page %d with payload '%s' "
      + 'at %d', senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful
}
/*
 * Message Read Event
 *
 * This event is called when a previously-sent message has been read.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
 *
 */
export function receivedMessageRead(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  // All messages before watermark (a timestamp) or sequence have been seen.
  const { watermark } = event.read;
  const sequenceNumber = event.read.seq;

  console.log('Received message read event for watermark %d and sequence '
      + 'number %d', watermark, sequenceNumber);

  tools.checkToSendMore(senderID);
}

/*
 * Account Link Event
 *
 * This event is called when the Link Account or UnLink Account action has been
 * tapped.
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
 *
 */
export function receivedAccountLink(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const { status } = event.account_linking;
  const authCode = event.account_linking.authorization_code;

  console.log('Received account link event with for user %d with status %s '
      + 'and auth code %s ', senderID, status, authCode);
}

export function receivedDeliveryConfirmation(event) {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const { delivery } = event;
  const messageIDs = delivery.mids;
  const { watermark } = delivery;
  const sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach((messageID) => {
      console.log('Received delivery confirmation for message ID: %s',
        messageID);
    });
  }
  console.log('All message before %d were delivered.', watermark);
}
