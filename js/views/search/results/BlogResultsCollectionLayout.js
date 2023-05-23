
define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'services/searchService',
	'views/search/results/BlogResultItemView',
	'collections/search/results/ResultCollection',
	'event.aggregator',
	'text!templates/search/results/blogResultListTemplate.html',
	'util/uriUtil'
], function ($, _, Backbone, Marionette, App,
	 SearchService, BlogResultItemView, ResultCollection, EventAggregator, blogResultListTemplate, UriUtil) {
	var BlogResultsCollectionLayout = Backbone.Marionette.CompositeView.extend({
		template: Backbone.Marionette.TemplateCache.get(blogResultListTemplate),
		itemView: BlogResultItemView,
		tagName: 'div',
		attributes: function () {
			return {
				class: "posts"
			}
		},
		initialize: function () {
			var outerScope = this;

			$("#nextPage").unbind().click(function () {
				if ($("#nextPage").hasClass('disabled')) {
					return;
				} else {
					outerScope.scrollToTop();
				}
			});
			$("#previousPage").unbind().click(function () {
				if ($("#previousPage").hasClass('disabled')) {
					return;
				} else {
					outerScope.scrollToTop();
				}
			});

			outerScope.applyPagination(this.options.searchOptions);
		},
		scrollToTop: function () {
			$('html,body').animate({
				scrollTop: $('.category-nav').offset().top - 50
			}, "slow");
		},
		applyPagination: function (searchOptions) {
			var outerScope = this;

			var currentPage = searchOptions.get("currentPage");
			var resultsPerPage = searchOptions.get("numberOfAdditionalResultsPerPage");
			var totalResults = searchOptions.get("totalNumberOfResults");
			var totalPages = Math.ceil(totalResults / resultsPerPage);

			var prevPageButton = $("#blogPaginationBar").find("#previousPage");
			var nextPageButton = $("#blogPaginationBar").find("#nextPage");

			var hashObj = UriUtil.getUrlVars();

			var allPaginationBtns = [];

			// create page # buttons
			$("li").remove(".paginationButton");
			for (var page = totalPages; page > 0; page--) {
				var paginationButton = "";
				if (hashObj && window.location.hash.substring(3).length > 0) {
					if (hashObj.currentPage) {
						hashObj.currentPage = page;
					} else {
						hashObj["currentPage"] = page;
					}
					paginationButton = '<li class="paginationButton" id="pageButton' + page + '"><a href="#q/' + UriUtil.serializeUrl(hashObj) + '">' + page + '</a></li>';
					allPaginationBtns.unshift(paginationButton);
				} else {
					paginationButton = '<li class="paginationButton" id="pageButton' + page + '"><a href="#q/' + UriUtil.serializeUrl({ currentPage: page }) + '">' + page + '</a></li>';
					allPaginationBtns.unshift(paginationButton);
				}
			}

			// Change the number of buttons shown at the start/end
			var startBtnCount = 5;
			// Change the number of buttons shown in the middle section
			var middleBtnCount = 5;

			var showPagination = function(beginSlice, endSlice, liIndex) {
				var visibleBtns = [];
				$(".pagination").find(".paginationEllipse").remove();

				if (beginSlice && endSlice) {
					visibleBtns = allPaginationBtns.slice(beginSlice, endSlice);
				} else {
					// Check parent width to prevent breaking the nav css
					if ($("#searchResultView").width() < 600) {
						middleBtnCount = 3;
					}
					// Get buttons where middleBtnCount is the total number of buttons and currentPage is the median
					for (var i = 0; i < middleBtnCount; i++) {
						visibleBtns[i] = allPaginationBtns[currentPage - (Math.ceil(middleBtnCount / 2) - i)];
					}
				}

				visibleBtns.forEach(function(btn){
					$(btn).insertBefore(nextPageButton);
				});

				// Show first and last pagination buttons, if more than 1 page
				if (allPaginationBtns.length > 1) {
					$(allPaginationBtns[0]).insertAfter(prevPageButton);
					$(allPaginationBtns[allPaginationBtns.length - 1]).insertBefore(nextPageButton);
				}

				if (liIndex.constructor === Array) {
					liIndex.forEach(function(index){
						$(".pagination li:eq(" + index + ")").after($('<li class="paginationEllipse"><a>...</a></li>'));
					});
				} else {
					// Ellipse always hides at least 1 page
					if (totalPages > startBtnCount + 1) {
						$(".pagination li:eq(" + liIndex + ")").after($('<li class="paginationEllipse"><a>...</a></li>'));
					}
				}
			}

			// Show buttons/ellipses based on beginning/middle/end position in pagination
			if (totalPages <= startBtnCount) { // Show all buttons, no ellipses
				showPagination(1, allPaginationBtns.length - 1, NaN);
			} else if (currentPage < startBtnCount) {
				showPagination(1, startBtnCount, startBtnCount);
			} else if (currentPage >= startBtnCount && currentPage <= totalPages - (startBtnCount - 1)) {
				showPagination(null, null, [1, -3]);
			} else {
				showPagination((totalPages - startBtnCount), -1, -(startBtnCount + 2));
			}

			// paginationButton event
			$(".paginationButton").on("click", function () {
				outerScope.scrollToTop();
			});

			//current page
			var currentPageButton = $("#blogPaginationBar").find("#pageButton" + currentPage);
			if (currentPageButton) {
				currentPageButton.addClass("currentPage");
			}

			//next and prev buttons
			if ((currentPage * resultsPerPage) >= totalResults) {
				nextPageButton.addClass("disabled");
				$(nextPageButton).find("a").removeAttr("href");
			} else {
				nextPageButton.removeClass("disabled");
				if (hashObj && window.location.hash.substring(3).length > 0) {
					if (hashObj.currentPage) {
						hashObj.currentPage = currentPage + 1;
					} else {
						hashObj["currentPage"] = currentPage + 1;
					}
					nextPageButton.find("a").attr("href", "#q/" + UriUtil.serializeUrl(hashObj));
				} else {
					nextPageButton.find("a").attr("href", "#q/" + UriUtil.serializeUrl({ currentPage: (currentPage + 1) }));
				}
			}

			if (currentPage == 1) {
				prevPageButton.addClass("disabled");
				$(prevPageButton).find("a").removeAttr("href");
			} else {
				prevPageButton.removeClass("disabled");

				if (hashObj && window.location.hash.substring(3).length > 0) {
					if (hashObj.currentPage) {
						hashObj.currentPage = currentPage - 1;
					} else {
						hashObj["currentPage"] = currentPage - 1;
					}
					prevPageButton.find("a").attr("href", "#q/" + UriUtil.serializeUrl(hashObj));
				} else {
					prevPageButton.find("a").attr("href", "#q/" + UriUtil.serializeUrl({ currentPage: (currentPage - 1) }));
				}
			}
		},
		onShow: function () {
			if (this.collection.length > 0) {
				$(".section.padded[data-noresult='1']").hide();
				$("#blogPaginationBar").show();
			} else {
				$(".section.padded[data-noresult='1']").show();
				$("#blogPaginationBar").hide();
			}
		},
		itemViewOptions: function (model, index) {
			return {
				resultNumber: index + 1
			}
		},
		appendHtml: function (collectionView, itemView, indexw) {
			collectionView.$("#searchResult:last").append(itemView.el);
		},
		templateHelpers: function() {

			return {
				gridLayout: function () {
					if ($('#searchResultView').data('gridlayout') == null) {
						return "";
					} else {
						if ($('#searchResultView').data('gridlayout').toLowerCase() === "true") {
							return "posts-grid";
						}
						return "";
					}
				}
			}
		}
	});
	// Our module now returns our view
	return BlogResultsCollectionLayout;
});
