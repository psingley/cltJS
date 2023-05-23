define([
'domReady',
'app',
'jquery',
'backbone',
'marionette',

'objects/search/context/baseSearchContext',
'views/search/results/BlogResultsCollectionLayout',
'renderedLayouts/blogNews/BlogPostLayout',
'renderedLayouts/search/facets/DropdownFilterLayout',
'renderedLayouts/search/facets/LocationFilterLayout',
'renderedLayouts/search/facets/BlogTagsFacetLayout',
'event.aggregator'
],
function (domReady, App, $, Backbone, Marionette,
	BaseSearchContext, BlogResultsCollectionLayout, BlogPostLayout, DropdownFilterLayout, LocationFilterLayout, BlogTagsFacetLayout, EventAggregator) {
	/**
	* The search context for blog
	*
	* @extends baseSearchContext
	* @Class blogSearchContext
	*/
	var blogSearchContext = (function () {
		var constructor = function () {
			this.onToggleSearchOptions();
			this.onRequestResults();
			this.onPageLoad();
			this.setBlogPostLayout();
		};

		return constructor;
	})();

	blogSearchContext.prototype = new BaseSearchContext();

	blogSearchContext.prototype.setLocationFilterLayout = function () {
		var locationFilterLayout = new LocationFilterLayout();
	};

	blogSearchContext.prototype.setDropDownFilterLayout = function () {
		var dropdownFilterLayout = new DropdownFilterLayout();
	};

	blogSearchContext.prototype.setBlogPostLayout = function () {
		var blogPostLayout = new BlogPostLayout();
	};
	blogSearchContext.prototype.setBlogTagsFacetLayout = function () {
		var blogTagsFacetLayout = new BlogTagsFacetLayout();
	};

	blogSearchContext.prototype.onPageLoad = function () {
		var outerScope = this;

		domReady(function () {
			outerScope.setLocationFilterLayout();
			outerScope.setDropDownFilterLayout();
			outerScope.setBlogTagsFacetLayout();
		});
	};

	blogSearchContext.prototype.renderResultItems = function (blogResults, options) {
		var pageNum = options.get("currentPage");

		if (pageNum == 1 || App.Search.searchOptions.get("returnAllResults") || App.searchResultsRegion.currentView == undefined) {
			App.searchResultsRegion.show(new BlogResultsCollectionLayout({ collection: blogResults, searchOptions: options }));
		}
		else {
			App.searchResultsRegion.currentView.collection.reset(App.searchResultsRegion.show(new BlogResultsCollectionLayout({ collection: blogResults, searchOptions: options })));
		}
	};

	blogSearchContext.prototype.onRequestResults = function () {
		var outerScope = this;
		/**
		* Fired when results have come back from the server
		*
		* @event requestResultsComplete
		* @param {Backbone.Model} a backbone model that receives and parses the data
		*/
		EventAggregator.on('requestResultsComplete', function (performSearch) {
			App.Search.performSearch = performSearch;

			outerScope.renderFacets(performSearch.get("facets"));

			if (performSearch) {
				outerScope.renderResultItems(performSearch.get("blogResults"), performSearch.get("options"));
			}

			//get the search query passed into the page and update the search text box
			var content = App.Search.searchOptions.get('content');
		});
	};

	return blogSearchContext;
});