define([
	'jquery',
	'underscore',
	'App',
	'util/seoTaggingUtil'
], function ($, _, App, SeoTaggingUtil) {
		var trackCriteoUtils = {

			trackPreConversion: function (criteoId) {

				var preItem = [{ id: "1", price: "0", quantity: 1 }];
				var deviceType = /iPad/.test(navigator.userAgent)
					? "t"
					: /Mobile|iP(hone||od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent)
						? "m"
						: "d";
				if (SeoTaggingUtil.useExternalScripts()) {

					window.criteo_q = window.criteo_q || [];
					window.criteo_q.push(
						{ event: "setAccount", account: criteoId },
						{ event: "setSiteType", type: deviceType },
						{ event: "viewBasket", item: preItem }
					);
				}
				else {

					console.log('Criteo Pixel');
					console.log('Event - SetAccount    Account - ' + criteoId);
					console.log('Event - setSiteType   Type - ' + deviceType);
					console.log('viewBasket - ' + preItem);
					

                }

            },
			
		trackCriteoPixel: function (criteoId, user_email) {

			if (SeoTaggingUtil.useExternalScripts()) {

				window.criteo_q = window.criteo_q || [];
				var deviceType = /iPad/.test(navigator.userAgent) ? "t" : /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent) ? "m" : "d";
				window.criteo_q.push(
					{ event: "setAccount", account: criteoId },
					{ event: "setSiteType", type: deviceType },
					{ event: "setEmail", email: user_email },
					{
						event: "trackTransaction", id: (new Date()).getTime(),
						item: [{ id: "1", price: "0", quantity: 1 }]
					}
				);
				

			}
			else {

				
					var deviceType = /iPad/.test(navigator.userAgent)
					? "t"
					: /Mobile|iP(hone||od)|Android|BlackBerry|IEMobile|Silk/.test(navigator.userAgent)
					? "m"
					: "d";
					console.log('Criteo Pixel');
					console.log('Event - SetAccount    Account - ' + criteoId);
					console.log('Event - setSiteType   Type - ' + deviceType);
					console.log('Event - setEmail		Email - ' + user_email);
					console.log('Event - trackTransaction  id - ' + (new Date()).getTime());
        
            }

			
		}

	}
	return trackCriteoUtils;
});