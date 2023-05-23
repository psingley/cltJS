define(['jquery', 'knockout', 'app'], function ($, ko, App) {

    ko.bindingHandlers.autoComplete = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var selectedObservableArrayInViewModel = valueAccessor();

            var updateElementValueWithLabel = function (event, ui) {
                // Stop the default behavior
                event.preventDefault();

                // Update the value of the html element with the label 
                // of the activated option in the list (ui.item)
                $(element).val(ui.item.label);

                viewModel.selectLocation(ui.item.value);
                                               

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

        //applied paramters string variables
        self.appliedRegionsString = ko.observable();
        self.appliedDatesString = ko.observable('Add Date Range');
        self.appliedTravelStylesString = ko.observable('Add Travel Style');
        self.linkTakeoverMarkup = ko.observable("<span class='link-takeover'></span>");

        self.locationDropdownOptions = ko.observableArray();
        self.locationFilter = ko.observable('');
        self.locationSelected = ko.observableArray();

        self.departureYears = ko.observableArray();
        self.departureMonths = ko.observableArray();

        self.bestOffers = ko.observableArray();
        self.regionOffers = ko.observableArray();

        //applied date params
        self.appliedFromDate = ko.observable('');
        self.appliedToDate = ko.observable('');
        self.appliedStartDate = ko.observable('');
        self.appliedEndDate = ko.observable('');


        self.showLocationInput = ko.observable(true);


        self.myObservableArray = ko.observableArray();

        self.locationDetail = ko.observableArray();
        self.locations = ko.observableArray();
        self.searchHeroFilters = ko.observableArray();
        self.searchRegionFilter = ko.observableArray();
        self.searchRegionOffersFilter = ko.observableArray();

        self.locationFilter = ko.observableArray();
        self.yearFilter = ko.observable();
        self.selectedMonths = ko.observableArray();

        self.language = ko.observable();
        self.siteSettings = ko.observable();

        self.appliedLocations = ko.observableArray();
        self.appliedTravelStyles = ko.observableArray();
        self.filterLocations = ko.observableArray();
        self.filterTravelStyles = ko.observableArray();
        self.filterMinDepartDate = ko.observable('');
        self.filterMaxDepartDate = ko.observable('');

        self.locationParam = ko.observableArray();
        self.error = ko.observable();

        //max an min dates returned from index
        self.nearestDepartureDate = ko.observable();
        self.latestDepartureDate = ko.observable();
        self.nearestDepartureMonth = ko.observable();
        self.nearestDepartureMonthNumber = ko.observable();
        self.nearestDepartureYear = ko.observable();
        self.latestDepartureMonth = ko.observable();
        self.latestDepartureMonthNumber = ko.observable();
        self.latestDepartureYear = ko.observable();

        self.dateRangeStartSelected = ko.observable(true);
        self.dateRangeEndSelected = ko.observable(false);
        self.dateRangeError = ko.observable(false);


        self.allTravelStyles = ko.observableArray();


        //default filters
        self.defaultRegions = ko.observableArray();
        self.defaultRegionOffers = ko.observableArray();
        self.defaultTravelStyles = ko.observableArray();

        //filter availability
        self.availableRegions = ko.observableArray();
        self.availableTravelStyles = ko.observableArray();

        var siteSettings = $('#siteSettings').val();
        self.siteSettings(siteSettings);
        self.language($.parseJSON(self.siteSettings()).language);
        console.log("siteSettings: " + self.siteSettings());
        console.log('language: ' + self.language());

        self.selectLocation = function (locationItem) {

            self.locationSelected([]);
            self.locationSelected().push(locationItem);

            //clear applied locations
            self.appliedLocations([]);

            //refresh dates and tour styles filters based on location selection
            refreshAvailableDates();
            refreshTravelStyles();


        }

        self.filteredLocations = ko.computed(function () {
            return self.locationDropdownOptions().filter(function (i) {
                var term = self.locationFilter().toString().toLowerCase();
                return i.label.toLowerCase().indexOf(term) >= 0;
            });
        });


        self.departureMonthsByYear = ko.computed(function () {
            return self.departureMonths().filter(function (i) {
                return i.year == self.yearFilter();
            });
        });


        self.initiateSearch = function (data) {

            if (self.appliedLocations().length > 0 || self.appliedTravelStyles().length > 0 || self.appliedStartDate() != '' || self.appliedEndDate() != '' || self.locationSelected().length > 0 ) 
                submitSearch();


        }

        function submitSearch() {

            //applied locations
            var locationParams = '';
            if (self.locationSelected().length > 0)
                self.appliedLocations.push(self.locationSelected()[0]);

            self.appliedLocations().forEach(function (v, i) {

                console.log("Location Type: " + v.locationType);
                console.log("Location Name: " + v.locationName);

                if (v.locationType == 'Continent') {
                    locationParams = locationParams.concat('&continentnames=' + v.locationName);
                }

                if (v.locationType == 'Region') {
                    locationParams = locationParams.concat('&regionnames=' + v.locationName);
                }

                if (v.locationType == 'City') {
                    locationParams = locationParams.concat('&cities=' + v.locationName);
                }

                if (v.locationType == 'Country') {
                    locationParams = locationParams.concat('&countrynames=' + v.locationName);
                }

            });

           
            //applied travel styles
            var travelStyleParams = '';
            if (self.appliedTravelStyles().length > 0) {
                travelStyleParams = '&stylenamesfacet=' + self.appliedTravelStyles().join(',');
            }

            //dates
            var startDateParam = '';
            if (self.appliedStartDate() != '' && self.appliedStartDate() != undefined )
                startDateParam = '&start=' + self.appliedStartDate();

            var endDateParam = '';
            if (self.appliedEndDate() != '' && self.appliedEndDate() != undefined)
                endDateParam = '&end=' + self.appliedEndDate();


            var currentDomain = document.location.host;
            var currentProtocol = document.location.protocol;
            var currentLanguage = self.language();
            var findYourTour = "find-your-tour#q/showFacets=1&currentPage=1&sortDirection=desc&sortBy=pageviewsbylanguage";
            var searchPage = currentProtocol + '//' + currentDomain + "/" + currentLanguage + "/" + findYourTour + locationParams + travelStyleParams + startDateParam + endDateParam;
            
            console.log("searchPage: " + searchPage);
            window.location.href = searchPage;

            try {
                dataLayer.push({
                    'homepageTravelToolWhere': locationParams,
                    'homepageTravelToolWhen': startDateParam + endDateParam,
                    'homepageTravelToolStyle': travelStyleParams,
                    'IsAgent': IsAgent(),
                    'Action': 'Home Page Hero Search',
                    'event': 'dataLayerPush'

                });
            } catch (e) {
                console.log(e);
            }
        }

        self.nearestDepartureMonthYear = ko.computed(function () {
            return self.nearestDepartureMonth() + ' ' + self.nearestDepartureYear();

        });

        self.latestDepartureMonthYear = ko.computed(function () {
            return self.latestDepartureMonth() + ' ' + self.latestDepartureYear();

        });

        self.monthSelected = function (data) {

            if ((data.month == self.nearestDepartureMonth() && data.year == self.nearestDepartureYear()) || (data.month == self.latestDepartureMonth() && data.year == self.latestDepartureYear()))
                return true;
            else
                return false;

        }

        self.regionSelected = function (data) {

            var selected = false;
            self.filterLocations().forEach(function (v, i) {
            
                if (data.locationName == v.locationName) {
                    console.log("bingo this region is selected: " + data);
                    selected = true;
                }

            });

            return selected;

        }

        self.regionAvailable = function (data) {

            console.log("region to check: " + data);
            var available = false;
            self.availableRegions().forEach(function (v, i) {

                if (data == v.locationName) {
                    console.log("bingo this region is available: " + data);
                    available = true;
                }

            });

            return available;

        }

        self.regionTravelStyleAvailable = function (data) {

            console.log("travel style to check: " + data);
            var available = false;
            self.availableTravelStyles().forEach(function (v, i) {

                if (data == v) {
                    console.log("bingo this travel style is available: " + data);
                    available = true;
                }

            });

            return available;


        }

        self.travelStyleSelected = function (data) {

            var styleSelected = false;
            self.filterTravelStyles().forEach(function (v, i) {

                console.log("filter travel style: " + v);
                console.log("data.searchIndexText: " + data.searchIndexText);
                if (data.searchIndexText == v) {
                    console.log("Travel Style should be selected: " + data.searchIndexText);
                    styleSelected = true;
                }

            });

            return styleSelected;

        }


        // Subscribe to changes in the filterTravelStyles array
        self.filterTravelStyles.subscribe(function () {
            // Update appliedTravelStyles with the current filterTravelStyles
            self.appliedTravelStyles(self.filterTravelStyles());

            // Update appliedTravelStylesString based on the appliedTravelStyles array
            if (self.appliedTravelStyles().length > 0) {
                var stylesString = '';
                var lastItemIndex = self.appliedTravelStyles().length - 1;
                self.appliedTravelStyles().forEach(function (v, i) {
                    stylesString = stylesString + v;
                    if (i < lastItemIndex) {
                        stylesString = stylesString + ', ';
                    }
                });

                self.appliedTravelStylesString(stylesString.trimStart());
            } else {
                self.appliedTravelStylesString('Add Travel Style');
            }
        });

        self.selectTravelStyle = function (data) {
            var travelStyleId = "#" + data.searchIndexText;
            if ($(travelStyleId).hasClass("selected")) {
                self.filterTravelStyles.remove(data.searchIndexText);
            }
            else {
                self.filterTravelStyles.push(data.searchIndexText);
            }
            console.log(self.filterTravelStyles());
        };

        self.selectRegion = function (data) {
            var regionId = "#" + data.sitecoreId;
            console.log("regionId: " + regionId);
            if ($(regionId).hasClass("selected")) {
                self.filterLocations.remove(data);
            }
            else {
                self.filterLocations([]);
                self.filterLocations.push(data);
            }
            console.log(self.filterLocations());
            refreshDestinationOffers();

            // Call applyRegions at the end of the selectRegion function instead of using done button
            self.applyRegions();
        }

        self.selectYear = function (data) {

            self.yearFilter(data);
            console.log(self.yearFilter());

        }

        self.selectMonth = function (data) {

            //check if we are selecting start date or end date
            if (self.dateRangeStartSelected()) {
                self.nearestDepartureMonth(data.month);
                self.nearestDepartureMonthNumber(data.monthNumber);
                self.nearestDepartureYear(data.year);
            }
            else {
                
                self.latestDepartureMonth(data.month);
                self.latestDepartureMonthNumber(data.monthNumber);
                self.latestDepartureYear(data.year);
            }

        }

        self.selectDateRangeStart = function (data) {

            self.dateRangeStartSelected(true);
            self.dateRangeEndSelected(false);

            console.log("dateRangeStartSelected: " + self.dateRangeStartSelected());
            console.log("dateRangeEndSelected: " + self.dateRangeEndSelected());

        }

        self.selectDateRangeEnd = function (data) {

            self.dateRangeStartSelected(false);
            self.dateRangeEndSelected(true);

            console.log("dateRangeStartSelected: " + self.dateRangeStartSelected());
            console.log("dateRangeEndSelected: " + self.dateRangeEndSelected());

        }

        //hpr-455-bugfix
        function adjustMonthForSearch(monthNumber) {
            
            if ($.trim(monthNumber).length == 1) {

                return '0' + monthNumber;
            }
            else
                return monthNumber;
        }

        self.applyDates = function (data) {
            function daysInMonth(m, y) { return m === 2 ? y & 3 || !(y % 25) && y & 15 ? 28 : 29 : 30 + (m + (m >> 3) & 1) } // Days in month
            var last_day_of_departure_month = daysInMonth(self.latestDepartureMonthNumber());
            
            //validate dates
            var startDate = new Date(self.nearestDepartureMonthNumber() + '/1/' + self.nearestDepartureYear());
            var endDate = new Date(self.latestDepartureMonthNumber() + '/' + last_day_of_departure_month+'/' + self.latestDepartureYear());

            if (startDate > endDate)
                self.dateRangeError(true);
            else
                self.dateRangeError(false);


            if (!self.dateRangeError()) {

                self.appliedDatesString(self.nearestDepartureMonthYear() + ' - ' + self.latestDepartureMonthYear());

                //format dates to be passed to back end for refreshing filters
                self.appliedFromDate(self.nearestDepartureMonthNumber() + '/1/' + self.nearestDepartureYear());
                self.appliedToDate(self.latestDepartureMonthNumber() + '/' + last_day_of_departure_month +'/' + self.latestDepartureYear());

                //format dates for find your tour page
                self.appliedStartDate(adjustMonthForSearch(self.nearestDepartureMonthNumber()) + '-' + self.nearestDepartureYear());
                self.appliedEndDate(adjustMonthForSearch(self.latestDepartureMonthNumber()) + '-' + self.latestDepartureYear());


                $(".home-hero-date-panel").removeClass("show");
                console.log(self.appliedDatesString());
                console.log("applied from date: " + self.appliedFromDate());
                console.log("applied to date: " + self.appliedToDate());

                //refresh location dropdown based on dates selected
                populateLocationFilter();

                //refresh available regions based on detes selected
                refreshRegions();

                //refresh available travel styles based on dates selected
                refreshTravelStyles();

            }


        }
                
        self.cancelDates = function (data) {

            self.nearestDepartureDate('');
            self.nearestDepartureMonth('');
            self.nearestDepartureYear('');
            self.latestDepartureDate('');
            self.latestDepartureMonth('');
            self.latestDepartureYear('');
            self.appliedStartDate('');
            self.appliedEndDate('');
            self.appliedFromDate('');
            self.appliedToDate('');
            self.appliedDatesString('Add Date Range');
            self.dateRangeError(false);

            
            //refresh location dropdown based on dates selected
            populateLocationFilter();

            //refresh available regions based on detes selected
            refreshRegions();

            //refresh available travel styles based on dates selected
            refreshTravelStyles();

            $(".home-hero-date-panel").removeClass("show");

        }

        self.cancelRegions = function (data) {

            self.appliedLocations([]);
            self.filterLocations([]);
            self.appliedRegionsString('Add Location');
            $(".home-hero-region-panel").removeClass("show");

            //refresh available dates based on regions selected
            refreshAvailableDates();

            //refresh travel styles based on regions selected
            refreshTravelStyles();

        }

        self.applyTravelStyles = function (data) {

            if (self.filterTravelStyles().length > 0) {

                // adding a comma to separate each item
                var stylesString = '';
                var lastItemIndex = self.appliedTravelStyles().length - 1;
                self.appliedTravelStyles().forEach(function (v, i) {
                    stylesString = stylesString + v;
                    if (i < lastItemIndex) {
                        stylesString = stylesString + ', ';
                    }
                });

                self.appliedTravelStylesString(stylesString.trimStart());
                console.log(self.appliedTravelStylesString());

                //refresh location dropdown based on dates selected
                populateLocationFilter();

                //refresh available regions based on travel styles selected
                refreshRegions();

                //refresh available dates selected based on travel styles selected
                refreshAvailableDates();

            }
            else {
                self.appliedTravelStylesString('Add Travel Style');
            }

            $(".home-hero-travel-style-panel").removeClass("show");


        }

        self.selectAllTravelStyles = function (data) {
            //clear travel styles selected
            self.filterTravelStyles([]);

            self.defaultTravelStyles().forEach(function (v, i) {
                self.filterTravelStyles.push(v.searchIndexText);
            });
        };


        self.strikeThroughPrice = function (data) {

            return parseInt(data.price) + parseInt(data.minimumPriceOfferAmount);

        }

        self.cancelTravelStyles = function (data) {

            self.filterTravelStyles([]);
            self.appliedTravelStyles([]);
            self.appliedTravelStylesString('Add Travel Style');

            //refresh location dropdown based on dates selected
            populateLocationFilter();

            //refresh available regions based on travel styles selected
            refreshRegions();

            //refresh available dates selected based on travel styles selected
            refreshAvailableDates();


            $(".home-hero-travel-style-panel").removeClass("show");
        }

        self.closePanelAndApplyTravelStyles = function () {
            // Close the dropdown panel
            $(".home-hero-travel-style-panel").removeClass("show");
            // Apply the changes
            self.applyTravelStyles();
        };

        self.applyRegions = function (data) {
                        
            self.appliedLocations(self.filterLocations());

            //clear variable holding location selected from droplist
            self.locationSelected([]);
                        
            var regionString = '';
            self.appliedLocations().forEach(function (v, i) {
                regionString = regionString + ' ' + v.locationName;

            });

            self.appliedRegionsString(regionString.trimStart());
            console.log(self.appliedRegionsString());

            //refresh available dates based on regions selected
            refreshAvailableDates();

            //refresh available travel styles based on regions selected
            refreshTravelStyles();

            $(".home-hero-region-panel").removeClass("show");

            
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

        function getDefaultSearchHeroFilters() {

            var parameters = { language: self.language() };

            ajaxHelper('/api/services/LocationDetail/GetDefaultSearchHeroFilters', 'POST', parameters).done(function (data, status, xhr) {
                                
                self.defaultRegions(data.destinationItems);
                self.defaultRegionOffers(data.highestDiscountTours);
                self.bestOffers(data.highestDiscountTours);
                self.defaultTravelStyles(data.travelStylesDetailList);

                                                  
                //set available regions and travel styles to default
                self.availableRegions(data.destinationItems);
                self.availableTravelStyles(data.travelStylesDetailList);

                self.departureYears(data.departureYears);
                self.departureMonths(data.departureMonths);

                self.yearFilter(self.departureYears()[0]);

                self.nearestDepartureDate(data.nearestDepartureDate);
                self.nearestDepartureMonth(data.nearestDepartureMonth);
                self.nearestDepartureMonthNumber(data.nearestDepartureMonthNumber);
                self.nearestDepartureYear(data.nearestDepartureYear);
                self.latestDepartureDate(data.latestDepartureDate);
                self.latestDepartureMonth(data.latestDepartureMonth);
                self.latestDepartureMonthNumber(data.latestDepartureMonthNumber);
                self.latestDepartureYear(data.latestDepartureYear);

                                           


            });


        }

        
        function refreshDestinationOffers() {

            var parameters = { language: self.language(), locations: self.filterLocations() };

            ajaxHelper('/api/services/LocationDetail/RefreshDestinationOffers', 'POST', parameters).done(function (data, status, xhr) {

                //if we get back some destination specific offers - show them
                if (data.highestDiscountTours.length > 0) {
                    self.bestOffers(data.highestDiscountTours);
                }
                else {
                    self.bestOffers(self.defaultRegionOffers());
                }
                               

            });


        }

        function refreshRegions() {

            var parameters = { language: self.language(), earliestDepartureDate: self.appliedFromDate(), latestDepartureDate: self.appliedToDate(), travelStyles: self.appliedTravelStyles() };

            ajaxHelper('/api/services/LocationDetail/RefreshRegions', 'POST', parameters).done(function (data, status, xhr) {


                self.availableRegions(data.destinationItems);

                console.log("available regions:");
                self.availableRegions().forEach(function (v, i) {

                    console.log("region: " + v.locationName);

                });


            });


        }

        function refreshTravelStyles() {

            setLocationParam();

            var parameters = { language: self.language(), locations: self.locationParam(), earliestDepartureDate: self.appliedFromDate(), latestDepartureDate: self.appliedToDate() };

            ajaxHelper('/api/services/LocationDetail/RefreshTravelStyles', 'POST', parameters).done(function (data, status, xhr) {


                self.availableTravelStyles(data.travelStyles);

                console.log("available travel styles:");
                self.availableTravelStyles().forEach(function (v, i) {
                                        
                    console.log("travel style: " + v);
                    
                });


            });


        }

        function setLocationParam() {

            console.log("setLocationParam");
            if (self.locationSelected().length > 0) {
                console.log("use locationSelected param");
                self.locationParam(self.locationSelected());
            }
            else {
                console.log("use appliedLocations param");
                self.locationParam(self.appliedLocations());
            }

        }

        function refreshAvailableDates() {

            setLocationParam();
                      

            var parameters = { language: self.language(), locations: self.locationParam(), travelStyles: self.appliedTravelStyles() };
            console.log("parameters: " + parameters.language);
            console.log("parameters: " + parameters.locations);
           
            ajaxHelper('/api/services/LocationDetail/RefreshAvailableDates', 'POST', parameters).done(function (data, status, xhr) {
                                
                
                self.departureYears(data.departureYears);
                self.departureMonths(data.departureMonths);
                self.yearFilter(self.departureYears()[0]);
                self.nearestDepartureDate(data.nearestDepartureDate);
                self.nearestDepartureMonth(data.nearestDepartureMonth);
                self.nearestDepartureYear(data.nearestDepartureYear);
                self.latestDepartureDate(data.latestDepartureDate);
                self.latestDepartureMonth(data.latestDepartureMonth);
                self.latestDepartureYear(data.latestDepartureYear);

                console.log("nearestDepartureDate: " + data.nearestDepartureDate);
                console.log("latestDepartureDate: " + data.latestDepartureDate);
                console.log("dateRangeStartSelected: " + self.dateRangeStartSelected());
                console.log("dateRangeEndSelected: " + self.dateRangeEndSelected());


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

        
        function populateLocationFilter() {

            var parameters = { language: self.language(), earliestDepartureDate: self.appliedFromDate(), latestDepartureDate: self.appliedToDate(), travelStyles: self.appliedTravelStyles() };
            ajaxHelper('/api/services/LocationDetail/GetLocations', 'POST', parameters).done(function (data, status, xhr) {

                self.locationFilter(data);
                setLocationDropdownOptions();
                console.log("self.locationDropdownOptions: " + self.locationDropdownOptions());
                                
            });
        }

        function setLocationDropdownOptions() {

            self.locationDropdownOptions($.map(self.locationFilter(), function (item) {
                return {
                    label: item.locationName,
                    value: item
                }

            }));

        }

        $('#inputLocation').on('input keyup paste', function () {
            var hasValue = $.trim(this.value).length;
            if (!hasValue) {
                self.locationSelected([]);
                
                refreshAvailableDates(self.locationSelected());
                refreshTravelStyles(self.locationSelected());
            }

        });

        $('#inputSelectedRegions').on('input keyup paste', function () {
            var hasValue = $.trim(this.value).length;
            if (!hasValue) {
                self.appliedRegionsString('');
                self.appliedLocations([]);
                self.filterLocations([]);
                
                refreshAvailableDates(self.appliedLocations());
                refreshTravelStyles(self.appliedLocations());
            }

        });

        //populate the location dropdown list - Regions, Continents, Countries, Cities
        populateLocationFilter();

        //populate the default filters for this market - Regions, Offers, Dates, Travel Styles
        getDefaultSearchHeroFilters();

        
                      
        
        
        

        
    };
});





