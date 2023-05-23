define([
    'domReady!',
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'app',
    'util/searchOptionsUtil',
    'util/uriUtil'
], function (doc, $, _, Backbone, Marionette, EventAggregator, App, SearchOptionsUtil, UriUtil) {
    var HomePageFiltersLayout = Backbone.Marionette.Layout.extend({
        el: $('#homePageFilters'),
        initialize: function () {
            if ($('.datepicker').length > 0) {
                //make sure we can always get the us date format
                $('.datepicker').datepicker();
                $(".datepicker").datepicker("option", "dateFormat", App.siteSettings.datePickerDateFormat);
                $(".datepicker").datepicker("option", "altFormat", "mm-yy");
                $(".datepicker").datepicker("option", "altField", "#actualDate");
            }
        },
        events: {
            'click .btn': 'performSearch',
            'change #continentDropDown': 'updateCountriesDropDown'
        },
        performSearch: function () {
            var dateRange = this.getDate();
            var country = SearchOptionsUtil.getSelectedCountry();
            var continent = SearchOptionsUtil.getSelectedContinent();
	        var searchPageUrl = this.getSearhLink();

            var criteria = _.extend(dateRange, country, continent);

            //google tag manager event tracker
            try {
                var $page = $(location).attr('pathname');

                dataLayer.push({
                    'event': 'gaEvent',
                    'eventCategory': 'Header',
                    'eventAction': 'Filter Content',
                    'eventLabel': 'Select region - ' + $('#continentDropDown').val() + ' - ' + $('#countryDropDown').val() + ' - ' + $page
                });
            } catch (ex) {
                console.log(ex);
            }

            window.location.href = searchPageUrl + '#' + UriUtil.getUriHash(criteria);
        },
        getSearhLink: function () {
        	var url = $("#homePageFilters .btn").data('url');
	        if (url == "") {
	        	url = SearchOptionsUtil.getSearchUrl();
	        }
	        return url;
        },

        getDate: function () {
            var altField = $(".datepicker").datepicker("option", "altField");
            var startDateElement = $(altField);
            var startDate;

            if (!$(startDateElement).isNullOrEmpty()) {
                startDate = $(startDateElement).val();
            } else {
                startDate = '';
            }

            //if we have a start date but no end date
            if (startDate !== '') {
                return {start: startDate};
            }

            //if we have no dates
            return {};
        },
        //loop through all of the countries and hide/show them based
        //on whether it is in the selected region
        updateCountriesDropDown: function () {
            var countryDropDown = $('#countryDropDown').next('.new_select');
            //loop through all of the countries to find which ones to show
            $(countryDropDown).children('ul').children('li').each(function () {

                //get all of the currently selected countries to make sure
                //we are not adding it to the country drop down list
                var selectedCountries = $('#selectedCountryRegions ul > li[data-field="' + App.countryFacet + '"]');
                var selectedContinents = $('#selectedCountryRegions ul > li[data-field="' + App.continentFacet + '"]');

                var countryName = $(this).attr('data-value');

                //if the value is in selected countries the find function will return
                //the name of the country, otherwise it will return undefined
                var countryAlreadySelected =
                    _.find(selectedCountries, function (country) {
                        return $(country).children('a')[0].innerText === countryName;
                    });

                //as long as the country has not already been selected add it
                //to the newly populated drop down
                var regionName = $('#continentDropDown option:selected').val();

                if (countryAlreadySelected === undefined) {
                    var countryRegion = $(this).attr('data-region');
                    if (countryRegion === regionName) {
                        $(this).show();
                    }
                    //if region is equal to "Any Region"
                    else if (regionName === '') {
                        $(this).show();
                    } else {
                        //if the country is in the select list we hide it
                        $(this).hide();
                    }
                } else {
                    //if the country does not correspond to the selected continent
                    //we hide it
                    $(this).hide();
                }
            });
        }
    });

    return HomePageFiltersLayout;
});