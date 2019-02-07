
const axios = require('axios');
const querystring = require('querystring');
// const keys = require('../config/keys');



const getAccessToken = async refreshToken => {
  try {
    const accessTokenObj = await axios.post(
      'https://www.googleapis.com/oauth2/v4/token',
      querystring.stringify({
        refresh_token: '1/RqYFYGS2mgZkmE5946Hjn4SDIfxbytNLYf4IuXFs9hQqzZivT2F5xCEbkMBsCtSw',
        client_id: '998628160085-376til59858r8jqh4515t6cv72n4eilf.apps.googleusercontent.com',
        client_secret: '9J6TLTfv9nU7-KT8-5_5iwgy',
        grant_type: 'refresh_token'
      })
    );
    console.log("I'm here")
    console.log("accessTokenObj.data.access_token"+accessTokenObj.data.access_token)
    return accessTokenObj.data.access_token;
  } catch (err) {
    console.log(err);
  }
};

var token = getAccessToken;
console.log("get access_token" +  token);
