define([
        "app",
        'renderedLayouts/general/resetPasswordLayout'
    ],
    function (App, ResetPasswordLayout) {
        App.module("ResetPassword", function () {
            this.startWithParent = false;
            this.addInitializer(function () {
                var resetPasswordLayout = new ResetPasswordLayout();
                App.start();
            });
        });
    });
