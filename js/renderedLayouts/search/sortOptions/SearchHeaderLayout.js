define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'util/searchOptionsUtil',
    'util/uriUtil',
    'renderedLayouts/search/sortOptions/buttons/FacetsVisibilityButton',
    'renderedLayouts/search/sortOptions/buttons/SearchHelpWizardButton',
    'renderedLayouts/search/sortOptions/buttons/FilterBarButtons',
], function ($, _, Backbone, Marionette, App, EventAggregator, SearchOptionsUtil, UriUtil, FacetsVisibilityButton, SearchHelpWizardButton, FilterFacetBar) {
    let x = App.isColletteSite ? "#ssortOptionsList" : "#sortOptionsList";
    var SearchHeaderLayout = Backbone.Marionette.Layout.extend({
        el: $(x),
        events: {
            'change': 'toggleSortOptions'
        },
        toggleSortOptions: function () {
            var sortOptions = SearchOptionsUtil.getSortOptionsByElmSelector(this.el);
            var getFacetBarState = this.filterButton.getButtonStateObj();
            var searchOptionsParams = App.Search.searchOptions.get('parameters');
            App.Search.searchOptions.set({ returnAllResults: true });

            var serializableObject = searchOptionsParams.serializableObject(App.Search.searchOptions);
            var criteria = $.extend(serializableObject, sortOptions, getFacetBarState);
            UriUtil.setHashByObject(criteria);
        },

        initialize: function () {
            var outerScope = this;
            this.filterButton = new FacetsVisibilityButton();
            this.searchHelpWizard = new SearchHelpWizardButton();
            this.filterFacetBar = new FilterFacetBar();
            //support old event
            EventAggregator.on('setSearchOptionsComplete', function () {
                outerScope.setSelectedSortItem();
            });

            EventAggregator.on('requestResultsComplete', function (performSearch) {
                outerScope.processingParameters(performSearch);
            });

            outerScope.processingParameters();
        },

        processingParameters: function (performSearch) {
            var outerScope = this;
            var params = UriUtil.getUrlVars();
            if (params) {
                if (performSearch != null || performSearch != undefined) {
                    var sort = performSearch.get('options').get('sortBy');
                    var direction = performSearch.get('options').get('sortDirection');
                    if (sort != null && direction != null) {
                        outerScope.setSelectedSortItem(sort, direction);
                    }
                } else {
                    var sort = params[App.sortByFacet];
                    var direction = params[App.sortDirectionFacet];
                    if (sort != null && direction != null) {
                        outerScope.setSelectedSortItem(sort, direction);
                    }
                }

            }
        },
        setSelectedSortItem: function (sort, direction) {
            var sortBy = sort == null ? App.Search.searchOptions.get(App.sortByFacet) : sort;
            var sortDirection = direction == null ? App.Search.searchOptions.get(App.sortDirectionFacet) : direction;

            if (sortBy != undefined && sortDirection != undefined && sortDirection != '') {

                //make sure the value exists
                var defaultSortItem =
                    this.$el
                        .children('option[data-sort-direction = ' + sortDirection + '][data-sort-id = ' + sortBy + ']')[0];

                //if there is a sort option available for what was passed back
                if (!$(defaultSortItem).isNullOrEmpty()) {
                    $(defaultSortItem).prop('selected', true);
                    this.$el.trigger('update');
                    //update mobile filter count 
                    let afc2 = document.getElementById("activefiltercount2");
                    if (afc2) {
                        var length = document.querySelectorAll('.active-filter-set:not([style*="display: none;"])').length;
                        if (length > 0) {
                            afc2.textContent =
                                length + " selected";
                        }
                    }
                } else {
                    //if nothing was passed back as an option sort by relevancy
                    var $relevancyOption =
                        this.$el.first('option[data-sort-id = ""]');

                    $relevancyOption.prop('selected', true);
                    this.$el.trigger('update');
                }
            }
        }
    });
    // Our module now returns our view
    return SearchHeaderLayout;
});


