define([
	'app',
	'jquery',
	'domReady',
	'renderedLayouts/explorations/explorationsLayout'
],
	function (App, $, domReady, explorationsLayout) {
	    App.module("explorationsSite", function () {
	        this.startWithParent = false;
	        this.addInitializer(function () {
	            domReady(function () {
	                var r = new explorationsLayout();
	            });
	        });
	    });
	});