define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'domReady',
    'util/searchOptionsUtil',
    'util/seoTaggingUtil',
    'services/searchService',
    'renderedLayouts/search/facets/ActiveFiltersLayout',
    'renderedLayouts/search/facets/DateRangeFilterLayout',
    'renderedLayouts/search/facets/NewDateRangeFilterLayout',
    'renderedLayouts/search/facets/PriceRangeFilterLayout',
    'renderedLayouts/search/facets/TourLengthRangeFilterLayout',
    'renderedLayouts/search/facets/LocationFilterLayout',
    'text!templates/search/totalResultsTemplate.html',
    'util/uriUtil',
    'renderedLayouts/search/facets/FacetsLayout',
    'views/search/results/SearchResultsCollectionLayout',
    'views/search/results/SearchResultsPager',
    'goalsUtil',
    'util/objectUtil',
    'util/dataLayerUtil',
    'util/trackingPixelUtil'
], function ($, _, Backbone, Marionette, App,
    EventAggregator, domReady, SearchOptionsUtil, SeoTaggingUtil, SearchService,
    ActiveFiltersLayout, DateRangeFilterLayout, NewDateRangeFilterLayout, PriceRangeFilterLayout, TourLengthRangeFilterLayout, LocationFilterLayout,
    totalResultsTemplate, UriUtil, FacetsLayout, SearchResultsCollectionLayout, SearchResultsPager, goalsUtil,
    ObjectUtil, DataLayerUtil, TrackingPixelUtil) {

    /**
    * The search context class sets up the server side renderedLayouts
    * and subscribes to multiple events that can be overriden
    *
    * It can be inherited by other search context classes.
    *
    * @class baseSearchContext
    * @constructor
    */
    var searchContext = (function () {

        var constructor = function () {

        };

        /**
        * @method setActiveFiltersLayout
        * @return void
        */
        constructor.prototype.setActiveFiltersLayout = function () {
            var activeFiltersLayout = new ActiveFiltersLayout();
        };

        /**
        * @method setDateRangeFilterLayout
        * @return void
        */
        constructor.prototype.setDateRangeFilterLayout = function () {
            /*var dateRangeFilterLayout = new DateRangeFilterLayout();*/
            if (App.siteIds.Collette === App.siteSettings.siteId) {
                dateRangeFilterLayout = new NewDateRangeFilterLayout();
            } else {
                dateRangeFilterLayout = new DateRangeFilterLayout();
            }
        };

        /**
        * @method setPriceRangeFilterLayout
        * @return void
        */
        constructor.prototype.setPriceRangeFilterLayout = function () {
            var priceRangeFilterLayout = new PriceRangeFilterLayout();
        };

        /**
        * @method setTourLengthRangeFilterLayout
        * @return void
        */
        constructor.prototype.setTourLengthRangeFilterLayout = function () {
            var tourLengthRangeFilterLayout = new TourLengthRangeFilterLayout();
        };

        /**
        * @method setLocationFilterLayout
        * @return void
        */
        constructor.prototype.setLocationFilterLayout = function () {
            var locationFilterLayout = new LocationFilterLayout();
        };

        /**
        * A private method that sets all of the renderedLayouts for server side rendered
        * components
        *
        * @method onPageLoad
        * @return void
        */
        constructor.prototype.onPageLoad = function () {
            var outerScope = this;

            domReady(function () {
                outerScope.setActiveFiltersLayout();
                outerScope.setDateRangeFilterLayout();
                outerScope.setPriceRangeFilterLayout();
                outerScope.setTourLengthRangeFilterLayout();
                outerScope.setLocationFilterLayout();
                goalsUtil.searchPage();
            });
        };

        /**
        * Registers the toggleSearchOption event
        * @method onToggleSearchOptions
        * @returns void
        */
        constructor.prototype.onToggleSearchOptions = function () {
            /**
            * Fired when a filter changes on the search page
            *
            * @event toggleSearchOption
            */
            EventAggregator.on('toggleSearchOption', function (bypassLoadingModal) {
                if (bypassLoadingModal != null && bypassLoadingModal == true) {
                    App.Search.searchOptions.set({ bypassLoadingModal: true });
                }

                var facets = SearchOptionsUtil.getFacets();
                var currentPage = { currentPage: App.Search.searchOptions.get('currentPage') };
                var sortOption = SearchOptionsUtil.getSortOptions();
                var searchTxt = SearchOptionsUtil.getSearchTxt();

                if (!SearchOptionsUtil.isSearchLengthOK(searchTxt.content)) {
                    return;
                }

                var departureDates = SearchOptionsUtil.getDepartureDates();
                var tourLength = SearchOptionsUtil.getTourLength();
                var countries = SearchOptionsUtil.getCountries();
                var continents = SearchOptionsUtil.getContinents();
                var price = SearchOptionsUtil.getPriceRange();
                var region = SearchOptionsUtil.getRegion();
                var cities = SearchOptionsUtil.getCities();
                var content = SearchOptionsUtil.getContent();
                var highlights = SearchOptionsUtil.getHighlights();
                var criteria = $.extend(facets, price, continents, countries, departureDates, tourLength, currentPage, sortOption, searchTxt, region, cities, content, highlights);
                UriUtil.setHashByObject(criteria);

            });
        };

        /**
        * Registers the searchFilterApplied event
        * @method onSearchFilterApplied
        * @returns void
        */
        constructor.prototype.onSearchFilterApplied = function () {
            /**
            * Fired when a filter changes on the search page
            *
            * @event toggleSearchOption
            */
            EventAggregator.on('searchFilterApplied', function (fieldname, values) {
                //console.log(fieldname, values);
                var filteredOn = values.join('|');
                // Sitecore Events
                goalsUtil.searchFilterApplied(fieldname, filteredOn);

                // Tracking pixel
                //TrackingPixelUtil.trackAmazonEngagement(fieldname, values);

                // GTM Events
                try {
                    dataLayer.push({
                        'event': 'gaEvent',
                        'eventCategory': 'Search',
                        'eventAction': 'Filter Content',
                        'eventLabel': fieldname + " - " + filteredOn
                    });
                } catch (ex) {
                    console.log(ex);
                }

            });
        };

        /**
        * Registers the searchFilterApplied event
        * @method onTourDetailOptionClicked
        * @returns void
        */
        constructor.prototype.onTourDetailOptionClicked = function () {
            /**
            * Fired when a filter changes on the search page
            *
            * @event toggleSearchOption
            */
            EventAggregator.on('tourDetailOptionClicked', function (clickedOptionName, clickSource) {

                // Sitecore Events
                goalsUtil.tourDetailOptionClicked(clickSource, clickedOptionName);

                // GTM Events
                try {
                    dataLayer.push({
                        'event': 'gaEvent',
                        'eventCategory': 'Search',
                        'eventAction': 'Tour Detail Option',
                        'eventLabel': clickSource + " - " + clickedOptionName
                    });
                } catch (ex) {
                    console.log(ex);
                }

            });
        };

        /**
        * Renders all of the facet views
        *
        * @method renderFacets
        * @param {Backbone.Collection} a collection of type FacetModel
        * return void
        */
        constructor.prototype.renderFacets = function (facets) {
            var facetsLayout = new FacetsLayout({ collection: facets });
        };

        /**
        * Renders the result items and can be overridden
        *
        * @method renderResultItems
        * @param {Backbone.Collection} a collection of type ResultModel
        * @return void
        */
        constructor.prototype.renderResultItems = function (results, pageNum) {
            var activeResult = App.Search.ActiveResult;
            if (activeResult) {
                results.remove(results.where({ id: activeResult.id }));
                results.add(activeResult, { at: 0 });
                App.Search.ActiveResult = null;
            }

            if (pageNum === 1 || App.Search.searchOptions.get("returnAllResults") || App.searchResultsRegion.currentView === undefined) {
                if (!App.isColletteSite) {
                    App.searchResultsRegion.show(new SearchResultsCollectionLayout({ collection: results }));
                }
                else {
                    App.searchResultsRegion.show(new SearchResultsPager({ collection: results }));
                }
            }
            else {
                App.searchResultsRegion.currentView.collection.reset(App.searchResultsRegion.currentView.collection.models.concat(results.models));
            }

            this.getTourDetails(App.searchResultsRegion.currentView.collection);
        };

        /**
        * @method getTourDetails
        */

        constructor.prototype.getTourDetails = function (collection) {
            var mainTourDetailOptions = App.searchResultsRegion.currentView.mainButtons;
            var extraTourDetailOptions = App.searchResultsRegion.currentView.extraButtons;

            var ids = [];
            collection.each(function (item) {
                var addToSearch = true;
                //add only new ids for searchdetails
                if ((App.TourDetails && App.TourDetails.TourResults && App.TourDetails.TourResults.length > 0)) {
                    var rtl = App.TourDetails.TourResults.length;
                    for (var i = 0; i < rtl; i++) {
                        var id = "{" + App.TourDetails.TourResults[i].tourId.toUpperCase() + "}";
                        if (id == item.get("id")) {
                            addToSearch = false;
                        }
                    }
                }

                if (addToSearch)
                    ids.push(item.get("id"));

            });
            if (mainTourDetailOptions.length > 0 || extraTourDetailOptions.length > 0) {
                var parameters = { mainButtons: mainTourDetailOptions, extraButtons: extraTourDetailOptions, tourIds: ids };
                SearchService.requestTourDetailsResults(parameters);
            }
        }

        /**
        * Registers the requestResultsComplete event
        * @method onRequestResultsrequestSearchResults
        * @returns void
        */
        constructor.prototype.onRequestResults = function () {
            var outerScope = this;
            /**
            * Fired when results have come back from the server
            *
            * @event requestResultsComplete
            * @param {Backbone.Model} a backbone model that receives and parses the data
            */
            EventAggregator.on('requestResultsComplete', function (performSearch) {

                App.Search.performSearch = performSearch;

                App.tourLengthDescriptionResults = performSearch.attributes.facets;




                //direct hit functionality to bring them directly to this page
                if (performSearch.get('redirectToFirstResult') && performSearch.get("results").length === 1) {

                    //get first result
                    var firstResult = performSearch.get("results").first();
                    if (!ObjectUtil.isNullOrEmpty(firstResult) && !ObjectUtil.isNullOrEmpty(firstResult.get('tourDetailUrl'))) {
                        window.location.href = firstResult.get('tourDetailUrl');
                        return;
                    }
                }

                outerScope.renderFacets(performSearch.get("facets"));

                if (performSearch) {
                    outerScope.renderResultItems(performSearch.get("results"), performSearch.get("options").get("currentPage"));
                }

                // Clear the search text box(es)
                SearchOptionsUtil.clearSearchInputs();



                //get the number of results and update the total results
                var resultsText = App.dictionary.get('search.Results', 'Results');
                var numOfResults = App.Search.performSearch.get('totalResults');

                var $totalResultsEl = $("#totalResults");
                var activeFilterTotalResult = $('#total-active-results');
                var currencyLable = $('#currencyLabel').text();

                if (parseInt(numOfResults) > 0) {
                    $totalResultsEl.show();
                    activeFilterTotalResult.show();
                    var numOfResultsData = { numberOfResults: numOfResults, resultsText: resultsText };
                    var template = Backbone.Marionette.TemplateCache.get(totalResultsTemplate);
                    var totalResultsHtml = Backbone.Marionette.Renderer.render(template, numOfResultsData);
                    activeFilterTotalResult.html(totalResultsHtml);
                    $totalResultsEl.html(totalResultsHtml);
                } else {
                    $totalResultsEl.hide();
                    activeFilterTotalResult.hide();
                }

                //check currency code exist before adding
                if (App.siteIds.Marriott != App.siteSettings.siteId && !currencyLable.includes(App.siteSettings.currencyCode)) {
                    $('#currencyLabel').show();
                    $('#currencyLabel').html(currencyLable + ' ' + App.siteSettings.currencyCode);
                    $('#currencyLabelMobile').show();
                    $('#currencyLabelMobile').html(currencyLable + ' ' + App.siteSettings.currencyCode);
                } else if (App.siteIds.Marriott == App.siteSettings.siteId) {
                    $('#currencyLabel').hide();
                    $('#currencyLabelMobile').hide()
                }

                //Criteo Pixel data added
                var results = App.Search.performSearch.get("results");
                if (results.models.length > 0) {
                    var title2 = "";
                    var title3 = "";
                    var title1 = results.models[0].attributes.tourDetailUrl.split('/').pop();
                    if (results.models.length > 1) {
                        title2 = results.models[1].attributes.tourDetailUrl.split('/').pop();
                    }
                    if (results.models.length > 2) {
                        title3 = results.models[2].attributes.tourDetailUrl.split('/').pop();
                    }
                    if (SeoTaggingUtil.useExternalScripts() && !ObjectUtil.isNullOrEmpty(window.criteo_q)) {
                        window.criteo_q.push(
                            { event: "viewList", item: [title1, title2, title3] });
                    } else {
                        console.log("Criteo Pixel Added");
                        console.log('Tour1 -' + title1);
                        console.log('Tour2 -' + title2);
                        console.log('Tour3 -' + title3);
                    }

                }
                //Criteo pixel end

                //add dynamic id's for .gtm use
                var divMim = document.querySelectorAll('.slider-range-min input'), i;
                var divMax = document.querySelectorAll('.slider-range-max input');

                for (i = 0; i < divMim.length; ++i) {
                    switch (i) {
                        case 0:
                            //divMim[i].setAttribute('id', 'minDateRangeDeparture');
                            //divMax[i].setAttribute('id', 'maxDateRangeDeparture');
                            break;
                        case 1:
                            divMim[i].setAttribute('id', 'minTourLength');
                            divMax[i].setAttribute('id', 'maxTourLength');
                            break;
                        case 2:
                            divMim[i].setAttribute('id', 'minPriceRange');
                            divMax[i].setAttribute('id', 'maxPriceRange');
                            break;
                        default:
                            break;
                    }
                }


                //add to datalayer
                if (localStorage.getItem("SearchTerm") !== null) {
                    DataLayerUtil.PredictiveSearchLayerPush(parseInt(numOfResults));
                }
                try {
                    DataLayerUtil.CreateFilteredSearchLayer();
                }
                catch (error) {
                    console.error(error);
                }

                SearchOptionsUtil.updateTourListClasses();
                EventAggregator.trigger('requestResultsFinialize', true);

                //update mobile filter bar with results
                if (App.isColletteSite) {
                    $("#total-active-results-mobile").text(numOfResults + " results");
                    $("#total-active-results-mobile2").text(numOfResults + " results");
                }

            });
        };



        return constructor;
    })();

    return searchContext;
});