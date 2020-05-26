import { ImgurImagesConsumer } from './imgur_handler/api_consumer';

const SortImagesbyPoints = true;
const uniqueRandoms = [];
const SortedByPointsCounter = 0; // initlize the i globally for easer access so don't have to write extra code to determine if first query to set i =0 or not

const FirstQuery = true;
const counter = 0;

const
  fs = require('fs');
const tools = require('./helpers/sendFunctions.js');

const fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));

export function saveToFile(number, word, wantMore) {
  fileObject.functionNumber = number;
  fileObject.seach_word = word;
  fileObject.wantMore = wantMore;
  fs.writeFileSync('./inputMemory.json', JSON.stringify(fileObject, null, 2), 'utf-8');
}
export function chooseCaller(type, lastSearchWord, senderID) {
  /*
    1== for personal account api
    2== gallery
     */
  if (lastSearchWord == null) {
    lastSearchWord = 'memes'; // special case for send meme
    console.log(`lastSearchWord ${lastSearchWord}`);
  }
  ImgurImagesConsumer(senderID, type, lastSearchWord);
}
