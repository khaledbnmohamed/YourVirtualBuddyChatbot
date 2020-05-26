const fs = require('fs');
const https = require('https');
const tools = require('../helpers/sendFunctions');
const { formingElements } = require('./response_handler');

const fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));
const { CLIENT_ID } = process.env;
const { IMGUR_ACCESS_TOKEN } = process.env;

export function ImgurImagesConsumer(type, SearchQuery, senderID) {
  let options = {
    method: 'GET',
    hostname: 'api.imgur.com',
    path: `/3/gallery/search/top/{{window}}/{{page}}?q=${SearchQuery}`,
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
    fileObject.want_more = true;
    let searchWord = SearchQuery;
    if (!searchWord) {
      searchWord = 'memes';
      fileObject.search_word = searchWord;
      fs.writeFileSync('./inputMemory.json', JSON.stringify(fileObject, null, 2), 'utf-8');
    } else {
      searchWord = encodeURIComponent(searchWord);
    }
  }
  // Imgur API Gallery Search Request
  // console.log(SearchQuery);


  const req = https.request(options, (res) => {
    const chunks = [];
    res.on('data', (chunk) => {
      chunks.push(chunk);
    });
    res.on('end', (chunk) => {
      const body = Buffer.concat(chunks);
      formingElements(body, type, senderID);
    });
    res.on('error', (error) => {
      console.error(error);
      return false;
    });
  });
  req.end();
  
  // console.log(body);
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
