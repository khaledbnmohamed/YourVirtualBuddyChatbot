const fs   = require('fs');
const jwt   = require('jsonwebtoken');

// use 'utf8' to get string instead of byte array  (512 bit key)
var privateKEY  = fs.readFileSync('./PrivateKey.key', 'utf8');

module.exports = {

 sign: () => {

 
var payload = {
 data1: "Data 1",
 data2: "Data 2",
 data3: "Data 3",
 data4: "Data 4",
};   



   // Token signing options
  var signOptions = {
      issuer:  "dialogflowversion2@myvirtualbuddy-fab9e.iam.gserviceaccount.com",
      subject: "dialogflowversion2@myvirtualbuddy-fab9e.iam.gserviceaccount.com",
      audience:  "https://dialogflow.googleapis.com/google.cloud.dialogflow.v2beta1.Sessions",
      expiresIn:  "1h",    // 30 days validity
      algorithm:  "RS256",
      keyid :"4285b9a752db1057b238729826e15e030c2824fb"    
  };
	// console.log(jwt.sign(payload, privateKEY, signOptions))
  return (jwt.sign(payload, privateKEY, signOptions));
},

 decode: (token) => {
    return jwt.decode(token, {complete: true});
    //returns null if token is invalid
 }
}

