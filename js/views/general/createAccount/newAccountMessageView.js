define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/general/createAccount/textMessageView',
    'text!templates/general/createAccount/newAccountMessageTemplate.html',
    'util/objectUtil'
], function($, _, Backbone, Marionette,App, TextMessageView, Template, ObjectUtil){
    var NewAccountMessageView = TextMessageView.extend({
        template: Backbone.Marionette.TemplateCache.get(Template),
        templateHelpers: function () {
            var helpers = {
                createAccountButton: App.dictionary.get('profile.Buttons.CreateNewAccount'),
                buttonLink: this.setCompanyParameter()
            };

            return _.extend(helpers, TextMessageView.prototype.templateHelpers.apply(this));
        },
        setCompanyParameter: function() {
            if(App.createAccount && App.createAccount.company && !ObjectUtil.isNullOrEmpty(App.createAccount.company.id)
                && !ObjectUtil.isNullOrEmpty(App.createAccount.company.zip)
                && !ObjectUtil.isNullOrEmpty(App.createAccount.company.type)
                && !ObjectUtil.isNullOrEmpty(App.createAccount.company.companyNumber)) {
                return App.siteSettings.registerForAccessUrl + '?zipcode=' + App.createAccount.company.zip
                    + '&cmst=' + App.createAccount.company.type + '&cmsn=' + App.createAccount.company.companyNumber;
            }

            return App.siteSettings.registerForAccessUrl;
        }
    });
// Our module now returns our view
    return NewAccountMessageView;
});