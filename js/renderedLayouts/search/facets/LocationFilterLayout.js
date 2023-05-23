define([
'domReady!',
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'collections/search/searchOptions/ParameterCollection',
'models/search/searchOptions/ParameterModel',
'collections/search/facets/ActiveFiltersCollection',
'views/search/facets/ActiveFiltersListView',
'util/objectUtil',
'util/uriUtil',
'goalsUtil',

], function (doc, $, _, Backbone, Marionette, EventAggregator, App, ParameterCollection, ParameterModel, ActiveFiltersCollection, ActiveFiltersListView, ObjectUtil, UriUtil, GoalsUtil) {
	var LocationFilterLayout = Backbone.Marionette.Layout.extend({
		el: $('.filter'),
		events: {
			'change #locationFilterInput': 'applyNewfilter',
			'keydown .chosen-container': 'enterHit'
		},
		initialize: function() {
			var outerScope = this;

			// Hides all placeholder text boxes
			$('.placeholderChosenInput').hide();

			$(".chosen-select").chosen({ disable_search_threshold: 10 });

			if (!this.isChosenSupported()) {
				$('.chosen-select').show();
			} else {
				$('.chosen-select').hide();
			}

			/* hide/show more filters button on mobile if filters modal is open/closed */
			$('#filterBar').on('shown.bs.modal', function() {
				$('.mobile-search-actions.affix-top').addClass('hidden-when-mobile-modal-open');
			});
			$('#filterBar').on('hide.bs.modal', function() {
				$('.mobile-search-actions.affix-top').removeClass('hidden-when-mobile-modal-open');
			})

			EventAggregator.on('requestResultsComplete',
				function () {
					outerScope.setLocationFilterItems();
				});
		},

		setLocationFilterItems: function () {
			var searchParameters = UriUtil.getUrlVars();
			var locationFilters = $('.filter').find('#locationFilterInput');
			var values = [];
			if (searchParameters.hasOwnProperty('continentnames')) {
				values = searchParameters['continentnames'].split(',');
			}
			if (searchParameters.hasOwnProperty('countrynames')) {
				var countries = searchParameters['countrynames'].split(',');
				_.each(countries,
					function(country) {
						values.push(country);
					});
			}
			if (searchParameters.hasOwnProperty('regionnames')) {
				var regions = searchParameters['regionnames'].split(',');
				_.each(regions,
					function (region) {
						values.push(region);
					});
			}
			if (searchParameters.hasOwnProperty('cities')) {
				var cities = searchParameters['cities'].split(',');
				_.each(cities,
					function (city) {
						values.push(city);
					});
			}

			$(locationFilters[0]).val(values);
			$(locationFilters[1]).val(values);
			$(locationFilters[0]).trigger("chosen:updated");
			$(locationFilters[1]).trigger("chosen:updated");

			$('.search-field input').blur();

		},

		applyNewfilter: function (e, selection) {
			e.stopPropagation();

			var target = $(e.currentTarget);
			if (target.length <= 0 || target.val() === undefined) {
				return;
			}

			var continents = [];
			var countries = [];
			var regions = [];
			var cities = [];

			var x = $('select[name="multilocation"] option:selected');
			x.each(function () {
				var loc = $(this).val();
				if ($(this).data('fieldname') == 'continentnames') {
					if (continents.indexOf(loc) == -1) {
						continents.push(loc);
					}
				}
				if ($(this).data('fieldname') == 'countrynames') {
					if (countries.indexOf(loc) == -1) {
						countries.push($(this).val());
					}
				}
				if ($(this).data('fieldname') == 'regionnames') {
					if (regions.indexOf(loc) == -1) {
						regions.push($(this).val());
					}
				}
				if ($(this).data('fieldname') == 'cities') {
					if (cities.indexOf(loc) == -1) {
						cities.push(loc);
					}
				}
			});
			this.updateSearchParams('continentnames', continents );
			this.updateSearchParams('countrynames', countries);
			this.updateSearchParams('regionnames', regions);
			this.updateSearchParams('cities', cities);
		},

		isChosenSupported: function () {
			if (/iP(od|hone)/i.test(window.navigator.userAgent)) {
				console.log("Set AbstractChosen.browser_is_supported & LocationFilterLayout.isChosenSupported to true for iPod/iPhone.");
				return true;
			}
			if (/Android/i.test(window.navigator.userAgent)) {
				if (/Mobile/i.test(window.navigator.userAgent)) {
					console.log("Set AbstractChosen.browser_is_supported & LocationFilterLayout.isChosenSupported to true for Android Mobile.");
					return true;
				}
			}
			if (/IEMobile/i.test(window.navigator.userAgent)) {
				return false;
			}
			if (/Windows Phone/i.test(window.navigator.userAgent)) {
				return false;
			}
			if (/BlackBerry/i.test(window.navigator.userAgent)) {
				return false;
			}
			if (/BB10/i.test(window.navigator.userAgent)) {
				return false;
			}
			if (window.navigator.appName === "Microsoft Internet Explorer") {
				return document.documentMode >= 8;
			}
			return true;
		},

		updateSearchParams: function (filterFieldname, values) {
			var parameterModel;
			var parameterCollection;

			var searchOptionsParams = App.Search.searchOptions.get('parameters');

			if (App.isBlogSearch) {
				parameterCollection = new ParameterCollection();
				parameterModel = new ParameterModel({ id: filterFieldname, values: [] });
				_.each(values, function (filtername) {
					parameterModel.get("values").push(filtername);
					parameterCollection.push(parameterModel);
				});

				searchOptionsParams = parameterCollection;
				App.Search.searchOptions.set({ parameters: searchOptionsParams });
			} else if (searchOptionsParams.length <= 0) {
				parameterCollection = new ParameterCollection();
				parameterModel = new ParameterModel({ id: filterFieldname, values: [] });
				_.each(values, function (filtername) {
					parameterModel.get("values").push(filtername);
					parameterCollection.push(parameterModel);
				});

				searchOptionsParams = parameterCollection;
				App.Search.searchOptions.set({ parameters: searchOptionsParams });
				//App.Search.searchOptions.set({ sortBy: 'locationlist' });
			} else {
				var fieldnameParameter = searchOptionsParams.findWhere({ id: filterFieldname });
				if (fieldnameParameter === undefined || fieldnameParameter === null) {
					parameterModel = new ParameterModel({ id: filterFieldname, values: [] });
					_.each(values, function (filtername) {
						parameterModel.get("values").push(filtername);
						searchOptionsParams.push(parameterModel);
					});
				} else {
					App.Search.searchOptions.get('parameters').get(filterFieldname).clear();
					parameterModel = new ParameterModel({ id: filterFieldname, values: [] });
					_.each(values, function (filtername) {
						parameterModel.get("values").push(filtername);
						searchOptionsParams.push(parameterModel);
					});
				}
				//App.Search.searchOptions.set({ sortBy: 'locationlist' });
			}
			var sortParam = App.Search.searchOptions.get('sortBy');
			if (ObjectUtil.isNullOrEmpty(sortParam) || sortParam == 'pageviewsbylanguage') {
				App.Search.searchOptions.set({ sortBy: 'locationlist' });
			}
			App.Search.searchOptions.set({ currentPage: 1 });
			UriUtil.updateSearchOptionsHash(searchOptionsParams);
		},

		enterHit: function(e) {
			if (e.keyCode == 13) {
				// Stop search event from triggering twice
				e.stopPropagation();
				e.preventDefault();
				var desktopFilterVal = $('.search-page-header').find('#multiLocationFilter').find('input').first().val();
				var mobileFilterVal = $('.search-filter-modal').find('#multiLocationFilter').find('input').first().val();

                if ((!ObjectUtil.isNullOrEmpty(desktopFilterVal) || !ObjectUtil.isNullOrEmpty(mobileFilterVal)) &&
                    !($('#multiLocationFilter').find('input').first().val().toLowerCase() == $('#multiLocationFilter').find('ul.chosen-results').first().find(".active-result").first().text().toLowerCase())) {  // If search result is highlighted then it shouldn't perform search on content
					var searchOptionsParams = App.Search.searchOptions.get('parameters');
					var parameterModel;
					var searchKeywords = '';
					// Set searchKeywords source (from main filter or modal filter)
					$('.search-filter-modal').hasClass('in') ? searchKeywords = mobileFilterVal : searchKeywords = desktopFilterVal;

                    var appliedSearchFilter = [];
                    var selectedSearchFilters = $('select[name="multilocation"] option:selected');
                    selectedSearchFilters.each(function () {                       
                        if ($(this).data('fieldname') == 'continentnames' || $(this).data('fieldname') == 'countrynames' || $(this).data('fieldname') == 'regionnames'
                            || $(this).data('fieldname') == 'cities') {
                            appliedSearchFilter.push($(this).val().toLowerCase().trim());
                        }
                    });

                    if (appliedSearchFilter.indexOf(searchKeywords.toLowerCase().trim()) == -1) { //Adding this condition to avoid search on already applied search filters.

                        if (searchOptionsParams.length <= 0) {
                            var parameterCollection = new ParameterCollection();
                            parameterModel = new ParameterModel({ id: "content", values: [] });
                            parameterModel.get("values").push(searchKeywords);
                            parameterCollection.push(parameterModel);

                            searchOptionsParams = parameterCollection;
                        } else {
                            var fieldnameParameter = searchOptionsParams.findWhere({ id: "content" });
                            if (fieldnameParameter !== undefined && fieldnameParameter !== null) {
                                if (App.Search.searchOptions.get('parameters').get("content").get("values").indexOf(searchKeywords) == -1) {
                                    App.Search.searchOptions.get('parameters').get("content").get("values").push(searchKeywords);
                                }
                            } else {
                                parameterModel = new ParameterModel({ id: "content", values: [] });
                                parameterModel.get("values").push(searchKeywords);
                                searchOptionsParams.push(parameterModel);
                            }
                        }

                        App.Search.searchOptions.set({ currentPage: 1 });

                        UriUtil.updateSearchOptionsHash(searchOptionsParams);
                    }
				}
			}
		}
	});

	return LocationFilterLayout;
});
