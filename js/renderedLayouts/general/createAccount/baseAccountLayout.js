define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/general/createAccount/textMessageView'
], function ($, _, Backbone, Marionette, App,  EventAggregator, MessageView) {
    var BaseAccountLayout = Backbone.Marionette.Layout.extend({
        showLoading: function(messages){
            var loadingView = new MessageView({type: "loading", messages: messages});
            this.messagesRegion.show(loadingView);
        },
        disableSection: function (selector) {
            var $inputs = selector ? this.$el.find(selector) : this.$el.find("fieldset");
            $inputs.attr("disabled", "disabled");
        },
        enableSection: function (selector) {
            var $inputs = selector ? this.$el.find(selector) : this.$el.find("fieldset");
            $inputs.removeAttr("disabled");
        },
        displaySuccess: function(messages){
            var view = new MessageView({type: "success", messages: messages});
            this.messagesRegion.show(view);
        },
        displayErrors: function(errors){
            var errorView = new MessageView({type: "error", messages: errors});
            this.messagesRegion.show(errorView);
        }
    });
    return BaseAccountLayout;
});