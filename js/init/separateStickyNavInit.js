define([
    'app',
    'jquery',
    'domReady'
], function (App, $, domReady) {
    App.module('Separate-Nav-Component', function () {
        this.startWithParent = false;
        this.addInitializer(function () {
            domReady(function () {
                var primaryStickyNav = $('#primary-sticky-nav');
                var mainNavHeight = 49;

                primaryStickyNav.affix({
                    offset: {
                        top: function () {
                            return (this.top = primaryStickyNav.offset().top - mainNavHeight)
                        }
                    }
                });
            });
        });
    });
});