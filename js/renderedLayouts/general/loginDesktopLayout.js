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
    var LoginDesktopLayout = LoginLayout.extend({
        el:".site-header", 
        regions:{
            button:".login-logout-button" 
        },
        ui:{
           "$loginPopover": "#login-popover", 
            "$tabButtons": "#loginSignupTabs" 
        },
        logoutButtonId: "logoutButton",
        popoverShown: false,
        initialize: function () {
            var item = $(this.el).find(this.button.el);
      
            this.updateHeader(item.data("logged-in").toLowerCase() === "true", item.data("user-name"), item.data("links"));

            var outerScope = this;
            EventAggregator.on("updateUserAccountButton", function(isLoggedIn, name, links){
                outerScope.updateHeader(isLoggedIn, name, links)
            });

            EventAggregator.on("openLoginPopup", function(){
                if ($(window).width() >= outerScope.desktopWidth){
                    $(outerScope.ui.$loginPopover).click();
                }
            });

            $(window).resize(function () {
                if (outerScope.popoverShown) {
                    if ($(window).width() < outerScope.desktopWidth )
                    {
                        outerScope.hidePopover();
                    }
                    else {
                       outerScope.properlyMovePopoverOnWindowResize();
                    }
                }
            });

            $("body").on('click', function(e) {
                if (outerScope.popoverShown && !$.contains($(outerScope.ui.$tabButtons)[0],e.target)) {
                    outerScope.hidePopover();
                }
            });
        },
        properlyMovePopoverOnWindowResize: function(){
            var button = $(this.ui.$loginPopover);
            var popover = $("#" + button.attr("aria-describedby"));
            if (popover != undefined && popover.length > 0) {
                var popoverWidth = popover[0].offsetWidth;
                var buttonWidth = button[0].offsetWidth;
                var buttonCenter = button.offset().left + buttonWidth / 2;
                var totalWidth = buttonCenter + popoverWidth / 2;
                var windowWidth = $(window).width();
                if (totalWidth <= windowWidth) {
                    popover.css("left", buttonCenter - popoverWidth / 2 + "px");
                    popover.find(".arrow").css("left", "50%");
                }
                else {
                    popover.css("left", windowWidth - popoverWidth + "px");
                    var arrowPlace = (1 - (windowWidth - buttonCenter) / popoverWidth ) * 100;
                    popover.find(".arrow").css("left", arrowPlace + "%");
                }
            }
        },
        updateHeader: function(isLoggedIn, name, links){
            this.hidePopover();
            this.button.reset();
            this.button.show(new UserAccountButtonView({loggedIn: isLoggedIn, name: name}));
            if (isLoggedIn) {
                this.showLogoutDropdown(links);
                let redesignbutton = document.getElementById("hiddenlogin");
                let uname = "";
                let logging_in = document.querySelectorAll(".login_name");
                if (redesignbutton) {
                    uname = redesignbutton.dataset.username;
                }
                if (logging_in[0] || logging_in[1]) {
                    logging_in[0].textContent = uname;
                    logging_in[1].textContent = uname;
                }
                let logout = document.querySelectorAll('.dropdown-menu.dropdown-menu-right');
                if (logout.length === 2) {
                    let link2;
                    let link3;
                    let logoutli = document.querySelectorAll('.dropdown-menu.dropdown-menu-right')[0].querySelectorAll('li');
                    let dtul = document.querySelectorAll('.dropdown-menu.dropdown-menu-right')[1];
                    if (logoutli.length > 1) {
                        link2 = logoutli[1].cloneNode(true);
                        dtul.appendChild(link2);
                    }
                    if (logoutli.length > 2) {
                        link3 = logoutli[2].cloneNode(true);
                        dtul.appendChild(link3);
                    }
                }
            }
            else{
                this.showLoginPopover();
            }
            
        },
        showLogoutDropdown: function (links) {
            var logoutView = new LogoutDropdownView({logoutButtonId: this.logoutButtonId, links: links});
            logoutView = logoutView.render();
            this.button.$el.append(logoutView.el);
            this.initLogout(this.logoutButtonId);
        },
        hidePopover: function(){
            $(this.ui.$loginPopover).popover("hide");
        },
        showLoginPopover: function () {
            $(this.ui.$loginPopover)
                .popover({
                    placement: "bottom",
                    container: "body",
                    html: true,
                    content: function () {
                        var popoverView = new LoginPopoverView();
                        popoverView = popoverView.render();
                        return popoverView.el;
                    }
                });

            $("div.popover").addClass("login-new").addClass("bottom");
            var outerScope = this;
            $(this.ui.$loginPopover).on("shown.bs.popover", function(){
                outerScope.addErrorRegion();
                outerScope.initLogin();
                outerScope.popoverShown = true;

                $('.popover').on('click', function(e) {
                    if (!$.contains($(outerScope.ui.$tabButtons)[0], e.target)) {
                        e.stopPropagation();
                    }
                });
            });

            $(this.ui.$loginPopover).on("hidden.bs.popover", function(e){
                outerScope.popoverShown = false;
            });
        }

    });
    return LoginDesktopLayout;
});