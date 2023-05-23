define([
    'domReady!',
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'app',
		'extensions/marionette/views/RenderedLayout'
], function (doc, $, _, Backbone, Marionette, EventAggregator, App, RenderedLayout) {
	var regionDestinationsComponentLayout = RenderedLayout.extend({
		el: '#region-destinations',
		events: {
			'click .showcase-item a': 'stageDestination',
			'slid.bs.carousel .carousel': 'afterSliding'
		},
		initialize: function() {
			var self = this;
			self.carouselItems = $('#region-destination-carousel .carousel-inner')[0].children;
			self.setChosenDropDowns();
			self.setDestinationSearch();
			self.setViewportResizeSettingForCarousel();
			if (self.prevControlLabel.length > 0 && self.nextControlLabel.length > 0) {
				self.prevControlLabel.text(self.getCarouselItemHeaderText(self.prevSlide()));
				self.nextControlLabel.text(self.getCarouselItemHeaderText(self.nextSlide()));
			}

			EventAggregator.on('highlightStageContent', function (index) {
				self.setStageDetails(index);
			});
		},

		setDestinationSearch: function() {
			$("#destination-search").hideseek({
				nodata: App.dictionary.get('common.Page_Components.No_Results_Found')
			});
		},

		prevControlLabel: $('#region-map .showcase-stage-controls #region-destination-carousel-left .control-label'),
		nextControlLabel: $('#region-map .showcase-stage-controls #region-destination-carousel-right .control-label'),

		//Apply the harvet JS plugin to the dropdown menus
		setChosenDropDowns: function() {
			$(".chosen-select").chosen({
				no_results_text: App.dictionary.get('common.Page_Components.No_Filter_Results'),
				disable_search_threshold: 10
			});
		},

		// Animate the height of carousel slides if they are different heights
		setAnimateHeightOfCarousel: function() {
			$(document).on("slide.bs.carousel", ".carousel", function(e) {
				var nextH = $(e.relatedTarget).outerHeight();
				$(this).find('.active.item').parent().animate({ height: nextH }, 500);
			});
		},

		setViewportResizeSettingForCarousel: function() {
			var viewport = $(window);
			viewport.resize(function() {
				$(".carousel-inner").height("auto");
			});
		},

		stageDestination: function(e) {
			e.preventDefault();
			var showcaseItem = $(e.target).closest('.showcase-item');
			var simpleDestination = showcaseItem.data('simpledestination');
			var index = showcaseItem.data('index');

			var self = this;
			self.setMainStage(simpleDestination, index);

		},

		afterSliding: function (e) {
			var self = this;
			self.animateHeightOfCarousel(e);

			//This is right with respect to screen not user. So our left
			if (e.direction === "right") {
				self.currentSlide = self.prevSlide();
			}
			else if (e.direction === "left") {
				self.currentSlide = self.nextSlide();
			}
			self.prevControlLabel.text(self.getCarouselItemHeaderText(self.prevSlide()));
			self.nextControlLabel.text(self.getCarouselItemHeaderText(self.nextSlide()));
			self.highlightStageContent(self.currentSlide);
		},

		getCarouselItemHeaderText: function (index) {
			var self = this;
			var item = self.carouselItems[index];
			return $(item).find('.item-inner .padded h3')[0].innerText;
		},

		// Animate the height of carousel slides if they are different heights
		animateHeightOfCarousel: function (e) {
			
			var nextH = $(e.relatedTarget).outerHeight();
			$(this).find('.active.item').parent().animate({ height: nextH }, 500);
		},

		carouselItems: null,
		currentSlide: 0,
		nextSlide: function() {
			var self = this;
			var lastSlide = self.carouselItems.length - 1;
			if (self.currentSlide === lastSlide) {
				return 0;
			}
			else {
				return self.currentSlide + 1;
			}
		},
		prevSlide : function() {
			var self = this;
			var lastSlide = self.carouselItems.length - 1;
			if (self.currentSlide === 0) {
				return lastSlide;
			}
			else {
				return self.currentSlide - 1;
			}
		},
		
		goToSlide :  function (currentSlide, moveToSlide) {
			var self = this;
			var current = self.carouselItems[currentSlide];
			current.className = current.className.replace('active', '');
			var newCurrent = self.carouselItems[moveToSlide];
			newCurrent.className = newCurrent.className + " active";
			self.currentSlide = moveToSlide;

			self.prevControlLabel.text(self.getCarouselItemHeaderText(self.prevSlide()));
			self.nextControlLabel.text(self.getCarouselItemHeaderText(self.nextSlide()));
		},

		setMainStage: function (simpleDestination, index) {
			var outerScope = this;
			outerScope.highlightStageContent(index);
			outerScope.setStageDetails(index);
		},

		highlightStageContent: function (index) {
			EventAggregator.trigger('highlightMarker',index);
		},

		setStageDetails: function (index) {
			var self = this;
			self.goToSlide(self.currentSlide, index);
		}
	});

	return regionDestinationsComponentLayout;
});