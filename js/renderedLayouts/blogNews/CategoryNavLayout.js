define([
		'jquery',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
], function ($, Backbone, Marionette, RenderedLayout) {

    var categoryNavLayout = RenderedLayout.extend({
			initialize: function () {

				$(document).click( function(){
					if ($(window).width() < 992) {
						$('#cat-nav').fadeOut(150);
					}
				});

				$('.category-nav').click(function(e) {
					if ($(window).width() < 992) {
						e.stopPropagation();
						$('#cat-nav').slideToggle(250);
					}
				});
			}
		});

    return categoryNavLayout;
});
