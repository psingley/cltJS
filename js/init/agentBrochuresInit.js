define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/brochures/AgentBrochuresLayout'
	],
	function (App, $, domReady, AgentBrochuresLayout) {
		App.module("Agent-Brochures", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					console.log("IM IN The init function" + $('#BrochuresPageDetails').value);
					//instantiate AgentBrochuresLayout for server side rendered components
					var r = new AgentBrochuresLayout();
				});
			//start the app
			});
		});
	});