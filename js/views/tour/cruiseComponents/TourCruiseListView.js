define([
'jquery',
'underscore',
'backbone',
'marionette',
'app',
'event.aggregator',
'owl.carousel',
'views/tour/cruiseComponents/CruiseComponentView',
'collections/tour/cruiseComponents/CruiseComponentCollection',
'util/tourDetailUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, owl, CruiseComponentView, CruiseComponentCollection, TourDetailUtil) {
	var TourCruiseListView = Backbone.Marionette.CollectionView.extend({
		collection: CruiseComponentCollection,
		itemView: CruiseComponentView,
		initialize: function (options) {
			this.$expandedView = options.$expandedView;
			this.$closeButton = options.$closeButton;
		},
		itemViewOptions: function () {
			var viewContext = this;

			return {
				$expandedView: viewContext.$expandedView,
				$closeButton: viewContext.$closeButton
			}
		},
		onShow: function () {
			var viewContext = this;
			//hides optional excursions section if empty
			if (this.collection == null || this.collection.length < 1) {
				$('#cruise_section_container').hide();
				$('#cruise_section_container').attr('shownondesktop', 'false');
			} else {
				$('#cruise_section_container').show();
				$('#cruise_section_container').attr('shownondesktop', 'true');
				var $images = $('#tourCruise').find('img');
				$images.load(function () {
					var $columns = viewContext.$el.find('.col');
					TourDetailUtil.updateColumnHeights($columns);
				});
			}

			var numberOfItemsPerPage = 3;
			viewContext.$el.owlCarousel({
				loop: false,
				items: numberOfItemsPerPage,
				nav: true
			}).on('changed.owl.carousel', viewContext.owlFixLastDot);


			viewContext.$el.show();
			var currentItemsPerPage = viewContext.$el.find('.owl-item').length;
			if (currentItemsPerPage <= numberOfItemsPerPage) {
				var owlControls = viewContext.$el.find('.owl-controls');
				$(owlControls).hide();
			}
		},
		owlFixLastDot: function (event) {
			var numberOfItemsPerPage = 3;
			if (event.item.index + numberOfItemsPerPage === event.item.count) {
				$(event.target).find('.owl-dots div:last')
					.addClass('active')
					.siblings().removeClass('active');
			}
		}
	});
	// Our module now returns our view
	return TourCruiseListView;
});