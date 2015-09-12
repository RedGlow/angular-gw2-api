describe('GW2API', function() {
	beforeEach(module('redglow.gw2api', function(GW2APIProvider) {
		// exclude the local storage usage
		GW2APIProvider.cacheFactories = [];
	}));
	
	function doTest($httpBackend, GW2API, url, methodName, myResponse, skipToken) {
		var myToken = '0BF23BD3-AD51-E841-BAA9-72848B98E554';
		if(!skipToken) {
			if(url.indexOf("?") == -1) {
				url += "?access_token=" + myToken;
			} else {
				url += "&access_token=" + myToken;
			}
		}
		$httpBackend.expect('GET', url, undefined).respond(myResponse);
		var answer;
		expect(GW2API.getNumRunningRequests()).toBe(0);
		GW2API[methodName](myToken).then(function(data) {
			answer = data;
		});
		expect(GW2API.getNumRunningRequests()).toBe(1);
		$httpBackend.flush();
		expect(GW2API.getNumRunningRequests()).toBe(0);
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

	it('correctly asks for a character', inject(function($httpBackend, GW2API) {
		var myToken = '0BF23BD3-AD51-E841-BAA9-72848B98E554';
		var myResponse = {
			"name": "test",
			"race": "Norn"
		};
		var url = "https://api.guildwars2.com/v2/characters/test?access_token=" + myToken;
		$httpBackend.expect('GET', url, undefined).respond(myResponse);
		var answer;
		GW2API.getCharacter('test', myToken).then(function(data) {
			answer = data;
		});
		$httpBackend.flush();
		expect(answer).toEqual(myResponse);
	}));

	it('correctly searches for recipes', inject(function($httpBackend, GW2API) {
		var myToken = '0BF23BD3-AD51-E841-BAA9-72848B98E554';
		var myResponse = [5114];
		var url = "https://api.guildwars2.com/v2/recipes/search?output=19622";
		$httpBackend.expect('GET', url).respond(myResponse);
		var answer;
		GW2API.getRecipeIdsByOutput(19622).then(function(data) {
			answer = data;
		});
		$httpBackend.flush();
		expect(answer).toEqual(myResponse);
	}));
	
	it('correctly asks for the currencies', inject(function($httpBackend, GW2API) {
		doTest($httpBackend, GW2API, 'https://api.guildwars2.com/v2/currencies', 'getCurrencies', [
			1,
			2,
			3,
			4,
			5,
			6,
			7,
			9,
			10,
			11,
			12,
			13,
			14,
			15,
			16,
			18,
			23,
			24,
			25,
			26,
			27
		], true);
	}));

	it('correctly asks for the wallet contents', inject(function($httpBackend, GW2API) {
		doTest($httpBackend, GW2API, 'https://api.guildwars2.com/v2/account/wallet', 'getWallet', [
			{
				"id": 1,
				"value": 9107193
			},
			{
				"id": 2,
				"value": 2937100
			},
			{
				"id": 3,
				"value": 546
			},
			{
				"id": 5,
				"value": 75
			},
			{
				"id": 6,
				"value": 162
			},
			{
				"id": 7,
				"value": 111
			},
			{
				"id": 9,
				"value": 201
			},
			{
				"id": 10,
				"value": 198
			},
			{
				"id": 11,
				"value": 99
			},
			{
				"id": 12,
				"value": 213
			},
			{
				"id": 13,
				"value": 657
			},
			{
				"id": 14,
				"value": 36
			},
			{
				"id": 15,
				"value": 1972
			},
			{
				"id": 16,
				"value": 9
			},
			{
				"id": 17,
				"value": 428
			},
			{
				"id": 18,
				"value": 39
			},
			{
				"id": 23,
				"value": 2225
			},
			{
				"id": 24,
				"value": 18
			},
			{
				"id": 25,
				"value": 130
			},
			{
				"id": 26,
				"value": 750
			},
			{
				"id": 27,
				"value": 2894
			}
		]);
	}));
});