define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'renderedLayouts/general/loginLayout',
    'views/general/userAccountButtonView',
    'views/general/loginPopoverView',
    'views/general/logoutDropdownView'
], function ($, _, Backbone, Marionette, App, EventAggregator, LoginLayout, UserAccountButtonView, LoginPopoverView, LogoutDropdownView) {
    var LoginMobileLayout = LoginLayout.extend({
        el:"#mobile-offscreen-menu",
        regions: {
            button: ".login-logout-button"
        },
        logoutButtonId: "logoutButtonMobile",
        modalShown: false,
        initialize: function () {
            var item = $(this.el).find(this.button.el);
            this.updateHeader(item.data("logged-in").toLowerCase() === "true", item.data("user-name"), item.data("links"));

            var outerScope = this;
            EventAggregator.on("updateUserAccountButton", function(isLoggedIn, name, links){
                outerScope.updateHeader(isLoggedIn, name, links)
            });

            EventAggregator.on("openLoginPopup", function(){
                if ($(window).width() < outerScope.desktopWidth){
                    $("#login-modal-button").click();
                }
            });

            $(window).resize(function () {
                if ($(window).width() >= outerScope.desktopWidth && outerScope.modalShown)
                {
                    $("#login-modal").modal("hide");
                }
            });
        },
        updateHeader: function(isLoggedIn, name, links){
            $("#login-modal").modal("hide");
            this.button.reset();
            this.button.show(new UserAccountButtonView({mobile: true, loggedIn: isLoggedIn, name: name}));
            if (isLoggedIn) {
                this.showLogoutDropdown(links);
            }
            else{
                this.showLoginModal();
            }
        },
        showLogoutDropdown: function(links){
            var logoutView = new LogoutDropdownView({logoutButtonId: this.logoutButtonId, links: links});
            logoutView = logoutView.render();
            this.button.$el.append(logoutView.el);
            this.initLogout(this.logoutButtonId);
        },
        showLoginModal: function(){
            var outerScope = this;
            $("#login-modal-button").click(function (e) {
                var popoverView = new LoginPopoverView();
                popoverView = popoverView.render();
                $("#login-modal .modal-body").append(popoverView.el);
                $("#login-modal").modal();

                $("#login-modal").on("hide.bs.modal", function () {
                    $("#login-modal .modal-body").empty();
                    outerScope.modalShown = false;
                });

                $("#login-modal").on("shown.bs.modal", function(){
                    outerScope.addErrorRegion();
                    outerScope.initLogin();
                    outerScope.modalShown = true;
                });
            });
        }
    });
    return LoginMobileLayout;
});