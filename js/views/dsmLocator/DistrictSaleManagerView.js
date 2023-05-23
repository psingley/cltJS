define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil',
    'models/dsmLocator/DistrictSaleManagerModel',
    'text!templates/dsmLocator/districtSaleManagerTemplate.html'

], function($, _, Backbone, Marionette,App, ObjectUtil, DistrictSaleManagerModel, districtSaleManagerTemplate){
    var DistrictSaleManagerView = Backbone.Marionette.ItemView.extend({
        model: DistrictSaleManagerModel,
        template: Backbone.Marionette.TemplateCache.get(districtSaleManagerTemplate),
        tagName:"div",
        className: "dsm_result clearfix"

    });
// Our module now returns our view
    return DistrictSaleManagerView;
});