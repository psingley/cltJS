define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, Marionette, RenderedLayout) {

	var stickyHeaderLayout = RenderedLayout.extend({
	    el: '.header-navbar',
		initialize: function() {
		    var outerscope = this;
		    $(this.el).affix({
		        offset: {
		            top: function () {
		                return (this.top = $(outerscope.el).offset().top);
		            }
		        }
		    });
		}
	});
	return stickyHeaderLayout;
});
