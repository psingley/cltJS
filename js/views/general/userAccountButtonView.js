define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'text!templates/general/userAccountButton.html'
], function($, _, Backbone, Marionette,App, Template){
    var userAccountView = Backbone.Marionette.ItemView.extend({
        template: Backbone.Marionette.TemplateCache.get(Template),
        tagName: "a",
        attributes: function () {
            if (this.options.loggedIn){
                return {
                    href: "javascript:void(0);",
                    class: "dropdown-toggle profile-dropdown",
                    type:"button",
                    "data-toggle":"dropdown",
                    "aria-expanded": "false"
                }
            }

            if (this.options.mobile){
                return {
                    href: "javascript:void(0);",
                    id: "login-modal-button",
                    class: "login",
                    "data-toggle": "modal",
                    "data-target": "#login-modal"
                }
            }

            return {
                href : "javascript:void(0);",
                id: "login-popover",
                class: "login"
            }
        },
        onRender: function () {
            $.when(App.dictionary.getDictionaries())
             .done(function (dictionary) {
                 var welcomeText = dictionary.get('profile.Buttons.Welcome');
                 var nameText = this.options.name;
                 var loginSignUpText = dictionary.get('profile.Buttons.LoginOrSignup');

                 if (this.options.loggedIn)
                 {
                     $(this.$el).html(function ()
                     {
                        return "<span>" + welcomeText + ", " + "</span><span class='login_name'>&nbsp;</span>" + " <i class='fa fa-chevron-down'></i>";
                     }.bind(this));
                 }
                 else
                 {
                     $(this.$el).html(loginSignUpText);
                 }
             }.bind(this));
        }
    });
// Our module now returns our view
    return userAccountView;
});

