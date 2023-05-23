// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/pageComponent/BackToTopLayout",
		'domReady'
],
	function (App, Chosen, BackToTopLayout, domReady) {
		App.module("Back-To-Top", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					var backToTopLayout = new BackToTopLayout();
				});
			});
		});
	});