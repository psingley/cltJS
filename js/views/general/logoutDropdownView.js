define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'text!templates/general/logoutDropdown.html'
], function($, _, Backbone, Marionette,App, Template){
    var LogoutDropdownView = Backbone.Marionette.ItemView.extend({
        template: Backbone.Marionette.TemplateCache.get(Template),
        tagName: "ul",
        attributes: function(){
            return {
                class: "dropdown-menu dropdown-menu-right",
                role: "menu",
                "aria-labelledby": "profileDropdownMenu"
            }
        },
        templateHelpers: function () {
            var outerScope = this;
            let thelinks = document.getElementById("login-modal-button");
            let options = "";
            if (thelinks && thelinks.dataset.links) {
                options = outerScope.options.links !== undefined ? outerScope.options.links :
                    JSON.parse(document.getElementById("login-modal-button").dataset.links);
            }
            else {
                options = outerScope.options.links;
            }
         
            return {
                logoutText: App.dictionary.get('profile.Buttons.Logout'),
                logoutButtonId: outerScope.options.logoutButtonId,
                links: options
                    
            }
        }
    });
    // Our module now returns our view
    return LogoutDropdownView;
});