define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/booking/travelerInformation/ContactInfoModel',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, App, ContactInfoModel, ObjectUtil) {
    var UKContactInfoModel = ContactInfoModel.extend({
        defaults: function () {
            var defaults = {
                optInEmail: false,
                optInMail: false
            };

            return _.extend(defaults, ContactInfoModel.prototype.defaults);
        }
    });
    return UKContactInfoModel;
});