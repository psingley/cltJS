define([
        "app",
        'renderedLayouts/general/registerForAccessLayout'
    ],
    function (App, RegisterForAccessLayout) {
        App.module("RegisterForAccess", function () {
            this.startWithParent = false;
            this.addInitializer(function () {
                var registerForAccessLayout = new RegisterForAccessLayout();
                App.start();
            });
        });
    });