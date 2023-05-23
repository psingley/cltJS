define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'event.aggregator'
], function ($, _, Backbone, App, EventAggregator) {
    var needMoreInfoService = {
        needMoreInfoSignup: function (params) {
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: '/Services/Tours/NeedMoreInfo.asmx/NeedMoreInfoFormSubscribe',
                dataType: "json",
                data: params,
                error: function (errorResponse) {
                    console.log("NeedMoreInfoService call failed: NeedMoreInfoFormSubscribe");
                    console.log(errorResponse.responseText);
                }
            });
            return result;
        }
    };

    return needMoreInfoService;
});