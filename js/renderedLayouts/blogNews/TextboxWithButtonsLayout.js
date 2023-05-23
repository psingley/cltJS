define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, Marionette, RenderedLayout) {

	var TextboxWithButtonsLayout = RenderedLayout.extend({
		initialize: function() {
			var outerscope = this;

			this.showHideTextboxes();
		},

		showHideTextboxes: function() {
			$('.textboxWithButtons').each(function (i, obj) {
				var filterSection = $(obj).find('.textboxFilters');
				var contentSection = $(obj).find('.textboxContent');

				var contentEmpty = false;
				var filterEmpty = false;

				if (contentSection != null && /^\s*$/.test(contentSection.html().trim())) {
					contentEmpty = true;
				}

				if (filterSection != null && /^\s*$/.test(filterSection.html().trim())) {
					filterEmpty = true;
					filterSection.hide();
				} else if (filterSection != null) {
					filterSection.show();
				}

				if (filterEmpty && contentEmpty) {
					$(obj).hide();
				} else {
					$(obj).show();
				}
			});
		}

	});
	return TextboxWithButtonsLayout;
});
