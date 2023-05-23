define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/uriUtil',
    'util/searchOptionsUtil',
    'services/searchService',
    'models/search/PerformSearchModel',
    'models/search/searchOptions/SearchOptionsModel',
    'models/search/searchOptions/ParameterModel',
    'collections/search/searchOptions/ParameterCollection',
    'event.aggregator',
	'goalsUtil'
], function ($, _, Backbone, Marionette, App, UriUtil, SearchOptionsUtil, SearchService, PerformSearchModel, SearchOptionsModel, ParameterModel, ParameterCollection, EventAggregator, goalsUtil) {
    /**
     * Controls the selection of features in the main menu
     *
     * @class GetInspiredLayout
     * @type {Backbone.Marionette.Layout}
     */
    var GetInspiredLayout = Backbone.Marionette.Layout.extend({
        el: '.inspired',
        events: {
            'click input[type=checkbox]': 'getNumberOfTours',
            'click #getInspiredSearch': 'searchTours'
        },
        /**
         * Adjusts the of tours associated with specific tags
         *
         * @method getNumberOfTours
         * @returns void
         */
        getNumberOfTours: function () {
            var outerScope = this;
            var featuresObject = this.getCheckedFeatures();
            var searchOptions = new SearchOptionsModel();
            var parameters = new ParameterCollection();
            var currentId = $('#siteSearchId').val();

            parameters.add(new ParameterModel({id: App.tourFeaturesFacet, values: featuresObject.features}));
            var hash = UriUtil.getUriHash(featuresObject);

            searchOptions.set({parameters: parameters});
            searchOptions.set({currentItemId: currentId});
            searchOptions.set({key: hash});

            var totalResults = SearchService.requestNumberOfSearchResults(searchOptions);
            var $toursToExperience = outerScope.$el.find('.media_object');
            $toursToExperience.show();
            $('#getInspiredCount').text(totalResults);
        },
        /**
         * Adjusts the url and brings you to the search page with the selected features
         *
         * @method searchTours
         * @returns void
         * @param e
         */
        searchTours: function (e) {
            e.preventDefault();

            var searchPageUrl = SearchOptionsUtil.getSearchUrl();

            var featuresObject = this.getCheckedFeatures();
            var urlHash = UriUtil.getUriHash(featuresObject);

	        goalsUtil.getInspired(urlHash);

	        window.location.href = searchPageUrl + '#' + urlHash;

            if (App.isSearch) {
                var $primary = $("#primary");
                var currentId = $('#siteSearchId').val();
                SearchOptionsUtil.setUrlSearchOptions(currentId);
                EventAggregator.trigger('setSearchOptionsComplete');

                $('html, body').animate({scrollTop: $primary.offset().top});
            }
        },
        /**
         * Creates the criteria to search for tours based on features
         *
         * @method getCheckedFeatures
         * @returns {*}
         */
        getCheckedFeatures: function () {
            var features = [];
            var $featureElements = this.$el.find('input[type=checkbox]');

            //get all of the children elements of the filter field
            _.each($featureElements, function (featureElement) {
                if ($(featureElement).is(':checked')) {
                    features.push($(featureElement).attr('name'));
                }
            });

            if (features.length > 0) {
                var featuresObject = {features: features};
                return featuresObject;
            }

            return {};
        }
    });
    return GetInspiredLayout;
});