import { addSearchWord, getUser } from '../controllers/users';

const https = require('https');
const { formingElements } = require('./response_handler');

const { CLIENT_ID } = process.env;
const { IMGUR_ACCESS_TOKEN } = process.env;

export function ImgurImagesConsumer(type, SearchQuery, senderID) {
  getUser(senderID, (user) => {
    const searchBy = user.sort_by_latest ? 'viral' : 'top';
    // eslint-disable-next-line no-param-reassign
    let options = {
      method: 'GET',
      hostname: 'api.imgur.com',
      path: `/3/gallery/search/${searchBy}/{{window}}/{{page}}?q=${encodeURIComponent(SearchQuery)}`,
      headers: {
        Authorization: `Client-ID ${CLIENT_ID}`,
      },
    };
    if (type === 'account') {
      options = {
        method: 'GET',
        hostname: 'api.imgur.com',
        path: '/3/account/khaledbnmohamed/images',
        headers: {
          Authorization: `Bearer ${IMGUR_ACCESS_TOKEN}`,
        },
      };
    } else {
      addSearchWord(senderID, SearchQuery);
    }

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        formingElements(body, type, senderID, SearchQuery);
      });
      res.on('error', (error) => {
        console.error(error);
        return false;
      });
    });
    req.end();
  });
}

export function uploadToAccount(senderID, image) {
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
}
