define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'models/dsmLocator/DistrictSaleManagerLocatorModel',
    'event.aggregator'
], function ($, _, Backbone, App, DistrictSaleManagerLocatorModel, EventAggregator) {
    var districtSaleManagerLocatorService = {
        searchForDSM: function (state,currentItemId) {
           //fetch the results
            var districtSaleManagerLocatorModel = new DistrictSaleManagerLocatorModel();
            var dsmLocatorSearch ='{state:"'+state+'",currentItemId:"'+currentItemId+'"}';
            districtSaleManagerLocatorModel.fetch({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data:dsmLocatorSearch,
                success: function (response) {
                },
                error: function (errorResponse) {
	                console.log("Inside Failure");
	                console.log(errorResponse.responseText);
                }
            })  //have to wait for the fetch to complete
                .complete(function () {
                    EventAggregator.trigger('dsmLocatorSearchComplete', districtSaleManagerLocatorModel);
                });
        }
    }

    return districtSaleManagerLocatorService;
});