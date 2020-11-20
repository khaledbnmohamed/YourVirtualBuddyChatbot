// Holding ALL send functions in the bots for easier use
import { changeWantMore, getUser } from '../controllers/users';

const express = require('express');
const request = require('request');

const app = express();
app.set('port', process.env.PORT || 5001);

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN)
  ? (process.env.MESSENGER_PAGE_ACCESS_TOKEN)
  : process.env.PAGE_ACCESS_TOKEN;
const { SERVER_URL } = process.env;


module.exports = {
  /*
   * Call the Send API. The message data goes in the body. If successful, we'll
   * get the message id in a response
   *
   */
  checkToSendMore(senderID) {
    getUser(senderID, (user) => {
      if (user.want_more) this.SendMore(senderID);
    });
    changeWantMore(senderID, false);
  },
  sendHiMessage(recipientId) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: `
Hi,

I'm here to help you on your bad days. Try out "memes", "send meme" to see magic (SPOILER:it'll be a meme). More functionalities are to come

I really hope one day, You'll find the right person to forward these memes to <3
      `,
      },
    };
    changeWantMore(recipientId, false);
    callSendAPI(messageData);
  },

  /*
     * Send an image using the Send API.
     *
     */
  sendImageMessage(recipientId, image_message_url) {
    this.sendTypingOn(recipientId);

    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url: image_message_url,
          },
        },
      },
    };

    callSendAPI(messageData);
    changeWantMore(recipientId, true);
    this.sendTypingOff(recipientId);
  },

  /*
     * Send audio using the Send API.
     *
     */
  sendAudioMessage(recipientId) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'audio',
          payload: {
            url: `${SERVER_URL}/assets/sample.mp3`,
          },
        },
      },
    };

    callSendAPI(messageData);
  },

  /*
     * Send a video using the Send API.
     *
     */
  sendVideoMessage(recipientId) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'video',
          payload: {
            url: `${SERVER_URL}/assets/allofus480.mov`,
          },
        },
      },
    };

    callSendAPI(messageData);
  },

  /*
     * Send a file using the Send API.
     *
     */
  sendFileMessage(recipientId) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'file',
          payload: {
            url: `${SERVER_URL}/assets/test.txt`,
          },
        },
      },
    };

    callSendAPI(messageData);
  },

  /*
     * Send a text message using the Send API.
     *
     */
  sendTextMessage(recipientId, messageText) {
    this.sendTypingOn(recipientId);

    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: messageText,
        metadata: 'DEVELOPER_DEFINED_METADATA',
      },
    };

    changeWantMore(recipientId, false);
    callSendAPI(messageData);
    this.sendTypingOff(recipientId);
  },

  /*
     * Send a button message using the Send API.
     *
     */
  sendButtonMessage(recipientId) {
    this.sendTypingOn(recipientId);

    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: 'This is test text',
            buttons: [{
              type: 'web_url',
              url: 'https://www.oculus.com/en-us/rift/',
              title: 'Open Web URL',
            }, {
              type: 'postback',
              title: 'Trigger Postback',
              payload: 'DEVELOPER_DEFINED_PAYLOAD',
            }, {
              type: 'phone_number',
              title: 'Call Phone Number',
              payload: '+16505551234',
            }],
          },
        },
      },
    };

    callSendAPI(messageData);
    this.sendTypingOff(recipientId);
  },
  /*
     * Send a message with Quick Reply buttons.
     *
     */
  sendQuickReply(recipientId) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: "What's your favorite category?",
        quick_replies: [
          {
            content_type: 'text',
            title: 'Sad Memes',
            payload: 'sad memes',
          },
          {
            content_type: 'text',
            title: 'Love memes',
            payload: 'love memes',
          },
          {
            content_type: 'text',
            title: 'Surprise Me !',
            payload: 'account_memes',
          },
        ],
      },
    };

    callSendAPI(messageData);
  },


  SendMore(recipientId) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        text: 'More from the same category?',
        quick_replies: [
          {
            content_type: 'text',
            title: 'Yes',
            payload: 'send_alike',
          },
          {
            content_type: 'text',
            title: 'No',
            payload: 'do nothing',
          },
        ],
      },
    };
    callSendAPI(messageData);
  },

  /*
     * Send a read receipt to indicate the message has been read
     *
     */
  sendReadReceipt(recipientId) {
    console.log('Sending a read receipt to mark message as seen');

    const messageData = {
      recipient: {
        id: recipientId,
      },
      sender_action: 'mark_seen',
    };

    callSendAPI(messageData);
  },

  /*
     * Turn typing indicator on
     *
     */
  sendTypingOn(recipientId) {
    console.log('Turning typing indicator on');

    const messageData = {
      recipient: {
        id: recipientId,
      },
      sender_action: 'typing_on',
    };

    callSendAPI(messageData);
  },

  /*
     * Turn typing indicator off
     *
     */
  sendTypingOff(recipientId) {
    console.log('Turning typing indicator off');

    const messageData = {
      recipient: {
        id: recipientId,
      },
      sender_action: 'typing_off',
    };

    callSendAPI(messageData);
  },

  /*
     * Send a message with the account linking call-to-action
     *
     */
  sendAccountLinking(recipientId) {
    console.log('sendAccountLinkingsendAccountLinkingsendAccountLinkingsendAccountLinkingsendAccountLinkingsendAccountLinkingsendAccountLinkingsendAccountLinking');
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: 'Welcome. Link your account.',
            buttons: [{
              type: 'account_link',
              url: `${SERVER_URL}/authorize`,
            }],
          },
        },
      },
    };

    callSendAPI(messageData);
  },

};

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData,

  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const recipientId = body.recipient_id;
      const messageId = body.message_id;

      if (messageId) {
        console.log('Successfully sent message with id %s to recipient %s',
          messageId, recipientId);
      } else {
        console.log('Successfully called Send API for recipient %s',
          recipientId);
      }
    } else {
      console.error('Failed calling Send API', response.statusCode, response.statusMessage, body.error);
    }
  });
}
