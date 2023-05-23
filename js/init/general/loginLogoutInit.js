define([
        'app',
        'domReady',
        'renderedLayouts/general/loginDesktopLayout',
        'renderedLayouts/general/loginMobileLayout'
    ],
    function (App, domReady, LoginDesktopLayout, LoginMobileLayout) {
        App.module("loginLogout", function () {
            this.addInitializer(function () {
                domReady(function () {
                    if ($("#mobile-offscreen-menu .login-logout-button").length > 0){
                        new LoginMobileLayout();
                    }
                    if ($(".site-header .login-logout-button").length > 0){
                        new LoginDesktopLayout();
                    }
                });
            });
        });
    });
