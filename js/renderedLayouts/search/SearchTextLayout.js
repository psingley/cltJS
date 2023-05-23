define([
		'jquery',
		'backbone',
		'marionette',
		'app',
		'underscore',
		'jquery.ui',
		'collections/search/searchOptions/ParameterCollection',
		'models/search/searchOptions/ParameterModel',
		'services/marketingCenterService',
		'services/suggestionsService',
		'util/objectUtil',
		'util/searchOptionsUtil',
		'util/stringUtil',
		'util/uriUtil',
        'util/offersUtil',
        'util/dataLayerUtil'
	],
	function ($, Backbone, Marionette, App, _, JqueryUi, ParameterCollection, ParameterModel,
			  MarketingCenterService, SuggestionsService, ObjectUtil, SearchOptionsUtil, StringUtil, UriUtil, OffersUtil, DataLayerUtil ) {
        var SearchTextLayout = Backbone.Marionette.Layout.extend({
            //element: ".ui-corner-all",
			el: ".nav-search",
	        ui: {
	            '$autoCompleteText': '.search-box',
	            '$spinner': '.suggestion-loader',
	            '$datasourceId': '.datasourceId',
	            '$minLength': '.minLength',
	            '$noResultsCaption': '.noResultsCaption',
	            '$noResultsTitle': '.noResultsTitle',
	            '$suggestionTitles': '.suggestionTitles'

	        },
	        initialize: function () {
				var outerScope = this

				let search = document.querySelector(".Desktop-Header-Search-Bar-nav-search");
				let searchIcon = document.querySelector(".Desktop-Header-Search-Bar-nav-search__icon");
				let searchInput = document.querySelector(".Desktop-Header-Search-Bar-nav-search__input");
				let searchClose = document.querySelector(".Desktop-Header-Search-Bar-nav-search__close");
			


				if (searchIcon !== null) {
					searchIcon.addEventListener("click", () => {
						search.classList.add("nav-search-open");
						searchInput.focus();
						$('a.phonenumber.change-phone-number').parent().hide();
					});

					searchClose.addEventListener("click", () => {
						search.classList.remove("nav-search-open");
						//clear search field on close
						searchInput.value = "";
						setTimeout(function () {
							$('a.phonenumber.change-phone-number').parent().fadeIn("medium");
						}, 1000);
					});

					searchInput.addEventListener("keypress", (e) => {
						outerScope.enterHit(e);
					});
				}

	            $(outerScope.$el).each(function () {
	                var datasourceId = $(this).find(outerScope.ui.$datasourceId);
	                var autoCompleteComponent = $(this).find(outerScope.ui.$autoCompleteText);
	                var minLengthForSuggestions = $(this).find(outerScope.ui.$minLength);
	                var noResultsTitle = $(this).find(outerScope.ui.$noResultsTitle);
	                var noResultsCaption = $(this).find(outerScope.ui.$noResultsCaption);
	                var suggestionTitles = $(this).find(outerScope.ui.$suggestionTitles);

	                if (!ObjectUtil.isNullOrEmpty(datasourceId) && datasourceId.length > 0
						&& !ObjectUtil.isNullOrEmpty(autoCompleteComponent) && autoCompleteComponent.length > 0
						&& !ObjectUtil.isNullOrEmpty(minLengthForSuggestions) && minLengthForSuggestions.length > 0
						&& !ObjectUtil.isNullOrEmpty(noResultsTitle) && noResultsTitle.length > 0
						&& !ObjectUtil.isNullOrEmpty(suggestionTitles) && suggestionTitles.length > 0) {

	                    outerScope.setCustomAutocompleteAjax(SuggestionsService.getSuggestions, autoCompleteComponent,
							datasourceId.val(), minLengthForSuggestions.val(), $(this).find(outerScope.ui.$spinner),
							50, noResultsTitle.val(), noResultsCaption,
							suggestionTitles.val());
                    }
                    var ua = window.navigator.userAgent;
                    var msie = ua.indexOf("Trident");
                    if (msie < 0) // If not Internet Explorer
                    {
                        const hrefs = document.querySelectorAll('.ui-corner-all');
                        hrefs.forEach(function (href) {
                            href.addEventListener('click', function (event) {
                                if (localStorage.SearchTerm !== event.target.textContent) {
									DataLayerUtil.PredictiveSearchLayer(event.target.textContent, 'anchor tag');
                                    localStorage.SearchTerm = event.target.textContent;
                                }
                            });
                        });
                    }
	            });
	        },
	        events: {
	            'keydown .nav-search': 'enterHit',
	            'keydown .explor-searchbox': 'enterHit',
	            'click .nav-search': 'searchButtonHit',
				'submit form': 'stopSubmit'
            },
            stopSubmit: function (e) {
	            e.preventDefault();
	        },
	        enterHit: function (e) {
                if (e.keyCode === 13) {
                    if (App.isSearch) {
                        this.applySearchContent();
                        DataLayerUtil.PredictiveSearchLayer(SearchOptionsUtil.getSearchInputValue(), 'Search Box');
	                } else {
                        this.redirectToSearchPage(e);
                        DataLayerUtil.PredictiveSearchLayer(SearchOptionsUtil.getSearchInputValue(), 'Search Box');
                    }
                    
	            }
	        },
			searchButtonHit: function (e) {
                if (App.isSearch) {
                    this.applySearchContent();
                    DataLayerUtil.PredictiveSearchLayer(SearchOptionsUtil.getSearchInputValue(), 'Search Button');
	            } else {
                    this.redirectToSearchPage(e);
                    DataLayerUtil.PredictiveSearchLayer(SearchOptionsUtil.getSearchInputValue(), 'Search Button');
                }
              
	        },
            redirectToSearchPage: function (e) {
	            var searchPageUrl = SearchOptionsUtil.getSearchUrl(e.currentTarget);
	            var searchText = SearchOptionsUtil.getSearchTxt();
	            if (!SearchOptionsUtil.isSearchLengthOK(searchText.content)) {
	                return;
	            }

	            MarketingCenterService.predictiveSearch(searchText.content);
	            var x = e.target;
	            if (x.id != "blogQueryChange") {
	                window.location.href = searchPageUrl + "#" + UriUtil.getUriHash(searchText);
	            }
	            else{
                    window.location.href = searchPageUrl + "?" + UriUtil.getUriHash(searchText).replace("q/", "");
	            }
			},
			applySearchContent: function () {
				var searchKeywords = SearchOptionsUtil.getSearchInputValue();
				if (searchKeywords) {
					var searchOptionsParams = App.Search.searchOptions.get('parameters');
					var parameterModel;

					if (searchOptionsParams.length <= 0) {
						var parameterCollection = new ParameterCollection();
						parameterModel = new ParameterModel({ id: "content", values: [] });
						parameterModel.get("values").push(searchKeywords);
						parameterCollection.push(parameterModel);

						searchOptionsParams = parameterCollection;
					} else {
						var fieldnameParameter = searchOptionsParams.findWhere({ id: "content" });
						if (fieldnameParameter !== undefined && fieldnameParameter !== null) {
							App.Search.searchOptions.get('parameters').get("content").clear();
						}
						parameterModel = new ParameterModel({ id: "content", values: [] });
						parameterModel.get("values").push(searchKeywords);

						searchOptionsParams.push(parameterModel);
					}

					App.Search.searchOptions.set({ currentPage: 1 });

					UriUtil.updateSearchOptionsHash(searchOptionsParams);
				}
			},

            searchUrlMatch: function (searchOptionsUrl, autocompleteItem) {
                if (ObjectUtil.isNullOrEmpty(searchOptionsUrl) ||
                    autocompleteItem == null ||
                    ObjectUtil.isNullOrEmpty(autocompleteItem.url)) {
                    return false;
                }

                return autocompleteItem.url.indexOf(searchOptionsUrl.substring(1)) >= 0;
            },

			trackAndRedirect: function(term,item){
				MarketingCenterService.predictiveSearch(term, item.id, item.url);
				window.location.href = item.url;
			},

			/*
			Custom autocomplete for predictive search
			*/
			setCustomAutocompleteAjax: function (deferredObject, $selector, datasourceId, minLength, $spinner,
				maxLength, noResultsTitleValue, noResultsCaptionElement, suggestionTitles) {
				if ($selector.length === 0) {
					console.log("There is no selector for this autocomplete: ");
					return;
				}
				var outerScope = this;
				var widgetInstance = $selector.autocomplete({
				    select: function (event, ui) {
				        var originalEvent = event;
				        while (originalEvent) {
				            if (originalEvent.keyCode == 13)
				                originalEvent.stopPropagation();

				            if (originalEvent == event.originalEvent)
				                break;

				            originalEvent = event.originalEvent;
				        }

						var item = ui.item;
				        if (ObjectUtil.isNullOrEmpty(item) || ObjectUtil.isNullOrEmpty(item.url)) {
				            return;
				        }

				        if (App.isSearch) {
							var searchOptionsParams = App.Search.searchOptions.get('parameters');
							if (searchOptionsParams != null) {
								var parameterModels = SearchOptionsUtil.getParameterModelsFromUrl(item.url);
								if (parameterModels != null && parameterModels.length > 0) {
									if ($(searchOptionsParams).length <= 0) {
										searchOptionsParams = new ParameterCollection();
									}
									Array.prototype.push.apply(searchOptionsParams.models, parameterModels);

									App.Search.searchOptions.set({currentPage: 1});
									UriUtil.updateSearchOptionsHash(searchOptionsParams);
									return;
								}
							}
						}
						outerScope.trackAndRedirect($selector.val(), item);
					},
					source: function (request, response) {
						var term = $selector.val();
						$selector.attr('data', term);
						$selector.attr('data', term);
						//Pattern to check if valid characters are entered.
						var pattern = /^[A-Za-z0-9\s']*$/;
						var match = term.match(pattern);

						if (ObjectUtil.isNullOrEmpty(term) || ObjectUtil.isNullOrEmpty(match) || match.length === 0) {
							$(outerScope.ui.$spinner).hide();
							this.close();
							return;
						}
						var data = { term: term, datasourceId: datasourceId };

						if (!ObjectUtil.isInteger(term) && term.length < minLength) {
							var text = App.dictionary.get("predictiveSearch.TypeMoreCharacters");
							if (text != null) {
								response(outerScope.getResultsMessage(text.replace("@NumberOfCharacters@", minLength - term.length)));
							}
						}
						else if (term.length > maxLength) {
							var maxLengthWarningText = App.dictionary.get("predictiveSearch.MaxLengthWarningText");
							if (maxLengthWarningText != null) {
								response(outerScope.getResultsMessage(maxLengthWarningText.replace("@NumberOfCharacters@", maxLength)));
							}
						}
						else {
							deferredObject(data)
							.success(function (data) {
								if (data == null || data.d == null) {
								    response(outerScope.getResultsMessage(noResultsTitleValue,
                                        ObjectUtil.isNullOrEmpty(noResultsCaptionElement) ? string.Empty :
										noResultsCaptionElement.val()));
									return;
								}
								var responseData = JSON.parse(data.d);
								var groups = responseData.groupedResults.suggestionType.groups;
								var matches = responseData.groupedResults.suggestionType.matches;

								if (ObjectUtil.isNullOrEmpty(groups) || parseInt(matches) <= 0) {
								    response(outerScope.getResultsMessage(noResultsTitleValue,
                                        ObjectUtil.isNullOrEmpty(noResultsCaptionElement) ? string.Empty :
									noResultsCaptionElement.val()));
									return;
								}
								var source = groups;
								var results = [];
								$.each(source,
									function (group) {
										var documents = source[group].documents;
										$.each(documents,
											function (document) {
												var doc = documents[document];
												results.push(doc);
											});
									});
								response(results);
								
							});
						}
					},
					search: function() {
						$($spinner).show();
					},
					open: function() {
						$($spinner).hide();
					}
				});

				widgetInstance.data("ui-autocomplete")._renderItem = function (ul, item) {
					var htmlSnippet = $("<li></li>");
					if (ObjectUtil.isNullOrEmpty(item.title) && ObjectUtil.isNullOrEmpty(item.noResultTitle)) {
						// So its a suggestion result
						var name = item.name;
						var space = " ";
						var term = StringUtil.trim(this.term);
						term = term.replace(new RegExp(space, 'g'), "|");
						var pattern = new RegExp(term, 'gi');
						var autocompleteLabel = name.replace(pattern, function (match) {
							return "<span class='matched-text'>" + match + "</span>";
						});

						if (item.suggestionType === "SearchPage") {
							htmlSnippet.addClass("generic");
						} else if (item.suggestionType === "TourDetailPage") {
							htmlSnippet.addClass("tour");
						} else if (item.suggestionType === "DestinationPage") {
							htmlSnippet.addClass("travel-guide");
						} else if (item.suggestionType === "BlogsPage") {
							htmlSnippet.addClass("blog");
						}else if (item.suggestionType === "NewsPage") {
							htmlSnippet.addClass("news");
						} else if (item.suggestionType === "LandingPage") {
							htmlSnippet.addClass("landing-page");
						}

						if (!ObjectUtil.isNullOrEmpty(item.imageUrl)) {
							htmlSnippet.append("<div class='image-wrapper'><img src='" + item.imageUrl + "' class='predictive-search-image'/></div>");
						}
						var contentWrapper = $("<div class='content-wrapper'></div>");
						contentWrapper.append("<p class='generic-title'>" + autocompleteLabel + "</p>");
						if (!ObjectUtil.isNullOrEmpty(item.price) && parseFloat(item.price) > 0) {
							//formatPrice() see site.js setFormatPriceFunction
							contentWrapper.append("<p class='generic-caption price'> " + item.price.toLocaleString().formatPrice()
								+ " " + App.dictionary.get('tourRelated.FreeFormText.PP') + "</p>");
							var maxOfferPriceText = OffersUtil.maxOfferPrice(item.offers);
							if(maxOfferPriceText){
								contentWrapper.append("<p class='generic-caption save'>" + App.dictionary.get('tourRelated.FreeFormText.SaveUpTo') + " <span>" + maxOfferPriceText + "</span></p>");
							}
						}
						var ahrefTagWrapper = $("<a href='" + item.url + "'></a>");
						ahrefTagWrapper.append(contentWrapper);
						htmlSnippet.append(ahrefTagWrapper);
					}
					else if (!ObjectUtil.isNullOrEmpty(item.title)) {
						// Its a Suggestion Title and not a suggestion result.
						htmlSnippet.append('<div class="predictive-search-title">' + item.title + '</div>');
					}
					else {
						htmlSnippet.addClass("no-results");
						htmlSnippet.append('<div class="content-wrapper"><p class="generic-title">' + item.noResultTitle + '</p></div>');
						if (!ObjectUtil.isNullOrEmpty(item.noResultsCaption)) {
							htmlSnippet.append('<p class="generic-caption">' + item.noResultsCaption + '</p>');
						}
					}
					return htmlSnippet.appendTo(ul);
					},

				widgetInstance.data("ui-autocomplete")._renderMenu = function (ul, items) {
					var self = this;
					ul.addClass("predictive-search-results");
					var titles = [];

					let searchInput = document.querySelector(".Desktop-Header-Search-Bar-nav-search__input");
					let search = document.querySelector(".Desktop-Header-Search-Bar-nav-search");
					let m_searchInput = document.querySelector(".Mobile-Header-Search-Bar-nav-search__input");
					let m_search = document.querySelector(".Mobile-Header-Search-Bar-nav-search");
					let predictivesearchresults = document.querySelector('.predictive-search-results');
					let v = searchInput.value;
					let mv = m_searchInput.value;
					if (predictivesearchresults && document.querySelector('.Desktop-Header-Search-Bar-nav-search__icon')) {
						predictivesearchresults.addEventListener("click", (e) => {
							if (e.target.classList.contains("predictive-search-title") || e.target.classList.contains("ui-autocomplete"))
							{
								searchInput.value = v;
							}
							else {
								searchInput.value = v;
								setTimeout(function () {
									searchInput.value = "";
									search.classList.remove("nav-search-open");
								}, 5000);
							}
						});
					}
					if (predictivesearchresults && document.querySelector('.Mobile-Header-Search-Bar-nav-search__icon')) {
						predictivesearchresults.addEventListener("click", (e) => {
							if (e.target.classList.contains("predictive-search-title") || e.target.classList.contains("ui-autocomplete"))
							{
								m_searchInput.value = mv;
							}
							else {
								m_searchInput.value = mv;
								setTimeout(function () {
									m_searchInput.value = "";
									m_search.classList.remove("nav-search-open");
								}, 5000);
							}
						});
					}



					if (!ObjectUtil.isNullOrEmpty(suggestionTitles)) {
						titles = JSON.parse(suggestionTitles);
					}

					var predictiveSearchSuggestionType = "";
					$.each(items, function (index, item) {
						if (!ObjectUtil.isNullOrEmpty(item.name) || !ObjectUtil.isNullOrEmpty(item.noResultTitle)) {
							if (!ObjectUtil.isNullOrEmpty(item.suggestionType) && titles.indexOf(item.suggestionType) > -1
								&& predictiveSearchSuggestionType !== item.suggestionType) {

								var fakeTitleItem = { title: item.suggestionTypeDisplayText };
								predictiveSearchSuggestionType = item.suggestionType;
								self._renderItemData(ul, fakeTitleItem);
								self._renderItemData(ul, item);
							}
							else {

								self._renderItemData(ul, item);
							}
						}

					});
				};
			},
			getResultsMessage: function (title, caption) {
				var results = [];
				results.push({ noResultTitle: title, noResultsCaption: caption });
				return results;

			}
		});
		return SearchTextLayout;
	});
