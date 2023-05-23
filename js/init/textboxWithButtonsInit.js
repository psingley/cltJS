define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/blogNews/TextboxWithButtonsLayout'
	],
	function (App, $, domReady, TextboxWithButtonsLayout) {
		App.module("TextboxWithButtons", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					var r = new TextboxWithButtonsLayout();
				});
			});
		});
	});