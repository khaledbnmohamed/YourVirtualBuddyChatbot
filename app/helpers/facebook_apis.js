// export function getFirstName(senderID, callback) {
//   const https = require('https');
//   const access_token = PAGE_ACCESS_TOKEN;

//   let first_name = '';
//   const options = {
//     method: 'GET',
//     hostname: 'graph.facebook.com',
//     path: `/v7.0/${senderID}?fields=first_name&access_token=${access_token}`,
//   };
//   const req = https.request(options, (res) => {
//     const chunks = [];
//     res.on('data', (chunk) => {
//       chunks.push(chunk);
//     });

//     res.on('end', (chunk) => {
//       const body = Buffer.concat(chunks);
//       first_name = JSON.parse(body).first_name;
//       callback('', first_name);
//     });

//     res.on('error', (error) => {
//       console.error(error);
//       callback(error, '');
//     });
//   });

//   req.end();
// }

export function getFirstName(account_linking_token, callback ) {
  const https = require('https');
  const access_token = process.env.PAGE_ACCESS_TOKEN;

  let first_name = '';
  const options = {
    method: 'GET',
    hostname: 'graph.facebook.com',
    path: `v2.6/me?access_token=${access_token}N&fields=recipient&account_linking_token=${account_linking_token}`,
  };
  const req = https.request(options, (res) => {
    const chunks = [];
    res.on('data', (chunk) => {
      chunks.push(chunk);
    });

    res.on('end', (chunk) => {
      const body = Buffer.concat(chunks);
      first_name = JSON.parse(body).first_name;
      callback('', first_name);
    });

    res.on('error', (error) => {
      console.error(error);
      callback(error, '');
    });
  });

  req.end();
}
