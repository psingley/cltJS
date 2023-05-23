define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'event.aggregator'
], function ($, _, Backbone, App, EventAggregator) {
    var emailService = {
        sendShareEmail: function (name, email, recipientEmails, optionalMessage, currentItemId, packageDateId, isCoBranding, partnerId) {
            var data = { name: name, email: email, recipientEmails: recipientEmails, optionalMessage: optionalMessage, currentItemId: currentItemId, packageDateId: packageDateId, isCoBranding: isCoBranding, partnerId: partnerId};
	        var result = $.ajax({
		        type: "POST",
		        contentType: "application/json; charset=utf-8",
		        dataType: "json",
		        data: JSON.stringify(data),
		        url: '/Services/Email/EmailService.asmx/SendShareEmail',
		        error: function(errorResponse) {
			        console.log("Inside Failure");
			        console.log(errorResponse.responseText);
		        }
	        });

            return result;
        }
    }

    return emailService;
});