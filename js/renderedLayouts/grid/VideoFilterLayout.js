define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'event.aggregator',
		'models/search/searchOptions/VideoParameterModel',
		'collections/grid/VideoResultCollection',
		'extensions/marionette/views/RenderedLayout',
		'views/grid/VideoResultListView',
		'services/searchService',
		'models/search/PerformVideoSearchModel'
], function ($, _, Backbone, Marionette, App, EventAggregator, VideoParameterModel, VideoResultCollection, RenderedLayout, VideoResultListView, SearchService, PerformVideoSearchModel) {
	/**
	* @class videoFilterLayout
	* @extends RenderedLayout
	*/
	var videoFilterLayout = RenderedLayout.extend({
		el: '.video-filter',
		events: {
			'change .chosen-select': 'filterWithSelections',
			'keyup #searchTerm': 'searchActionPerformed',
			'click #videoSearchButton': 'filterWithSelections',
			'hidden.bs.collapse #video-filter-options': 'showFilterOptionsText',
			'show.bs.collapse #video-filter-options': 'hideFilterOptionsText'
		},
		//Initialize - apply chosen dropdowns,
		//check query strings, bind the "View More" button
		initialize: function () {
			var outerScope = this;
			this.filterWithQueryString();
			this.applyChosenDropdowns();
			this.incrementPage();

			//When the search results come back, render the results
			EventAggregator.on('videoSearchComplete', function (model) {
				outerScope.renderVideoList(model);
				outerScope.loadDynamicOptions(model);
			});
		},
		//Renders a video list with the given a model of results
		renderVideoList: function (model) {
			$(".result-list .result-list-item").remove();

			if (model.results.length > 0) {
				$("#noSearchResults").css('display', 'none');
				var videoResultListView = new VideoResultListView({ collection: model.results });
				videoResultListView.render();
				$(".result-list").append(videoResultListView.el);
			} else {
				$("#noSearchResults").css('display', 'block');
				model.allresults.models = model.allresults.models.slice(0, Math.min(model.allresults.length, model.get("currentPage") * 6));
				var allVideoResultListView = new VideoResultListView({ collection: model.allresults });
				allVideoResultListView.render();
				$(".result-list").append(allVideoResultListView.el);
			}

			this.setViewMoreVisibility(model);
			$("#viewMoreText").data("page", model.get("currentPage").toString());
			this.setResultsText(model.get("totalResults"));
		},
		//Increments the page so that additional results are shown
		incrementPage: function () {
			var outerScope = this;
			$("#viewMoreText").on('click', function (e) {
				e.preventDefault();
				var currentPage = $(this).data("page");
				var newPage = Number(currentPage) + 1;
				$("#viewMoreText").data("page", newPage.toString());
				outerScope.filterWithSelections();
			});
		},
		setResultsText: function (results) {
			if (results == 1) {
				$("#results").text(results + " " + App.dictionary.get('search.Result'));
			} else {
				$("#results").text(results + " " + App.dictionary.get('search.Results'));
			}
		},
		//Makes the "View More" button invisible depending on the number of results
		setViewMoreVisibility: function (model) {
			if (model.get("totalResults") == 0 && model.allresults.models.length < model.get("allResultsCount")) {
				$("#viewMoreText").show();
			} else if (model.results.length < model.get("totalResults")) {
				$("#viewMoreText").show();
			} else {
				$("#viewMoreText").hide();
			}
		},
		searchActionPerformed: function (e) {
			//If the user presses enter, search
			if (e != undefined && _.has(e, "keyCode") && e.keyCode == 13) {
				this.filterWithSelections(e);
			}
		},
		//Gets the user's selections and asks the back end for results
		filterWithSelections: function (e) {
			if (e != undefined) {
				$("#viewMoreText").data("page", 1);
			}

			var continentSelection = $("#continents").chosen().val();
			var countrySelection = $("#countries").chosen().val();
			var categorySelection = $("#categories").chosen().val();
			var currentPage = $("#viewMoreText").data("page");
			var searchTerm = $("#searchTerm").val();

			var videoParameterModel = new VideoParameterModel({
				countries: countrySelection,
				continents: continentSelection,
				categories: categorySelection,
				currentPage: currentPage,
				searchTerm: searchTerm
			});
			this.addQueryString(videoParameterModel);
			SearchService.requestVideoSearchResults(videoParameterModel);
			return true;
		},
		showFilterOptionsText: function () {
			$("#videoFilterOptionsButton").text(App.dictionary.get('common.Page_Components.Show_Filtering_Options'));
		},
		hideFilterOptionsText: function () {
			$("#videoFilterOptionsButton").text(App.dictionary.get('common.Page_Components.Hide_Filtering_Options'));
		},
		//Get the query strings from the URL and ask the back end for results
		filterWithQueryString: function () {
			var queryString = this.getQueryString();

			if (!queryString) {
				this.showDefaultVideoResults();
			}
			else {
				var videoParameterModel = new VideoParameterModel(queryString);
				SearchService.requestVideoSearchResults(videoParameterModel);
			}
		},
		//After a user makes a selection, adjust the query string in the URL
		addQueryString: function (videoParameterModel) {
			var url = window.location.href;
			var outerScope = this;
			url = url.substring(0, url.indexOf('#q/'));

			_.each(videoParameterModel.attributes, function (val, key) {
				if (val != undefined && val.length != 0 && key != "site") {
					if (outerScope.added) { url += "&"; } else { url += "#q/"; };
					outerScope.added = true;
					url += key + "=" + encodeURIComponent(val);
				}
			});
			window.history.pushState({ path: url }, '', url);
			outerScope.added = false;
		},
		//Get the query parameters from the URL
		getQueryString: function (queryString) {
			var outerScope = this;
			var query = (queryString || window.location.hash).substring(3);
			if (!query) {
				return false;
			}
			return _
				.chain(query.split('&'))
				.map(function (params) {
					var selected = '';
					var p = params.split('=');
					//SearchTerm and currentPage are not arrays, we don't want to split them
					if (p[0] == "searchTerm" || p[0] == "currentPage")
						selected = decodeURIComponent(p[1]);
					else
						selected = decodeURIComponent(p[1]).split(",");
					outerScope.makeChosenSelection(p[0], selected);
					return [p[0], selected];
				})
				.object()
				.value();
		},
		//Selects the value in a dropdown with id #key
		makeChosenSelection: function (key) {
			$("#" + key).trigger("chosen:updated");
		},
		//Apply the harvet JS plugin to the dropdown menus
		applyChosenDropdowns: function () {
			$(".chosen-select").chosen({
				no_results_text: App.dictionary.get('common.Page_Components.No_Filter_Results'),
				width: "100%"
			});
		},
		//Loads available continents, countries and categories into the filter dropdowns
		loadDynamicOptions: function (model) {
			var outerScope = this;
			var videoParameterModel = new VideoParameterModel(outerScope.getQueryString());

			if (videoParameterModel.attributes.searchTerm.length > 0) {
				$('#searchTerm').val(videoParameterModel.attributes.searchTerm.toString());
			}

			if ($("#continents option").length == 0) {
				_.each(outerScope.getContinents(model), function (continent) {
					$("#continents").append('<option value="' + continent + '">' + continent + '</option>');
					if (videoParameterModel.attributes.continents.indexOf(continent) != -1) {
						$("#continents").val(continent);
						$("#video-filter-options").collapse('show');
					}
				});
			}

			if ($("#countries option").length == 0) {
				$.each(outerScope.getCountries(model), function (key, value) {
					var htmlString = '<optgroup id="country-optgroup-' + key + '" label="' + key + '">';
					_.each(value, function (country) {
						if (videoParameterModel.attributes.countries.indexOf(country) != -1) {
							var isSelected = ' selected';
							$("#video-filter-options").collapse('show');
						}
						htmlString += '<option value="' + country + '"' + (isSelected || '') + '>' + country + '</option>';
					});
					$("#countries").append(htmlString);
				});
			}

			if ($("#categories option").length == 0) {
				_.each(outerScope.getCategories(model), function (category) {
					$("#categories").append('<option value="' + category + '">' + category + '</option>');
					if (videoParameterModel.attributes.categories.indexOf(category) != -1) {
						$("#categories").val(category);
						$("#video-filter-options").collapse('show');
					}
				});
			}
			$(".chosen-select").trigger("chosen:updated");
		},
		getCategories: function (model) {
			var categories = [];
			_.chain(model.attributes.allResults)
				.map(function (video) { return video.categories; })
					.each(function (x) { categories = _.uniq(categories.concat(x)); }).compact();
			return categories;
		},
		getContinents: function (model) {
			var continents = [];
			_.chain(model.attributes.allResults)
				.map(function (video) { return video.continents; })
					.each(function (x) { continents = _.uniq(continents.concat(x)); }).compact();
			return continents.sort();
		},
		getCountries: function (model) {
			var pairsArr = [];
			_.chain(model.attributes.allResults)
				.map(function (video) { return video.continentCountriesPair; })
					.each(function (x) { pairsArr = _.uniq(pairsArr.concat(x)); }).compact();

			var pairsObj = {};
			for (var i = 0; i < pairsArr.length; i++) {
				for (var value in pairsArr[i]) {
					var continent = value.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
					pairsObj[continent] = _.compact(_.union(pairsObj[continent], pairsArr[i][value])).sort();
				}
			}

			var continentCountriesPairs = {};
			Object.keys(pairsObj).sort().forEach(function (v) {
				continentCountriesPairs[v] = pairsObj[v];
			});
			return continentCountriesPairs;
		},

		showDefaultVideoResults: function () {
			var $results = $('#defaultVideoResults');
			if ($results.length === 0) {
				SearchService.requestVideoSearchResults(new VideoParameterModel(getQueryString()));
				return;
			}
			var performVideoSearch = new PerformVideoSearchModel();
			performVideoSearch.set($.parseJSON($results.val()));

			this.renderVideoList(performVideoSearch);
			this.loadDynamicOptions(performVideoSearch);
		}
	});
	return videoFilterLayout;
});