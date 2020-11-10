import { chooseCaller } from '../resend_handler';

const https = require('https');
const tokenFile = require('../helpers/JWTtoken');

const tools = require('../helpers/send_functions.js');

const { GOOGLE_PROJET_ID } = process.env;
const googleAccessToken = tokenFile.sign();

// eslint-disable-next-line import/prefer-default-export
export function sendtoDialogFlow(MessagetoDialogFlow, senderID, callback) {
  const DFchunks = [];
  const data = JSON.stringify({
    queryInput: {
      text: {
        languageCode: 'en',
        text: MessagetoDialogFlow,
      },
    },
  });
  const options = {
    method: 'POST',
    host: 'dialogflow.googleapis.com',
    path: `/v2beta1/projects/${GOOGLE_PROJET_ID}/agent/environments/draft/users/6542423/sessions/124567:detectIntent`,
    headers: {

      Authorization: `Bearer ${googleAccessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',

    },
  };
  const req = https.request(options, (res) => {
    res.on('data', (DF) => {
      DFchunks.push(DF);
      res.on('end', () => {
        const body = Buffer.concat(DFchunks);
        const parsed = JSON.parse(body);
        console.log('##############################3');
        console.log('##############################3');
        console.log('##############################3');
        console.log('##############################3');
        console.log('##############################3');
        handleResponse(parsed, senderID);
        res.on('error', (error) => {
          console.error(error);
          callback(error, '');
        });
      });
    });
  });
  req.on('error', (error) => { console.error(error); });
  req.write(data);
  req.end();
}

export function handleResponse(resp, senderID) {

  if (JSON.stringify(resp.queryResult.parameters) !== '{}') {
    if (resp.queryResult.parameters.sendmeme !== undefined) {
      const message = resp.queryResult.parameters.sendmeme;

      console.log(JSON.stringify(resp.queryResult.parameters));
      chooseCaller('gallery', message, senderID);
    } else {
      tools.sendTextMessage(senderID, resp.queryResult.fulfillmentText);
    }
  } else {
    try {
      if (resp.queryResult.action === 'repeat' && resp.alternativeQueryResults[0].knowledgeAnswers.answers[0].matchConfidence > 0.41) {
        const message = resp.alternativeQueryResults[0].knowledgeAnswers.answers[0].answer;
        tools.sendTextMessage(senderID, message);
      } else {
        tools.sendTextMessage(senderID, resp.queryResult.fulfillmentText);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
