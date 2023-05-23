// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
'app',
'routers/searchRouter',
'controllers/searchController',
'routers/blogSearchRouter',
'routers/resultSearchRouter',
'collections/search/facets/TourFeatureCollection',
'collections/search/facets/FacetCollection',
'models/search/SearchSettingsModel',
'models/search/searchOptions/SearchOptionsModel',
'models/search/PerformSearchModel',
'renderedLayouts/search/facets/ActiveFiltersLayout',
'renderedLayouts/search/facets/LocationFilterLayout',
'renderedLayouts/search/facets/TourLengthRangeFilterLayout',
'renderedLayouts/search/facets/PriceRangeFilterLayout',
'renderedLayouts/search/facets/DateRangeFilterLayout',
'renderedLayouts/search/sortOptions/SearchHeaderLayout',
'views/search/results/SearchResultsCollectionLayout',
'util/searchOptionsUtil',
'event.aggregator'
],
function (App, SearchRouter, SearchController, BlogSearchRouter, ResultSearchRouter, TourFeatureCollection, FacetCollection,
SearchSettingsModel, SearchOptionsModel, PerformSearchModel, ActiveFiltersLayout,
LocationFilterLayout, TourLengthRangeFilterLayout, PriceRangeFilterLayout, DateRangeFilterLayout, SearchHeaderLayout, SearchResultsCollectionLayout, SearchOptionsUtil, EventAggregator) {
	var desktop = 992;

	App.module("Search", function () {
		var outerScope = this;
		this.startWithParent = false;

		App.addRegions({
			searchResultsRegion: "#searchResultView"
		});

		//a modules initializer runs when the module is started
		this.addInitializer(function () {
			//contains the settings for the search page
			//App.Search.searchSettings = new SearchSettingsModel();
			//object passed back to the search service with all params/filters
			App.Search.searchOptions = new SearchOptionsModel();
			//all of the facets that are passed back from the web service
			App.Search.facets = new FacetCollection();
			//the model used to fetch results/facets
			App.Search.performSearch = new PerformSearchModel();

			//features collection
			App.Search.tourFeatureCollection = new TourFeatureCollection();

			//we can set up multiple dependencies here, when will wait for all fetches to finish.
			if (App.isBlogSearch) {
				var templateId = $('body').data('template');

				switch (templateId) {
					case '{7AD9432A-32C9-4E49-89B2-61E5FCD70A4C}':
					case '{ABBAB320-08F7-4F92-A562-6078433009F0}':
						outerScope.appRouter = new ResultSearchRouter({
							controller: new SearchController()
						});
						break;
					default:
						outerScope.appRouter = new BlogSearchRouter({
							controller: new SearchController()
						});
						break;
				}
			} else {
				outerScope.appRouter = new SearchRouter({
					controller: new SearchController()
				});
			}

			$.when(outerScope.getSearchSettings)
			.done(function () {

				App.start();

			})
			.fail(function () {
				var $body = $('body');

				if ($body.length == 0) {
					console.log('could not find body element');
				}

				//var currentItemId = $body.data('current-item-id');

				$.ajax({
					type: "POST",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					url: '/Services/Search/SearchService.asmx/GetDefaultSettings',
					error: function (errorResponse) {
						console.log("Inside Failure");
						console.log(errorResponse.responseText);
					}
				})
				.done(function (response) {
					App.Search.searchSettings = new SearchSettingsModel(JSON.parse(response.d));
					App.start();
				});
			});

			if (App.isColletteSite) {
				if ($('header.page-header #ssortOptionsList').length > 0) {
					App.Search.searchHeaderLayout = new SearchHeaderLayout();
				}
			}
			else {
				if ($('header.page-header #sortOptionsList').length > 0) {
					App.Search.searchHeaderLayout = new SearchHeaderLayout();
				}
            }


			var filterModal = $(".search-filter-modal");
			var filterModalTriggers = $(".search-filter-modal-trigger");
			var applyFilterBtn = $(".apply-filter-btn");
			var filtersBtnDefaultText = App.dictionary.get('search.Filters', 'All Filters <i class="fa fa-caret-right" aria-hidden="true"></i>');
			// Need to filter out the empty/hidden inputs with no width
			var desktopFilter = $.grep($('.search-page-header').find('.multi-location-filter').find('input.default'), function (e) {
				return e.style.width != '';
			});
			var mobileFilter = $.grep($('.search-filter-modal').find('.multi-location-filter').find('input.default'), function (e) {
				return e.style.width != '';
			});
			var desktopFilterVal = '';
			var mobileFilterVal = '';

			var persistFilterContent = function() {
				if (!filterModal.hasClass('in')) { // on open modal
					if (desktopFilterVal != mobileFilterVal) {
						$(mobileFilter).val(desktopFilterVal);
					}
				} else { // on close modal
					if (mobileFilterVal != desktopFilterVal) {
						$(desktopFilter).val(mobileFilterVal);
					}
				}
			}

			filterModalTriggers.click(function () {
				desktopFilterVal = $(desktopFilter).val();
				mobileFilterVal = $(mobileFilter).val();
				persistFilterContent();
				applyFilterBtn.hide();
				filterModal.modal("toggle");
			});

			var screenUpdate = function () {
				SearchOptionsUtil.updateTourListClasses();

				if ($(window).width() >= desktop) {
					filterModal.modal("hide");
				}
			}

			// If the window is resized, close the filter view
			if ($.isFunction($(window).smartresize)) {
				$(window).smartresize(function() {
					screenUpdate();
				}).resize();
			}

			$(window).on("orientationchange", function () {
				screenUpdate();
			});
		});

		/**
		* Deferred object that gets the tour settings
		* from a hidden input. If it fails it falls back
		* to a service request
		*
		* @method getTourSettings
		*/
		var getSearchSettings = $.Deferred(function (defer) {

			//global variables should be defined here
			var $searchSettings = $('#searchSettingsJson');
			if ($searchSettings.length === 0) {
				console.log('could not find search settings element');
				defer.reject();
				return;
			}

			var searchSettings = $searchSettings.val();
			App.Search.searchSettings = new SearchSettingsModel($.parseJSON(searchSettings));
			defer.resolve();
		});
	});
});
