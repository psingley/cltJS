define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'models/agentFinder/AgentFinderModel',
    'event.aggregator'
], function ($, _, Backbone, App, AgentFinderModel, EventAggregator) {
	var agentFinderService = {
		searchAgentByZipCode: function (zipCode, currentItemId) {
			//fetch the results
			var agentFinderModel = new AgentFinderModel();
			agentFinderModel.showError = true;
			agentFinderModel.showNotification = false;
			var agentFinderSearch = '{zipCode:"' + zipCode + '",currentItemId:"' + currentItemId + '"}';
			agentFinderModel.fetch({
				url: '/services/agent/agentservice.asmx/SearchAgentByZipCode',
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: agentFinderSearch,
				success: function (response) {
				},
				error: function (errorResponse) {
					console.log("Inside Failure");
					console.log(errorResponse.responseText);
				}
			})  //have to wait for the fetch to complete
					.complete(function () {
						EventAggregator.trigger('agentFinderSearchComplete', agentFinderModel);
					});
		},
        searchAgentByGeoLocation: function (latitude, longitude, currentItemId, showError, showNotification, zipcode, distance) {
            //fetch the results
            var agentFinderModel = new AgentFinderModel();
            agentFinderModel.showError = showError;
            agentFinderModel.showNotification = showNotification;
            var agentFinderSearch ='{latitude:"'+latitude+'",longitude:"'+longitude+'",currentItemId:"'+currentItemId+'",zipcode:"'+zipcode+'",distance:"'+distance+'"}';
            agentFinderModel.fetch({
                url: '/services/agent/agentservice.asmx/SearchAgentByGeoLocation',
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data:agentFinderSearch,
                success: function (response) {
                },
                error: function (errorResponse) {
	                console.log("Inside Failure");
	                console.log(errorResponse.responseText);
                }
            })  //have to wait for the fetch to complete
                .complete(function () {
                    agentFinderModel.zipCode = zipcode;
                    EventAggregator.trigger('agentFinderSearchComplete', agentFinderModel);
                });
        },
        searchAgent: function (currentItemId) {
            //fetch the results
            var agentFinderModel = new AgentFinderModel();
            agentFinderModel.showError = false;
            agentFinderModel.showNotification = true;
            var agentFinderSearch ='{currentItemId:"'+currentItemId+'"}';
            agentFinderModel.fetch({
                url: '/services/agent/agentservice.asmx/SearchAgent',
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data:agentFinderSearch,
                success: function (response) {
                },
                error: function (errorResponse) {
	                console.log("Inside Failure");
	                console.log(errorResponse.responseText);
                }
            })  //have to wait for the fetch to complete
                .complete(function () {
                	EventAggregator.trigger('agentFinderSearchComplete', agentFinderModel);
                
                });
        },
        geolocationByZip: function (zipCode)
        {
            var params = JSON.stringify({ 'zipCode': zipCode});
            //make ajax request
            var result = $.ajax({
                url: "/services/agent/agentservice.asmx/GetGeoLocationByZipCode",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: params,
                type: 'POST',
                success: function (response) {
                },
                error: function (errorResponse) {
                    console.log("Inside Failure");                    
                }
            });
            return result;                       
        }
    }

    return agentFinderService;
});