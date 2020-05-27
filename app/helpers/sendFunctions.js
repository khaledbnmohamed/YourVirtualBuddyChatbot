// 'module.exports' is a node.JS specific feature, it does not work with regular JavaScript

// Holding ALL send functions in the bots for easier use

const
  express = require('express');
const request = require('request');
const fs = require('fs');

const ImageLink = 'https://i.imgur.com/KZC2CW9.jpg';
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
  requiresSERVER_URL(next, [recipientId, ...args]) {
    if (SERVER_URL === 'to_be_set_manually') {
      const messageData = {
        recipient: {
          id: recipientId,
        },
        message: {
          text: `
We have static resources like images and videos available to test, but you need to update the code you downloaded earlier to tell us your current server url.
1. Stop your node server by typing ctrl-c
2. Paste the result you got from running "lt —port 5001" into your config/default.json file as the "SERVER_URL".
3. Re-run "node app.js"
Once you've finished these steps, try typing “video” or “image”.
        `,
        },
      };

      callSendAPI(messageData);
    } else {
      next.apply(this, [recipientId, ...args]);
    }
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
    this.sendTypingOff(recipientId);
  },


  /*
     * Send a meme using the Send API.
     *
     */
  sendMemeMessage(recipientId) {
    // var SearchQuery = messageText;
    // ImageLink= ImgurImagesConsumer(senderID);
    this.sendTypingOn(recipientId);

    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url: ImageLink,
          },
        },
      },
    };

    callSendAPI(messageData);
    this.sendTypingOff(recipientId);
  },
  /*
     * Send a Gif using the Send API.
     *
     */
  sendGifMessage(recipientId) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'image',
          payload: {
            url: `${SERVER_URL}/assets/instagram_logo.gif`,
          },
        },
      },
    };

    callSendAPI(messageData);
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
     * Send a Structured Message (Generic Message type) using the Send API.
     *
     */
  sendGenericMessage(recipientId) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: 'rift',
              subtitle: 'Next-generation virtual reality',
              item_url: 'https://www.oculus.com/en-us/rift/',
              image_url: `${SERVER_URL}/assets/rift.png`,
              buttons: [{
                type: 'web_url',
                url: 'https://www.oculus.com/en-us/rift/',
                title: 'Open Web URL',
              }, {
                type: 'postback',
                title: 'Call Postback',
                payload: 'Payload for first bubble',
              }],
            }, {
              title: 'touch',
              subtitle: 'Your Hands, Now in VR',
              item_url: 'https://www.oculus.com/en-us/touch/',
              image_url: `${SERVER_URL}/assets/touch.png`,
              buttons: [{
                type: 'web_url',
                url: 'https://www.oculus.com/en-us/touch/',
                title: 'Open Web URL',
              }, {
                type: 'postback',
                title: 'Call Postback',
                payload: 'Payload for second bubble',
              }],
            }],
          },
        },
      },
    };

    callSendAPI(messageData);
  },

  /*
     * Send a receipt message using the Send API.
     *
     */
  sendReceiptMessage(recipientId) {
    // Generate a random receipt ID as the API requires a unique ID
    const receiptId = `order${Math.floor(Math.random() * 1000)}`;

    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'receipt',
            recipient_name: 'Peter Chang',
            order_number: receiptId,
            currency: 'USD',
            payment_method: 'Visa 1234',
            timestamp: '1428444852',
            elements: [{
              title: 'Oculus Rift',
              subtitle: 'Includes: headset, sensor, remote',
              quantity: 1,
              price: 599.00,
              currency: 'USD',
              image_url: `${process.env.SERVER_URL}/assets/riftsq.png`,
            }, {
              title: 'Samsung Gear VR',
              subtitle: 'Frost White',
              quantity: 1,
              price: 99.99,
              currency: 'USD',
              image_url: `${SERVER_URL}/assets/gearvrsq.png`,
            }],
            address: {
              street_1: '1 Hacker Way',
              street_2: '',
              city: 'Menlo Park',
              postal_code: '94025',
              state: 'CA',
              country: 'US',
            },
            summary: {
              subtotal: 698.99,
              shipping_cost: 20.00,
              total_tax: 57.67,
              total_cost: 626.66,
            },
            adjustments: [{
              name: 'New Customer Discount',
              amount: -50,
            }, {
              name: '$100 Off Coupon',
              amount: -100,
            }],
          },
        },
      },
    };

    callSendAPI(messageData);
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
            payload: 'personal_AccountMemes',
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
    if (!error && response.statusCode == 200) {
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
