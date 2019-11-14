var clientId = '8056e5db3f369d1'
var imgur_access_token = '2a8f6dacd57b657d8f9542b166724964c1ed8f8f'
var imgur_username = 'khaledbnmohamed'
var google_project_id = 'myvirtualbuddy-fab9e' // from google console
var databaseURL = 'postgres://oaqihykkdtrvug:fa4da0b599c058e98801e574f1081c2f9490d79243ce9646f046776d0b1eb90b@ec2-50-19-114-27.compute-1.amazonaws.com:5432/d7epf5aalru69j'
module.exports = {
		getClientID: function (){

			return clientId;
		},
		getDatabaseURL: function (){
			return databaseURL;
		},
		getImgurAccessToken: function (){
			return imgur_access_token;
		},
		getImgurUserName: function (){
			return imgur_username;
		},
		getGoogleProjectID: function (){
			return google_project_id;
		}
	}