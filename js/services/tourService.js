define([
	'jquery',
	'underscore',
	'backbone',
	'app',
	'models/tour/TourDetailsModel',
	'collections/tour/tourDates/TourDateCollection',
	'event.aggregator'
], function ($, _, Backbone, App, TourDetailsModel, TourDateCollection, EventAggregator) {
	var tourService = {
		guidValidator : function() {
			return new RegExp("^({)?[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}(})?$", "i");
		},
		getEmpty: function() {
		},
		getTourDetails: function (tourDetailOptions) {
			if (tourDetailOptions.packageDateId && !this.guidValidator().test(tourDetailOptions.packageDateId)) {
				return;
			}

			var tourDetailOptionsJson = JSON.stringify(tourDetailOptions);

			//fetch the results
			var tourDetailsModel = new TourDetailsModel({
				tourDetailOptions: tourDetailOptions
			});

			tourDetailsModel.fetch({
				type: "GET",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				//data: JSON.stringify({ tourDetailOptionsJson: tourDetailOptionsJson }),
				success: function (response) {
					console.log("Inside tourDetailsModel.fetch success");
				},
				error: function (errorResponse) {
					console.log("Inside tourDetailsModel.fetch Failure");
					console.log(errorResponse.responseText);
				}
			})  //have to wait for the fetch to complete
			.complete(function () {
				console.log("Inside tourDetailsModel.fetch Complete");
				//$("body").removeClass("loading");
				EventAggregator.trigger('tourDetailsRequestComplete', tourDetailsModel);
			});
		},
		getDatePackages: function (currentItemId) {
			var tourDatesCollection = new TourDateCollection();
			var tourIdLang = currentItemId + "|" + App.siteSettings.siteLanguage;

			console.log("This is being passed to service: " + JSON.stringify(tourIdLang))
			var result = $.ajax({
				type: "GET",
				processData: false,
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				url: '/Services/Tours/TourService.asmx/GetPackageDateInfo?tourId=' + JSON.stringify(tourIdLang),
				error: function (errorResponse) {
					console.log("Inside Failure - Invalid Tour ID Provided: " + currentItemId);
					console.log(errorResponse.responseText);
				},
				success: function (result) {
					var tourDatesCollection = new TourDateCollection();
					tourDatesCollection.setFromJson(result.d);
					App.Tour.TourDates = tourDatesCollection;
					EventAggregator.trigger('tourDatesRequestComplete', tourDatesCollection);
				}
			});
		},
		getDefaultTourDetails: function () {
			var tourDetailsModel = new TourDetailsModel();
			var deferred = $.Deferred(function (defer) {
				var $results = $('#tourDetails');
				if ($results.length === 0) {
					console.log('could not find default tour details element');
					defer.reject();
					return;
				}
				tourDetailsModel.set($.parseJSON($results.val()));
				defer.resolve();
			});

			//public instance variable
			this.getDefaultTourDetailsResults = function () {
				return deferred.promise();
			};

			$.when(this.getDefaultTourDetailsResults()).done(function () {
				EventAggregator.trigger('tourDetailsRequestComplete', tourDetailsModel);
			});
		},
		getTourDatesSettings: function () {
			var getTourSettings = $.Deferred(function (defer) {
				//global variables should be defined here
				var $tourSettings = $('#tourSettingsJson');
				if ($tourSettings.length === 0) {
					console.log('could not find tour settings element');
					defer.reject();
					return;
				}

				var tourSettings = $tourSettings.val();
				if (App.Tour == undefined){
					App.Tour = {};
				}
				App.Tour.settings = $.parseJSON(tourSettings);
				defer.resolve();
			});

			//public instance variable
			this.getSettings = function () {
				return getTourSettings.promise();
			};

			$.when(this.getSettings()).done(function () {
				EventAggregator.trigger('getTourDatesSettingsComplete');
			});
		}
	};

	return tourService;
});