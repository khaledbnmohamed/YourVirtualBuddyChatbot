
const axios = require('axios');
const querystring = require('querystring');
// const keys = require('../config/keys');


request.post('https://accounts.google.com/o/oauth2/token', {
  form: {
    grant_type:'refresh_token',
    refresh_token:'1/RqYFYGS2mgZkmE5946Hjn4SDIfxbytNLYf4IuXFs9hQqzZivT2F5xCEbkMBsCtSw',
        client_id: '998628160085-376til59858r8jqh4515t6cv72n4eilf.apps.googleusercontent.com',
        client_secret: '9J6TLTfv9nU7-KT8-5_5iwgy'
  }
}, function (err, res, body) {})



var token = getAccessToken;
console.log("get access_token" +  token);
