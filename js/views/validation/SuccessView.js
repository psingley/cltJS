define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/validation/BaseValidationView'
], function($, _, Backbone, Marionette, App, BaseValidationView){
    var SuccessView = BaseValidationView.extend({
        className: 'successMessages'
    });
    return SuccessView;
});/**
 * Created by ssinno on 12/2/13.
 */
