var clientId = '8056e5db3f369d1'
var imgur_access_token = '2a8f6dacd57b657d8f9542b166724964c1ed8f8f'
var imgur_username = 'khaledbnmohamed'
var google_project_id = 'myvirtualbuddy-fab9e' // from google console
module.exports = {
		getClientID: function (){
			return clientId;
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