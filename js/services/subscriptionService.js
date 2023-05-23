define([
    'jquery',
    'app',
], function ($, App) {
	var subscriptionService = {
		/**
* Checks to see whether or not the user is currently
* signed up to receive emails.
*
* @method checkEmailExists
* @param email
* @returns {*}
*/
		ifUserSubscribed: function (email, newsletterCodes) {
			var currentItemId = App.siteSettings.currentItemId;
			var newsletterCodes = JSON.stringify(newsletterCodes);
			var params = JSON.stringify({ 'emailAddress': email, 'currentItemId': currentItemId, newsletterCodes: newsletterCodes });

			//make ajax request
			var result = $.ajax({
				url: "/Services/Brochures/NewsletterService.asmx/IfUserSubscribed",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: params,
                type: 'POST',
                error: function (errorResponse) {
                    console.log("ifUserSubscribed call failed");
                    console.log(errorResponse.responseText);
                }
			});

			return result;
		}
	};

	return subscriptionService;
});