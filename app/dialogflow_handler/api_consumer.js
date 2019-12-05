

const
  tokenFile = require('./../helpers/JWTtoken.js');



//Secret Keys saved in different file for security 
var
  GOOGLE_PROJET_ID = process.env.GOOGLE_PROJET_ID
  google_access_token = tokenFile.sign();

module.exports = function () {

  this.sendtoDialogFlow = function (MessagetoDialogFlow, callback) {
    var CallBackReturn;
    var https = require('https');
    var DFchunks = [];
    const data = JSON.stringify({
      "queryInput": {
        "text": {
          "languageCode": "en",
          "text": MessagetoDialogFlow
        }
      }
    })
    const options = {
      method: 'POST',
      host: 'dialogflow.googleapis.com',
      path: '/v2beta1/projects/' + GOOGLE_PROJET_ID + '/agent/environments/draft/users/6542423/sessions/124567:detectIntent',
      headers: {

        'Authorization': 'Bearer ' + google_access_token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'

      }
    }
    var req = https.request(options, (res) => {
      res.on('data', (d) => { process.stdout.write(d) })


      res.on("data", function (DF) {
        DFchunks.push(DF);
        res.on("end", function (DF) {
          var body = Buffer.concat(DFchunks);
          var parsed = JSON.parse(body)
          res.on("error", function (error) {
            console.error(error);
            callback(error, "")
          });

          if (JSON.stringify(parsed.queryResult.parameters) != "{}") {
            if (parsed.queryResult.parameters.sendmeme !== undefined) {
              DialogflowhasParameters = true
              CallBackReturn = parsed.queryResult.parameters.sendmeme;

            }
            else {
              DialogflowhasParameters = false
              CallBackReturn = parsed.queryResult.fulfillmentText;
            }
          }
          else {
            DialogflowhasParameters = false;
            try {
              if (parsed.queryResult.action == "repeat" && parsed.alternativeQueryResults[0].knowledgeAnswers.answers[0].matchConfidence > 0.41) {
                CallBackReturn = parsed.alternativeQueryResults[0].knowledgeAnswers.answers[0].answer;
                returnedFromKnoweldge = true;
              }
              else {
                CallBackReturn = parsed.queryResult.fulfillmentText;
              }
            }
            catch (err) {
              CallBackReturn = parsed.queryResult.fulfillmentText;
            }
          }
          callback("", CallBackReturn);
        });
      });
    })
    req.on("error", (error) => { console.error(error) })
    req.write(data)
    req.end()

  }
};