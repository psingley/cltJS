define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
        'app',
		'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, Marionette, App, RenderedLayout) {

	var componentCarouselLayout = RenderedLayout.extend({
		el: '.carousel-generic',
		
		initialize: function () {


		    //if (App.isIntervalSite) {
		    //    $(".wrapper-pad.bg-white:contains('Brochures')").hide();
		    //}

			var carousels = $('.carousel-generic');
			for (var j = 0; j < carousels.length; j++) {
				this.setLabelControl(carousels[j]);
			}
			
			$(document).ready(function () {
				$("[data-toggle=\"popover\"]").popover();
			});
		},
		InPageEditorMode: function() {
			var parent = $(this.el).parent();
			return $(parent).hasClass("page-editor");
		},

		setLabelControl: function(carousel) {
			var labelItems = $(carousel).closest('.btn-group-carousel').find('#ts-btn-toggles label');
			var carouselItems = $(carousel).find(".carousel-inner .item");
			var carouselItem;
			var labelItem;
			for (var i = 0; i < carouselItems.length; i++) {
				labelItem = labelItems[i];
				carouselItem = carouselItems[i];
				if (this.InPageEditorMode()) {
					$(labelItem).addClass("active");
					$(carouselItem).addClass("active");
				}
				else {
					if (i === 0) {
						$(labelItem).addClass("active");
						$(carouselItem).addClass("active");
						$(labelItem).attr("data-slide-to", i);
					}
					else {
						$(labelItem).removeClass("active");
						$(carouselItem).removeClass("active");
						$(labelItem).attr("data-slide-to", i);
					}
				}
			}

		},

		slideLabels: function(carousel) {
			var labelItems = $(carousel).closest('.btn-group-carousel').find('#ts-btn-toggles label');
			var labelItem;
			for (var i = 0; i < labelItems.length; i++) {
				labelItem = labelItems[i];
				if ($(labelItem).hasClass("active")) {
					$(labelItem).removeClass("active");
					var start = labelItem;
					var nextLabelItem = labelItems[($.inArray(start, labelItems) + 1) % labelItems.length];
					$(nextLabelItem).addClass("active");
					return false;
				}
			}
		}
	});
	return componentCarouselLayout;
});