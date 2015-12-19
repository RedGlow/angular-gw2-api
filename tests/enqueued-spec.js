describe('GW2API', function() {
	beforeEach(module('redglow.gw2api', function(GW2APIProvider) {
		// exclude the local storage usage
		GW2APIProvider.cacheFactories = [];
	}));
	
	function testIdInterface(name, functionName, collection, prepare) {
		var ids = Object.getOwnPropertyNames(collection);
		var firstItemId = parseInt(ids[0], 10);
		var secondItemId = parseInt(ids[1], 10);
		describe('within the "' + name + '" interface', function() {
			it('returns a single item', inject(function($httpBackend, $timeout, GW2API) {
				var itemId = firstItemId;
				var expectedItemResponse = prepare($httpBackend, itemId)[0];
				var obtainedItem = null;
				expect(GW2API.getNumRunningRequests()).toBe(0);
				GW2API[functionName](itemId)
					.then(function(data) {
						obtainedItem = data;
					});
				expect(GW2API.getNumRunningRequests()).toBe(1);
				expect(obtainedItem).toBe(null);
				$timeout.flush(GW2API.getTimeoutDelay() * 2);
				expect(GW2API.getNumRunningRequests()).toBe(1);
				expect(obtainedItem).toBe(null);
				$httpBackend.flush();
				expect(GW2API.getNumRunningRequests()).toBe(0);
				expect(obtainedItem).toEqual(expectedItemResponse);
			}));
			
			function doubleCallTest($httpBackend, $timeout, GW2API, itemId1, itemId2) {
				var expectedItemResponses = prepare($httpBackend, itemId1, itemId2);
				var expectedItemResponse1 = expectedItemResponses[0],
					expectedItemResponse2 = expectedItemResponses[1];
				var obtainedItem1 = null,
					obtainedItem2 = null;
				expect(GW2API.getNumRunningRequests()).toBe(0);
				GW2API[functionName](itemId1)
					.then(function(data) {
						obtainedItem1 = data;
					});
				expect(GW2API.getNumRunningRequests()).toBe(1);
				GW2API[functionName](itemId2)
					.then(function(data) {
						obtainedItem2 = data;
					});
				expect(GW2API.getNumRunningRequests()).toBe(2);
				expect(obtainedItem1).toBe(null);
				expect(obtainedItem2).toBe(null);
				$timeout.flush(GW2API.getTimeoutDelay() * 2);
				expect(GW2API.getNumRunningRequests()).toBe(2);
				expect(obtainedItem1).toBe(null);
				expect(obtainedItem2).toBe(null);
				$httpBackend.flush();
				expect(GW2API.getNumRunningRequests()).toBe(0);
				expect(obtainedItem1).toEqual(expectedItemResponse1);
				expect(obtainedItem2).toEqual(expectedItemResponse2);
			}
			
			it('enqueues calls to two different items and after the timeout returns both', inject(function($httpBackend, $timeout, GW2API) {
				doubleCallTest($httpBackend, $timeout, GW2API, firstItemId, secondItemId);
			}));
			
			it('enqueues two calls to the same item and after the timeout returns both', inject(function($httpBackend, $timeout, GW2API) {
				doubleCallTest($httpBackend, $timeout, GW2API, firstItemId, firstItemId);
			}));
			
			function doubleInterlockedCallTest($httpBackend, $timeout, GW2API, itemId1, itemId2) {
				var expectedItemResponses = prepare($httpBackend, itemId1, itemId2);
				var expectedItemResponse1 = expectedItemResponses[0],
					expectedItemResponse2 = expectedItemResponses[1];
				var obtainedItem1 = null,
					obtainedItem2 = null;
				expect(GW2API.getNumRunningRequests()).toBe(0);
				GW2API[functionName](itemId1)
					.then(function(data) {
						obtainedItem1 = data;
					});
				expect(GW2API.getNumRunningRequests()).toBe(1);
				expect(obtainedItem1).toBe(null);
				expect(obtainedItem2).toBe(null);
				$timeout.flush(GW2API.getTimeoutDelay() * 2);
				expect(GW2API.getNumRunningRequests()).toBe(1);
				GW2API[functionName](itemId2)
					.then(function(data) {
						obtainedItem2 = data;
					});
				expect(GW2API.getNumRunningRequests()).toBe(2);
				expect(obtainedItem1).toBe(null);
				expect(obtainedItem2).toBe(null);
				$httpBackend.flush();
				expect(GW2API.getNumRunningRequests()).toBe(itemId1 == itemId2 ? 0 : 1);
				expect(obtainedItem1).toEqual(expectedItemResponse1);
				expect(obtainedItem2).toEqual(itemId1 == itemId2 ? expectedItemResponse2 : null);
				$timeout.flush(GW2API.getTimeoutDelay() * 2);
				expect(GW2API.getNumRunningRequests()).toBe(itemId1 == itemId2 ? 0 : 1);
				expect(obtainedItem1).toEqual(expectedItemResponse1);
				expect(obtainedItem2).toEqual(itemId1 == itemId2 ? expectedItemResponse2 : null);
				if(itemId1 != itemId2) {
					$httpBackend.flush();
				}
				expect(GW2API.getNumRunningRequests()).toBe(0);
				expect(obtainedItem1).toEqual(expectedItemResponse1);
				expect(obtainedItem2).toEqual(expectedItemResponse2);
			}
			
			it('makes a call, wait for the timeout to expire, and performs another one before the http call completes', inject(function($httpBackend, $timeout, GW2API) {
				doubleInterlockedCallTest($httpBackend, $timeout, GW2API, firstItemId, secondItemId);
			}));
			
			it('makes a call, wait for the timeout to expire, and performs another one for the same item before the http call completes', inject(function($httpBackend, $timeout, GW2API) {
				doubleInterlockedCallTest($httpBackend, $timeout, GW2API, firstItemId, firstItemId);
			}));
			
			it('refuses non-int ids', inject(function($rootScope, GW2API) {
				var refused = false;
				expect(GW2API.getNumRunningRequests()).toBe(0);
				GW2API[functionName]('hello').then(function() {
					fail('should not accept non-integer ids.');
				}, function() {
					refused = true;
				});
				expect(GW2API.getNumRunningRequests()).toBe(0);
				$rootScope.$apply();
				expect(refused).toBe(true);
			}));
			
			it('correctly manages mixed valid and invalid ids', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
				var itemId1 = firstItemId;
				var itemId2 = secondItemId;
				var expectedItemResponses = prepare($httpBackend, itemId1, itemId2, 999);
				var expectedItemResponse1 = expectedItemResponses[0],
					expectedItemResponse2 = expectedItemResponses[1];
				var obtainedItem1 = null,
					obtainedItem2 = null,
					obtainedItem3 = null;
				GW2API[functionName](itemId1)
					.then(function(data) {
						obtainedItem1 = data;
					});
				GW2API[functionName](itemId2)
					.then(function(data) {
						obtainedItem2 = data;
					});
				GW2API[functionName](999)
					.then(function(data) {
						fail("shouldn't obtain any data");
					}, function(data) {
						obtainedItem3 = data;
					});
				$timeout.flush(GW2API.getTimeoutDelay() * 2);
				$httpBackend.flush();
				expect(obtainedItem1).toEqual(expectedItemResponse1);
				expect(obtainedItem2).toEqual(expectedItemResponse2);
				expect(obtainedItem3).toEqual({"text": "no such id"});
			}));
			
			it('correctly manages all invalid ids', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
				prepare($httpBackend);
				var obtainedItem = null;
				GW2API[functionName](999)
					.then(function(data) {
						fail("shouldn't obtain any data");
					}, function(data) {
						obtainedItem = data;
					});
				$timeout.flush(GW2API.getTimeoutDelay() * 2);
				$httpBackend.flush();
				expect(obtainedItem).toEqual({"text": "no such id"});
			}));
			
			it('correctly manages server errors', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
				prepare($httpBackend);
				var obtainedError = null;
				GW2API[functionName](1999)
					.then(function(data) {
						fail("shouldn't obtain any data");
					}, function(data) {
						obtainedError = data;
					});
				$timeout.flush(GW2API.getTimeoutDelay() * 2);
				$httpBackend.flush();
				expect(obtainedError.status).toBe(500);
			}));
		});
	}
	testIdInterface('item', 'getItem', globalItems.items, globalItems.prepareItem);
	testIdInterface('listing', 'getListing', globalItems.listings, globalItems.prepareListing);
	testIdInterface('recipe', 'getRecipe', globalItems.recipes, globalItems.prepareRecipe);
	testIdInterface('currency', 'getCurrency', globalItems.currencies, globalItems.prepareCurrency);
	testIdInterface('achievement', 'getAchievement', globalItems.achievements, globalItems.prepareAchievement);
	
	describe('', function() {
		beforeEach(module('redglow.gw2api', function(GW2APIProvider) {
			GW2APIProvider.language = 'de';
		}));
		it('checks that the language is respected', inject(function($httpBackend, $timeout, GW2API) {
			var itemResponse = globalItems.item24305;
			$httpBackend.whenGET("https://api.guildwars2.com/v2/items/24305?lang=de").respond(itemResponse);
			$httpBackend.whenGET("https://api.guildwars2.com/v2/items?ids=24305&lang=de").respond([itemResponse]);
			$httpBackend.whenGET("https://api.guildwars2.com/v2/items/24305").respond("WRONG");
			$httpBackend.whenGET("https://api.guildwars2.com/v2/items?ids=24305").respond(["WRONG"]);
			expect(GW2API.getNumRunningRequests()).toBe(0);
			var obtainedItem = null;
			GW2API.getItem(24305)
				.then(function(data) {
					obtainedItem = data;
				});
			expect(GW2API.getNumRunningRequests()).toBe(1);
			expect(obtainedItem).toBe(null);
			$timeout.flush(GW2API.getTimeoutDelay() * 2);
			expect(GW2API.getNumRunningRequests()).toBe(1);
			expect(obtainedItem).toBe(null);
			$httpBackend.flush();
			expect(GW2API.getNumRunningRequests()).toBe(0);
			expect(obtainedItem).toEqual(itemResponse);
		}));
	});

	describe('', function() {
		var start = Date.now();
		var nowService = {
			millitime: start,
			value: function() {
				return new Date(nowService.millitime);
			}
		};
		beforeEach(module(function($provide) {
			$provide.value('Now', nowService);
		}));
		
		function cacheTest($httpBackend, $timeout, $rootScope, GW2API, id) {
			var delta = GW2API.getItemsEntrySecondsDuration() * 1000;
			var itemResponse = id == 999 ? {text: 'no such id'} : globalItems.items[id];
			var status = id == 999 ? 404 : 200;
			var returnedJSON = id == 999 ? itemResponse : [itemResponse];
			function prep() {
				$httpBackend.expect("GET", "https://api.guildwars2.com/v2/items?ids=" + id)
					.respond(status, returnedJSON);
			}
			prep();
			var obtainedItem = null;
			function get() {
				GW2API.getItem(id)
					.then(function(data) {
						if(id == 999) { fail("Shouldn't return an item"); }
						obtainedItem = data;
					}, function(data) {
						if(id != 999) { fail("Should return an item"); }
						obtainedItem = data;
					});
			}
			get();
			$timeout.flush(GW2API.getTimeoutDelay() * 2);
			$httpBackend.flush();
			expect(obtainedItem).toEqual(itemResponse);
			// wait a bit, without reaching expiration
			nowService.millitime += delta / 2;
			obtainedItem = null;
			get();
			$rootScope.$apply();
			expect(obtainedItem).toEqual(itemResponse);
			// wait a bit more, surpassing expiration
			prep();
			nowService.millitime += delta;
			obtainedItem = null;
			get();
			$timeout.flush(GW2API.getTimeoutDelay() * 2);
			$httpBackend.flush();
			expect(obtainedItem).toEqual(itemResponse);
		}
		
		it('correctly manages the cache', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
			cacheTest($httpBackend, $timeout, $rootScope, GW2API, 24305);
		}));
		
		it('correctly manages the negative cache', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
			cacheTest($httpBackend, $timeout, $rootScope, GW2API, 999);
		}));
	});
	
	describe('', function() {
		function produceItem(id) {
			return {
				id: id,
				name: "Item n. " + id
			};
		}
		function prepareHttpBackend($httpBackend) {
			// http backend
			$httpBackend.expect('GET', /https:\/\/api.guildwars2.com\/v2\/items\?ids=(.*)/)
				.respond(function(method, url, data, headers, params) {
					var ids = url.split('=')[1].split(',');
					if(ids.length > 200) {
						return [400, '{"text":"id list too long; this endpoint is limited to 200 ids at once"}']
					} else {
						var data = [];
						for(var i = 0; i < ids.length; i++) {
							var id = ids[i];
							var item = produceItem(id);
							data.push(item);
						}
						var jsonData = JSON.stringify(data);
						return [200, jsonData];
					}
				});
		}
		function getItems($timeout, $httpBackend, GW2API, numIds) {
			for(var j = 0; j < Math.ceil(numIds / 200); j++) {
				prepareHttpBackend($httpBackend);
			}
			var numResolved = 0;
			for(var i = 0; i < numIds; i++) {
				GW2API.getItem(i).then(function() {
					numResolved++;
				});
			}
			$timeout.flush(GW2API.getTimeoutDelay() * 2);
            var numToResolve = Math.ceil(numIds / 200);
            $httpBackend.flush(numToResolve);
			expect(numResolved).toBe(numIds);
		}
		it('does correctly process 1 request', inject(function($httpBackend, $q, $timeout, GW2API) {
			getItems($timeout, $httpBackend, GW2API, 1);
		}));
		it('does correctly process 199 requests', inject(function($httpBackend, $q, $timeout, GW2API) {
			getItems($timeout, $httpBackend, GW2API, 199);
		}));
		it('does correctly process 200 requests', inject(function($httpBackend, $q, $timeout, GW2API) {
			getItems($timeout, $httpBackend, GW2API, 200);
		}));
		it('does correctly process 201 requests', inject(function($httpBackend, $q, $timeout, GW2API) {
			getItems($timeout, $httpBackend, GW2API, 201);
		}));
		it('does correctly process 399 requests', inject(function($httpBackend, $q, $timeout, GW2API) {
			getItems($timeout, $httpBackend, GW2API, 399);
		}));
		it('does correctly process 400 requests', inject(function($httpBackend, $q, $timeout, GW2API) {
			getItems($timeout, $httpBackend, GW2API, 400);
		}));
		it('does correctly process 401 requests', inject(function($httpBackend, $q, $timeout, GW2API) {
			getItems($timeout, $httpBackend, GW2API, 401);
		}));
	});
});