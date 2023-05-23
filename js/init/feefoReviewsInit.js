define([
        "app",
        'jquery',
        'underscore',
        'marionette',
        'backbone',
		'domReady',
        'renderedLayouts/feefo/FeefoReviewsLayout',
        'util/seoTaggingUtil',
		'renderedLayouts/feefo/FeefoTourHeroLayout',
    'renderedLayouts/feefo/FeefoTourDetailLayout',
    'renderedLayouts/tourDetailPage/Feefo/feefoReviewsLayout'
],
    function (App, $, _, Marionette, Backbone, domReady, FeefoReviewsLayout, SeoTaggingUtil, FeefoTourHeroLayout, FeefoTourDetailLayout, FeefoReviewsLayoutNew) {
    	App.module("Reviews", function () {
    		this.startWithParent = false;

    		this.addInitializer(function () {
    			domReady(function () {
    				//instantiate FeefoReviewsLayout for server side rendered components
    				var r = new FeefoReviewsLayout();
    				var s = new FeefoTourHeroLayout();
                    var t = new FeefoTourDetailLayout();
                    var f = new FeefoReviewsLayoutNew();
			    });

    		});
    	});
    });
