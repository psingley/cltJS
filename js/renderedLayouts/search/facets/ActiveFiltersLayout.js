define([
'domReady!',
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'collections/search/facets/ActiveFiltersCollection',
'views/search/facets/ActiveFiltersListView',
'util/objectUtil',
'util/uriUtil'

], function (doc, $, _, Backbone, Marionette, EventAggregator, App, ActiveFiltersCollection, ActiveFiltersListView, ObjectUtil, UriUtil) {
	var ActiveFiltersLayout = Backbone.Marionette.Layout.extend({
		el: $('.active-filters'),
		events: {
            'click #clearActiveFilters': 'clearQueryString',
            'click #clearAppliedFilters': 'clearQueryString',
			'click ul.filter-set-filters li': 'deleteSearchParameter',
		/*	'click #clearActiveFiltersModals': 'clearQueryString'*/
		},
		initialize: function () {
			var outerScope = this;
			//outerScope.updateActiveFilters();

			EventAggregator.on('setSearchOptionsComplete', function () {
				outerScope.updateActiveFilters();
			});
			EventAggregator.on('requestResultsComplete', function () {
				outerScope.updateActiveFilters();
			});
			//modal filter count
			if (App.isColletteSite) {
			
				document.getElementById("activefiltercount").textContent =
					document.querySelectorAll('.active-filter-set:not([style*="display: none;"])').length + " Filters Selected";

				document.getElementById("clearActiveFilters").addEventListener("click", () => {
					this.clearQueryString();
				});

				document.getElementById("clearActiveFiltersModals").addEventListener("click", () => {
					this.clearQueryString();
					document.getElementById("activefiltercount").textContent = "";
					document.getElementById("activefiltercount2").textContent = "";
				});
			}
		},
		//setFilterClass: function () {
		//	if ($("#filterPanelView").hasClass("show")) {
		//		$("#filterPanelView").addClass("col-3");
		//	}
		//	else {
		//		if ($("#filterPanelView").hasClass("col-3")) {
		//			this.removeClass("col-3");
		//		}
		//	}
  //      },
		updateActiveFilters: function () {
			var searchParameters = UriUtil.getUrlVars();

			var showFilters = false;

			$('.active-filters').find('.active-filter-set').each(function (index, filterSet) {
				if ($(filterSet).data('fieldname') !== undefined) {
					var fieldnameProperty = $(filterSet).data('fieldname').split('|');

					var fieldnameInSearch = false;
					for (var i = 0; i < fieldnameProperty.length; i++) {
						if (!searchParameters.hasOwnProperty(fieldnameProperty[i])) {
							fieldnameInSearch = false;
							break;
						}
						fieldnameInSearch = true;
					}
				
					if (fieldnameInSearch) {
						var filterSetFilters = $(filterSet).find('#filter-group');
						var activeFilters = new ActiveFiltersCollection();
						activeFilters.setActiveFilters(fieldnameProperty, searchParameters);

						var activeFiltersListView = new ActiveFiltersListView({ collection: activeFilters });
						activeFiltersListView.render();
						$(filterSetFilters).html(activeFiltersListView.el);
						$(filterSet).show();
                        $('#all-tours-filter').hide();
                        $('#mobile-all-tours-filter').hide();                        
                        $('#clearActiveFilters').show();
                        $('#clearAppliedFilters').show();
                        //$('.applied-filters-search-header').show();
						if (App.isColletteSite && $(filterSet).data('fieldname') === "stylenamesfacet")
						{
							let afi = document.querySelectorAll('.activeFilterItem input');
							let i = 0;
							afi.forEach((el) => {
								if (el.dataset.fieldname === 'stylenamesfacet') {
									i++;
                                }
							});
							if (i >= 2) {
								$(this).find('.filter-set-filters').css('display', 'flex');
								$(this).find('.filter-set-filters').css('width', '475px');
								$(this).find('.filter-set-filters').css('flex-wrap', 'wrap');
								$(this).find('.activeFilterItem').css('margin-bottom', '1rem');
							}
						}
						showFilters = true;
					} else {
						$(filterSet).hide();
						if (fieldnameProperty[i] === "tourlength_description") {
							$("input[type=radio][name=tourlength]").prop('checked', false);
                        }
					}
					//modal filter count
					if (App.isColletteSite) {
						let l = document.querySelectorAll('.active-filter-set:not([style*="display: none;"])').length;
					
						if (Number(l) > 0) {
							document.getElementById("activefiltercount").textContent =
								l + " Filters Selected";
						}
						else {
							document.getElementById("activefiltercount").textContent = "";
                        }
					}
				}
			});
			if (!showFilters) {
                $('#all-tours-filter').show();
                $('#mobile-all-tours-filter').show();
                $('#clearActiveFilters').hide();
                $('#clearAppliedFilters').hide();
                //$('.applied-filters-search-header').hide();               
			}
		},
		deleteSearchParameter: function (ev) {
			var fieldnames = $(ev.target).find('input').data('fieldname').split('|');
			if (fieldnames == "daylength" || fieldnames == "price" || fieldnames === "tourlength_description") {
                EventAggregator.trigger('setDefaultInputValue', true);
            }
			var filternames = $(ev.target).find('input').data('filtername').toString().split('|');

			var searchOptionsParams = App.Search.searchOptions.get('parameters');
			_.each(fieldnames, function(fieldname) {
				var fieldnameParameter = searchOptionsParams.findWhere({ id: fieldname });
		
				_.each(filternames, function(filtername) {
					fieldnameParameter.get('values').remove(filtername);
				});
			});

			App.Search.searchOptions.set({ currentPage: 1 });

			UriUtil.updateSearchOptionsHash(searchOptionsParams);

			//$(ev.target).addClass('muted');
		},
		clearQueryString: function () {
            EventAggregator.trigger('setDefaultInputValue', true);
			var searchOptionsParams = App.Search.searchOptions.get('parameters');
			searchOptionsParams.reset();

			App.Search.searchOptions.set({ currentPage: 1 });

            UriUtil.updateSearchOptionsHash(searchOptionsParams);

			$('#multiLocationFilter').find('input').first().val("");
			document.querySelectorAll(".filterbox .collapse").forEach((x) => {
				x.classList.remove("show");
			});
			document.querySelectorAll(".top .fa-chevron-up").forEach((x) => {
				x.classList.add("collapsed");
			});

			//$(this.el).closest('.active-filters-container').addClass('muted');
		}
	});

	return ActiveFiltersLayout;
});