define([
    'jquery',
    'underscore',
    'models/taxonomy/LocationsModel',
    'event.aggregator',
    'util/objectUtil',
    'models/general/StateModel',
    'collections/general/StatesCollection'
], function ($, _, LocationsModel, EventAggregator, ObjectUtil, StateModel, StatesCollection) {
    var locationsUtil = (function () {

        //constructor
        var constructor = function () {
            //private instance variables.
            var _locations = new LocationsModel();

            var deferred = $.Deferred(function (defer) {
                _locations.fetch({
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    cache: true,
                    success: function (response) {
                        defer.resolve();
                    },
                    error: function (errorResponse) {
                        console.log("Inside Failure");
                        console.log(errorResponse.responseText);
                        defer.resolve();
                    }
                });
            });

            this.getLocations = function () {
                return deferred.promise();
            };

            //gets all of the locations for a specific type
            this.getAll = function (type) {
                var locations = _locations.get(type);

                if (ObjectUtil.isNullOrEmpty(locations)) {
                    console.log('the locations object was not returned back from the request');
                    return null;
                }

                if (locations.length == 0) {
                    console.log('there were no locations returned');
                    return null;
                }

                return locations;
            };

            this.getLocationItemById = function (id) {
                var allTaxonomies = [];
                for (var taxonomyType in _locations.attributes) {
                    var taxonomyTypeObject = _locations.attributes[taxonomyType];
                    for (var taxonomy in taxonomyTypeObject) {
                        allTaxonomies.push(taxonomyTypeObject[taxonomy]);
                    }
                }

                var taxonomyObject = _.find(allTaxonomies, function (taxonomy) {
                    return taxonomy.id === id;
                });

                if (taxonomyObject != undefined) {
                    return taxonomyObject;
                }

                console.log('could not find taxonomy for id ' + id);
                return null;
            };

            this.getCitiesForLocation = function (id) {
                var citiesRequest = $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    url: '/Services/Taxonomy/TaxonomyService.asmx/GetCitiesForLocation',
                    data: JSON.stringify({id: id}),
                    cache: true,
                    success: function (response) {
                    },
                    error: function (errorResponse) {
                        console.log("Inside Failure");
                        console.log(errorResponse.responseText);
                    }
                });

                return citiesRequest;
            };

            this.getCountriesForLocation = function (id) {
                var countriesRequest = $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    url: '/Services/Taxonomy/TaxonomyService.asmx/GetCountriesForLocation',
                    data: id,
                    cache: true,
                    success: function (response) {
                    },
                    error: function (errorResponse) {
                        console.log("Inside Failure");
                        console.log(errorResponse.responseText);
                    }
                });

                return countriesRequest;
            };

            this.getStatesForLocation = function (id) {
                var statesRequest = $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    url: '/Services/Taxonomy/TaxonomyService.asmx/GetStatesForLocation',
                    data: JSON.stringify({id: id}),
                    cache: true,
                    success: function (response) {
                    },
                    error: function (errorResponse) {
                        console.log("Inside Failure");
                        console.log(errorResponse.responseText);
                    }
                });

                return statesRequest;
            };

            var getLocation = function (type, key) {
                var locationType = _locations.get(type);

                if (ObjectUtil.isNullOrEmpty(locationType)) {
                    console.log('could not find the location item ' + key);
                    return '';
                }

                var location = null;
                if(!ObjectUtil.isNullOrEmpty(key)){
                     location = _.filter(locationType, function (location) {
                        return location.name.toLocaleLowerCase() === key.toLowerCase();
                    });
                }

                if(ObjectUtil.isNullOrEmpty(location)){
                    return '';
                }

                if (location.length > 1) {
                    console.log('location key returned too many results');
                    return '';
                }

                if (location.length == 0) {
                    console.log('could not find the location ' + type);
                    return '';
                }

                return location[0];
            };

            this.getLocationItem = function(type, key){
                var location = getLocation(type, key);

                if(!ObjectUtil.isNullOrEmpty(location)){
                    return location;
                }

                return null;
            };

            this.getLocationId = function (type, key) {
                var location = getLocation(type, key);

                if (ObjectUtil.isNullOrEmpty(location)) {
                    console.log('location is null');
                    return null;
                }

                return location.id;
            };

            this.getCountryStates = function (countryId, callback) {
                var deferredFetch = $.Deferred();
                var statesCollection;
                var cachedLocationsJson;
              
                if (!ObjectUtil.isNullOrEmpty(sessionStorage)) {
                    
                    cachedLocationsJson = sessionStorage.getItem('countryStatesSessionCache');
                }
                 
                if (!ObjectUtil.isNullOrEmpty(cachedLocationsJson)) {
                    var countryStatesCache = JSON.parse(cachedLocationsJson);
                   
                    if (!ObjectUtil.isNullOrEmpty(countryStatesCache)
                        && !ObjectUtil.isNullOrEmpty(countryStatesCache.states)
                        && !ObjectUtil.isNullOrEmpty(countryStatesCache.countryId)
                        && countryStatesCache.countryId == countryId)
                    {
                        statesCollection = new StatesCollection();
                        statesCollection.countryId = countryId;
                        var states = JSON.parse(countryStatesCache.states);
                        statesCollection.set(_(states).map(function (state) { return new StateModel(state); }));
                    }
                }

                if (!ObjectUtil.isNullOrEmpty(statesCollection)) {
                    deferredFetch.resolve();
                    if (typeof callback === "function") { callback(statesCollection); }
                } else {
                    
                var countryStates = new StatesCollection({ countryId: countryId });
            	countryStates.fetch().done(function () {
            		    deferredFetch.resolve();
            		    // Make sure the callback is a function
            		    if (typeof callback === "function") { callback(countryStates); }
            	    }).fail(deferredFetch.reject);
                }

            	return deferredFetch.promise();

            };
			
        };

        return constructor;
    })();

    return locationsUtil;
});