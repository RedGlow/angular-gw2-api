angular.module('redglow.gw2api', [])

.factory('Now', function() {
	return {
		value: function() {
			return new Date();
		}
	};
})

.provider('GW2API', function() {
	var provider = this;
	// items entries last one day by default
	provider.itemsEntrySecondsDuration = 60 * 60 * 24;
	// recipes last long too
	provider.recipesEntrySecondsDuration = 60 * 60 * 24;
	// listings last for a much shorter time
	provider.listingsEntrySecondsDuration = 60;
	// currencies last long
	provider.currenciesEntrySecondsDuration = 60 * 60 * 24;
	// achievements last long
	provider.achievementsEntrySecondsDuration = 60 * 60 * 24;
	// timeout delay
	provider.timeoutDelay = 250;
	// default language (null => no language sent; value => language value sent)
	provider.language = null;
	// cache providers: an array of injectable functions which are launched in given order, and
	// the first that returns a non-falsy object is used as the cache object, which is
	// an object with the following functions:
	// - set(familyKey, idKey, value): sets a value <value> associated to the tuple <familyKey>,
	//   <idKey>
	// - get(familyKey, idKey): returns the value associated with the tuple <familyKey>, <idKey>
	provider.localStorageFactory = function($window) {
		// taken from ngStorage project
		function isStorageSupported() {
			// Some installations of IE, for an unknown reason, throw "SCRIPT5: Error: Access is denied"
			// when accessing window.localStorage. This happens before you try to do anything with it. Catch
			// that error and allow execution to continue.

			// fix 'SecurityError: DOM Exception 18' exception in Desktop Safari, Mobile Safari
			// when "Block cookies": "Always block" is turned on
			var supported;
			try {
				supported = $window.localStorage;
			}
			catch (err) {
				supported = false;
			}

			// When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage
			// is available, but trying to call .setItem throws an exception below:
			// "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota."
			if (supported) {
				var key = '__' + Math.round(Math.random() * 1e7);

				try {
					localStorage.setItem(key, key);
					localStorage.removeItem(key);
				}
				catch (err) {
					supported = false;
				}
			}

			return supported;
		}
		if(!isStorageSupported()) {
			return false;
		}
		function key(familyKey, idKey) {
			return 'gw2api-' + familyKey + '-' + idKey;
		}
		return {
			get: function(familyKey, idKey) {
				var item = $window.localStorage.getItem(
					key(familyKey, idKey));
				if(item === null) {
					return undefined;
				} else {
					var returnValue = angular.fromJson(item);
					returnValue.timestamp = new Date(returnValue.timestamp);
					return returnValue;
				}
			},
			set: function(familyKey, idKey, value) {
				return $window.localStorage.setItem(
					key(familyKey, idKey),
					angular.toJson(value));
			},
			del: function(familyKey, idKey) {
				$window.localStorage.removeItem(key(familyKey, idKey));
			}
		};
	};
	provider.cacheFactories = [
		provider.localStorageFactory
	];

	this.$get = function($injector, $q, $http, $log, $timeout, $filter, Now) {
		/* produce the main cache object */
		var mainCacheObject = null;
		for(var cacheFactoryIndex = 0; cacheFactoryIndex < provider.cacheFactories.length; cacheFactoryIndex++) {
			var cacheFactory = provider.cacheFactories[cacheFactoryIndex];
			var obtainedCache = $injector.invoke(cacheFactory);
			if(!!obtainedCache) {
				mainCacheObject = obtainedCache;
				break;
			}
		}
		if(!mainCacheObject) {
			var mainCache = {};
			var getMainCacheFamilyEntry = function(familyKey) {
				if(!mainCache[familyKey]) {
					mainCache[familyKey] = {};
				}
				return mainCache[familyKey];
			};
			mainCacheObject = {
				get: function(familyKey, idKey) {
					return getMainCacheFamilyEntry(familyKey)[idKey];
				},
				set: function(familyKey, idKey, value) {
					getMainCacheFamilyEntry(familyKey)[idKey] = value;
				},
				del: function(familyKey, idKey) {
					var familyEntry = getMainCacheFamilyEntry(familyKey);
					delete familyEntry[idKey];
				}
			};
		}
		
		/**
		 * This structure holds the data about the different kind of requests we can
		 * make to the GW2 API, its endpoints, the enqueued requests, and the
		 * caching system.
		 * The top-level structure is the following:
		 * { <key>: <data> }
		 * Where <key> is either "items" (requests to get items data) and "listings"
		 * (requests to get listings).
		 * Each entry (<data>) has these entries:
		 * - queue: an associative array {<ID> : <deferreds>} between IDs to resolve
		 *	   and an array of "deferred" which must be called when the entry is
		 *	   ready.
		 * - queued: same as queue, but entries get moved in here once the request
		 *	  to the API has already been performed, but before the results have
		 *	  arrived. this change is useful to add new requests in this second
		 *	  queue if they are asked in the between time but correspond to some
		 *	  entry already present.
		 * - timerIsStarted: whether a timer has already been started. this timer
		 *	  will process all the queued entries with a single call once started
		 *	  off.
		 * - endpoint: the endpoint to send a request for the data. static.
		 * - entrySecondsDuration: duration of a cache entry. static.
		 * - cache: an associative array structured like this:
		 *	  { <ID>:
		 *		  { "value": <value>,
		 *			"timestamp": <timestamp>,
		 *			"isRejection": <whether this was a reject or not> }
		 *	  }
		 *	  Where <ID> is the ID of the entry, <value> is the cached entry, and
		 *	  <timestamp> is a Date object produced at the moment of the entry
		 *	  creation.
		 */
		function produceRequestsEntry(name, entrySecondsDuration, endpoint) {
			return {
				name: name,
				queue: {},
				queued: {},
				entrySecondsDuration: entrySecondsDuration,
				timerIsStarted: false,
				endpoint: endpoint
			};
		}
		var numRunningRequests = 0;
		var requests = {
			items: produceRequestsEntry(
				"items",
				provider.itemsEntrySecondsDuration,
				"https://api.guildwars2.com/v2/items"),
			listings: produceRequestsEntry(
				"listings",
				provider.listingsEntrySecondsDuration,
				"https://api.guildwars2.com/v2/commerce/listings"),
			recipes: produceRequestsEntry(
				"recipes",
				provider.recipesEntrySecondsDuration,
				"https://api.guildwars2.com/v2/recipes"),
			currencies: produceRequestsEntry(
				"currencies",
				provider.currenciesEntrySecondsDuration,
				"https://api.guildwars2.com/v2/currencies"),
			achievements: produceRequestsEntry(
				"achievements",
				provider.achievementsEntrySecondsDuration,
				"https://api.guildwars2.com/v2/achievements"),
		};

		function runRequests(key) {
			// timer has been resolved
			var request = requests[key];
			request.timerIsStarted = false;

			// move requests from "queue" to "queued", and clean "queue"
			var queueIds = Object.keys(request.queue);
			for(var i = 0; i < queueIds.length; i++) {
				var id = queueIds[i];
				var deferreds = request.queue[id];
				request.queued[id] = [];
				Array.prototype.push.apply(request.queued[id], deferreds);
			}
			request.queue = {};

			// launch http get
			var ids = queueIds.join(",");
			var url = request.endpoint + "?ids=" + ids;
			if(!!provider.language) {
				url += '&lang=';
				url += provider.language;
			}
			$http
				.get(url)
				.then(function(response) {
					// send results to the registered promises
					var data = response.data;
					var now = Now.value();
					// first add caches, then process the promises. this is done in
					// order to avoid that the answer to the promise asks for an
					// item which we got right now, and a new call is enqueued
					// because its entry wasn't yet added to the cache
					var i, item, id;
					for(i = 0; i < data.length; i++) {
						item = data[i];
						id = item.id;
						mainCacheObject.set(request.name, id, {
							timestamp: now,
							value: item,
							isRejection: false
						});
					}
					var queueId, queueRow,
						notId = function(value) { return value != id; };
					for(i = 0; i < data.length; i++) {
						item = data[i];
						id = item.id;
						queueRow = request.queued[id];
						for(var j = 0; j < queueRow.length; j++) {
							queueRow[j].resolve(item);
							numRunningRequests--;
						}
						delete request.queued[id];
						queueIds = $filter('filter')(queueIds, notId);
					}
					for(i = 0; i < queueIds.length; i++) {
						queueId = queueIds[i];
						queueRow = request.queued[queueId];
						var returnValue = {
							"text": "no such id"
						};
						mainCacheObject.set(request.name, queueId, {
							timestamp: now,
							value: returnValue,
							isRejection: true
						});
						for(var jj = 0; jj < queueRow.length; jj++) {
							queueRow[jj].reject(returnValue);
							numRunningRequests--;
						}
						delete request.queued[queueId];
					}
				}, function(err) {
					var i, queueId, queueRow, j;
					if(!!err.data && !!err.data.text && (
						err.data.text == "all ids provided are invalid" ||
						err.data.text == "no such id")) {
						// all values are invalid
						var now = Now.value();
						for(i = 0; i < queueIds.length; i++) {
							queueId = queueIds[i];
							queueRow = request.queued[queueId];
							var returnValue = {
								"text": "no such id"
							};
							mainCacheObject.set(request.name, queueId, {
								timestamp: now,
								value: returnValue,
								isRejection: true
							});
							for(j = 0; j < queueRow.length; j++) {
								queueRow[j].reject(returnValue);
								numRunningRequests--;
							}
							delete request.queued[queueId];
						}
					} else {
						// this is another kind of error (HTTP level, 500, ...):
						// return the same error, but without caching it
						for(i = 0; i < queueIds.length; i++) {
							queueId = queueIds[i];
							queueRow = request.queued[queueId];
							for(j = 0; j < queueRow.length; j++) {
								queueRow[j].reject(err);
								numRunningRequests--;
							}
							delete request.queued[queueId];
						}
					}
				});
		}

		function isInt(value) {
			return !isNaN(value) &&
				parseInt(Number(value)) === value &&
				!isNaN(parseInt(value, 10));
		}

		function enqueue(key, id) {
			// check input
			if(!isInt(id)) {
				return $q.reject("Not an id:", id);
			}
			id = parseInt(id);

			// check cache
			var request = requests[key];
			var cacheEntry = mainCacheObject.get(request.name, id);
			if(cacheEntry !== undefined) {
				// we have a cache entry: check if it's not too old
				var cacheDate = cacheEntry.timestamp;
				var now = Now.value();
				var delta = (now - cacheDate) / 1000;
				if(delta <= request.entrySecondsDuration) {
					// not too old: we can return it
					if(!cacheEntry.isRejection) {
						return $q.when(cacheEntry.value);
					} else {
						return $q.reject(cacheEntry.value);
					}
				} else {
					// remove the entry to clean up some space
					mainCacheObject.del(request.name, id);
				}
			}

			// cache entry not present / too old: continue
			var deferred = $q.defer();
			numRunningRequests++;

			// check if the call is already queued
			var queuedEntry = request.queued[id];
			if(queuedEntry !== undefined) {
				// yes: just add this deferred for when the http call returns
				queuedEntry.push(deferred);
			} else {
				// no: add to the queue
				// create the queue for this ID if not already present
				if(request.queue[id] === undefined) {
					request.queue[id] = [];
				}

				// add our deferred
				request.queue[id].push(deferred);

				// if the timer hasn't already started, do it now
				if(!request.timerIsStarted) {
					$timeout(function() { runRequests(key); }, provider.timeoutDelay);
					request.timerIsStarted = true;
				}
			}

			// return the promise that will be satisfied upon resolution
			return deferred.promise;
		}
		
		function straightCall(url, token) {
			numRunningRequests++;
			if(!!token) {
				url = [url, "?access_token=", token].join("");
			}
			return $http({
				method: 'GET',
				url: url
			}).then(function(response) {
				return response.data;
			})['finally'](function() {
				numRunningRequests--;
			});
		}

		return {
			getItem: function(id) {
				return enqueue('items', id);
			},
			getListing: function(id) {
				return enqueue('listings', id);
			},
			getRecipe: function(id) {
				return enqueue('recipes', id);
			},
			getTokenInfo: function(token) {
				return straightCall("https://api.guildwars2.com/v2/tokeninfo", token);
			},
			getBank: function(token) {
				return straightCall("https://api.guildwars2.com/v2/account/bank", token);
			},
			getMaterials: function(token) {
				return straightCall("https://api.guildwars2.com/v2/account/materials", token);
			},
			getCharacters: function(token) {
				return straightCall("https://api.guildwars2.com/v2/characters", token);
			},
			getCharacter: function(characterName, token) {
				return straightCall("https://api.guildwars2.com/v2/characters/" + characterName, token);
			},
			getRecipeIdsByOutput: function(outputId) {
				return straightCall("https://api.guildwars2.com/v2/recipes/search?output=" + outputId);
			},
			getNumRunningRequests: function() {
				return numRunningRequests;
			},
			getTimeoutDelay: function() {
				return provider.timeoutDelay;
			},
			getItemsEntrySecondsDuration: function() {
				return provider.itemsEntrySecondsDuration;
			},
			getCurrencies: function() {
				return straightCall("https://api.guildwars2.com/v2/currencies");
			},
			getCurrency: function(id) {
				return enqueue('currencies', id);
			},
			getWallet: function(token) {
				return straightCall("https://api.guildwars2.com/v2/account/wallet", token);
			},
			getAchievements: function() {
				return straightCall("https://api.guildwars2.com/v2/achievements");
			},
			getAchievement: function(id) {
				return enqueue('achievements', id);
			},
			getAccountAchievements: function(token) {
				return straightCall("https://api.guildwars2.com/v2/account/achievements", token);
			}
		};
	};

	return this;
})

;
