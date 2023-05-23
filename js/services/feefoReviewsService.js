define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'models/feefo/FeefoReviewListModel',
    'event.aggregator'
], function ($, _, Backbone, App, FeefoReviewListModel, EventAggregator) {
	var feefoReviewService = {
		getReviews: function (vendorref, mode, since, orderBy, sortBy, from, limit) {
			//fetch the results
			var feefoReviewListModel;
			var data = { vendorref: vendorref, mode: mode,since: since,orderBy: orderBy,sortBy: sortBy, from: from, limit: limit};
			$.ajax({
					url: '/services/feefo/FeefoService.asmx/GetFeefoReviews',
					type: "POST",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: JSON.stringify(data),
					success: function (response) {
						if (response.d != null) {
							var json = JSON.parse(response.d);
							feefoReviewListModel = new FeefoReviewListModel(json);
						} else {
							console.log(response);
						}
					},
					error: function(errorResponse) {
						console.log("Inside Failure");
						console.log(errorResponse.responseText);
					}
				}) //have to wait for the fetch to complete
				.complete(function() {
					EventAggregator.trigger('getFeefoReviewsComplete', feefoReviewListModel);
				});
		}
	}

	return feefoReviewService;
});