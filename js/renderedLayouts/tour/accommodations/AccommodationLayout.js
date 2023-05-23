define([
'jquery',
'underscore',
'backbone',
'marionette',
'util/tourDetailUtil',
'views/tour/accommodations/AccommodationListView',
'views/tour/accommodations/AccommodationView',
'collections/tour/accommodations/AccommodationCollection',
'text!templates/tour/accommodations/accommodationLayout.html'
], function ($, _, Backbone, Marionette, TourDetailUtil, AccommodationListView, AccommodationView, AccommodationCollection, accommodationLayoutTemplate) {
	var AccommodationLayout = Backbone.Marionette.Layout.extend({
		template: Backbone.Marionette.TemplateCache.get(accommodationLayoutTemplate),
		regions: {
			defaultView: "#accommodationDefaultView",
			expandedView: "#accommodationExpandedView"
		},
		onShowCalled: function () {
			$(document).ready(function () {
				//check clientbase before appending
				var isClientBase = $('#clientBase').val();
				if (isClientBase.toLowerCase() == "false") {
					$('head').append(
						'<script data-pid="1092047" data-ids="147912" data-lang="en" data-app="vfmGalleryReflections" data-theme="default" data-id="vfmviewer" src="https://deeljyev3ncap.cloudfront.net/galleries/player/loader.min.js" type="text/javascript" charset="UTF-8"><\/script>');
				}
			});
			//hides Hotels & accommodations if empty
			if (this.collection.length < 1) {
				$('#hotels_section').parent().hide();
				$('#hotels_section').parent().attr('shownondesktop', 'false');
				return;
			} else {
				$('#hotels_section').parent().show();
				$('#hotels_section').parent().attr('shownondesktop', 'true');
				this.defaultView.show(new AccommodationListView({ collection: this.collection }));
			}
			$("#hotelsAccommodationsViewMore").hide();
			
		}

	});
	// Our module now returns our view
	return AccommodationLayout;
});