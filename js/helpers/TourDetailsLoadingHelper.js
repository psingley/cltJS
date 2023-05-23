define([
    'jquery',
    'underscore',
    'app',
	'util/animationUtil'
], function ($, _, App, AnimationUtil) {
	var TourDetailsLoadingHelper = {
		_getSectionLoader: function(sectionLoaderEl){
            if (sectionLoaderEl != null && sectionLoaderEl.length > 0)
                return sectionLoaderEl;
            return $("#search-td-loader");
		},
		
		startItineraryAnimation: function (sectionLoaderEl) {
			var sectionLoader = this._getSectionLoader(sectionLoaderEl);
			AnimationUtil.startItineraryAnimationSlow(sectionLoader);
		},

		endItineraryAnimation: function (sectionLoaderEl) {
			var sectionLoader = this._getSectionLoader(sectionLoaderEl);
			AnimationUtil.endItineraryAnimation(sectionLoader);
		}
    };
	return TourDetailsLoadingHelper;
});