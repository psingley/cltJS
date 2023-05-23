define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'extensions/marionette/views/RenderedLayout',
    'util/seoTaggingUtil',
    'goalsUtil'
], function ($, _, Backbone, Marionette, App, RenderedLayout, SeoTaggingUtil,goalsUtil) {
    /**
     * Abstract class used for all newsletter layouts
     *
     * @class BaseNewsletterLayout
     * @type {*|void}
     */
    var BaseNewsletterLayout = RenderedLayout.extend({
        /**
         * Logs the transaction with google analytics
         *
         * @method logNewsletterTransaction
         */
        logNewsletterTransaction: function () {
           
        },
        /**
         * Subscribes the users email address
         *
         * @method subscribeEmailAddress
         * @param email
         */
        subscribeEmailAddress: function (firstName, lastName, email, newsletterCodes, isPrimaryChecked) {
        	var currentItemId = App.siteSettings.currentItemId;
        	var datasourceId = '';
        	if ($('div.newsletterSignupFooterForm').length > 0) {
        		datasourceId = $('div.newsletterSignupFooterForm').data('datasourceid');
        	}
        	if ($(this.el).length > 0) {
        		datasourceId = $(this.el).data('datasourceid');
        	}
            var newsletterCodes = JSON.stringify(newsletterCodes);
        	var params = JSON.stringify({ 'firstName': firstName, 'lastName': lastName, 'emailAddress': email, 'currentItemId': currentItemId, 'signupDataSourceId': datasourceId, newsletterCodes: newsletterCodes });

            var viewContext = this;
            //make ajax request
            $.ajax({
                url: "/Services/Brochures/NewsletterService.asmx/Subscribe",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: params,
                type: 'POST',
                success: function (data) {
                    App.Newsletter.cookieValue = data.d;
                    App.Newsletter.stop();

                    //submit goal for subcribing to newsletter
                    if(isPrimaryChecked) {
                        goalsUtil.emailSignup(email);
                    }

                },
                error: function () {
                    console.log('NewsletterService call failed: Subscribe');
                }
            });

            //submit goal for subcribing to newsletter
            goalsUtil.emailSignup(email);
        },
    
        /**
         * Highlights the input if the email was not successfully signed up
         *
         * @method highlightInput
         * @param input
         * @param clear
         */
        highlightInput: function (input, clear) {
            if (input != null) {
                console.log("input:" + input.name);
                if (clear === true) {
                    $(input).css({
                        "border-color": "",
                        "border-weight": "",
                        "border-style": "",
                        "background-color": ""
                    });
                } else {
                    $(input).css({
                        "border-color": "#D8000C",
                        "border-weight": "1px",
                        "border-style": "solid",
                        "background-color": "#FFBABA"
                    });

                }
            }
        }
    });
    return BaseNewsletterLayout;
});