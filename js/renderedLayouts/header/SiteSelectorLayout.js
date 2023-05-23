define([
		'app',
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'util/objectUtil',
		'extensions/marionette/views/RenderedLayout'
], function (App, $, _, Backbone, Marionette, ObjectUtil, RenderedLayout) {
	var layout = RenderedLayout.extend({
		el: 'header .country-dropdown.dropdown',
		events: {
			'click a[data-available=true]': 'changeSite'
		},
		initialize: function () {
			var outerScope = this;
			var isPopUpSettingUnavailable = ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings);

			this.$el.find('a[data-available=false]').confirmOn({
				questionText: isPopUpSettingUnavailable || ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.questionText) ? App.dictionary.get('common.Misc.SiteSelectorConfirmText') : App.siteSettings.pageNotAvailablePopUpSettings.questionText,
				textYes: isPopUpSettingUnavailable || ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.submitButtonText) ? App.dictionary.get('tourRelated.Booking.TourDateInfo.Yes') : App.siteSettings.pageNotAvailablePopUpSettings.submitButtonText,
				textNo: isPopUpSettingUnavailable || ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.cancelButtonText) ? App.dictionary.get('tourRelated.Booking.TourDateInfo.No') : App.siteSettings.pageNotAvailablePopUpSettings.cancelButtonText,
				afterShow: outerScope.setPopUpStyles
			}, 'click', function (e, confirmed) {
				if (confirmed) {
					//redirect to homepage
					e.preventDefault();
					var clickedUrl = outerScope.getClickedAttribute(e.target, 'href');
					var lang = outerScope.getClickedAttribute(e.target, 'data-language');

					var site = outerScope.getParameterByName('site', clickedUrl);
					var url = '/' + lang +'?site=' + site;
					window.location.href = url;
				}
			});
		},
		changeSite: function(e) {
		    e.preventDefault();
		    // 197072 - Make the cart Id as Zero. So new cart number would be assigned.
		    if (!ObjectUtil.isNullOrEmpty(App.Booking) && !ObjectUtil.isNullOrEmpty(App.Booking.cartId)) {
		        App.Booking.cartId = 0;
		    }

			var url = this.getClickedAttribute(e.target, 'href');

			window.location.href = url + window.location.hash;
		},
		getParameterByName: function (name, url) {
			if (!url) {
				url = window.location.href;
			}
			name = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);

			if (!results) return null;
			if (!results[2]) return '';

			return decodeURIComponent(results[2].replace(/\+/g, " "));
		},
		getClickedAttribute: function (clickedElement, attrName) {
			var element;
			if ($(clickedElement)[0].tagName === "IMG") {
				element = $($(clickedElement)[0].parentElement);
			} else {
				element = $(clickedElement);
			}

			return $(element).attr(attrName);
		},
		setPopUpStyles: function() {
			if(ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings)) {
				return;
			}

			var form = $('.confirmon-box')[0];
			if(form) {
				if(!ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.formBackgroundColor)) {
					$(form).css('background-color', App.siteSettings.pageNotAvailablePopUpSettings.formBackgroundColor);
				}

				if(!ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.formBorderColor)) {
					$(form).css('border-color', App.siteSettings.pageNotAvailablePopUpSettings.formBorderColor);
				}

				if(!ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.formTextColor)) {
					$(form).css('color', App.siteSettings.pageNotAvailablePopUpSettings.formTextColor);
				}

				if(!ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.formTextSize)) {
					$(form).css('font-size', App.siteSettings.pageNotAvailablePopUpSettings.formTextSize  + 'px');
				}
			}

			var buttons = $(form).find('button');
			if (buttons.length > 0) {
				if(!ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.buttonBackgroundColor)) {
					$(buttons).css('background-color', App.siteSettings.pageNotAvailablePopUpSettings.buttonBackgroundColor);
				}

				if(!ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.buttonBorderColor)) {
					$(buttons).css('border-color', App.siteSettings.pageNotAvailablePopUpSettings.buttonBorderColor);
				}

				if(!ObjectUtil.isNullOrEmpty(App.siteSettings.pageNotAvailablePopUpSettings.buttonTextColor)) {
					$(buttons).css('color', App.siteSettings.pageNotAvailablePopUpSettings.buttonTextColor);
				}
			}
		}
	});
	return layout;
});