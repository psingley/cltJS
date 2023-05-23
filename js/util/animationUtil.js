define([
    'jquery'
], function ($) {
    var animationUtil = {
        _loadingActionConst: 'loading-action',
        _loadingConst: 'loading',
        _getItineraryLoader: function(){
          return  $("#itinerary-loader");
        },
        _constructLoaders: function(element){
            var sectionLoader = this._getItineraryLoader();
            if (element)
                sectionLoader = $(element);
            var sectionLoaderContainer = sectionLoader.parent(".section-loader-container");
            return {loader: sectionLoader, container: sectionLoaderContainer};
        },
        _startAnimation: function(element, fadeInOptions, cssClass){
            var o = this._constructLoaders(element);
            var loader = o.loader;
            var container = o.container;
            if (fadeInOptions)
                loader.fadeIn(fadeInOptions);
            else
                loader.fadeIn();
            container.addClass(cssClass);
        },
        _endAnimation: function (element, fadeOutOptions, cssClass) {
            var o = this._constructLoaders(element);
            var loader = o.loader;
            var container = o.container;
            if (fadeOutOptions)
                loader.fadeOut(fadeOutOptions);
            else
                loader.fadeOut();
            container.removeClass(cssClass);
        },

        //itinerary animations
        startItineraryAnimation: function (element, fadeInOptions) {
            this._startAnimation(element, fadeInOptions, this._loadingActionConst);
        },
        startItineraryAnimationSlow: function (element) {
            this.startItineraryAnimation(element, {duration: 'slow'});
        },
        startItineraryAnimationWithMetrics: function (metric, element, fadeInOptions) {
            metric = Date.now();
            this.startItineraryAnimation(element, fadeInOptions);
        },
        endItineraryAnimation: function (element, fadeOutOptions) {
            this._endAnimation(element,fadeOutOptions, this._loadingActionConst);
        },
        //itinerary animations
        
        //loading animations
        //the same methods as airsearch animations
        startLoadingAnimation: function(element, fadeInOptions){
            this._startAnimation(element,  fadeInOptions, this._loadingConst);
        },
        startLoadingAnimationSlow: function(element){
            this.startLoadingAnimation(element, {duration: this._loadingConst});
        },
        endLoadingAnimation: function (element, fadeOutOptions) {
            this._endAnimation(element, fadeOutOptions, 'loading');
        },
        //loading animations
        
        //progress bar
        showProgressBar: function () {
            $("#itinerary-loader .section-loader-description").hide();
            this._startAnimation(null, null, this._loadingActionConst)
        },
        hideProgressBar: function () {
            this._endAnimation(null, {duration: 'fast', easing: 'linear', complete: function () {
                    $("#itinerary-loader .section-loader-description").show();
                }}, this._loadingActionConst);
        },
        //progress bar
        
        //air search animations
        startAirSearchAnimation: function () {
            this.startLoadingAnimation($('#air-search-loader'));
        },
        endAirSearchAnimation: function () {
            this.endLoadingAnimation($('#air-search-loader'));
        }
        //air search animations
    };
    return animationUtil;
});