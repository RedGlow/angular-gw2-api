var globalItems = (function() {
var ctx = {};
ctx.item24305 = {
	"name": "Charged Lodestone",
	"type": "CraftingMaterial",
	"level": 0,
	"rarity": "Rare",
	"vendor_value": 48,
	"game_types": [
		"Activity",
		"Wvw",
		"Dungeon",
		"Pve"
	],
	"flags": [
		"Activity",
		"Wvw",
		"Dungeon",
		"Pve"
	],
	"restrictions": [
	],
	"id": 24305,
	"icon": "https://render.guildwars2.com/file/02EFB1C5E11B2FF4B4AC25A84E2302D244C82AA3/66958.png"
};
ctx.item19677 = {
	"name": "Gift of Exploration",
	"description": "A gift used to create legendary weapons.",
	"type": "Trophy",
	"level": 0,
	"rarity": "Legendary",
	"vendor_value": 640,
	"game_types": [
		"Activity",
		"Wvw",
		"Dungeon",
		"Pve"
	],
	"flags": [
		"Activity",
		"Wvw",
		"Dungeon",
		"Pve",
		"AccountBindOnUse"
	],
	"restrictions": [
	],
	"id": 19677,
	"icon": "https://render.guildwars2.com/file/B0051EB5FF730C9EF7C2A3781D3F9B732D4D1A55/455857.png"
};

ctx.items = {
	24305: ctx.item24305,
	19677: ctx.item19677
};

function permute(input) {
	var usedChars = [],
		permArr = [];
	function doPermute(input) {
		var i, ch;
		for (i = 0; i < input.length; i++) {
			ch = input.splice(i, 1)[0];
			usedChars.push(ch);
			if (input.length == 0) {
				permArr.push(usedChars.slice());
			}
			doPermute(input);
			input.splice(i, 0, ch);
			usedChars.pop();
		}
		return permArr;
	};
	return doPermute(input);
}

function removeDuplicates(input) {
	var i = 0;
	var existing = [];
	while(i < input.length) {
		var itemId = input[i];
		if(existing.indexOf(itemId) == -1) {
			existing.push(itemId);
			i++;
		} else {
			input.splice(i, 1);
		}
	}
}

ctx.prepare = function($httpBackend) {
	var itemIds = [];
	var allResponses = [];
	for(var i = 1; i < arguments.length; i++) {
		var itemId = arguments[i];
		itemIds.push(itemId);
		var itemResponse = ctx.items[itemId];
		allResponses.push(itemResponse);
		$httpBackend.whenGET('https://api.guildwars2.com/v2/items/' + itemId).respond(itemResponse);
		$httpBackend.whenGET('https://api.guildwars2.com/v2/items?ids=' + itemId).respond([itemResponse]);
	}
	var itemIdsPermutations = permute(itemIds);
	for(var i = 0; i < itemIdsPermutations.length; i++) {
		var itemIdsPermutation = itemIdsPermutations[i];
		removeDuplicates(itemIdsPermutation);
		var itemResponses = [];
		for(var j = 0; j < itemIdsPermutation.length; j++) {
			itemResponses.push(ctx.items[itemIdsPermutation[j]]);
		}
		var url = 'https://api.guildwars2.com/v2/items?ids=' + itemIdsPermutation.join(',');
		$httpBackend
			.whenGET(url)
			.respond(itemResponses);
	}
	return allResponses;
};

return ctx;
})();