describe('GW2API', function() {
	beforeEach(module('redglow.gw2api'));
	it('correctly asks for token info', inject(function($httpBackend, GW2API) {
		var myToken = '0BF23BD3-AD51-E841-BAA9-72848B98E554',
			myResponse = {
				"id": "0BF23BD3-AD51-E841-BAA9-72848B98E554",
				"name": "Gandara-TS",
				"permissions": [ "account" ]
			};
		$httpBackend.expect('GET', 'https://api.guildwars2.com/v2/tokeninfo', undefined, function(headers) {
			return headers.Authorization == 'Bearer ' + myToken;
		}).respond(myResponse);
		var answer;
		GW2API.getTokenInfo(myToken).then(function(data) {
			answer = data;
		});
		$httpBackend.flush();
		expect(answer).toEqual(myResponse);
	}));
});