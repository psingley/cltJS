define(['jquery','knockout','app'], function ($,ko,App) {

    ko.bindingHandlers.autoComplete = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var selectedObservableArrayInViewModel = valueAccessor();

            

            var updateElementValueWithLabel = function (event, ui) {
                // Stop the default behavior
                event.preventDefault();

                // Update the value of the html element with the label 
                // of the activated option in the list (ui.item)
                $(element).val(ui.item.label);
                viewModel.locationSelected.push(ui.item.value);
                console.log("LocationSelected: " + viewModel.locationSelected());

                // Update our SelectedOption observable
                //if (typeof ui.item !== "undefined") {
                // ui.item - label|value|...
                //    selectedOption(ui.item);
                //}
            };

            $(element).autocomplete({
                minLength: 3,
                autoFocus: true,
                source: function (request, response) {
                    console.log("autocomplete: " + request.term);
                    viewModel.locationFilter(request.term);
                    console.log("locationFilter: " + viewModel.locationFilter());
                    console.log("filteredLocations: " + viewModel.filteredLocations());

                    //check search results
                    if (viewModel.filteredLocations().length > 0)
                        response(viewModel.filteredLocations());
                    else {
                        var result = [
                                    {
                                        label: 'Sorry, no destinations match your search',
                                        value: response.term
                                    }
                                ];
                                response(result);


                    }


                    
                    //return viewModel.locationDropdownOptions.filter(function (i) {
                    //    return i.label.toLowerCase().indexOf(request.term) >= 0;
                    //});


                    //$.ajax({
                    //    url: '/api/services/LocationDetail/GetLocations',
                    //    data: { language: 'en', term: request.term },
                    //    dataType: "json",
                    //    type: "POST",
                    //    success: function (data) {
                    //        if (!data.length) {
                    //            var result = [
                    //                {
                    //                    label: 'No matches found',
                    //                    value: response.term
                    //                }
                    //            ];
                    //            response(result);
                    //        }
                    //        else {

                    //            response($.map(data, function (item) {
                    //                return {
                    //                    label: item.location,
                    //                    value: item.locationType 
                    //                }
                                
                    //            }));


                    //        }

                            
                    //    }
                    //});
                },
                select: function (event, ui) {
                    var label = ui.item.label;
                    if (label === "Sorry, no destinations match your search") {
                        // this prevents "no results" from being selected
                        event.preventDefault();
                    }
                    else {
                        updateElementValueWithLabel(event, ui);
                    }
                }

            });
        }
    };


    return function appViewModel() {

        var self = this;
                
        self.locationDropdownOptions = ko.observableArray();
        self.locationFilter = ko.observable();
        self.locationSelected = ko.observableArray();

        self.filteredLocations = ko.computed(function () {
            return self.locationDropdownOptions().filter(function (i) {
                return i.label.toLowerCase().indexOf(self.locationFilter()) >= 0;
            });
        });

        self.appliedRegionsString = ko.observable();
        self.showLocationInput = ko.observable(true);
        self.showRegionPanel = ko.observable(false);

        self.packageDateItinerary = ko.observableArray();
        self.error = ko.observable();

        self.myObservableArray = ko.observableArray();

        self.locationDetail = ko.observableArray();
        self.locations = ko.observableArray();
        self.searchHeroFilters = ko.observableArray();
        self.searchRegionFilter = ko.observableArray();
        self.searchRegionOffersFilter = ko.observableArray();

        self.locationFilter = ko.observableArray();


        self.language = ko.observable();
        self.siteSettings = ko.observable();
        self.filterLocations = ko.observableArray();
        self.appliedLocations = ko.observableArray();
        self.filterTravelStyles = ko.observableArray();
        self.filterMinDepartDate = ko.observable('');
        self.filterMaxDepartDate = ko.observable('');


        var siteSettings = $('#siteSettings').val();
        self.siteSettings(siteSettings);
        self.language($.parseJSON(self.siteSettings()).language);
        console.log("siteSettings: " + self.siteSettings());
        console.log('language: ' + self.language());
               


        self.dictionaryItemBreakfast = ko.observable(App.dictionary.get('tourRelated.FreeFormText.Breakfast'));
        self.dictionaryItemLunch = ko.observable(App.dictionary.get('tourRelated.FreeFormText.Lunch'));
        self.dictionaryItemDinner = ko.observable(App.dictionary.get('tourRelated.FreeFormText.Dinner'));
        self.lowText = ko.observable(App.dictionary.get('common.Misc.Low'));
        self.highText = ko.observable(App.dictionary.get('common.Misc.High'));
        
        self.getItinerary = function(packageDateNeoId) {
                        
            if (packageDateNeoId != '' && packageDateNeoId != null)
            {

                var parameters = { packageDateNeoId: packageDateNeoId, language: "en" };
                ajaxHelper('/api/services/TourDetailsService/GetPackageDateItinerary', 'POST', parameters).done(function (data, status, xhr) {

                    self.packageDateItinerary(data);
                    console.log(self.packageDateItinerary());

                });

            }

        }

        self.shouldShowRegionPanel = function (data) {

            if (self.showRegionPanel()) {
                self.getSearchHeroFilters();
                return true;

            }
        }

        self.enableLocationSearch = function (data) {

            console.log("enableLocationSearch");
        }

        self.selectRegion = function (data) {
            console.log("Region Selected: " + data.locationName);
            console.log("Sitecore Id Selected: " + data.sitecoreId);
            var regionId = "#" + data.sitecoreId;
            console.log("regionId: " + regionId);
            if ($(regionId).hasClass("selected")) {
                self.filterLocations.remove(data);
            }
            else {
                self.filterLocations.push(data);
            }
            $(regionId).toggleClass("selected");
            //self.refreshSpecialOffers();
        }

        self.applyRegions = function (data) {

            
            self.appliedLocations(self.filterLocations());

            
            self.appliedLocations().forEach(function (v, i) {
                console.log("Location Name: " + v.locationName);
                console.log("Location Type: " + v.locationType);

            });

            var regionString = '';
            self.appliedLocations().forEach(function (v, i) {
                regionString = regionString + ' ' + v.locationName;

            });

            self.appliedRegionsString(regionString.trimStart());
            console.log(self.appliedRegionsString());
            
        }

        self.cancelRegions = function (data) {

            console.log("cancelRegions");
            self.searchHeroFilters([]);

        }



        self.refreshSpecialOffers = function () {

            var parameters = { language: self.language(), locations: self.filterLocations(), travelStyles: self.filterTravelStyles(), earliestDepartureDate: self.filterMinDepartDate(), latestDepartureDate: self.filterMaxDepartDate() };
            console.log("refreshSpecialOffers parameters: " + parameters.language);
            console.log("refreshSpecialOffers parameters: " + parameters.locations);
            console.log("refreshSpecialOffers parameters: " + parameters.earliestDepartureDate);
            console.log("refreshSpecialOffers parameters: " + parameters.latestDepartureDate);


            ajaxHelper('/api/services/LocationDetail/GetSearchHeroFilters', 'POST', parameters).done(function (data, status, xhr) {

                if (data.highestDiscountTours.length > 0) {
                    self.searchRegionOffersFilter(data.highestDiscountTours);
                    console.log(self.searchRegionOffersFilter());
                }

            });
            
        }

        self.getSearchHeroFilters = function () {

            var parameters = { language: self.language(), locations: self.filterLocations(), travelStyles: self.filterTravelStyles(), earliestDepartureDate: self.filterMinDepartDate(), latestDepartureDate: self.filterMaxDepartDate() };
            console.log("parameters: " + parameters.language);
            console.log("parameters: " + parameters.locations);
            console.log("parameters: " + parameters.earliestDepartureDate);
            console.log("parameters: " + parameters.latestDepartureDate);

            ajaxHelper('/api/services/LocationDetail/GetSearchHeroFilters', 'POST', parameters).done(function (data, status, xhr) {

                self.searchHeroFilters(data);
                self.searchRegionFilter(data.destinationItems);
                self.searchRegionOffersFilter(data.highestDiscountTours);


                console.log(self.searchHeroFilters());
                console.log(self.searchRegionFilter());
                console.log(self.searchRegionOffersFilter());


            });

        }

        self.getLocationDetail = function (sitecoreId) {

            if (sitecoreId != '' && sitecoreId != null) {

                var parameters = { sitecoreId: sitecoreId, language: "en" };
                ajaxHelper('/api/services/LocationDetail/GetDestinationAggregateIndexData', 'POST', parameters).done(function (data, status, xhr) {

                    self.locationDetail(data);
                    console.log(self.locationDetail());

                });

            }


        }

        self.getLocations = function () {

            var parameters = { language: self.language() };
            console.log("getLocations: " + parameters.language);

        }

        self.getFoodText = function (breakfast, lunch, dinner) {

            var foodText;
            if (breakfast && lunch && dinner) {
                foodText = self.dictionaryItemBreakfast() + ", " + self.dictionaryItemLunch() + " & " + self.dictionaryItemDinner();
                return foodText;
            } else {
                var foodsArray = [];
                if (breakfast) {
                    foodsArray.push(self.dictionaryItemBreakfast());
                }
                if (lunch) {
                    foodsArray.push(self.dictionaryItemLunch());
                }
                if (dinner) {
                    foodsArray.push(self.dictionaryItemDinner())
                }

                foodText = foodsArray.length > 0 ? foodsArray.join("&") : "";

                return foodText;
            }


        }

        function ajaxHelper(uri, method, data) {

            
            self.error(''); // Clear error message
            return $.ajax({
                type: method,
                url: uri,
                dataType: 'json',
                contentType: 'application/json',
                data: data ? JSON.stringify(data) : null
            }).fail(function (jqXHR, textStatus, errorThrown) {
                self.error(errorThrown);
            });

        }


        function getLocations(marketId, currencyId) {

            
            var parameters = { marketId: marketId, currencyId: currencyId };
            ajaxHelper('/api/services/LocationDetail/GetDestinationAggregateIndexData', 'POST', parameters).done(function (data, status, xhr) {

                self.locations(data);
                console.log(self.locations());

            });
        }

        function populateLocationFilter() {

            var parameters = { language: self.language(), term: '' };
            ajaxHelper('/api/services/LocationDetail/GetLocations', 'POST', parameters).done(function (data, status, xhr) {

                self.locationFilter(data);
                setLocationDropdownOptions();
                console.log("self.locationDropdownOptions: " + self.locationDropdownOptions());
                //console.log(self.locationFilter());
                //console.log("About to set chosen");
                //$(".chosen-select").chosen({ no_results_text: "No results found. Sorry...." });
                //$('.chosen-select').val('').trigger('chosen:updated');
            });
        }

        function setLocationDropdownOptions() {

            self.locationDropdownOptions($.map(self.locationFilter(), function (item) {
                return {
                    label: item.location,
                    value: item.locationType
                }

            }));

        }

        $('#inputLocation').on('input keyup paste', function () {
            var hasValue = $.trim(this.value).length;
            if (!hasValue) {
                self.locationSelected([]);
            }

        });

        $('#inputSelectedRegions').on('input keyup paste', function () {
            var hasValue = $.trim(this.value).length;
            if (!hasValue) {
                self.appliedRegionsString('');
                self.appliedLocations([]);
                self.filterLocations([]);
                self.getSearchHeroFilters();
            }

        });

        
        populateLocationFilter();

                
        
        //$(".chosen-select").chosen({ no_results_text: "No results found...." });

        

        
    };
});





