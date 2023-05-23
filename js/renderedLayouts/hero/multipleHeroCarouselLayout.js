define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, Marionette, RenderedLayout) {
	/**
	* @class multipleHeroCarouselLayout
	* @extends RenderedLayout
	*/
	var multipleHeroCarouselLayout = RenderedLayout.extend({
		el: 'body',
		ui: {
			'$carousels': '.carousel',
		},
		//events: {
		//	'slide.bs.carousel #hero-carousel': 'carouselNormalization'
		//},
		initialize: function () {

		    
			var carousels = this.ui.$carousels;
			if (carousels == undefined ||  carousels == null) {
				return;
			}

			for (var i = 0; i < carousels.length ; i++) {
			    var carousel = $(carousels[i]);
				if (this.InPageEditorMode(carousel)) {
					$(carousel).carousel('pause');
				}
				else {
				    $(carousel).carousel('cycle');
				    
				}

				this.setCarouselIndicatorsAndControls(carousel);
			}
		},

		InPageEditorMode: function (el) {
			var parent = $(el).parent();
			return $(parent).hasClass("page-editor");
		},

		setCarouselIndicatorsAndControls: function (carousel) {
            		    
			var leftControl = $(carousel).find("a.left.carousel-control");
			var rightControl = $(carousel).find("a.right.carousel-control");
			var carouselIndicators = $(carousel).find(".carousel-indicators");
			var carouselItems = $(carousel).find(".carousel-inner .item");
			var carouselItem;

			if (carouselItems == null || carouselItems == undefined ||
				carouselIndicators == null || carouselIndicators == undefined ||
				rightControl == null || rightControl == undefined ||
				leftControl == null || leftControl == undefined) {
				return;
			}
            
			if (carouselItems.length > 1) {
			    //Setting carousel indicators
			    
				var html = "";
				for (var i = 0; i < carouselItems.length; i++) {
					carouselItem = carouselItems[i];
					
					if (this.InPageEditorMode(carousel)) {
						$(carouselItem).addClass("active");
					}
					else {
						if (i === 0) {
							$(carouselItem).addClass("active");
							html += '<li data-target="#'+ carousel.attr('id')+'" data-slide-to="' + i + '" class="active"></li>';
						}
						else {
							$(carouselItem).removeClass("active");
							html += '<li data-target="#' + carousel.attr('id') + '" data-slide-to="' + i + '"></li>';
						}
					}
				}
				if ($(carouselIndicators).length > 0) {
					$(carouselIndicators)[0].innerHTML = html;
				}
                				
				//Switching controls on 
				$(leftControl).show();
				$(rightControl).show();
                				
			}
			else {
				carouselItem = carouselItems[0];
				$(carouselItem).addClass("active");
				$(leftControl).hide();
				$(rightControl).hide();
			}
		},
		carouselNormalization: function () {
		    var items = $('#hero-carousel .va-container'), //grab all slides
					heights = [], //create empty array to store height values
					tallest; //create variable to make note of the tallest slide

			if (items.length) {
				this.normalizeHeights(items);
				var outerscope = this;
				$(window).on('resize orientationchange', function () {
					tallest = 0;
					heights.length = 0; //reset vars
					items.each(function () {
						$(this).css('height', '0'); //reset min-height
					});
					outerscope.normalizeHeights(items); //run it again
				});
			}
		},
		normalizeHeights: function (items) {
			var heights = [], //create empty array to store height values
					tallest; //create variable to make note of the tallest slide

			items.each(function () { //add heights to array
				heights.push($(this).height());
			});

			tallest = Math.max.apply(null, heights); //cache largest value
			items.each(function () {
				$(this).css('height', tallest + 'px');
			});
		}
	});
	return multipleHeroCarouselLayout;
});