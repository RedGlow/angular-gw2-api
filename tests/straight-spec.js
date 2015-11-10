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
	
	it('correctly asks for the achievements', inject(function($httpBackend, GW2API) {
		doTest($httpBackend, GW2API, 'https://api.guildwars2.com/v2/achievements', 'getAchievements',
			[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,105,106,107,108,111,112,113,114,115,116,117,118,119,120,121,122,123,127,128,129,133,134,136,137,138,139,140,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,163,164,165,166,167,168,169,170,171,172,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,217,218,219,220,221,222,223,239,240,241,247,248,249,250,251,252,253,254,255,265,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,288,291,294,297,300,303,306,307,310,313,316,319,322,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,366,367,368,369,370,371,372,373,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,415,416,417,418,419,420,421,422,423,424,427,429,430,431,432,437,460,461,500,536,537,539,540,541,542,543,544,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,562,563,569,570,571,572,589,590,591,592,593,594,595,596,597,598,599,600,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,648,649,650,651,652,653,654,655,656,657,658,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,681,682,683,684,685,686,687,688,689,690,696,697,698,699,700,701,702,703,704,705,706,707,708,709,710,711,712,713,714,715,716,717,718,719,720,721,722,723,724,725,726,727,728,729,730,731,732,733,734,735,736,737,738,739,740,741,742,743,744,745,746,747,748,749,750,751,752,753,754,755,756,757,758,759,760,761,762,763,764,766,767,768,769,770,772,773,774,775,776,777,778,779,795,796,797,798,799,800,801,802,803,804,805,806,807,808,809,810,811,815,816,817,818,819,820,821,822,823,824,825,826,827,828,829,830,831,832,833,834,835,836,854,855,856,857,858,859,860,861,862,863,864,865,866,867,868,869,870,871,872,873,874,875,876,877,878,879,880,881,882,897,898,899,900,901,902,903,904,905,906,907,908,909,910,916,917,918,919,920,921,922,923,924,925,926,927,928,929,930,932,933,934,940,941,942,946,947,969,970,971,972,973,974,975,976,977,978,979,980,981,982,983,984,985,986,987,988,990,1089,1090,1092,1093,1094,1095,1096,1097,1098,1099,1100,1101,1102,1131,1132,1133,1134,1135,1136,1137,1138,1139,1140,1141,1142,1143,1144,1145,1146,1147,1148,1149,1150,1151,1152,1153,1154,1155,1156,1189,1190,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1203,1204,1205,1206,1207,1208,1209,1261,1262,1263,1264,1265,1266,1304,1305,1306,1307,1308,1309,1310,1311,1312,1313,1314,1315,1316,1317,1332,1333,1334,1335,1336,1337,1338,1339,1340,1341,1342,1344,1345,1346,1363,1368,1369,1370,1371,1372,1374,1375,1376,1377,1378,1379,1380,1381,1382,1385,1389,1390,1391,1392,1393,1394,1395,1396,1397,1398,1399,1400,1401,1402,1459,1506,1507,1508,1509,1510,1511,1512,1513,1514,1515,1516,1517,1518,1519,1520,1521,1522,1538,1539,1541,1542,1543,1544,1545,1546,1547,1548,1549,1550,1551,1552,1553,1554,1555,1556,1566,1567,1568,1570,1571,1572,1573,1574,1575,1576,1577,1578,1579,1580,1581,1582,1583,1584,1585,1586,1587,1588,1589,1590,1591,1592,1595,1621,1631,1632,1633,1634,1635,1636,1637,1638,1639,1640,1641,1642,1643,1644,1646,1647,1648,1649,1650,1651,1652,1653,1654,1655,1657,1659,1660,1661,1662,1663,1664,1665,1666,1667,1668,1669,1670,1671,1672,1673,1674,1675,1676,1677,1678,1679,1680,1691,1692,1693,1694,1695,1696,1697,1698,1699,1700,1701,1702,1703,1704,1705,1706,1707,1708,1709,1710,1711,1712,1713,1717,1720,1726,1728,1729,1730,1731,1734,1744,1745,1749,1750,1751,1752,1754,1755,1756,1757,1758,1759,1760,1777,1779,1780,1781,1782,1783,1784,1785,1786,1787,1788,1789,1790,1791,1792,1793,1795,1796,1797,1798,1799,1800,1801,1802,1803,1804,1805,1806,1807,1808,1809,1810,1811,1812,1814,1815,1816,1817,1818,1819,1820,1821,1822,1824,1825,1826,1827,1828,1829,1830,1831,1832,1833,1834,1835,1836,1837,1838,1839,1840,1843,1844,1845,1846,1847,1848,1849,1850,1852,1856,1857,1858,1861,1867,1930,1931,1932,1933,1934,1935,1936,1937,1938,1939,1940,1941,1942,1943,1944,1945,1947,1948,1949,1950,1951,1952,1953,1954,1955,1956,1958,1959,1960,1961,1962,1963,1964,1965,1968,1969,1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,1980,1981,1983,1984,1985,1989,2022,2025,2026,2028,2029,2030,2051,2052,2053,2054,2055,2056,2057,2058,2059,2060,2061,2062,2063,2064,2065,2066,2067,2068,2069,2070,2071,2072,2073,2074,2075,2076,2077,2078,2090,2091,2093,2096,2098,2099,2100,2101,2102,2103,2104,2105,2107,2108,2109,2110,2111,2112,2113,2114,2115,2116,2117,2118,2120,2122,2126,2127,2128,2129,2132,2143,2144,2145,2146,2147,2148,2149,2150,2151,2155,2156,2157,2158,2160,2162,2163,2164,2165,2166,2168,2169,2170,2172,2173,2174,2175,2176,2177,2178,2179,2180,2181,2182,2185,2186,2188,2189,2190,2191,2193,2194,2195,2196,2197,2198,2200,2201,2202,2203,2204,2205,2206,2210,2211,2212,2214,2215,2216,2217,2218,2219,2220,2221,2222,2223,2224,2225,2226,2227,2229,2230,2231,2233,2236,2237,2238,2239,2240,2243,2245,2246,2248,2249,2251,2252,2253,2254,2255,2256,2257,2258,2259,2261,2262,2263,2264,2265,2266,2267,2269,2270,2271,2272,2273,2274,2275,2276,2281,2283,2285,2286,2287,2292,2293,2294,2297,2298,2299,2301,2302,2303,2304,2305,2307,2308,2309,2310,2313,2314,2315,2316,2317,2318,2320,2321,2324,2326,2327,2328,2329,2330,2331,2333,2334,2335,2339,2342,2343,2344,2346,2347,2348,2349,2350,2351,2352,2353,2355,2357,2360,2361,2364,2365,2366,2368,2369,2370,2371,2373,2375,2376,2377,2378,2379,2380,2382,2384,2385,2386,2387,2389,2392,2395,2396,2397,2399,2400,2401,2402,2403,2405,2406,2407,2408,2411,2413,2414,2415,2417,2418,2419,2420,2421,2422,2423,2424,2425,2426,2427,2429,2430,2431,2432,2434,2435,2436,2437,2438,2439,2440,2441,2443,2444,2445,2446,2448,2450,2452,2453,2455,2457,2460,2461,2462,2465,2466,2469,2470,2471,2472,2473,2474,2475,2476,2478,2479,2481,2483,2484,2485,2486,2487,2488,2489,2491,2492,2493,2494,2495,2496,2497,2499,2501,2504,2505,2509,2510,2511,2512,2513,2514,2515,2516,2517,2519,2521,2523,2525,2526,2527,2528,2529,2530,2531,2532,2533,2534,2537,2538,2540,2541,2543,2544,2546,2547,2548,2549,2551,2552,2553,2554,2555,2557,2558,2560,2561,2562,2563,2564,2565,2566,2567,2568,2570,2571,2572,2573,2574,2575,2576,2577,2579,2581,2583,2584,2585,2587,2589,2590,2593,2594,2595,2597,2599,2600,2601,2602,2605,2607,2608,2611,2612,2613,2614,2615,2616,2617,2618,2619,2620,2621,2622,2623,2624,2625,2626,2627,2628,2631,2632,2633,2634,2635,2636,2637,2638,2639,2640,2642,2643,2644,2645],
			true);
	}));

	it('correctly asks for the achievements contents', inject(function($httpBackend, GW2API) {
		doTest($httpBackend, GW2API, 'https://api.guildwars2.com/v2/account/achievements', 'getAccountAchievements',
			[{"id":1,"current":1,"max":1000,"done":false},{"id":2,"current":1,"max":1000,"done":false},{"id":8,"current":1,"max":1000,"done":false},{"id":5,"current":1,"max":1000,"done":false},{"id":4,"current":1,"max":1000,"done":false},{"id":3,"current":1,"max":1000,"done":false},{"id":9,"current":1,"max":5000,"done":false},{"id":12,"bits":[],"current":0,"max":175,"done":false},{"id":11,"current":1,"max":1000,"done":false},{"id":85,"current":1,"max":400,"done":false},{"id":14,"current":1,"max":800,"done":false},{"id":15,"current":1,"max":30,"done":false},{"id":16,"current":1,"max":1000,"done":false},{"id":21,"current":1,"max":5000,"done":false},{"id":54,"current":1,"max":5000,"done":false},{"id":19,"current":1,"max":5000,"done":false},{"id":57,"current":1,"max":5000,"done":false},{"id":17,"current":1,"max":5000,"done":false},{"id":18,"current":1,"max":5000,"done":false},{"id":185,"bits":[],"current":0,"max":4,"done":false},{"id":7,"current":1,"max":1000,"done":false},{"id":24,"current":1,"max":1000,"done":false},{"id":25,"current":1,"max":1000,"done":false},{"id":26,"current":1,"max":1000,"done":false},{"id":27,"current":1,"max":1000,"done":false},{"id":30,"current":1,"max":1000,"done":false},{"id":33,"current":1,"max":1000,"done":false},{"id":32,"current":1,"max":1000,"done":false},{"id":29,"current":1,"max":1000,"done":false},{"id":34,"current":1,"max":1000,"done":false},{"id":48,"current":1,"max":1000,"done":false},{"id":35,"current":1,"max":1000,"done":false},{"id":36,"current":1,"max":1000,"done":false},{"id":37,"current":1,"max":1000,"done":false},{"id":38,"current":1,"max":1000,"done":false},{"id":40,"current":1,"max":1000,"done":false},{"id":42,"current":1,"max":1000,"done":false},{"id":43,"current":1,"max":1000,"done":false},{"id":44,"current":1,"max":1000,"done":false},{"id":45,"current":1,"max":1000,"done":false},{"id":47,"current":1,"max":1000,"done":false},{"id":49,"current":1,"max":1000,"done":false},{"id":52,"current":1,"max":1000,"done":false},{"id":51,"current":1,"max":1000,"done":false},{"id":53,"current":1,"max":1000,"done":false},{"id":6,"current":1,"max":1000,"done":false},{"id":10,"current":1,"max":2000000,"done":false},{"id":92,"current":1,"max":400,"done":false},{"id":87,"current":1,"max":400,"done":false},{"id":86,"current":1,"max":400,"done":false},{"id":90,"current":1,"max":400,"done":false},{"id":89,"current":1,"max":400,"done":false},{"id":88,"current":1,"max":400,"done":false},{"id":91,"current":1,"max":400,"done":false},{"id":121,"bits":[],"current":0,"max":8,"done":false},{"id":103,"bits":[],"current":0,"max":60,"done":false},{"id":101,"bits":[],"current":0,"max":177,"done":false},{"id":100,"bits":[],"current":0,"max":175,"done":false},{"id":102,"bits":[],"current":0,"max":167,"done":false},{"id":127,"current":1,"max":500,"done":false},{"id":128,"current":1,"max":100,"done":false},{"id":133,"current":1,"max":10000,"done":false},{"id":134,"current":1,"max":500,"done":false},{"id":136,"current":1,"max":1000,"done":false},{"id":138,"bits":[],"current":0,"max":0,"done":true},{"id":139,"current":1,"max":500000,"done":false},{"id":140,"current":1,"max":500,"done":false},{"id":142,"done":true},{"id":144,"done":true},{"id":143,"done":true},{"id":149,"done":true},{"id":147,"done":true},{"id":146,"done":true},{"id":145,"done":true},{"id":150,"done":true},{"id":148,"done":true},{"id":151,"done":true},{"id":153,"current":1,"max":300000,"done":false},{"id":194,"done":true},{"id":195,"done":true},{"id":196,"done":true},{"id":154,"done":true},{"id":155,"done":true},{"id":156,"done":true},{"id":157,"done":true},{"id":158,"done":true},{"id":159,"done":true},{"id":160,"done":true},{"id":161,"done":true},{"id":163,"done":true},{"id":172,"done":true},{"id":186,"bits":[],"current":0,"max":4,"done":false},{"id":188,"bits":[],"current":0,"max":4,"done":false},{"id":190,"bits":[],"current":0,"max":4,"done":false},{"id":191,"bits":[],"current":0,"max":4,"done":false},{"id":192,"bits":[],"current":0,"max":4,"done":false},{"id":193,"done":true},{"id":197,"done":true},{"id":198,"done":true},{"id":199,"done":true},{"id":200,"done":true},{"id":202,"done":true},{"id":201,"done":true},{"id":217,"done":true},{"id":218,"done":true},{"id":219,"done":true},{"id":203,"done":true},{"id":205,"done":true},{"id":204,"done":true},{"id":206,"done":true},{"id":207,"done":true},{"id":220,"done":true},{"id":221,"done":true},{"id":222,"done":true},{"id":247,"current":1,"max":8500,"done":false},{"id":96,"bits":[],"current":0,"max":18,"done":false},{"id":64,"bits":[],"current":0,"max":1,"done":false},{"id":65,"bits":[],"current":0,"max":1,"done":false},{"id":66,"bits":[],"current":0,"max":1,"done":false},{"id":67,"bits":[],"current":0,"max":1,"done":false},{"id":68,"bits":[],"current":0,"max":1,"done":false},{"id":69,"bits":[],"current":0,"max":1,"done":false},{"id":70,"bits":[],"current":0,"max":1,"done":false},{"id":71,"bits":[],"current":0,"max":1,"done":false},{"id":72,"bits":[],"current":0,"max":1,"done":false},{"id":73,"bits":[],"current":0,"max":1,"done":false},{"id":78,"bits":[],"current":0,"max":1,"done":false},{"id":98,"done":true},{"id":80,"bits":[],"current":0,"max":1,"done":false},{"id":81,"bits":[],"current":0,"max":0,"done":true},{"id":82,"bits":[],"current":0,"max":1,"done":false},{"id":83,"bits":[],"current":0,"max":1,"done":false},{"id":74,"bits":[],"current":0,"max":1,"done":false},{"id":75,"bits":[],"current":0,"max":1,"done":false},{"id":76,"bits":[],"current":0,"max":1,"done":false},{"id":77,"bits":[],"current":0,"max":1,"done":false},{"id":99,"done":true},{"id":79,"bits":[],"current":0,"max":1,"done":false},{"id":137,"current":1,"max":100,"done":false},{"id":307,"current":1,"max":10,"done":false},{"id":284,"current":1,"max":10,"done":false},{"id":344,"done":true},{"id":345,"done":true},{"id":346,"done":true},{"id":347,"done":true},{"id":348,"done":true},{"id":349,"done":true},{"id":366,"done":true},{"id":350,"done":true},{"id":351,"done":true},{"id":352,"done":true},{"id":353,"done":true},{"id":354,"done":true},{"id":355,"done":true},{"id":356,"done":true},{"id":357,"done":true},{"id":367,"done":true},{"id":341,"done":true},{"id":339,"done":true},{"id":337,"done":true},{"id":338,"done":true},{"id":340,"current":1,"max":5,"done":false},{"id":342,"done":true},{"id":343,"done":true},{"id":368,"done":true},{"id":369,"done":true},{"id":370,"done":true},{"id":371,"done":true},{"id":372,"done":true},{"id":373,"done":true},{"id":335,"bits":[],"current":0,"max":38,"done":false},{"id":400,"done":true},{"id":401,"done":true},{"id":381,"current":1,"max":1,"done":true},{"id":383,"current":1,"max":1,"done":true},{"id":384,"current":1,"max":1,"done":true},{"id":386,"current":1,"max":1,"done":true},{"id":385,"current":1,"max":1,"done":true},{"id":389,"current":1,"max":1,"done":true},{"id":388,"current":1,"max":1,"done":true},{"id":390,"current":1,"max":1,"done":true},{"id":387,"current":1,"max":1,"done":true},{"id":392,"current":1,"max":1,"done":true},{"id":393,"current":1,"max":1,"done":true},{"id":395,"current":1,"max":1,"done":true},{"id":394,"current":1,"max":1,"done":true},{"id":398,"current":1,"max":1,"done":true},{"id":397,"current":1,"max":1,"done":true},{"id":399,"current":1,"max":1,"done":true},{"id":396,"current":1,"max":1,"done":true},{"id":391,"current":1,"max":1,"done":true},{"id":423,"current":1,"max":500,"done":false},{"id":424,"current":1,"max":10,"done":false},{"id":415,"current":1,"max":1,"done":true},{"id":416,"current":1,"max":1,"done":true},{"id":417,"current":1,"max":1,"done":true},{"id":418,"current":1,"max":1,"done":true},{"id":419,"current":1,"max":1,"done":true},{"id":420,"current":1,"max":1,"done":true},{"id":460,"current":1,"max":75,"done":false},{"id":461,"current":1,"max":150,"done":false},{"id":536,"current":1,"max":6,"done":false},{"id":120,"current":3,"max":50,"done":false},{"id":129,"current":195,"max":200,"done":false},{"id":119,"current":3,"max":45,"done":false},{"id":118,"current":3,"max":40,"done":false},{"id":117,"current":3,"max":35,"done":false},{"id":116,"current":3,"max":30,"done":false},{"id":115,"current":3,"max":25,"done":false},{"id":114,"current":3,"max":20,"done":false},{"id":113,"current":3,"max":15,"done":false},{"id":111,"current":3,"max":5,"done":false},{"id":112,"current":3,"max":10,"done":false},{"id":422,"current":1,"max":5,"done":false},{"id":429,"current":22,"max":50,"done":false},{"id":431,"current":9,"max":50,"done":false},{"id":622,"current":34,"max":100,"done":false},{"id":689,"current":231,"max":250,"done":false},{"id":658,"current":12,"max":20,"done":false},{"id":676,"current":9,"max":50,"done":false},{"id":722,"current":2,"max":50,"done":false},{"id":723,"current":16,"max":25,"done":false},{"id":728,"current":2,"max":15,"done":false},{"id":731,"current":1,"max":20,"done":false},{"id":734,"current":1,"max":2,"done":false},{"id":743,"current":3,"max":20,"done":false},{"id":746,"current":1,"max":2,"done":false},{"id":748,"current":2,"max":3,"done":false},{"id":752,"current":2,"max":6,"done":false},{"id":757,"current":9,"max":12,"done":false},{"id":753,"current":8,"max":30,"done":false},{"id":762,"current":23,"max":250,"done":false},{"id":754,"current":5,"max":250,"done":false},{"id":981,"current":64,"max":100,"done":false},{"id":973,"current":38,"max":225,"done":false},{"id":971,"current":44,"max":225,"done":false},{"id":976,"current":3,"max":50,"done":false},{"id":972,"current":15,"max":50,"done":false},{"id":974,"current":19,"max":30,"done":false},{"id":980,"current":3,"max":5,"done":false},{"id":975,"current":7,"max":10,"done":false},{"id":982,"current":19,"max":50,"done":false},{"id":978,"current":1,"max":30,"done":false},{"id":1363,"current":17,"max":200,"done":false},{"id":1374,"current":5,"max":10,"done":false},{"id":1543,"current":22,"max":60,"done":false},{"id":1554,"current":82,"max":95,"done":false},{"id":1556,"current":14,"max":75,"done":false},{"id":1541,"current":12,"max":40,"done":false},{"id":1595,"current":10,"max":12,"done":false},{"id":1669,"current":4,"max":15,"done":false},{"id":2074,"current":3,"max":5,"done":false},{"id":2386,"current":1,"max":50,"done":false},{"id":2636,"current":37,"max":100,"done":false},{"id":2576,"current":34,"max":100,"done":false},{"id":2251,"current":10,"max":100,"done":false},{"id":23,"current":930,"max":1000,"done":false},{"id":20,"current":1082,"max":5000,"done":false},{"id":55,"current":1820,"max":5000,"done":false},{"id":56,"current":251,"max":5000,"done":false},{"id":58,"current":2357,"max":5000,"done":false},{"id":59,"current":2484,"max":5000,"done":false},{"id":60,"current":1366,"max":5000,"done":false},{"id":61,"current":204,"max":5000,"done":false},{"id":22,"current":3568,"max":5000,"done":false},{"id":63,"current":168,"max":5000,"done":false},{"id":62,"current":78,"max":5000,"done":false},{"id":28,"current":764,"max":1000,"done":false},{"id":31,"current":40,"max":1000,"done":false},{"id":39,"current":701,"max":1000,"done":false},{"id":46,"current":328,"max":1000,"done":false},{"id":50,"current":810,"max":1000,"done":false},{"id":41,"current":847,"max":1000,"done":false},{"id":106,"current":386,"max":5000,"done":false},{"id":107,"current":673,"max":5000,"done":false},{"id":108,"current":2157,"max":5000,"done":false},{"id":241,"current":70,"max":10000,"done":false},{"id":248,"current":36922,"max":48500,"done":false},{"id":265,"current":3,"max":10000,"done":false},{"id":169,"current":2,"max":500,"done":false},{"id":168,"current":28,"max":500,"done":false},{"id":166,"current":12,"max":500,"done":false},{"id":167,"current":1,"max":500,"done":false},{"id":164,"current":39,"max":1000,"done":false},{"id":171,"current":11,"max":500,"done":false},{"id":165,"current":7,"max":500,"done":false},{"id":336,"current":32,"max":500,"done":false},{"id":382,"current":203,"max":500,"done":false},{"id":623,"current":99,"max":300,"done":false},{"id":760,"current":11,"max":1000,"done":false},{"id":758,"current":8,"max":500,"done":false},{"id":761,"current":128,"max":2000,"done":false},{"id":759,"current":13,"max":1000,"done":false},{"id":764,"current":3778,"max":5000,"done":false},{"id":763,"current":445,"max":2000,"done":false},{"id":756,"current":332,"max":2000,"done":false},{"id":755,"current":82,"max":1000,"done":false},{"id":983,"current":423,"max":500,"done":false},{"id":977,"current":158,"max":500,"done":false},{"id":2078,"current":310,"max":8888,"done":false},{"id":152,"current":88,"max":-1,"done":false},{"id":13,"current":302,"max":100000,"done":false},{"id":240,"current":43,"max":-1,"done":false},{"id":239,"current":1212,"max":-1,"done":false},{"id":283,"current":10064,"max":-1,"done":false},{"id":279,"current":3,"max":-1,"done":false},{"id":268,"current":1,"max":-1,"done":false},{"id":267,"current":1,"max":-1,"done":false},{"id":272,"current":30,"max":-1,"done":false},{"id":270,"current":1,"max":-1,"done":false},{"id":271,"current":29,"max":-1,"done":false},{"id":269,"current":8,"max":-1,"done":false},{"id":303,"current":1528,"max":-1,"done":false},{"id":306,"current":2709,"max":-1,"done":false},{"id":291,"current":555,"max":-1,"done":false},{"id":297,"current":338,"max":-1,"done":false},{"id":300,"current":114,"max":-1,"done":false},{"id":294,"current":32,"max":-1,"done":false},{"id":310,"current":37,"max":-1,"done":false},{"id":313,"current":83,"max":-1,"done":false},{"id":316,"current":148,"max":-1,"done":false},{"id":319,"current":422,"max":-1,"done":false},{"id":322,"current":136,"max":-1,"done":false},{"id":288,"current":414,"max":-1,"done":false},{"id":285,"current":217,"max":-1,"done":false},{"id":1368,"current":151,"max":-1,"done":false},{"id":1369,"current":265,"max":-1,"done":false},{"id":1382,"current":106,"max":-1,"done":false},{"id":122,"bits":[0,2,3,5,6,7],"current":6,"max":8,"done":false},{"id":187,"bits":[0,2,4],"current":3,"max":5,"done":false},{"id":189,"bits":[0,1,3],"current":3,"max":4,"done":false},{"id":93,"bits":[0,2,3,5],"current":4,"max":18,"done":false},{"id":94,"bits":[0,2,3,5,6],"current":5,"max":18,"done":false},{"id":95,"bits":[0,3],"current":2,"max":18,"done":false},{"id":97,"bits":[0,2,3,5],"current":4,"max":18,"done":false},{"id":223,"bits":[0,2,3,5],"current":4,"max":90,"done":false},{"id":427,"bits":[0,1,2,3,4],"current":5,"max":12,"done":false},{"id":721,"bits":[1,2],"current":2,"max":6,"done":false},{"id":724,"bits":[2,3],"current":2,"max":5,"done":false},{"id":726,"bits":[0,1,4],"current":3,"max":6,"done":false},{"id":729,"bits":[0,1,6],"current":3,"max":6,"done":false},{"id":741,"bits":[0],"current":1,"max":6,"done":false},{"id":864,"bits":[4],"current":1,"max":13,"done":false},{"id":865,"bits":[0,1],"current":2,"max":11,"done":false},{"id":868,"bits":[2,3],"current":2,"max":10,"done":false},{"id":874,"bits":[0],"current":1,"max":17,"done":false},{"id":857,"bits":[0,1,3,4,5,6,7],"current":7,"max":33,"done":false},{"id":927,"bits":[1],"current":1,"max":17,"done":false},{"id":990,"bits":[0,4],"current":2,"max":15,"done":false},{"id":1142,"bits":[2,3,5],"current":3,"max":11,"done":false},{"id":1304,"bits":[0,1,2],"current":3,"max":5,"done":false},{"id":1708,"bits":[0],"current":1,"max":46,"done":false},{"id":1709,"bits":[],"current":0,"max":54,"done":false},{"id":1707,"bits":[],"current":0,"max":49,"done":false},{"id":1711,"bits":[0,4,5,6],"current":4,"max":39,"done":false},{"id":1712,"bits":[],"current":0,"max":19,"done":false},{"id":1729,"bits":[1],"current":1,"max":6,"done":false},{"id":1734,"bits":[3,6,7],"current":3,"max":18,"done":false},{"id":1744,"bits":[],"current":0,"max":23,"done":false},{"id":1749,"bits":[5],"current":1,"max":16,"done":false},{"id":1751,"bits":[0,1,2,3],"current":4,"max":18,"done":false},{"id":1835,"bits":[1,2,5,7],"current":4,"max":30,"done":false},{"id":2452,"bits":[0],"current":1,"max":14,"done":false},{"id":2625,"bits":[0],"current":1,"max":7,"done":false},{"id":2461,"bits":[0,2,4,6,7],"current":5,"max":8,"done":false},{"id":2432,"bits":[0],"current":1,"max":14,"done":false},{"id":2351,"bits":[7],"current":1,"max":11,"done":false},{"id":2548,"bits":[0],"current":1,"max":4,"done":false},{"id":2262,"bits":[5],"current":1,"max":16,"done":false},{"id":2236,"bits":[],"current":0,"max":26,"done":false},{"id":2226,"bits":[2,5,7],"current":3,"max":30,"done":false},{"id":2364,"bits":[0,1,2,3],"current":4,"max":13,"done":false},{"id":2573,"bits":[0,1],"current":2,"max":5,"done":false},{"id":2378,"bits":[0,1,2,4,5,6],"current":6,"max":18,"done":false},{"id":2281,"bits":[0],"current":1,"max":5,"done":false},{"id":2221,"bits":[0,4],"current":2,"max":14,"done":false},{"id":2203,"bits":[0,2,5,7],"current":4,"max":9,"done":false},{"id":2551,"bits":[],"current":0,"max":32,"done":false},{"id":2476,"bits":[0],"current":1,"max":14,"done":false},{"id":2602,"bits":[4],"current":1,"max":25,"done":false},{"id":2402,"bits":[0,2,4,6],"current":4,"max":21,"done":false},{"id":2318,"bits":[0,3,4,5,6,7],"current":6,"max":20,"done":false},{"id":2314,"bits":[0,1,2,3,4,5],"current":6,"max":19,"done":false},{"id":2574,"bits":[2,6],"current":2,"max":10,"done":false},{"id":2212,"bits":[0,1,2,4,5],"current":5,"max":18,"done":false},{"id":2222,"bits":[0,1,2,3,4,5,6,7],"current":8,"max":23,"done":false},{"id":2246,"bits":[0,1],"current":2,"max":3,"done":false},{"id":2431,"bits":[1],"current":1,"max":7,"done":false},{"id":2568,"bits":[2],"current":1,"max":3,"done":false},{"id":2529,"bits":[5],"current":1,"max":8,"done":false},{"id":2397,"bits":[0],"current":1,"max":8,"done":false},{"id":2186,"bits":[2],"current":1,"max":3,"done":false},{"id":2626,"bits":[0],"current":1,"max":14,"done":false},{"id":2407,"bits":[7],"current":1,"max":18,"done":false},{"id":2370,"bits":[2,3,4,5,6,7],"current":6,"max":17,"done":false},{"id":2255,"bits":[0,1,4],"current":3,"max":14,"done":false},{"id":2220,"bits":[0,3,5],"current":3,"max":14,"done":false},{"id":2257,"bits":[0,1,2,3,4,5],"current":6,"max":9,"done":false},{"id":2566,"bits":[0,1,2,3],"current":4,"max":5,"done":false},{"id":2509,"bits":[0,1,2,3],"current":4,"max":14,"done":false},{"id":2541,"bits":[4,5,6,7],"current":4,"max":9,"done":false},{"id":2613,"bits":[4,5],"current":2,"max":6,"done":false}]
		);
	}));
});