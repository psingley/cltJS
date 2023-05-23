define([
'jquery',
'underscore',
'backbone',
'moment',
'collections/search/searchOptions/ParameterCollection',
'util/uriUtil',
'util/animationUtil',
'models/search/searchOptions/ParameterModel',
'app',
'event.aggregator',
'util/objectUtil',
'util/stringUtil',
'renderedLayouts/search/sortOptions/buttons/FacetsVisibilityButton'
], function ($, _, Backbone, Moment, ParameterCollection, UriUtil, AnimationUtil, ParameterModel, App, EventAggregator, ObjectUtil, StringUtil, FacetsVisibilityButton) {
	var searchOptionsUtil = {
		//since we only need filter field names to be calculated once
		//set up variable to hold data
		filterFieldNames: new Array(),
		switchOptionList: function () {
			//let s = App.isColletteSite ? "#ssortOptionsList" : "#sortOptionsList";
			var s;
			if (App.isColletteSite) {
				s = "#ssortOptionsList";
			}
			else{
				s = "#sortOptionsList";
            }
			return s;
        },
		getFacets: function () {
			//create an object we can append properties to
			var facetItems = new Object();
			//todo add filterType logic
			$(".filter[data-field]").each(function (el, idx) {
				//getting selected values
				var facetSelectedValues = $(this).find('input:checked').map(function () {
					return $(this).val();
				});
				if (facetSelectedValues.length > 0) {
					facetItems[$(this).attr("id")] = facetSelectedValues.toArray().toString();
				}
			});
			return facetItems;
		},
		getDepartureDates: function () {
			var obj = {};

			var startDate = '';
			var endDate = '';

			var searchOptionsParams = App.Search.searchOptions.get('parameters');
			if (searchOptionsParams != null && searchOptionsParams.length > 0) {
				var startParams = searchOptionsParams.findWhere({ id: App.startDateFacet });
				if (startParams != null && startParams.get('values') !== undefined) {
					startDate = startParams.get('values')[0];
				}

				var endParams = searchOptionsParams.findWhere({ id: App.endDateFacet });
				if (endParams != null && endParams.get('values') !== undefined) {
					endDate = endParams.get('values')[0];
				}
			}

			if (endDate != '') {
				obj[App.endDateFacet] = endDate;
			}

			if (startDate != '') {
				obj[App.startDateFacet] = startDate;
			}

			return obj;
		},
		getCountries: function () {
			var obj = {};

			var searchOptionsParams = App.Search.searchOptions.get('parameters');
			if (searchOptionsParams != null && searchOptionsParams.length > 0) {
				var countryParams = searchOptionsParams.findWhere({ id: App.countryFacet });
				if (countryParams != null && countryParams.get('values') !== undefined) {
					var countries = countryParams.get('values');

					if (countries != null && countries.length > 0) {
						obj[App.countryFacet] = countries;
					}
				}
			}

			return obj;
		},
		getContinents: function () {
			var obj = {};

			var searchOptionsParams = App.Search.searchOptions.get('parameters');
			if (searchOptionsParams != null && searchOptionsParams.length > 0) {
				var continentParams = searchOptionsParams.findWhere({ id: App.continentFacet });
				if (continentParams != null && continentParams.get('values') !== undefined) {
					var continents = continentParams.get('values');

					if (continents != null && continents.length > 0) {
						obj[App.continentFacet] = continents;
					}
				}
			}

			return obj;
        },
        getCities: function () {
            var obj = {};

            var searchOptionsParams = App.Search.searchOptions.get('parameters');
            if (searchOptionsParams != null && searchOptionsParams.length > 0) {
                var citiesParams = searchOptionsParams.findWhere({ id: App.cities });
                if (citiesParams != null && citiesParams.get('values') !== undefined) {
                    var cities = citiesParams.get('values');

                    if (cities != null && cities.length > 0) {
                        obj[App.cities] = cities;
                    }
                }
            }

            return obj;
		},
		getHighlights: function () {
			var obj = {};

			var searchOptionsParams = App.Search.searchOptions.get('parameters');
	
			if (searchOptionsParams != null && searchOptionsParams.length > 0) {
				var highlightsParams = searchOptionsParams.findWhere({ id: 'highlights' });
				if (highlightsParams != null && highlightsParams.get('values') !== undefined) {
					var highlights = highlightsParams.get('values');

					if (highlights != null && highlights.length > 0) {
						obj[App.highlights] = highlights;
					}
				}
			}

			return obj;
		},
        getRegion: function () {
            var obj = {};

            var searchOptionsParams = App.Search.searchOptions.get('parameters');
            if (searchOptionsParams != null && searchOptionsParams.length > 0) {
                var regionParams = searchOptionsParams.findWhere({ id: App.regionFacet });
                if (regionParams != null && regionParams.get('values') !== undefined) {
                    var region = regionParams.get('values');

                    if (region != null && region.length > 0) {
                        obj[App.regionFacet] = region;
                    }
                }
            }

            return obj;
        },
        getContent: function () {
            var obj = {};

            var searchOptionsParams = App.Search.searchOptions.get('parameters');
            if (searchOptionsParams != null && searchOptionsParams.length > 0) {
                var contentParams = searchOptionsParams.findWhere({ id: App.content });
                if (contentParams != null && contentParams.get('values') !== undefined) {
                    var content = contentParams.get('values');
                    if (content != null && content.length > 0) {
                        obj[App.content] = content;
                    }
                }
            }

            return obj;
        },
		getSearchTxt: function () {

			var result = $(".nav-search__input").map(function () {
				return $(this).val() === "" ? null : $(this).val();
			});

			if (result.length) {
				return {
					content: StringUtil.protectSpecialSymbols(result[0])
			};
			}

			return {};
		},

		clearSearchInputs: function () {
			if ($(".search .search-box:visible").length > 0) {
				$(".search .search-box:visible").each(function () {
					$(this).val('');
				});
			} else {
				//mobile input could be hidden on first page load
				$("#search-collapse .search .search-box").each(function () {
					$(this).val('');
				});
			}
		},

		setSearchContentToInputElements: function (value) {
			if ($(".search .search-box:visible").length > 0) {
				$(".search .search-box:visible").each(function() {
					$(this).val(value);
				});
			} else {
				//mobile input could be hidden on first page load
				$("#search-collapse .search .search-box").each(function () {
					$(this).val(value);
				});
                if ($("#interval-search-collapse").length > 0) {
                    $("#interval-search-collapse .search .search-box").each(function () {
                        $(this).val(value);
                    });
                }
			}
		},

		getSearchInputValue: function () {
			//it is possible to have 2 search input box on page
			//searching for first one with no empty value
			//open question about if 2 input contains some values,
			//old logic return first element current one as well
			var result = $(".nav-search__input").map(function () {
				return $(this).val() === "" ? null : $(this);
			});

			if (result.length > 0) {
				if (result[0] != null) {
					return result[0].val();
				}
			}

			return null;
		},
		getPriceRange: function () {
			var obj = {};

			var searchOptionsParams = App.Search.searchOptions.get('parameters');
			if (searchOptionsParams != null && searchOptionsParams.length > 0) {
				var priceParams = searchOptionsParams.findWhere({ id: App.priceFacet });
				if (priceParams != null && priceParams.get('values') !== undefined) {
					var priceRange = priceParams.get('values');

					// Price parameter must have no less than two values to be considered valid
					if (priceRange != null && priceRange.length >= 2) {
						obj[App.priceFacet] = priceRange;
					}
				}
			}

			return obj;
		},
		getTourLength: function () {
			var obj = {};

			var searchOptionsParams = App.Search.searchOptions.get('parameters');
			if (searchOptionsParams != null && searchOptionsParams.length > 0) {
				var tourLengthParams = searchOptionsParams.findWhere({ id: App.dayLengthFacet });
				if (tourLengthParams != null && tourLengthParams.get('values') !== undefined) {
					var tourLength = tourLengthParams.get('values');

					// Price parameter must have no less than two values to be considered valid
					if (tourLength != null && tourLength.length >= 2) {
						obj[App.dayLengthFacet] = tourLength;
					}
				}
			}

			return obj;
		},
		getSortOptions: function () {
			var s = this.switchOptionList();
			var sortOption = $(`${s}`).find(':selected');
			return { sortBy: sortOption.data('sort-id'), sortDirection: sortOption.data('sort-direction') };
		},

		getSortOptionsByElmSelector: function (elm) {
			var sortOption = $(elm).find(':selected');
			return { sortBy: sortOption.data('sort-id'), sortDirection: sortOption.data('sort-direction') };
		},

		getFilterFieldNames: function () {
			if (this.filterFieldNames.length <= 0) {
				var outerScope = this;
				$(".filter[data-field]").each(function (el, idx) {
					var facet = $(this).attr("id");
					outerScope.filterFieldNames.push(facet);
				});
				outerScope.filterFieldNames.push("highlights");
			}
			return this.filterFieldNames;
		},
		getSearchUrl: function (target) {
			if (App.isColletteSite) {
				return $('.nav-search').data('url');
			}
			else {
				var searchButton = $('.search_button');

				if (target != null && $(target).hasClass("search_button")) {
					searchButton = target;
				} else if (target != null) {
					searchButton = $(target).parent().find(".search_button");
				}

				if (searchButton != null && $(searchButton).length > 0) {
					return $(searchButton).data('url');
				}
				return null;
			}
		},
		getSelectedCountry: function () {
			var country = $('#countryDropDown option:selected');
			if (!$(country).isNullOrEmpty()) {
				return { countrynames: country.val() };
			}

			return {};
		},
		getSelectedContinent: function () {
			var continent = $('#continentDropDown option:selected');
			if (!$(continent).isNullOrEmpty()) {
				return { continentnames: continent.val() };
			}

			return {};
		},
        getParameterModelsFromUrl: function (url) {
            if (ObjectUtil.isNullOrEmpty(url)) {
                return null;
            }
            var index = url.indexOf("#q/");
            if (index < 0) {
                return null;
            }
            var parameterModels = [];
            index = index + 3;
            url = url.substring(index);
            var paramValuePair = url.split('&');
            for (var i = 0; i < paramValuePair.length; i++) {
                var value = paramValuePair[i].split("=");
                if (value == null || value.length !== 2) {
                    continue;
                }
                var parameterModel = new ParameterModel({
                    id: value[0],
                    values: [value[1]]
                });
                parameterModels.push(parameterModel);
            }

            return parameterModels;

        },

		setUrlBlogOptions: function (currentItemId) {
			var urlVars = UriUtil.getUrlVars();
			var filterFieldNames = this.getFilterFieldNames();

			App.Search.searchOptions.set({ filterFieldNames: filterFieldNames });
			App.Search.searchOptions.set({ currentItemId: currentItemId });
			App.Search.searchOptions.set({ resultsOnFirstPage: 9 });
			App.Search.searchOptions.set({ numberOfAdditionalResultsPerPage: 9 });
			App.Search.searchOptions.set({ returnAllResults: false });

			if (urlVars.currentPage !== undefined && urlVars.currentPage !== '') {
				App.Search.searchOptions.set({ currentPage: urlVars.currentPage });
			} else {
				App.Search.searchOptions.set({ currentPage: 1 });
			}

			if (urlVars.content !== undefined && urlVars.content !== '') {
				urlVars.content = urlVars.content.replace(/\s+/g, ',').toLowerCase();
			}

			//delete these so we can loop the the rest and add them as facet parameters
			delete urlVars.sortBy;
			delete urlVars.sortDirection;
			delete urlVars.currentPage;

			var parameters = new ParameterCollection();
			//loop through all of the variables in this object
			for (var facet in urlVars) {
				if (urlVars[facet] !== undefined) {
					var id = facet;
					var value = urlVars[facet];

					parameters.add(new ParameterModel({ id: id, values: value.split(',') }));
				}
			}

			var parent = $('#postParentId').val();
			if (parent) {
				parameters.add(new ParameterModel({ id: App.parent, values: [parent.replace(/[- }{(]/g, '').toLowerCase()] }));
			} else {
				parameters.add(new ParameterModel({ id: App.parent, values: [currentItemId.replace(/[- }{(]/g, '').toLowerCase()] }));
			}

			App.Search.searchOptions.set({ parameters: parameters });
		},
		setUrlSearchOptions: function (currentItemId) {
			var urlVars = UriUtil.getUrlVars();
			var filterFieldNames = this.getFilterFieldNames();

			App.Search.searchOptions.set({ filterFieldNames: filterFieldNames });
			App.Search.searchOptions.set({ currentItemId: currentItemId });
			//set the key for caching on server side
			App.Search.searchOptions.set({ key: location.hash });

            var sortValue = "";
            var isSortByAssigned = false;
			if (urlVars.sortBy !== undefined) {
				sortValue = urlVars.sortBy;
			}
            if (sortValue == "") {
				isSortByAssigned = true;
				var s = this.switchOptionList();
				sortValue = $(`${s} option:selected`).data("sort-id");
			}
			App.Search.searchOptions.set({ sortBy: sortValue });

			var sortdv = "";

			if (urlVars.sortDirection !== undefined && urlVars.sortDirection !== '') {
				sortdv = urlVars.sortDirection;
			}            
			if (sortdv == "") {
				var s = this.switchOptionList();
				sortdv = $(`${s} option:selected`).data("sort-direction");
			}
			App.Search.searchOptions.set({ sortDirection: sortdv });

            if (isSortByAssigned) {
				urlVars.sortBy = sortValue;
				var s = this.switchOptionList();
                urlVars.sortDirection = $(`${s} option:selected`).data("sort-direction");
                App.Search.searchOptions.set({ sortDirection: urlVars.sortDirection });
                this.filterButton = new FacetsVisibilityButton();
                var facets = this.filterButton.getButtonStateObj();
                urlVars["showFacets"]= facets.showFacets;
                //App.Search.searchOptions.set({ key: UriUtil.serializeUrl(urlVars) });
            }
			if (urlVars.currentPage !== undefined && urlVars.currentPage !== '') {
				App.Search.searchOptions.set({ currentPage: urlVars.currentPage });
			}

			if (urlVars.content !== undefined && urlVars.content !== '') {
				App.Search.searchOptions.set({ content: urlVars.content });
			} else {
				App.Search.searchOptions.set({ content: '' });
			}

			//delete these so we can loop the the rest and add them as facet parameters
			delete urlVars.sortBy;
			delete urlVars.sortDirection;
			delete urlVars.currentPage;
			var c = 0;
			var parameters = new ParameterCollection();
			//loop through all of the variables in this object
			for (var facet in urlVars) {
			    if (urlVars[facet] !== undefined) {
					var id = facet;
					var value = urlVars[facet];
					parameters.add(new ParameterModel({ id: id, values: value.split(',') }));
			    }
			}

			App.Search.searchOptions.set({ parameters: parameters });
		}
	,
		isSearchLengthOK: function (searchString) {
			if (ObjectUtil.isNullOrEmpty(searchString)) {
				return true;
			}

			var minSearchLength = 1;
			var maxSearchLength = 100;
			var strLength = searchString.length;
			if (strLength < minSearchLength || strLength > maxSearchLength) {
				return false;
			}
			return true;
		},
		startLoadingAnimation: function () {
			var sectionLoader = $("#search-loader");
			AnimationUtil.startItineraryAnimationSlow(sectionLoader);
		},
		endLoadingAnimation: function () {
			var sectionLoader = $("#search-loader");
			AnimationUtil.endItineraryAnimation(sectionLoader);
		},
		updateTourListClasses: function () {
			var toursContainer = $(".tour-search-results");
			if (toursContainer.length) {
				var toursContainerLgWidth = 550,
					toursContainerLgClass = "tour-search-results-lg",
					toursWidth = toursContainer.width();

				if (toursWidth < toursContainerLgWidth) {
					toursContainer.removeClass(toursContainerLgClass);
				} else {
					toursContainer.addClass(toursContainerLgClass);
				}
			}
		
		}
	}

	return searchOptionsUtil;
});
