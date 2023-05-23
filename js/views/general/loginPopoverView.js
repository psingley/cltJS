    define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'text!templates/general/loginPopoverContent.html'

], function($, _, Backbone, Marionette,App, Template){
    var LoginPopoverView = Backbone.Marionette.ItemView.extend({
        template: Backbone.Marionette.TemplateCache.get(Template),
        className:"login-content-wrapper", 
        templateHelpers: function () {
            return {
                loginText: App.dictionary.get('profile.Buttons.LogInWithSpace'),
                signupText: App.dictionary.get('common.Buttons.Signup'),
                usernameText: App.dictionary.get('profile.FreeFormText.Username'),
                passwordText: App.dictionary.get('profile.FreeFormText.Password'),
                confirmPasswordText: App.dictionary.get('profile.FreeFormText.ConfirmPassword'),
                rememberMeText: App.dictionary.get('profile.FreeFormText.RememberMe'),
                forgotPasswordText: App.dictionary.get('profile.FreeFormText.ForgotYourPassword'),
                noAccountText: App.dictionary.get('profile.FreeFormText.NoAccount'),
                showPasswordText: App.dictionary.get('profile.FreeFormText.ShowPassword'),
                chooseTypeText: App.dictionary.get('profile.FreeFormText.ChooseType'),
                chooseTypeDescription: App.dictionary.get('profile.FreeFormText.ChooseTypeDescription'),
                consumerText: App.dictionary.get('profile.FreeFormText.Consumer'),
                professionalText: App.dictionary.get('profile.FreeFormText.TravelProfessional'),
                forgotPasswordLink: App.siteSettings.forgotPasswordUrl,
                consumerCreateAccountLink: App.siteSettings.createConsumerAccountUrl,
                professionalCreateAccountLink: App.siteSettings.createProfessionalAccountUrl
            }
        }
    });
// Our module now returns our view
    return LoginPopoverView;
});