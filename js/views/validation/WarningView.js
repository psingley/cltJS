define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/validation/BaseValidationView'
], function($, _, Backbone, Marionette, App, BaseValidationView){
    var ErrorView = BaseValidationView.extend({
        className: 'warningMessages'
    });
    return ErrorView;
});/**
 * Created by ssinno on 12/2/13.
 */
