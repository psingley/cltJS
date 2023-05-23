define([
'domReady',
'app',
'jquery',
'backbone',
'marionette',
'event.aggregator',
'util/searchOptionsUtil',
'services/searchService',
'util/timeoutUtil',
'objects/factories/searchContextFactory',
'models/search/PerformSearchModel',
'renderedLayouts/pageComponent/OffersModalLayout'
],
function (domReady, App, $, Backbone, Marionette, EventAggregator, SearchOptionsUtil, SearchService, TimeoutUtil, SearchContextFactory, PerformSearchModel, OffersModalLayout) {
	/**
	* This class is responsible for instantiating the
	* right search context and handling the routes
	*
	* @class searchController
	*/
	return Backbone.Marionette.Controller.extend({
		initialize: function () {
			var siteId = App.siteSettings.siteId;
			var searchContextFactory = new SearchContextFactory({ siteId: siteId });

			/**
			* this is used for setting the delay on the search
			* it needs to be declared up there so it doesn't create a new instance of the
			* class every time the url is changed
			*
			* @property timeoutUtil
			* @type {util.timeoutUtil}
			*/
			this.timeoutUtil = new TimeoutUtil();
			App.OffersModal = new OffersModalLayout();
		},
		/**
		* This method responds to the routes defined in the seach router class
		* @method performSearch
		* @return void
		*/
		performSearch: function () {
			var outerScope = this;
			if(window.location.href.indexOf("find-your-tour") > -1) {
				App.Search.searchOptions.set({ bypassLoadingModal: true });	
			}
			if (App.Search.searchOptions.get('bypassLoadingModal') == null || App.Search.searchOptions.get('bypassLoadingModal') === false) {
				SearchOptionsUtil.startLoadingAnimation();
			}
			App.Search.searchOptions.set({ bypassLoadingModal: false });

			$.when(App.dictionary.getDictionaries()).done(function () {
				var currentItemId = App.siteSettings.currentItemId;
				//if search settings are undefined
				if (App.Search.searchOptions.get('currentItemId') == null) {

					var settingsParams = { currentItemId: currentItemId };

					SearchOptionsUtil.setUrlSearchOptions(currentItemId);
					//once the search options are set we need to trigger an event to update
					//all of the facets in the sidebar
					EventAggregator.trigger('setSearchOptionsComplete');
				}
				outerScope.timeoutUtil.suspendOperation(
				App.Search.searchSettings.get('searchDelayInMilliseconds'),
				function () {
					SearchOptionsUtil.setUrlSearchOptions(currentItemId);
				},
				function () {
					if (App.isBlogSearch) {
						SearchService.requestBlogResults(App.Search.searchOptions);
					} else {
						
						if (!App.Search.firstLoad){
							App.Search.firstLoad = true;
							SearchService.requestSearchResults(App.Search.searchOptions, true);
						}
						else {
							SearchService.requestSearchResults(App.Search.searchOptions, App.Search.searchOptions.get("currentPage") == 1);
						}

					}
				}
				);
			});
		},

		showDefaultResults: function () {
				var performSearch;

				var deferred = $.Deferred(function (defer) {
					var $results = $('#defaultSearchResults');

					if ($results.length === 0) {
						console.log('could not find default search results element');
						defer.reject();
						return;
					}

					var val = $('#defaultSearchResults').val();

					if (!val) {
						console.log('no returned json document for default search');
						defer.reject();
						return;
					}

					if (val.indexOf("\"results\":[]") > -1) {
						console.log('results collection is empty');
						defer.reject();
						return;
					}

					performSearch = new PerformSearchModel($.parseJSON($results.val()));
					defer.resolve();
				});


				//public instance variable
				this.getDefaultSearchResults = function () {
					return deferred.promise();
				};

				function completeSearch(performSearch) {
					var currentItemId = App.siteSettings.currentItemId;
					SearchOptionsUtil.setUrlSearchOptions(currentItemId);
					EventAggregator.trigger('requestResultsComplete', performSearch);
				}

				$.when(this.getDefaultSearchResults())
					.done(function () {
						completeSearch(performSearch);
					})
					.fail(function () {
						SearchOptionsUtil.startLoadingAnimation();
						//reloading of default search results

						//set timeout to provide our server-side possibility to restore indexes for reading in case of error
						setTimeout(function () {
							$.ajax({
								type: "GET",
								url: "/Services/Search/SearchService.asmx/GetDefaultSearchTours?currentItemId=" +
									App.siteSettings.currentItemId,
								success: function (response) {

									if (response != null && response.results.length === 0) {
										console.log('retrying of default tour search returns empty results');
									}

									if (response != null && response === "") {
										performSearch = new PerformSearchModel("");
									} else {
										var $results = $('#defaultSearchResults');
										$results.val(JSON.stringify(response));
										performSearch = new PerformSearchModel(response);
									}

									completeSearch(performSearch);
								}
							})
								.done(function () {
									SearchOptionsUtil.endLoadingAnimation();
								})
								.fail(function () {
									SearchOptionsUtil.endLoadingAnimation();

									console.log('retrying of default tour search ajax error');

									performSearch = new PerformSearchModel("");
									completeSearch(performSearch);
								});
						}, 1500);
					});
		},
		getPreviousNextResult: function() {
			var outerScope = this;
			console.log("performBlogSearch fired.");

			$.when(App.dictionary.getDictionaries()).done(function () {
				var currentItemId = App.siteSettings.currentItemId;
				//if search settings are undefined
				if (App.Search.searchOptions.get('currentItemId') == null) {
					SearchOptionsUtil.setUrlBlogOptions(currentItemId);
					//once the search options are set we need to trigger an event to update
					//all of the facets in the sidebar
					EventAggregator.trigger('setSearchOptionsComplete');
				}
				outerScope.timeoutUtil.suspendOperation(
				1000,
				function () {
					SearchOptionsUtil.setUrlBlogOptions(currentItemId);
				},
				function () {
					var templateId = $('body').data('template');

					switch (templateId) {
						case '{7AD9432A-32C9-4E49-89B2-61E5FCD70A4C}':
						case '{ABBAB320-08F7-4F92-A562-6078433009F0}':
							App.Search.searchOptions.set({ returnAllResults: true });
							App.Search.searchOptions.set({ getPreviousNext: true });
							SearchService.requestPreviousNext(App.Search.searchOptions);
							break;
						default:
							console.log("getPreviousNextResult fired on an unsupported template.");
							break;
					}
				});
			});
		},
		performBlogSearch: function () {
			if (App.Search.searchOptions.get('bypassLoadingModal') == null || App.Search.searchOptions.get('bypassLoadingModal') === false) {
				SearchOptionsUtil.startLoadingAnimation();
			}
			var outerScope = this;
			console.log("performBlogSearch fired.");

			$.when(App.dictionary.getDictionaries()).done(function () {
				var currentItemId = App.siteSettings.currentItemId;
				//if search settings are undefined
				if (App.Search.searchOptions.get('currentItemId') == null) {

					var settingsParams = { currentItemId: currentItemId };

					SearchOptionsUtil.setUrlBlogOptions(currentItemId);
					//once the search options are set we need to trigger an event to update
					//all of the facets in the sidebar
					EventAggregator.trigger('setSearchOptionsComplete');
				}
				outerScope.timeoutUtil.suspendOperation(
				1000,
				function () {
					SearchOptionsUtil.setUrlBlogOptions(currentItemId);
				},
				function () {
					var templateId = $('body').data('template');

					switch (templateId) {
						case '{7AD9432A-32C9-4E49-89B2-61E5FCD70A4C}':
						case '{ABBAB320-08F7-4F92-A562-6078433009F0}':
							App.Search.searchOptions.set({ returnAllResults: true });
							App.Search.searchOptions.set({ getPreviousNext: true });
							SearchService.requestPreviousNext(App.Search.searchOptions);
							break;
						default:
							SearchService.requestBlogResults(App.Search.searchOptions);
							break;
					}
				});
			});
		},

		showDefaultBlogResults: function () {
			var deferred = $.Deferred(function (defer) {
				var $results = $('#defaultSearchResults');
				if ($results.length === 0) {
					console.log('could not find default search results element');
					defer.reject();
					return;
				}
				if ($results.val() != "") {
					performSearch = new PerformSearchModel($.parseJSON($results.val()));
				} else {
					console.log('no default search at search results element');
					defer.reject();
				}
				defer.resolve();
			});

			//public instance variable
			this.getDefaultSearchResults = function () {
				return deferred.promise();
			};

			$.when(this.getDefaultSearchResults()).done(function () {
				var currentItemId = App.siteSettings.currentItemId;
				SearchOptionsUtil.setUrlBlogOptions(currentItemId);

				EventAggregator.trigger('requestResultsComplete', performSearch);
			});
		}
	});
});