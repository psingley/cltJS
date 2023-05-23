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
'util/objectUtil',
'util/uriUtil',
'goalsUtil',

], function (doc, $, _, Backbone, Marionette, EventAggregator, App, ParameterCollection, ParameterModel, ObjectUtil, UriUtil, GoalsUtil) {
	var DropdownFilterLayout = Backbone.Marionette.Layout.extend({
		el: $('.filter'),
		events: {
			'change .blogFilter': 'setFilter'
		},
		initialize: function () {
			var outerScope = this;

			if (!this.isChosenSupported()) {
				$('.chosen-select').show();
			} else {
				$('.chosen-select').hide();
			}

			EventAggregator.on('requestResultsComplete', function (performSearch) {

				$(".filter.dropdown").each(function (i, obj) {
                    var facetId = $(this).attr("id");
					if (facetId == "") {
						console.log("Waring Facet Id is null " + $(this).data("facettype"));
					}

					var currentFilter = $(this).find('.blogFilter[data-fieldname=' + facetId + ']');
					if (currentFilter.length > 0) {
						var parameters = performSearch.get("options").get("parameters");

						var facetInCollection = _.findWhere(parameters, {id: facetId});
						if (facetInCollection) {
							$(currentFilter).val(facetInCollection.values[0]);
							$(this).show();
						} else {
							$(currentFilter).val("");
						}
						$(currentFilter).trigger("chosen:updated");
					} else {
						if ($(this).data("editormode") == 0) {
							$(this).hide();
						}
					}
				});
			});
		},
		setFilter: function (e, selection) {
			e.stopPropagation();

			var topPage = $('.category-nav');
			if (topPage.length > 0) {
				$('html,body').animate({
					scrollTop: $('.category-nav').offset().top - 50
				}, "slow");
			}

			var target = $(e.currentTarget);
			if (target.length <= 0 || target.val() === undefined) {
				return;
			}

			var filterSelection = target.chosen().val();
			var filterFieldname = target.data('fieldname');

			var parameterCollection = new ParameterCollection();
			var parameterModel = new ParameterModel({ id: filterFieldname, values: [filterSelection] });
			parameterCollection.push(parameterModel);

			App.Search.searchOptions.set({ currentPage: 1 });
			UriUtil.updateSearchOptionsHash(parameterCollection);

			$(target).val('').trigger('chosen:updated');
		},
		isChosenSupported: function () {
			if (/iP(od|hone)/i.test(window.navigator.userAgent)) {
				return false;
			}
			if (/Android/i.test(window.navigator.userAgent)) {
				if (/Mobile/i.test(window.navigator.userAgent)) {
					return false;
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
		}

	});

	return DropdownFilterLayout;
});