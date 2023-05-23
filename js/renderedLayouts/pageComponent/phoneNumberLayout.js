define([
		'jquery',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
], function ($, Backbone, Marionette, RenderedLayout) {
	var phoneNumberLayout = RenderedLayout.extend({
		el: '.phone-number',
		initialize: function () {
			var phoneNumberElements = $('.change-phone-number');

			var companyInfo = $("body").data("company");
			if (companyInfo) {
				if (companyInfo.callCenterPhoneNumber) {
					for (var j = 0; j < phoneNumberElements.length; j++) {
						var linkEl = $(phoneNumberElements[j]);

						if (linkEl.is('span')) {
							linkEl.html(companyInfo.callCenterPhoneNumber);
						}

						if (linkEl.is('a')) {
							$(linkEl).attr("href", 'tel:' + companyInfo.callCenterPhoneNumber);
						}
					}

				}
			}
		}
	});
	return phoneNumberLayout;
});