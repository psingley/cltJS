define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app'
], function($, _, Backbone, Marionette, App){
    var PrePostLayoutModel = Backbone.Model.extend({
        defaults: {
            servicesHeaderText: '',
            roomsHeaderText: '',
            priceHeaderText: '',
            nightsHeaderText: '',
            preExtensionTitleText: '',
            postExtensionTitleText: '',
            preUpgradeTitleText: '',
            postUpgradeTitleText: ''
        }
    });
    return PrePostLayoutModel;
});