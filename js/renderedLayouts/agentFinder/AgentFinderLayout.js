define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'event.aggregator',
	'util/objectUtil',
	'services/agentFinderService',
	'collections/agentFinder/AgentCollection',
	'views/agentFinder/AgentListView',
	'models/agentFinder/AgentModel',
	'models/agentFinder/AgentFinderModel',
	'views/validation/ErrorView',
	'util/seoTaggingUtil',
	'goalsUtil',
	'extensions/marionette/views/RenderedLayout',
	'util/validationUtil'
], function($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil, AgentFinderService, AgentCollection, AgentListView, AgentModel, AgentFinderModel, ErrorView, SeoTaggingUtil, goalsUtil, RenderedLayout, ValidationUtil) {
	var AgentFinderLayout = RenderedLayout.extend({
		el: '#agentFinderResultSection',
		ui: {
			'$findAgentLoader': '#findAgentLoader',
			'$agentFinderZipCode': '#agentFinderZipCode',
			'$agentFinderDistance': '#agentFinderDistance',
			'$agentListView': '#agentListView',
			'$resultsTitle': '#resultsTitle'
		},
		regions: {
			agentListView: "#agentListView"
		},
		events: {
			'click #agentFinderSearchBtn': 'searchAgentByZip',
			'keypress #agentFinderZipCode': 'searchAgentByZipKeyPress',
			'change #agentFinderDistance': 'updateDistance'
		},

		initialize: function() {
			var outerScope = this;
			EventAggregator.on('agentFinderSearchComplete', function(agentFinderModel) {
				outerScope.ui.$findAgentLoader.hide();
				var message = App.dictionary.get('agentFinder.NoResultsFound');
				if (agentFinderModel.agents.length > 0) {
					if (agentFinderModel.showNotification)
						message = App.dictionary.get('agentFinder.GeolocationSuccess');
					else
						message = App.dictionary.get('agentFinder.ResultsFor') + " " + agentFinderModel.zipCode;
					outerScope.$el.find("#resultsTitle").html(message);
					outerScope.agentListView.show(new AgentListView({ collection: agentFinderModel.agents }));
				} else {
					if (agentFinderModel.showError) {
						outerScope.agentListView.show(new ErrorView([message]));
					}
				}
				var a = new Date();
				console.log("Search By geo location completed " + a.getHours() + ":" + a.getMinutes() + ":" + a.getSeconds());
			});

			this.ui.$findAgentLoader.show();
			// Get zip from URL
			var match = new RegExp('[\\?&amp;]zip=([^&amp;#]*)').exec(window.location.href);
			if (!ObjectUtil.isNullOrEmpty(match)) {
				this.ui.$agentFinderZipCode.val(match[1]);
				this.searchAgentByZip_Code(match[1], App.siteSettings.currentItemId, null);
			} else this.searchByGeolocation(null);
		},

		updateDistance: function(e) {
			this.searchAgentByZip(e);
		},

		searchAgentByZipKeyPress: function(e) {
			if (e.which === 13) {
				e.preventDefault();
				this.searchAgentByZip(e);
			}
		},
		searchAgentByZip: function(e) {
			e.preventDefault();

			var zipCode = this.ui.$agentFinderZipCode.val();
			var currentItemId = App.siteSettings.currentItemId;
			var distance = this.ui.$agentFinderDistance.val();

			if (ObjectUtil.isNullOrEmpty(distance) || !ObjectUtil.isInteger(distance) || distance <= 0 || distance > 1000) {
				distance = null;
			}

			if (!ObjectUtil.isNullOrEmpty(zipCode) && !ObjectUtil.isNullOrEmpty(currentItemId)) {
				this.ui.$findAgentLoader.show();
				this.ui.$agentListView.html('');
				this.ui.$resultsTitle.html('');
				var viewContext = this;
				var result =
					$.Deferred(function(defer) {
						viewContext.validateZip(App.siteSettings.defaultCountryId, zipCode)
							.complete(function() {
								if (!viewContext.valid) {
									var message = App.dictionary.get('agentFinder.EnterValidZipcode');
									viewContext.ui.$findAgentLoader.hide();
									viewContext.agentListView.show(new ErrorView([message]));
								} else {
									viewContext.searchAgentByZip_Code(zipCode, currentItemId, distance);
								}
							})
							.fail(function() {
								defer.reject();
							});
					});
			} else if (distance != null) {
				this.searchByGeolocation(distance);
			} else if (window.console) {
				console.log("searchAgentByZip zipCode or currentItemId is null");
			}
		},

		validateZip: function(countryId, zip) {
			var viewContext = this;
			var result = ValidationUtil.validatePostalCode(countryId, false)
				.done(function(data) {
					viewContext.valid = ValidationUtil.isPostalCodeValidForCountry(data, countryId, zip);					
				});

			return result;
		},

		searchAgentByZip_Code: function(zipCode, currentItemId, distance) {

			//var outerScope = this;
			AgentFinderService.geolocationByZip(zipCode)
                .done(function (result) {
					//var result = outerScope.filterGeoApiResults(response);
					if (result != null && result.d != null) {
						AgentFinderService.searchAgentByGeoLocation(result.d.lat, result.d.lng, currentItemId, true, false, zipCode, distance);
					} else {
						AgentFinderService.searchAgentByZipCode(zipCode, currentItemId);
					}
				})
				.fail(function(response) {
					if (window.console) {
						console.log(response.responseText);
						console.log('there was an issue getting geolocation by zip');
					}
					AgentFinderService.searchAgentByZipCode(zipCode, currentItemId);
				});

			//submit goal for searching for agent
			goalsUtil.agentSearch(zipCode);
		},
		searchByGeolocation: function(distance) {
			var a = new Date();
			console.log("Search By geo location started " + a.getHours() + ":" + a.getMinutes() + ":" + a.getSeconds());
			if (Modernizr.touch) {
				// if mobile device get current location
				navigator.geolocation.getCurrentPosition(
					function(position) {
						AgentFinderService.searchAgentByGeoLocation(position.coords.latitude, position.coords.longitude, App.siteSettings.currentItemId, false, true, null, distance);
					},
					function() {
						AgentFinderService.searchAgent(App.siteSettings.currentItemId);
					});
			} else
				AgentFinderService.searchAgent(App.siteSettings.currentItemId);
		},
		filterGeoApiResults: function(response) {
			// nothing found
			if (response.results.length == 0 || response.results[0].types.indexOf("postal_code") == -1) {
				return null;
			}

			// search in current country
			if (App.siteSettings.googleApiCountry != undefined && App.siteSettings.googleApiCountry != "") {
				var countries = App.siteSettings.googleApiCountry.split("|");

				for (var i = 0; i < response.results.length; i++) {
					if (response.results[i].types.indexOf("postal_code") > -1) {
						var appropriateCountry = false;
						var item = response.results[i];
						for (var j = 0; j < item.address_components.length; j++) {
							var addressItem = item.address_components[j];
							if (addressItem.types.indexOf("country") > -1 && (countries.indexOf(addressItem.long_name) > -1 || countries.indexOf(addressItem.short_name) > -1)) {
								appropriateCountry = true;
							}
						};
						if (appropriateCountry) {
							return item.geometry.location;
						}
					}
				}
			} else {
				// if search country isn't set, go with exact zip.
				if (response.results.length == 1 && response.results[0].types.length == 1 && response.results[0].types[0] === "postal_code") {
					return response.results[0].geometry.location;
				}
			}
			return null;
		}
	});
	return AgentFinderLayout;
});