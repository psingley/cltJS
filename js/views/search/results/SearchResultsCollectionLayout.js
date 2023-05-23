
define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'services/searchService',
	'views/search/results/SearchResultItemView',
	'collections/search/results/ResultCollection',
	'event.aggregator',
	// Using the Require.js text! plugin, we are loaded raw text
	// which will be used as our views primary template
	'text!templates/search/results/searchResultListTemplate.html',
	'util/seoTaggingUtil'
], function ($, _, Backbone, Marionette, App, SearchService, SearchResultItemView, ResultCollection, EventAggregator, resultListTemplate, SeoTaggingUtil) {
	var activeTourOffsetTop = $(".header-navbar").height() + 20;
	var tablet = 767;
	var desktop = 992;
	var tourSidebar = $(".active-tour-details");
	var toursContainer = $(".tour-search-results");
	var applyFilterBtn = $(".apply-filter-btn");
	var closeDetailsBtn = $(".close-details-btn");
	var resultsContainerTop = $("#searchResultView").offset().top;

	var SearchResultsCollectionLayout = Backbone.Marionette.CompositeView.extend({
		template: Backbone.Marionette.TemplateCache.get(resultListTemplate),
		itemView: SearchResultItemView,
		tagName: 'div',
		attributes: function () {
			return {
				class: "row"
			}
		},
		events: {
			'click #viewMoreText': 'getPagedContent',
			'click .tour-details-header .modal-title a': 'scrollToActiveTour'
		},
		initialize: function () {

			var outerScope = this;
			this.mainButtons = $("#searchResultView").data("mainbuttons");
			this.extraButtons = $("#searchResultView").data("extrabuttons");
			this.mainClass = $("#searchResultView").data("mainclass");
			this.showDetailsbar = Boolean($("#searchResultView").data("buttonpanelstatus"));

			$(window).smartresize(function () {
				outerScope.updateTourSidebarCSS();
				outerScope.isActiveTourVisible();

				if ($(window).width() >= desktop) {
					tourSidebar.modal("hide");
				}
			}).resize();

			$(window).on("orientationchange", function () {
				outerScope.updateTourSidebarCSS();
				outerScope.isActiveTourVisible();

				if ($(window).width() >= desktop) {
					tourSidebar.modal("hide");
				}
			});

			$(document).scroll(function () {
				outerScope.updateTourSidebarCSS();
				outerScope.isActiveTourVisible();

				if ($(window).width() < desktop) {
					if ($(window).scrollTop() >= resultsContainerTop) {
						applyFilterBtn.fadeIn();
					} else if ($(window).scrollTop() < resultsContainerTop || $(window).scrollTop() < 300) {
						applyFilterBtn.hide();
					}
				}
			});

			EventAggregator.on("requestResultsFinialize", function (params) {
				outerScope.showHideViewMore();
				// if it is tour Redirect where we don't find any tours then show the div
				var url = window.location.toString();
				if (url.indexOf('isTourRedirect=1') !== -1) {
					$("#tour-not-available").show();
					//reset the querystring
					var newUrl = url.replace('isTourRedirect=1', 'isTourRedirect=0');
					if (history.pushState) {
						window.history.pushState({ path: newUrl }, '', newUrl);
					}
				} else {
					$("#tour-not-available").hide();
				}
			});

			EventAggregator.on("changedTourDate", function (params) {
				if (params && App.TourDetails) {
					//change default itinerary for tour
					//{ "neoId": (options).data("neoid"), "currentItemId": self.model.get("tourId"), "packageDateId": (options).data("tourid") };
					var tourDetails = App.TourDetails.TourResults;
					if (tourDetails) {
						var count = tourDetails.length;
						for (var i = 0; i < count; i++) {
							if (tourDetails[i].tourId == params.currentItemId) {
								tourDetails[i].defaultTourPackageDate.packageDateId = params.packageDateId;

								if (params.itineraryCollection)
									tourDetails[i].itineraries = params.itineraryCollection;
								else {
									//get new def itineraries for new date
									var tour = tourDetails[i];//could be problem with closure
									var successFunction = function (results) {
										tour.itineraries = results;
									};
									SearchService.requestTouritineraryResults(params, successFunction, null);
								}

								if (params.citiesCollection) {
									tourDetails[i].cities = params.citiesCollection;
								} else {
									//get new def itineraries for new date
									var tourD = tourDetails[i];//could be problem with closure
									var successFunctionCity = function (results) {
										tourD.cities = results;
									};
									SearchService.requestTourCitiesResults(params, successFunctionCity, null);
								}
								break;
							}
						}
					}
				}
			});


		},
		onShow: function () {
			var outerScope = this;
			this.showHideViewMore();

			// Custom event to hide co-loader until search results populated
			const searchResultsLoadedEvent = new CustomEvent('searchResultsLoaded');
			document.dispatchEvent(searchResultsLoadedEvent);

			if (!this.showDetailsbar) {
				this.$el.find("div[data-tourDetails]").hide();
				this.$el.find("div[data-mainSection]").attr('class', this.mainClass);
			}
			tourSidebar.affix({
				offset: {
					top: function () {
						return (toursContainer.offset().top - activeTourOffsetTop);
					},
					bottom: function () {
						var footer = $('#footer');
						if (footer.length > 0) {
							return $(document).height() - footer.offset().top;
						}
						return $(document).height();
					}
				}
			});
			tourSidebar.on("hide.bs.modal", function () {
				applyFilterBtn.show();
				closeDetailsBtn.hide();
			});
			tourSidebar.on("show.bs.modal", function () {
				applyFilterBtn.hide();
				closeDetailsBtn.show();
			});
			tourSidebar.on('affixed.bs.affix', function () {
				if ($(window).width() > tablet) {
					outerScope.updateHeightIfNeeded(tourSidebar);
					tourSidebar.css({
						top: activeTourOffsetTop,
						left: $('.active-tour-details-container').offset().left,
						width: $('.active-tour-details-container').parent().width()
					});
				}
			});
		},
		scrollToActiveTour: function (e) {
			$('html,body').animate({
				scrollTop: $('.tour-active').offset().top - activeTourOffsetTop
			}, "slow");
			e.preventDefault();
		},
		showHideViewMore: function () {
			//var isAllowToUpdate = $.parseJSON($("#searchResultView").attr("data-updateonurl").toLowerCase());
			var resultsPerPage = App.Search.searchOptions.get('numberOfAdditionalResultsPerPage');
			var currentPage = App.Search.searchOptions.get('currentPage');
			var hideResultsAfter = (currentPage * resultsPerPage);

			var numOfResults = App.Search.performSearch.get('totalResults');
			if (this.collection.length > 0) {
				$("#viewMoreText").html(App.Search.searchSettings.get('viewMoreText'));
				$(this.el).find("#viewMoreText").show();
				$(this.el).find(".pagedResults").show();
				$(this.el).find('.active-tour-details-container').show();
				$(".section.padded[data-noresult='1']").hide();
				if (numOfResults <= hideResultsAfter) {
					$(this.el).find("#viewMoreText").hide();
				}
			} else {
				$(this.el).find('.active-tour-details-container').hide();
				$(this.el).find("#searchResult").hide();
				$(this.el).find(".pagedResults").hide();
				$(this.el).find("#viewMoreText").hide();
				$(".section.padded[data-noresult='1']").show();
			}
		},
		getPagedContent: function (e) {
			var self = this;
			e.preventDefault();

			$('.tour-search-result:hidden')
				.css({ opacity: 0 })
				.show()
				.animate({ opacity: 1 }, 500)
				.promise()
				.done(function () {
					var newPage = parseInt(App.Search.searchOptions.get('currentPage')) + 1;
					var resultsPerPage = App.Search.searchOptions.get('numberOfAdditionalResultsPerPage');
					var hideResultsAfter = (newPage * resultsPerPage);
					var numOfResults = App.Search.performSearch.get('totalResults');

					if (hideResultsAfter < numOfResults) {
						App.Search.searchOptions.set({ currentPage: newPage });
						App.Search.searchOptions.set({ returnAllResults: false });

						EventAggregator.trigger('toggleSearchOption', true);
					} else {
						$(self.el).find("#viewMoreText").hide();
					}
				});
		},
		itemViewOptions: function (model, index) {
			var outerScope = this;
			return {
				mainButtons: outerScope.mainButtons,
				extraButtons: outerScope.extraButtons,
				resultNumber: index + 1
			}
		},
		appendHtml: function (collectionView, itemView, indexw) {
			// ensure we nest the child list inside of
			// the current list item
			collectionView.$("#searchResult:last").append(itemView.el);
		},
		tourSidebarAffixedBottomCSS: function () {
			var tourDetails = $('.active-tour-details-container');

			if (tourSidebar.length && tourDetails.length) {
				var footer = $('#footer');
				if (footer.length > 0) {
					var height = footer.offset().top - $(window).scrollTop() - activeTourOffsetTop;
					tourSidebar.css({
						top: activeTourOffsetTop,
						height: height
					});
				}
			}
		},
		updateHeightIfNeeded: function (tourSidebar) {
			var bottom = tourSidebar.offset().top + tourSidebar.height();
			var footer = $('#footer');
			if (footer.length > 0) {
				if (footer.offset().top <= bottom) {
					this.tourSidebarAffixedBottomCSS();
				}
				else {
					if (tourSidebar.height() < this.tourSidebarHeight) {
						this.tourSidebarAffixedBottomCSS();
					}
				}
			}
		},
		tourSidebarAffixedCSS: function () {
			var tourDetails = $('.active-tour-details-container');

			if (tourSidebar.length && tourDetails.length) {
				var width = tourDetails.parent().width();
				var left = tourDetails.offset().left;
				this.updateHeightIfNeeded(tourSidebar);

				tourSidebar.css({
					top: activeTourOffsetTop,
					left: left,
					width: width
				});
			}
		},
		updateAffixTopOffset: function (obj, offset) {
			if (obj.hasClass("affix")) {
				obj.css({
					top: offset
				});
			}
		},
		updateTourSidebarCSS: function () {
			if (tourSidebar.length) {
				if (this.tourSidebarHeight == undefined) {
					this.tourSidebarHeight = tourSidebar.height();
				}

				if ($(window).width() > tablet) {
					tourSidebar.css({
						width: tourSidebar.parent().innerWidth()
					});
					if (tourSidebar.hasClass("affix")) {
						this.tourSidebarAffixedCSS();
					}
					if (tourSidebar.hasClass("affix-bottom")) {
						this.tourSidebarAffixedBottomCSS();
					}
					// recalculate top offset
					this.updateAffixTopOffset(tourSidebar, activeTourOffsetTop);
				} else {
					// remove bootstrap affix for mobile
					if (tourSidebar[0].style.removeProperty) {
						tourSidebar[0].style.removeProperty("top");
						tourSidebar[0].style.removeProperty("right");
						tourSidebar[0].style.removeProperty("left");
						tourSidebar[0].style.removeProperty("width");
					} else {
						tourSidebar[0].style.removeAttribute("top");
						tourSidebar[0].style.removeAttribute("right");
						tourSidebar[0].style.removeAttribute("left");
						tourSidebar[0].style.removeAttribute("width");
					}
					//tourSidebar.removeClass("affix affix-top affix-bottom");
				}
			}
		},

		isActiveTourVisible: function () {
			var activeTour = $(".tour-active");
			var tourSidebarHeader = $(".tour-details-header");

			if (activeTour && activeTour.length) {
				if (!this.isElementInViewport(activeTour.find(".tour-title"))) {
					tourSidebar.find(".scroll").css({
						top: tourSidebarHeader.outerHeight()
					});
				} else {
					tourSidebar.find(".scroll").css({
						top: 0
					});
				}
			}
		},

		isElementInViewport: function (el) {
			if (typeof jQuery === "function" && el instanceof jQuery) {
				el = el[0];
			}

			var rect = el.getBoundingClientRect();
			return (
				rect.top >= 0 &&
				rect.left >= 0 &&
				rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
				rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
			);
		},
		templateHelpers: function () {
			var isTourDetailButtonsExist = this.mainButtons.length > 0 || this.extraButtons.length > 0;

			return {
				isTourDetailButtonsExist: isTourDetailButtonsExist,
				columnSize: function () {
					if (isTourDetailButtonsExist) {
						return "col-xs-12 col-sm-6 col-md-7 col-lg-8";
					}
					return "col-xs-12";
				},
				closeText: App.dictionary.get('common.Buttons.Close'),
				learnMoreText: App.Search.searchSettings.get("SeeDetailsMessage"),
				allPricesAreIn: function () {
					if (App.siteIds.Marriott != App.siteSettings.siteId) {
						return '*' + App.dictionary.get('tourRelated.FreeFormText.AllPricesAreIn') + ' ' + App.siteSettings.currencyCode;
					}
					return "";
				}
			}
		}
	});
	// Our module now returns our view
	return SearchResultsCollectionLayout;
});
