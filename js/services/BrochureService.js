define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'event.aggregator'
], function ($, _, Backbone, App, EventAggregator) {
	var brochureRequestService = {
        requestBrochure: function (params, includeMailsignUp) {
            var url = "/Services/Brochures/NewsletterService.asmx/" + (includeMailsignUp ? "RequestBrochureWithSignUp" : "RequestBrochure");
            var dataModel;
            $.ajax({
                url: url,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: params,
                type: 'POST',
                success: function (data) {
                    dataModel = data.d;
                },
                error: function (errorResponse) {
                    console.log('NewsletterService call failed: RequestBrochure');
                    console.log(errorResponse.responseText);
                }
            })
                .complete(function () {
                    EventAggregator.trigger('requestBrochureComplete', dataModel);
                });
        },
        getSessionId: function () {
            var result = $.ajax({
                url: "/Services/Brochures/NewsletterService.asmx/GetSessionInfo",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                type: 'post',
                error: function () {
                    console.log('NewsletterService call failed: GetSessionInfo');
                }
            });
            return result;
        }
    };

	return brochureRequestService;
});