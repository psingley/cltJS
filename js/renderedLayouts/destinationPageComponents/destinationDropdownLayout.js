define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
        'app',
		'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, Marionette, App, RenderedLayout) {

	var DestinationDropdownLayout = RenderedLayout.extend({
		el: "#dropDownRegion",
		events: {
			"change #destination-dropdown": "gotoLink"
		},
		gotoLink: function(e) {
			var url = $(e.target).val();
			console.log(url);
			window.location = url;
		},

		initialize: function () {
		    //if (App.isIntervalSite) {
		    //    $(".wrapper-pad.bg-white:contains('Brochures')").hide();
		    //}
		}
	});
	return DestinationDropdownLayout;
});