define([
    'jquery',
    'underscore',
    'cookie',
    'app',
    'util/objectUtil',
    'services/brochureService'
], function ($, _, cookie, App, ObjectUtil, BrochureService) {
    var $launchingSettingsInputs = $('#newsletter-modal-launching-settings');
    var $launchSettings = $launchingSettingsInputs && $launchingSettingsInputs.length > 0 ? $launchingSettingsInputs.first() : null;
    var newsletterUtil = {
        isGeneralNewsletterModal: function($modal){
            return $modal[0].id === 'newsletter-modal';
        },
        isLaunchingSettingsSet: function () {
            return !!$launchSettings;
        },
        isOnMouseLeaveWindow: function () {
            return $launchSettings.data('onmouseleave') === 'True';
        },
        getWaitTime: function () {
            return parseInt($launchSettings.data('time'));
        },
        getScrollPoint: function () {
            return parseInt($launchSettings.data('scrollpoint'));
        },
        setModalShownCookie: function (modalShownText) { //Changed the Code to write in a generic way. - Web-910.
            App.newsletterModalShwon = true;
            var expDate = new Date();
            expDate.setDate(expDate.getDate()+15);
            BrochureService.getSessionId().done(function (response) {
                var data = {
                    value: true,
                    sessionId: response.d
                };

                cookie.set(modalShownText, data, {path: '/', expires: expDate});
            });
        },
        newsletterModalShowCheck: function (callback) {
            var cookieString = cookie.get('newsLetterModalShown');
            var cookieValue;
            if (cookieString){
                cookieValue = JSON.parse(cookieString);
            }

			//do not show sign up for newsletter modal on mobile devices automatically
            if (App.mobile) {
	            return;
            }
			var currentItemId = $('body').data('current-item-id');
			var templateId = $('body').data('template');
			var suppressedPages = $launchSettings.data("suppressed-pages").split(",");
			var suppressedTemplates = $launchSettings.data("suppressed-templates").split(",");
            //suppress popup on this page if it in suppression list
			if (suppressedPages.indexOf(currentItemId) >= 0 || suppressedTemplates.indexOf(templateId) >= 0){
				return;
			}
            
            // if wasn't shown before - show now.
            if (ObjectUtil.isNullOrEmpty(cookieValue) || !cookieValue.value) {
                callback();
            }
            else {
                // if was shown before - do some additional checks.
                var exceptionPages = $launchSettings.data("exception-pages").split(",");
                var exceptionTemplates =$launchSettings.data("exception-templates").split(",");
                if (exceptionPages.indexOf(currentItemId) >= 0 || exceptionTemplates.indexOf(templateId) >= 0){
                    BrochureService.getSessionId().done(function (response) {
                        // we need to show in this session
                        if (cookieValue.sessionId != response.d){
                            callback();
                        }
                    });
                }
            }
        },
        getCheckedOptions: function($options) {
            return _.filter($options, function(opt) {
                return $(opt).is(':checked');
            })
        },
        isAnyModalOrPopupOpened: function () {
            // if there are opened modals or popups on the page
            var modals = $('.modal, *[data-type="popup"]');
            var isAnyModalOrPopupOpened = modals && modals.length > 0 && _.some(modals, function(modal) {
                    return $(modal).css('display') !== 'none';
                });

            return isAnyModalOrPopupOpened;
        }
    };

    return newsletterUtil;
});