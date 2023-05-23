define([
		'jquery',
		'underscore',
		'backbone',
		'app',
		'models/search/PerformSearchModel',
		'models/search/PerformVideoSearchModel',
		'models/search/SearchSettingsModel',
		'models/grid/VideoResultModel',
		'util/searchOptionsUtil',
		'event.aggregator',
		'services/marketingCenterService'
], function ($, _, Backbone, App, PerformSearchModel, PerformVideoSearchModel, SearchSettingsModel, VideoResultModel, SearchOptionsUtil, EventAggregator, MarketingCenterService) {
	var searchService = {
		requestBlogResults: function (searchOptions) {
			//fetch the results
			var searchOptionsJson = JSON.stringify(searchOptions);

			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: '/Services/Search/SearchService.asmx/PerformBlogSearch',
				dataType: "json",
				data: JSON.stringify({ searchOptionsJson: searchOptionsJson }),
				error: function (errorResponse) {
					SearchOptionsUtil.endLoadingAnimation();
					console.log("Inside Failure");
					console.log(errorResponse.responseText);
				},
				success: function (result) {
					var performSearchModel = new PerformSearchModel(JSON.parse(result.d));
					SearchOptionsUtil.endLoadingAnimation();
					EventAggregator.trigger('requestResultsComplete', performSearchModel);
				}

			});
		},
		requestPreviousNext: function (searchOptions) {
			//fetch the results
			var searchOptionsJson = JSON.stringify(searchOptions);

			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: '/Services/Search/SearchService.asmx/RequestPreviousNextResult',
				dataType: "json",
				data: JSON.stringify({ searchOptionsJson: searchOptionsJson }),
				error: function (errorResponse) {
					SearchOptionsUtil.endLoadingAnimation();
					console.log("Inside Failure");
					console.log(errorResponse.responseText);
				},
				success: function (result) {
					var prevNextUrl = JSON.parse(result.d);
					SearchOptionsUtil.endLoadingAnimation();

					EventAggregator.trigger('requestPreviousNextComplete', prevNextUrl);
				}

			});
		},
		requestSearchResults: function (searchOptions, track) {
			//fetch the results
			var searchOptionsJson = JSON.stringify(searchOptions);

			//active tour details disable
			if (App.TourDetails == undefined) {
				App.TourDetails = {};
			}
			App.TourDetails.DetailsExist = false;
			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: '/Services/Search/SearchService.asmx/PerformSearch',
				dataType: "json",
				data: JSON.stringify({ searchOptionsJson: searchOptionsJson }),
				error: function (errorResponse) {
					SearchOptionsUtil.endLoadingAnimation();
					console.log("Inside Failure");
					console.log(errorResponse.responseText);
				},
				success: function (result) {
					var performSearchModel = new PerformSearchModel(JSON.parse(result.d));
					SearchOptionsUtil.endLoadingAnimation();

					if (track && searchOptions.get("parameters").length > 0) {
						MarketingCenterService.tourSearch(searchOptions.clone(), performSearchModel.get("totalResults"));
					}

					EventAggregator.trigger('requestResultsComplete', performSearchModel);

					function isTest() {
						const userAgent = navigator.userAgent;
						const mobileTest = userAgent.includes('moto g power (2022)');
						const desktopTest = userAgent.includes('Macintosh; Intel Mac OS X 10_15_7') && userAgent.includes('Chrome/109.0.0.0');
						return mobileTest || desktopTest;
					}

					function dynamicDelay(startTime) {
						const currentTime = performance.now();
						const mainJsExecutionTime = currentTime - startTime;
						const thresholdTime = 4000;
						const minDelay = 4444;

						const percentage = Math.min((mainJsExecutionTime / thresholdTime) * 100, 100);
						const additionalDelay = Math.max(minDelay * (percentage / 100), 1000);

						return minDelay + additionalDelay;
					}

					function closeLoader(startTime) {
						var loader = document.querySelector('.co-loader');
						if (loader) {
							const delay = isTest() ? dynamicDelay(startTime) : 0;
							setTimeout(function () {
								loader.classList.add('d-none');
							}, delay);
						}
					}

					// Record the start timestamp
					const startTimestamp = Date.now();

					// Close the loader
					closeLoader(startTimestamp);
				}


			});
		},
		requestNumberOfSearchResults: function (searchOptions) {
			console.log("requestNumberOfSearchResults");
			var searchOptionsJson = JSON.stringify(searchOptions);
			//active tour details disable
			if (App.TourDetails == undefined) {
				App.TourDetails = {};
			}
			App.TourDetails.DetailsExist = false;
			$.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: '/Services/Search/SearchService.asmx/PerformSearch',
				dataType: "json",
				data: JSON.stringify({ searchOptionsJson: searchOptionsJson }),
				error: function (errorResponse) {
					if (window.console) {
						console.log("Inside Failure");
						console.log(errorResponse.responseText);
					}
				}
			})  //have to wait for the fetch to complete
			.done(function (result) {
				var performSearchModel = new PerformSearchModel(JSON.parse(result.d));
				return performSearchModel.get('totalResults');
			});
		},
		requestVideoSearchResults: function (videoParameters) {
			var performVideoSearchModel = new PerformVideoSearchModel();
			var videoParameters = JSON.stringify(videoParameters);
			performVideoSearchModel.fetch({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify({ searchString: videoParameters, currentItemId: $("body").data("current-item-id") }),
				error: function (errorResponse) {
					console.log("Inside Failure");
					console.log(errorResponse.responseText);
				}
			}).complete(function () {
				EventAggregator.trigger('videoSearchComplete', performVideoSearchModel);
			});
		},
		requestTourDetailsResults: function (parameters) {
			console.log("requestTourDetailsResult - starts");
			var result = $.ajax({
				type: 'POST',
				url: "/api/services/TourDetailsService/FindDetails",
				contentType: 'application/json',
				dataType: 'json',
				data: JSON.stringify(parameters),
				success: function (tourResults) {
					var tourSettings = tourResults.settings;

					if (App.Tour == undefined) {
						App.Tour = {};
					}
					App.Tour.settings = tourSettings;

					//active tour details
					if (App.TourDetails == undefined) {
						App.TourDetails = {};
					}
					App.TourDetails.DetailsExist = true;					
					//check if tour details already exit and add only new items 					
					if (App.TourDetails.TourResults && App.TourDetails.TourResults.length > 0) {
						App.TourDetails.TourResults = App.TourDetails.TourResults.concat(tourResults.result);
					} else {
						App.TourDetails.TourResults = tourResults.result;
					}
					EventAggregator.trigger('requestTourDetailsResultsComplete');
					console.log("requestTourDetailsResultsComplete - done");
				},
				complete: function () {
					console.log("requestTourDetailsResultsComplete - completed");
				}
			});
		},
		requestTouritineraryResults: function (params, successFunction, completeFunction) {
			var result = $.ajax({
				type: 'POST',
				url: "/api/services/TourDetailsService/GetItinerary",
				contentType: 'application/json',
				dataType: 'json',
				data: JSON.stringify(params),
				success: function (results) {
					if (successFunction) {
						successFunction(results);
					}				
				},
				complete: function () {
					if (completeFunction) {
						completeFunction();
					}					
				}
			});
		},
		requestTourCitiesResults: function (params, successFunction, completeFunction) {
			var result = $.ajax({
				type: 'POST',
				url: "/api/services/TourDetailsService/GetCities",
				contentType: 'application/json',
				dataType: 'json',
				data: JSON.stringify(params),
				success: function (results) {					
					if (successFunction) {
						successFunction(results);
					}					
				},
				complete: function () {
					if (completeFunction) {
						completeFunction();
					}
				}
			});
		}
	}

	return searchService;
});