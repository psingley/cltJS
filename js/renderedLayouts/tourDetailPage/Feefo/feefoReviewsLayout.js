define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app'
], function ($, _, Backbone, Marionette, App) {
    var FeefoReviewsLayout = Backbone.Marionette.Layout.extend({
		el: '#tourdetailsreviews',
        events: {
            'click .filter-checkbox': 'updateReviews'
        },
		initialize: function () {
			var viewContext = this;
        },
        updateReviews: function () {
        }
	});
    // Our module now returns our view
    return FeefoReviewsLayout;
});