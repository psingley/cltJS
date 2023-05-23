define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var CustomerLeadBrochureModel = Backbone.Model.extend({
        defaults: {
            BrochureCode: '',
            BrochureTitle: '',
            BrochureId: '',
            BrochureSignupId:0
        }
    });
    return CustomerLeadBrochureModel;
});