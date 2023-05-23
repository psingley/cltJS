// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'models/dsmLocator/DistrictSaleManagerModel',
    'collections/dsmLocator/DistrictSaleManagerCollection'
], function ($, _, Backbone, DistrictSaleManagerModel, DistrictSaleManagerCollection) {
    var DistrictSaleManagerLocatorModel = Backbone.Model.extend({
        defaults: {
            state: '',
            districtSaleManagers: DistrictSaleManagerCollection
        },
        url: function () {
            return '/services/dsm/dsmlocatorservice.asmx/SearchForDistrictSaleManage';
        },
        initialize: function () {
            this.districtSaleManagers = new DistrictSaleManagerCollection();
            //fetch calls an on change event.
            this.on("change", this.fetchCollections);
            this.on("change", this.fillModels);
        },
        parse: function (response) {
            var data = JSON.parse(response.d);
            return data;
        },
        fetchCollections: function () {
            //when we call fetch for the model we want to fill its collections
            this.districtSaleManagers.set(
                _(this.get("districtSaleManagers")).map(function (districtSaleManager) {
                    return new DistrictSaleManagerModel(districtSaleManager);
                })
            );
        },
        fillModels: function () {

        }
    });
    // Return the model for the module
    return DistrictSaleManagerLocatorModel;
});