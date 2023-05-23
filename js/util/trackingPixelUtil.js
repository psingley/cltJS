define(
	['jquery',
		'underscore',
		'app',
		'util/seoTaggingUtil',
		'util/uriUtil'
	],
	function ($, _, App, SeoTaggingUtil, UriUtil) {
		var trackingPixelUtil = {
			_getAmazonEngagementSettings: function () {
				return {
					sites: ['collette-us', 'collette-au', 'collette-ca'],
					requiredSearchOptions: [{filterId: 'stylenamesfacet', filteredOn: 'Explorations'}]
				}
			},
			trackItineraryPixel: function (startDate, endDate) {
				if (App.isUKSite)
					return;
				
				if (!App.isColletteSite) 
					return;

				var pixelScript = $('#itineraryPixel').val();
				
				if (pixelScript) {
					pixelScript = pixelScript.trim();
				}
				else {
					console.log("Itinerary pixel won't work, because itineraryPixel input was empty");
					return;
				}

				var startDate = new Date(startDate).toISOString().slice(0, 10);
				var endDate = new Date(endDate).toISOString().slice(0, 10);
				pixelScript = UriUtil.replaceParameterByName('v6', startDate, pixelScript);
				pixelScript = UriUtil.replaceParameterByName('v7', endDate, pixelScript);
				var script = $(pixelScript);
				script.attr('id', 'itineraryPixelContainer');
				if (SeoTaggingUtil.useExternalScripts()) {
					$('#itineraryPixelContainer').replaceWith(script);
				} else {
					console.log('Itinerary pixel script worked: ' + script.attr('src'));
				}
			}
		};
		return trackingPixelUtil;
	});

