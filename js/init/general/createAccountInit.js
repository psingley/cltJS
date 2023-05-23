define([
        "app",
        'renderedLayouts/general/createAccount/companySearchLayout'
    ],
    function (App, CompanySearchLayout) {
        App.module("CreateAccount", function () {
            this.startWithParent = false;
            this.addInitializer(function () {
                var companySearchLayout = new CompanySearchLayout();
                App.start();
            });
        });
    });