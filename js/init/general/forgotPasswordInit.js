define([
        "app",
        'renderedLayouts/general/forgotPasswordLayout'
    ],
    function (App, ForgotPasswordLayout) {
        App.module("ForgotPassword", function () {
            this.startWithParent = false;
            this.addInitializer(function () {
                var forgotPasswordLayout = new ForgotPasswordLayout();
                App.start();
            });
        });
    });
