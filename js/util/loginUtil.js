define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'util/animationUtil'
], function ($, _, Backbone, App, AnimationUtil) {
    var loginUtil = {
         startLoadingAnimation: function (loggingIn) {
            var sectionLoader = $("#login-loader");
            if (loggingIn) {
                sectionLoader.find(".section-loader-title").text(App.dictionary.get('profile.FreeFormText.LoggingIn'));
                sectionLoader.find(".section-loader-subtitle").text(App.dictionary.get('profile.FreeFormText.LoggingInDescription'));
            }
            else {
                sectionLoader.find(".section-loader-title").text(App.dictionary.get('profile.FreeFormText.LoggingOut'));
                sectionLoader.find(".section-loader-subtitle").text(App.dictionary.get('profile.FreeFormText.LoggingOutDescription'));
            }
            AnimationUtil.startItineraryAnimationSlow(sectionLoader);
        },
        endLoadingAnimation: function () {
            var sectionLoader = $("#login-loader");
            AnimationUtil.endItineraryAnimation(sectionLoader);
        }
    };
    return loginUtil;
});