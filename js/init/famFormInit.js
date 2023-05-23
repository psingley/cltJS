define([
    "app",
    'jquery',
    'underscore',
    'marionette',
    'backbone',
    'renderedLayouts/famForm/FamFormLayout'
],
    function (App, $, _, Marionette, Backbone, FamFormLayout) {
        App.module("FamForm", function (famForm) {
            this.startWithParent = true;

            this.addInitializer(function () {
                famForm.famFormLayout = new FamFormLayout();
            });
        });
    });