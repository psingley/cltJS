// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/grid/EmailUnsubscribe",
		'domReady'
	],
	function (App, Chosen, EmailUnsubscribe, domReady) {
		App.module("Email-Unsubscribe", function () {
			var outerScope = this;
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					//instantiate views/renderedLayouts for server side rendered components
					var layout = new EmailUnsubscribe();
				});
			});
		});
	});