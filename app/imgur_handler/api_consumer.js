const
  fs = require('fs');
const tools = require('../helpers/sendFunctions.js');

const fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));
const { CLIENT_ID } = process.env;
const { IMGUR_ACCESS_TOKEN } = process.env;

module.exports = function () {
  this.public_images_consumer = function (senderID, Search_query) {
    fileObject.want_more = true;
    if (!Search_query) {
      Search_query = 'memes';
      fileObject.search_word = Search_query;
      fs.writeFileSync('./inputMemory.json', JSON.stringify(fileObject, null, 2), 'utf-8');
    } else {
      Search_query = encodeURIComponent(Search_query);
    }
    // Imgur API Gallery Search Request
    const https = require('https');
    // console.log(Search_query);

    const options = {
      method: 'GET',
      hostname: 'api.imgur.com',
      path: `/3/gallery/search/top/{{window}}/{{page}}?q=${Search_query}`,
      headers: {
        Authorization: `Client-ID ${CLIENT_ID}`,
      },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      res.on('end', (chunk) => {
        const body = Buffer.concat(chunks);
        // console.log(JSON.parse(body).data[0])
        console.log(options.path);
        let image_link = formingElements(body, senderID, false);
        if (!image_link) {
          image_link = formingElements(body, senderID, false);
        } else {
          // Handling empty image responses
          tools.sendTypingOff(senderID);
          tools.sendImageMessage(senderID, image_link);
        }
      });
      res.on('error', (error) => {
        console.error(error);
      });
    });

    req.end();
    // console.log(body);
  },

  this.personal_images_consumer = function (senderID, Search_query) {
    // Imgur API Gallery Search Request
    const https = require('https');
    const options = {
      method: 'GET',
      hostname: 'api.imgur.com',
      path: '/3/account/khaledbnmohamed/images',
      headers: {
        Authorization: `Bearer ${IMGUR_ACCESS_TOKEN}`,
      },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      res.on('end', (chunk) => {
        const body = Buffer.concat(chunks);
        const image_link = formingElements(body, senderID, true);
        if (image_link) {
          tools.sendTypingOff(senderID);
          tools.sendImageMessage(senderID, image_link);
        }
      });
      res.on('error', (error) => {
        console.error(error);
      });
    });
    req.end();
    // console.log(body);
  },
  this.uploadToAccount = function (senderID, image) {
    const https = require('https');

    const options = {
      method: 'POST',
      hostname: 'api.imgur.com',
      path: '/3/image',
      headers: {
        Authorization: `Bearer ${IMGUR_ACCESS_TOKEN}`,
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', (chunk) => {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
      });

      res.on('error', (error) => {
        console.error(error);
      });
    });

    const postData = `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="image"\r\n\r\n${image}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--`;

    req.setHeader('content-type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');

    req.write(postData);

    req.end();
  };
};
