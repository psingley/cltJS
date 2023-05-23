define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/validation/BaseValidationView'
], function($, _, Backbone, Marionette, App, BaseValidationView){
    var InfoView = BaseValidationView.extend({
        className: 'infoMessages'
    });
    return InfoView;
});/**
 * Created by ssinno on 12/2/13.
 */
