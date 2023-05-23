define([
	'jquery',
	'underscore',
	'backbone',
	'app',
	'models/customerLead/CustomerLeadRequestModel',
	'event.aggregator'
], function($, _, Backbone, App, CustomerLeadRequestModel, EventAggregator) {
	var customerLeadService = {
		SubmitLead: function(customerLeadModel) {
			var avoyaServiceRequest = {
				CurrentItemId: customerLeadModel.get('currentItemId'),
				FormType: customerLeadModel.get('formType'),
				FirstName: customerLeadModel.get('firstName'),
				LastName: customerLeadModel.get('lastName'),
				Email: customerLeadModel.get('email'),
				OptInEmail: customerLeadModel.get('optInEmail'),
				Phone: customerLeadModel.get('phone'),
				IsTravelAgent: customerLeadModel.get('isTravelAgent'),
				WorkingWithTravelAgent: customerLeadModel.get('workingWithTravelAgent'),
				AgentWithMoreTravelers: customerLeadModel.get('agentWithMoreTravelers'),
				SourceUrl: customerLeadModel.get('sourceUrl'),
				RequestSource: customerLeadModel.get('requestSource'),
				PromoName: customerLeadModel.get('promoName'),
				TourId: customerLeadModel.get('tourId'),
				TourDepartureDate: customerLeadModel.get('tourDepartureDate'),
				CustomerLeadBrochures: customerLeadModel.get('customerLeadBrochures'),
				BrochurePageType: customerLeadModel.get('brochurePageType')
			};

			var avoyaServiceRequestJson = JSON.stringify({ avoyaServiceRequest: avoyaServiceRequest });

			var result = $.ajax({
					url: '/services/avoya/avoyaService.asmx/SubmitLead',
					type: "POST",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: avoyaServiceRequestJson,
					success: function(response) {
						if (response.d == "success") {
							EventAggregator.trigger('customerLeadSubmitSuccess');
						} else {
							EventAggregator.trigger('customerLeadSubmitError');
						}
					},
					error: function(errorResponse) {

						EventAggregator.trigger('customerLeadSubmitError');
						console.log("Inside Failure");
						console.log(errorResponse.responseText);
					}
				}) //have to wait for the fetch to complete
				.complete(function() {
					EventAggregator.trigger('customerLeadSubmitComplete');
				});
			return result;
		}
	}

	return customerLeadService;
});