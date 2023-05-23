// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
'app',
'views/search/results/SearchResultsStaticCollectionLayout',
'models/search/PerformSearchModel',
'event.aggregator'
],
function (App, SearchResultsStaticCollectionLayout, PerformSearchModel, EventAggregator) {
	App.module("SearchStaticView", function () {
		var outerScope = this;
		//a modules initializer runs when the module is started
		this.addInitializer(function () {

			$(".staticResultsDataView").each(function() {
				var data = $(this).children('input').val();
				if (data != "") {
					var performSearch = new PerformSearchModel();
					performSearch.set($.parseJSON(data));					
					var searchparam = $(this).children("div[data-searchPanel]").data("searchparams");
					var rootElement = $(this).children("div[data-searchPanel]");
					var resultView = new SearchResultsStaticCollectionLayout({ "searchParams": searchparam, "performSearch": performSearch, "rootElement": rootElement });
					$(this).children("div[data-searchPanel]").html(resultView.render().el);

					//move it to layout if it would be map in correct way with region and etc
					var btn = $(this).children("div[data-searchPanel]").find("#viewMoreText");
					if (performSearch.results.length > 0) {
						btn.html(App.Search.searchSettings.get('viewMoreText'));
						btn.show();
						$(this).find(".section.padded[data-noresult='0']").hide();
					} else {
						$(this).children("div[data-searchPanel]").hide();
						btn.hide();
						$(this).find(".section.padded[data-noresult='0']").show();
					}
				} else {
					console.log("no data from static search");
				}
			});			
			
		});
		
	});
});