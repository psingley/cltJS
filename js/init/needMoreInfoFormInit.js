define([
    "app",
    'jquery',
    'underscore',
    'marionette',
    'backbone',
    'renderedLayouts/tourDetailPage/needMoreInfoForm/NeedMoreInfoLayout'
],
    function (App, $, _, Marionette, Backbone, NeedMoreInfoLayout) {
        App.module("Need-More-Info",
            function () {
                this.startWithParent = false;
                this.addInitializer(function () {
                    //wrap a block of text in the domReady object so
                    //that is gets called after the dom has loaded.
                    var needMoreInfoLayout = new NeedMoreInfoLayout();
                });
            });
    });
