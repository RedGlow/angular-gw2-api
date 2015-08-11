describe('GW2API', function() {
	beforeEach(module('redglow.gw2api'));
	
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
	
	function doTest($httpBackend, $timeout, $rootScope, GW2API, cached) {
		id = 24305;
		var delta = GW2API.getItemsEntrySecondsDuration() * 1000;
		var itemResponse = globalItems.items[id];
		var status = 200;
		var returnedJSON = [itemResponse];
		function prep() {
			$httpBackend.expect("GET", "https://api.guildwars2.com/v2/items?ids=" + id)
				.respond(status, returnedJSON);
		}
		if(!cached) {
			prep();
		}
		var obtainedItem = null;
		function get() {
			GW2API.getItem(id)
				.then(function(data) {
					obtainedItem = data;
				}, function(data) {
					fail("Should return an item");
				});
		}
		get();
		$timeout.flush(GW2API.getTimeoutDelay() * 2);
		if(!cached) {
			$httpBackend.flush();
		}
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
		$rootScope.$apply();
	}
	
	describe('can use a clear local storage.', function($httpBackend, $timeout, $rootScope, GW2API) {
		it('', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
			doTest($httpBackend, $timeout, $rootScope, GW2API, false);
			window.localStorage.clear();
		}));
	});
	
	describe('can correcly skip local storage if the setItem returns error.', function($httpBackend, $timeout, $rootScope, GW2API) {
		var originalSetItem;
		beforeEach(module(function($provide) {
			$provide.factory('$window', function() {
				if(!originalSetItem) {
					originalSetItem = window.localStorage.setItem;
				}
				window.localStorage.setItem = function() {
					throw new Error();
				}
				return window;
			});
		}));
		afterEach(function() {
			window.localStorage.setItem = originalSetItem;
		});
		it('', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
			doTest($httpBackend, $timeout, $rootScope, GW2API, false);
			window.localStorage.clear();
		}));
	});

	describe('can correcly skip local storage if local storage is not supported.', function($httpBackend, $timeout, $rootScope, GW2API) {
		beforeEach(module(function($provide) {
			$provide.factory('$window', function() {
				var w = {
				};
				Object.defineProperty(w, "localStorage", {
					get: function() {
						throw new Error();
					}
				});
				return w;
			});
		}));
		it('', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
			doTest($httpBackend, $timeout, $rootScope, GW2API, false);
			window.localStorage.clear();
		}));
	});

	describe('can re-use a local storage', function($httpBackend, $timeout, $rootScope, GW2API) {
		it('', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
			doTest($httpBackend, $timeout, $rootScope, GW2API, false);
		}));
		it('', inject(function($httpBackend, $timeout, $rootScope, GW2API) {
			doTest($httpBackend, $timeout, $rootScope, GW2API, true);
			window.localStorage.clear();
		}));
	});
});