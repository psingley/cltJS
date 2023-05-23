define([
    'app',
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'util/objectUtil',
    'util/newsletterUtil',
    'cookie'
], function (App, $, _, Backbone, Marionette, ObjectUtil, NewsletterUtil, cookie) {
	var SurveyModalLayout = Backbone.Marionette.Layout.extend({
		el: '.surveyModal',
		events: {
			'click #survey-link': 'closePopup',
			'click .closeBtn': 'closePopup'
		},
		initialize: function () {
			var outerScope = this;
			var $appearanceTimeInput = this.$el.find('#survey-appearance-time');
			if ($appearanceTimeInput && $appearanceTimeInput.length > 0 && !ObjectUtil.isNullOrEmpty($appearanceTimeInput.val())) {
				var waitTime = parseInt($appearanceTimeInput.val());
				if (waitTime > 0) {
					setTimeout(function () {
						if (outerScope.shouldShowPopup()) {
							outerScope.$el.show();
							cookie.set('surveyShown', true);
						}
					}, waitTime);
				}
			}
		},
		closePopup: function (e) {
			$(this.$el).hide();
			e.preventDefault();
		},
		shouldShowPopup: function () {
			// if survey modal was already shown in current session
			var surveyCookie = cookie.get('surveyShown');
			if (surveyCookie && surveyCookie === 'true') {
				return false;
			}

			// if survey modal is configured to be shown on mobile devices
			var $showOnMobileInput = this.$el.find('#survey-show-mobile');
			if (App.mobile && $showOnMobileInput && $showOnMobileInput.val().toLowerCase() !== "true") {
				return false;
			}

			return !NewsletterUtil.isAnyModalOrPopupOpened();
		}
	});
	return SurveyModalLayout;
});
