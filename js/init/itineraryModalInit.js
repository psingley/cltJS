define([
'app',
'renderedLayouts/modals/ItineraryModalLayout'
],
function (App, ItineraryModalLayout) {
	App.module("ItineraryModal", function () {
		this.startWithParent = false;
		this.addInitializer(function () {
			//wrap a block of text in the domReady object so
			//that is gets called after the dom has loaded.
			var itineraryModalLayout = new ItineraryModalLayout();
		});
	});
});