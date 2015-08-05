describe('Now', function() {
	beforeEach(module('redglow.gw2api'));
	it('returns a consistent current date', inject(function(Now) {
		// check that the "now" date is compatible with dates taken immediatly before and after
		var preDate = new Date();
		var nowDate = Now.value()
		var postDate = new Date();
		expect(nowDate).not.toBeLessThan(preDate);
		expect(nowDate).not.toBeGreaterThan(postDate);
	}));
});