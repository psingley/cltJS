define([
    'underscore',
    'backbone',
    'models/customerLead/CustomerLeadBrochureModel'
], function (_, Backbone, CustomerLeadBrochureModel) {
    var CustomerLeadBrochureCollection = Backbone.Collection.extend({
        defaults: {
            model: CustomerLeadBrochureModel
        }
    });
    // Return the model for the module
    return CustomerLeadBrochureCollection;
});