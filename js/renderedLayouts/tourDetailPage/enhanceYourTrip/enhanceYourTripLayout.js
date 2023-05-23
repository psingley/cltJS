define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'util/tourDetailUtil',
		'views/tourDetailPage/optionalExcursions/OptionalExcursionsListView',
		'collections/tourDetailPage/optionalExcursions/OptionalExcursionsCollection',
		'extensions/marionette/views/RenderedLayout',
		'event.aggregator',
		'util/objectUtil',
		'views/tourDetailPage/prePost/PrePostListView',
		'views/tourDetailPage/tourExtensions/TourExtensionListView'
	],
	function($,
		_,
		Backbone,
		Marionette,
		TourDetailUtil,
		OptionalExcursionsListView,
		OptionalExcursionsCollection,
		RenderedLayout,
		EventAggregator,
		ObjectUtil,
		PrePostListView,
		TourExtensionListView) {
		var EnhanceYourTripLayout = RenderedLayout.extend({
			el: '#tour_detail_enhance',
			regions: {
				optionalExcursion: "#tourOptionalExcursionsRegion",
				prePost: "#tourPrePostRegion",
				extensions: ".carousel-accordion--carousel"
			},
			initialize: function() {
				var viewContext = this;

				/**
				 * @event tourDetailsRequestComplete
				 */
				EventAggregator.on('tourDetailsRequestComplete',
					function (tourDetailsModel) {
						var optionalExcursions = tourDetailsModel.tourOptionalExcursions;
						var prePost = tourDetailsModel.tourPrePost;
						var extensions = tourDetailsModel.tourDetailExtensions;

						if (optionalExcursions.length == 0 && prePost.length == 0 && extensions.length == 0) {
						    $("#tour_detail_enhance").hide();
						    $('a[href=#tour_detail_enhance]').hide();
						} else {
						    $('a[href=#tour_detail_enhance]').show();
							if (optionalExcursions.length >= 1) {
								viewContext.showOptionalExcursions(optionalExcursions);
							} else {
								$('#tour-optional-excursions-section-container').hide();
							}

							if (prePost.length >= 1) {
								viewContext.showTourPrePost(prePost);
							} else {
								$('#tour-pre-post-nights-section-container').hide();
							}

							if (extensions.length >= 1) {
								viewContext.showTourExtensions(extensions);
							} else {
								$('#tour_detail_extensions_section_container').hide();
							}
						}
					});
			},
			/**
			 * Renders the Optional Excursions List View
			 *
			 * @method showOptionalExcursions
			 * @param optionalExcursions
			 */
			showOptionalExcursions: function(optionalExcursions) {
				var filteredOptionalExcursions =
					optionalExcursions.filter(function(excursion) {
						var hasSummary = !ObjectUtil.isNullOrEmpty(excursion.get('summary'));
						var hasTitle = !ObjectUtil.isNullOrEmpty(excursion.get('title'));
						var hasDescription = !ObjectUtil.isNullOrEmpty(excursion.get('description'));

						return hasDescription && hasSummary && hasTitle;
					});

				optionalExcursions.set(filteredOptionalExcursions);

				this.optionalExcursion.show(
					new OptionalExcursionsListView(
					{
						collection: optionalExcursions
					})
				);
			},
			/**
			 * Renders the Pre Post List View
			 *
			 * @method showTourPrePost
			 * @param prePostNights
			 */
			showTourPrePost: function(prePostNights) {
				this.prePost.show(
					new PrePostListView(
					{
						collection: prePostNights
					})
				);
			},
			/**
			 * Renders the Extensions List View
			 *
			 * @method showTourExtensions
			 * @param extensions
			 */
			showTourExtensions: function (extensions) {
				this.extensions.show(
					new TourExtensionListView(
						{
							collection: extensions
						})
				);
			}
		});
		// Our module now returns our view
		return EnhanceYourTripLayout;
	});