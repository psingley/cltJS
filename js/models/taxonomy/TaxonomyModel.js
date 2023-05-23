/**
 * Created by ssinno on 10/24/13.
 */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var TaxonomyModel = Backbone.Model.extend({
        defaults: {
            name: '',
            id: ''
        }
    });

    return TaxonomyModel;
});