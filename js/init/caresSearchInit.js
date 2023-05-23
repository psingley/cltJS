// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
    "app",
    "routers/searchRouter",
    "controllers/searchController",
    'models/search/searchOptions/SearchOptionsModel',
    'models/search/PerformSearchModel'
],
    function (App, SearchRouter, SearchController, SearchOptionsModel, PerformSearchModel) {
        App.module("Cares-Search", function () {
            var outerScope = this;

            this.startWithParent = false;

            //a modules initializer runs when the module is started
            this.addInitializer(function () {
                //object passed back to the search service with all params/filters
                App.CaresSearch.searchOptions = new SearchOptionsModel();
                //the model used to fetch results/facets
                App.Search.performSearch = new PerformSearchModel();

                //we can set up multiple dependencies here, when will wait for all fetches to finish.
                outerScope.appRouter = new SearchRouter({
                    controller: new SearchController()
                });

                App.start();
            });
        });
    });