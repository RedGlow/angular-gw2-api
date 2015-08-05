describe('GW2API', function() {
	beforeEach(module('redglow.gw2api'));
	
	it('can be injected', inject(function(GW2API) {
	}));
	
	it('returns a single item', inject(function($httpBackend, $timeout, GW2API) {
		var itemId = 24305;
		var expectedItemResponse = globalItems.prepare($httpBackend, itemId)[0];
		var obtainedItem = null;
		expect(GW2API.getNumRunningRequests()).toBe(0);
		GW2API
			.getItem(itemId)
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
		var expectedItemResponses = globalItems.prepare($httpBackend, itemId1, itemId2);
		var expectedItemResponse1 = expectedItemResponses[0],
			expectedItemResponse2 = expectedItemResponses[1];
		var obtainedItem1 = null,
			obtainedItem2 = null;
		expect(GW2API.getNumRunningRequests()).toBe(0);
		GW2API
			.getItem(itemId1)
			.then(function(data) {
				obtainedItem1 = data;
			});
		expect(GW2API.getNumRunningRequests()).toBe(1);
		GW2API
			.getItem(itemId2)
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
		doubleCallTest($httpBackend, $timeout, GW2API, 24305, 19677);
	}));
	
	it('enqueues two calls to the same item and after the timeout returns both', inject(function($httpBackend, $timeout, GW2API) {
		doubleCallTest($httpBackend, $timeout, GW2API, 24305, 24305);
	}));
	
	function doubleInterlockedCallTest($httpBackend, $timeout, GW2API, itemId1, itemId2) {
		var expectedItemResponses = globalItems.prepare($httpBackend, itemId1, itemId2);
		var expectedItemResponse1 = expectedItemResponses[0],
			expectedItemResponse2 = expectedItemResponses[1];
		var obtainedItem1 = null,
			obtainedItem2 = null;
		expect(GW2API.getNumRunningRequests()).toBe(0);
		GW2API
			.getItem(itemId1)
			.then(function(data) {
				obtainedItem1 = data;
			});
		expect(GW2API.getNumRunningRequests()).toBe(1);
		expect(obtainedItem1).toBe(null);
		expect(obtainedItem2).toBe(null);
		$timeout.flush(GW2API.getTimeoutDelay() * 2);
		expect(GW2API.getNumRunningRequests()).toBe(1);
		GW2API
			.getItem(itemId2)
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
		doubleInterlockedCallTest($httpBackend, $timeout, GW2API, 24305, 19677);
	}));
	
	it('makes a call, wait for the timeout to expire, and performs another one for the same item before the http call completes', inject(function($httpBackend, $timeout, GW2API) {
		doubleInterlockedCallTest($httpBackend, $timeout, GW2API, 24305, 24305);
	}));
	
	it('refuses non-int ids', inject(function($rootScope, GW2API) {
		var refused = false;
		expect(GW2API.getNumRunningRequests()).toBe(0);
		GW2API.getItem('hello').then(function() {
			fail('should not accept non-integer ids.');
		}, function() {
			refused = true;
		});
		expect(GW2API.getNumRunningRequests()).toBe(0);
		$rootScope.$apply();
		expect(refused).toBe(true);
	}));
});