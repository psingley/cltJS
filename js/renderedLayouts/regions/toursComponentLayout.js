define([
    'domReady!',
    'jquery',
    'underscore',
    'backbone',
    'extensions/marionette/views/RenderedLayout',
    'event.aggregator',
    'jquery.unveil',
	'owl.carousel'
], function (doc, $, _, Backbone, RenderedLayout, EventAggregator, Unveil, OwlCarousel) {
	var toursComponentLayout = RenderedLayout.extend({
		el: '#region-tours',
		ui: {
			'$tags': '.tags',
			'$carousel': '.owl-carousel'
		},
		initialize: function () {
			this.SetCarousel();
		},
		SetCarousel: function () {
			var currentCarousel = this.ui.$carousel;
			var numberOfItemsPerPage = 3;
			currentCarousel.owlCarousel({
				loop:true,
				items: numberOfItemsPerPage,
				responsive: {
				    0: { items: 1 }, // above 0px screen width 
				    480 : { items : 2}, // above 480px screen width 
				    768: { items: 3 }, // above 480px screen widthto 768 
				    1024: { items: 3 } // above 1024px screen width 
				},
				theme: "collette-carousel",
				callbacks: true,
				nav: true,
				navText: ["<span class='fa fa-chevron-left'></span>", "<span class='fa fa-chevron-right'></span>"]
				
			});
			currentCarousel.show();
			var currentItemsPerPage = currentCarousel.find('.owl-item').length;
			if (currentItemsPerPage <= numberOfItemsPerPage) {
				var owlControls = currentCarousel.find('.owl-controls');
				$(owlControls).hide();
			}
			$('#region-tours img').unveil();
		}
	});
	return toursComponentLayout;
});