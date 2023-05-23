define([
    'domReady!',
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'app',
    'util/searchOptionsUtil',
    'util/uriUtil',
		'gallery-carousel',
		'isotope',
		'packery-mode',
		'waitForImages',
		'jquery.bridget',
		'extensions/marionette/views/RenderedLayout'
], function (doc, $, _, Backbone, Marionette, EventAggregator, App, SearchOptionsUtil, UriUtil, gc,Isotope, pm, waitforimages, Bridget, RenderedLayout) {
	var regionPhotosLayout = RenderedLayout.extend({
		el: '#region-photos',
		initialize: function () {

			$.bridget('isotope', Isotope);

			var $container = $('#region-gallery');
			$container.waitForImages.hasImageProperties = ['background-image'];

			$container.waitForImages(function () {
				$('#region-photos .pad').show();

				//Set Packery mode for isotope 
				$container.isotope({
					itemSelector: ".gallery-item",
					layoutMode: "packery"
				});

			});

			var gallery = $("#region-gallery");
    		gallery.galleryCarousel({
    			imgSelector: ".inner",
    			imgSrcAttr: "data-src"
    		});
				
        }
    });

    return regionPhotosLayout;
});