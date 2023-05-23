define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'util/objectUtil',
    'services/districtSaleManagerLocatorService',
    'collections/dsmLocator/DistrictSaleManagerCollection',
    'views/dsmLocator/DistrictSaleManagerListView',
    'models/dsmLocator/DistrictSaleManagerModel',
    'models/dsmLocator/DistrictSaleManagerLocatorModel',
    'views/validation/ErrorView'
], function ($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil,DistrictSaleManagerLocatorService, DistrictSaleManagerCollection, DistrictSaleManagerListView,DistrictSaleManagerModel,DistrictSaleManagerLocatorModel,ErrorView) {
    var DistrictSaleManagerLocatorLayout = Backbone.Marionette.Layout.extend({
        el: '.dsm',
        regions: {
            dsmLocatorListView: "#dsmLocatorListView"
        },
        events: {
            'click #dsmLocatorSearchBtn': 'searchDSM'
        },
        initialize: function(){
            var outerScope = this;
            EventAggregator.on('dsmLocatorSearchComplete', function (districtSaleManagerLocatorModel) {

                var message = App.dictionary.get('agentFinder.NoResultsFound');
                if(districtSaleManagerLocatorModel.districtSaleManagers.length>0){
                    $('#dsm_result_header').show();
                  var stateName= $( ".new_select option:selected" ).text();
                    message = App.dictionary.get('agentFinder.ResultsFor')+" "+stateName;
                    outerScope.$el.find("#resultsTitle").html(message) ;
                    outerScope.dsmLocatorListView.show(new DistrictSaleManagerListView({collection:districtSaleManagerLocatorModel.districtSaleManagers}));
                }else{
                    $('#dsm_result_header').hide();
                    outerScope.$el.find("#resultsTitle").html('');
                    outerScope.dsmLocatorListView.show(new ErrorView([message]));
                }

            });
        },
        searchDSM: function (e) {
            e.preventDefault();
            var state= $('.new_select').val();
            var currentItemId = App.siteSettings.currentItemId;
            if(!ObjectUtil.isNullOrEmpty(state) && !ObjectUtil.isNullOrEmpty(currentItemId))
            {
                DistrictSaleManagerLocatorService.searchForDSM(state,currentItemId);
            } else if (window.console) {
                console.log("state or currentItemId is null") ;
            }
        }

    });
    return DistrictSaleManagerLocatorLayout;
});
