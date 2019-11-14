


const 
sk = require('./../../config/SecretKeys.js'),
tools = require('./../../sendFunctions.js');

fs = require('fs');
var fileObject = JSON.parse(fs.readFileSync('./inputMemory.json', 'utf8'));
var clientId = sk.getClientID();

module.exports = function() {

 this.public_images_consumer = function(senderID, Search_query) {
    fileObject.want_more = true;
    if (!Search_query) {
        Search_query = "memes"
        fileObject.search_word = Search_query
        fs.writeFileSync('./inputMemory.json', JSON.stringify(fileObject, null, 2), 'utf-8');
    }
    else {

        Search_query = encodeURIComponent(Search_query);
    }
    //Imgur API Gallery Search Request
    var https = require('https');
    // console.log(Search_query);

    var options = {
        'method': 'GET',
        'hostname': 'api.imgur.com',
        'path': '/3/gallery/search/{{sort}}/{{window}}/{{page}}?q=' + Search_query,
        'headers': {
            'Authorization': 'Client-ID ' + clientId
        }
    };
    var req = https.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function (chunk) {
            var body = Buffer.concat(chunks);
            // console.log(JSON.parse(body).data[0])
            console.log(options.path)
            let image_link = formingElements(body, senderID, false)
            if (!image_link) {
                image_link = formingElements(body, senderID, false)
            }
            else {
                //Handling empty image responses 
                tools.sendTypingOff(senderID);
                tools.sendImageMessage(senderID, image_link);
            }
        });
        res.on("error", function (error) {
            console.error(error);
        });
    });

    req.end();
    // console.log(body);
},

 this.personal_images_consumer=function(senderID, Search_query) {
    //Imgur API Gallery Search Request
    var https = require('https');
    var options = {
        'method': 'GET',
        'hostname': 'api.imgur.com',
        'path': '/3/account/khaledbnmohamed/images',
        'headers': {
            'Authorization': 'Bearer ' + imgur_access_token
        }
    };
    var req = https.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function (chunk) {
            var body = Buffer.concat(chunks);
            let image_link = formingElements(body, senderID, true)
            if (image_link) {
                tools.sendTypingOff(senderID);
                tools.sendImageMessage(senderID, image_link);
            }
        });
        res.on("error", function (error) {
            console.error(error);
        });
    });
    req.end();
    // console.log(body);
}
};