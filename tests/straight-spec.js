describe('GW2API', function() {
	beforeEach(module('redglow.gw2api'));
	
	function doTest($httpBackend, GW2API, url, methodName, myResponse) {
		var myToken = '0BF23BD3-AD51-E841-BAA9-72848B98E554';
		$httpBackend.expect('GET', url, undefined, function(headers) {
			return headers.Authorization == 'Bearer ' + myToken;
		}).respond(myResponse);
		var answer;
		GW2API[methodName](myToken).then(function(data) {
			answer = data;
		});
		$httpBackend.flush();
		expect(answer).toEqual(myResponse);
	}
	
	it('correctly asks for token info', inject(function($httpBackend, GW2API) {
		doTest($httpBackend, GW2API, 'https://api.guildwars2.com/v2/tokeninfo', 'getTokenInfo', {
			"id": "0BF23BD3-AD51-E841-BAA9-72848B98E554",
			"name": "Gandara-TS",
			"permissions": [ "account" ]
		});
	}));
	
	it('correctly asks for bank contents', inject(function($httpBackend, GW2API) {
		doTest($httpBackend, GW2API, 'https://api.guildwars2.com/v2/account/bank', 'getBank', [ 
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
		]);
	}));
	
	it('correctly asks for the materials', inject(function($httpBackend, GW2API) {
		doTest($httpBackend, GW2API, 'https://api.guildwars2.com/v2/account/materials', 'getMaterials', [
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
		]);
	}));
	
	it('correctly asks for the characters', inject(function($httpBackend, GW2API) {
		doTest($httpBackend, GW2API, 'https://api.guildwars2.com/v2/characters', 'getCharacters', [
			"Reddeth Gibur",
			"Reddeth Tanaí",
			"Reddeth Gurow",
			"Reddeth Pondsson",
			"Tacitus Valvecrash",
			"Reddeth Paleclaw",
			"Reddeth Fenn",
			"Reddeth Kentar",
			"Thaumaturgist Toxx",
			"Reddeth Hrafnkin"
		]);
	}));
});