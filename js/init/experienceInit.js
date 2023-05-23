// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
    "app"
],
    function (App) {
        App.module("Experience", function () {
            this.startWithParent = false;

            this.addInitializer(function () {
                require(['carousel'], function () {
                    //launch experience page carousel
                    $(".photo_carousel_wrapper").ettCarousel();
                });
            });
        });
    });