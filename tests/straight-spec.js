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
	
	it('correctly asks for bank contents', inject(function($httpBackend, GW2API) {
		var myToken = '0BF23BD3-AD51-E841-BAA9-72848B98E554',
			myResponse = [ 
				{
					"id": 47874,
					"count": 1,
					"upgrades": [ 24685 ]
				},
				{
					"id": 36003,
					"count": 1,
					"upgrades": [36044]
				},
				{
					"id": 42418,
					"count": 1
				}
			];
		$httpBackend.expect('GET', 'https://api.guildwars2.com/v2/account/bank', undefined, function(headers) {
			return headers.Authorization == 'Bearer ' + myToken;
		}).respond(myResponse);
		var answer;
		GW2API.getBank(myToken).then(function(data) {
			answer = data;
		});
		$httpBackend.flush();
		expect(answer).toEqual(myResponse);
	}));
	
	it('correctly asks for the materials', inject(function($httpBackend, GW2API) {
		var myToken = '0BF23BD3-AD51-E841-BAA9-72848B98E554',
			myResponse = [
				{
					"id": 12134,
					"category": 5,
					"count": 436
				},
				{
					"id": 12238,
					"category": 5,
					"count": 126
				},
				{
					"id": 12147,
					"category": 5,
					"count": 167
				}
			];
		$httpBackend.expect('GET', 'https://api.guildwars2.com/v2/account/materials', undefined, function(headers) {
			return headers.Authorization == 'Bearer ' + myToken;
		}).respond(myResponse);
		var answer;
		GW2API.getMaterials(myToken).then(function(data) {
			answer = data;
		});
		$httpBackend.flush();
		expect(answer).toEqual(myResponse);
	}));
});