// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
    "app",
    'renderedLayouts/contactUs/ContactUsLayout'
],
    function (App, ContactUsLayout) {
        App.module("Contact", function () {
            this.startWithParent = false;
            this.addInitializer(function () {
                //wrap a block of text in the domReady object so
                //that is gets called after the dom has loaded.
                var contactUsLayout = new ContactUsLayout();
            });
        });
    });