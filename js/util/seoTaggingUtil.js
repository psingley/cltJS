define(
	['app'],
	function (App) {
		var seoTaggingUtil = {

            pushGoogleAnalytics: function () {
                window.dataLayer = window.dataLayer || [];
				if (this.useExternalScripts() === true) {
					try {
						dataLayer.push({
							'siteName': App.siteSettings.siteName,
							'event_nonInteraction': true
						});
					} catch (ex) {
						if (window.console) {
							console.log("pushGoogleAnalytics Error:" + ex);
						}
					}
				}
			},
			useExternalScripts: function () {
				if ($('body').data('use-external-scripts') === undefined) {
					return false;
				} else {
					return ($('body').data('use-external-scripts').toLowerCase() === "true");
				}
            },

            addDataLayerTags: function (bookingId, priceLocal, startDate, endDate, neoId, name, continent, totalPax) {
                if (this.useExternalScripts() === true) {
                    try {
                        var paxCount = parseInt(totalPax);
                        var site = $('body').data('site');
                        dataLayer.push({
                            'event': 'paymentSuccess',
                            'transactionId': bookingId, 
                            'transactionAffiliation': site, 
                            'transactionTotal': priceLocal, 
                            'startDate':startDate, 
                            'endDate':endDate, 
                            'transactionProducts': [{ 
                                'sku': neoId, 
                                'name': name, 
                                'category': continent, 
                                'price': priceLocal, 
                                'quantity': paxCount 
                             }]
                        });
                    } catch (ex) {
                        if (window.console) {
                            console.log("addDataLayer Tags Error:" + ex);
                        }
                    }
                }
            }
		};
		return seoTaggingUtil;
	});

