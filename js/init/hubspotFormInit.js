define([
    "app",
    'jquery',
    'underscore',
    'marionette',
    'backbone',
    'renderedLayouts/hubspotForm/HubspotFormLayout'
],
function (App, $, _, Marionette, Backbone, HubspotFormLayout) {
	App.module("HubspotForm", function (hubspotForm) {
    	this.startWithParent = true;

    	this.addInitializer(function () {
    		hubspotForm.hubspotFormLayout = new HubspotFormLayout();
    	});
    });
});