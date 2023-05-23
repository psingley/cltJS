define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var PassportInfoModel = Backbone.Model.extend({
        defaults: {
            info: '',
            expirationDate: new Date().minDate,
            issueDate: new Date().minDate,
            countryOfIssue: null,
            countryOfCitizenship: null,
            authority: ''
        }
    });
    return PassportInfoModel;
});