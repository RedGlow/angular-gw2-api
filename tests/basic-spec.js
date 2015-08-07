describe('GW2API', function() {
	beforeEach(module('redglow.gw2api'));
	
	it('can be injected', inject(function(GW2API) {
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
		});
	}
	testIdInterface('item', 'getItem', globalItems.items, globalItems.prepareItem);
	testIdInterface('listing', 'getListing', globalItems.listings, globalItems.prepareListing);
	testIdInterface('recipe', 'getRecipe', globalItems.recipes, globalItems.prepareRecipe);
	
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
	})
});