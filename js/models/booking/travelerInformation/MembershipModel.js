define([
    'jquery',
    'underscore',
    'backbone',
    'marionette'
], function ($, _, Backbone) {
    var MembershipModel = Backbone.Model.extend({
        defaults: {
            membershipType: null,
            membershipNumber: 0
        }
    });
    return MembershipModel;
});