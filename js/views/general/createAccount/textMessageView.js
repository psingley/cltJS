define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'text!templates/general/createAccount/textMessageTemplate.html'
], function($, _, Backbone, Marionette,App, Template){
    var TextMessageView = Backbone.Marionette.ItemView.extend({
        template: Backbone.Marionette.TemplateCache.get(Template),
        className: function(){
            var type = this.options.type;
            switch (type){
                case "error":
                    return "alert alert-danger";
                case 'loading':
                case "info":
                    return "alert alert-info";
                case "success":
                    return "alert alert-success";
            }
        },
        attributes:{
            role: "alert"
        },
        templateHelpers: function () {
            var type = this.options.type;
            var icon = '';
            switch (type){
                case "error":
                    icon = "fa-warning";
                    break;
                case 'loading':
                    icon = "fa-refresh fa-spin";
                    break;
                case "info":
                    icon = "fa-info";
                    break;
                case "success":
                    icon = "fa-check";
                    break;
            }

            return {
                icon: icon,
                messages: this.options.messages
            }
        }
    });
// Our module now returns our view
    return TextMessageView;
});