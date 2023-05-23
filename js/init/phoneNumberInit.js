// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
'app',
'renderedLayouts/pageComponent/PhoneNumberLayout',
'domReady'
],
function (App, PhoneNumberLayout, domReady) {
	App.module("PhoneNumber", function () {
		var outerScope = this;
		this.startWithParent = false;

		this.addInitializer(function () {
			domReady(function () {
				var r = new PhoneNumberLayout();
			});
		});
	});
});