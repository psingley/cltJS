define([
    'domReady',
    'app',
    'jquery',
    'backbone',
    'marionette',
    'objects/search/context/baseSearchContext',
    'views/search/results/aaa/AAAResultListView'
],
    function (domReady, App, $, Backbone, Marionette, BaseSearchContext, AAAResultListView) {
        /**
         * The search context for aaa
         *
         * @extends baseSearchContext
         * @Class aaaSearchContext
         */
        var aaaSearchContext = (function () {
            var constructor = function () {
                this.onToggleSearchOptions();
                this.onRequestResults();
                this.onPageLoad();
            };

            return constructor;
        })();

        aaaSearchContext.prototype = new BaseSearchContext();
        aaaSearchContext.prototype.renderResultItems = function (results, pageNum) {
        	var activeResult = App.Search.ActiveResult;
        	if (activeResult) {
        		results.remove(results.where({ id: activeResult.id }));
        		results.add(activeResult, { at: 0 });
        		App.Search.ActiveResult = null;
        	}

        	if (pageNum == 1 || App.Search.searchOptions.get("returnAllResults") || App.searchResultsRegion.currentView == undefined) {
        		App.searchResultsRegion.show(new AAAResultListView({ collection: results }));
        	}
        	else {
        		App.searchResultsRegion.currentView.collection.reset(App.searchResultsRegion.currentView.collection.models.concat(results.models));
        	}
        	this.getTourDetails(App.searchResultsRegion.currentView.collection);        
        };

        return aaaSearchContext;
    });