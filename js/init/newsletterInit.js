define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil',
    'renderedLayouts/newsletter/NewsletterLayout',
    'renderedLayouts/newsletter/NewsletterFormLayout',
    'renderedLayouts/newsletter/NewsletterFooterLayout',
    'renderedLayouts/newsletter/NewsletterPPCLayout',
	'cookie'
], function ($, _, Backbone, Marionette, App, ObjectUtil, NewsletterLayout, NewsletterFormLayout, NewsletterFooterLayout, NewsletterPPCLayout, cookie) {
    /**
     * Module for all newsletter forms
     *
     * @module Newsletter
     */
    App.module('Newsletter', function (Newsletter) {
        /**
         * Newsletter cookie
         *
         * @property newsletterCookie
         */
        var newsletterCookie = cookie.get('NewsletterSignup');

        /**
         * The Sitecore template id for the page
         *
         * @property templateId
         */
        var templateId = $('body').data('template');

        /**
         * The newsletter cookie parsed into a javascript object
         *
         * @property newsletterCookie
         */
        this.newsletterCookie = newsletterCookie ? JSON.parse(newsletterCookie) : undefined;
        /**
         * Displays the form section if not signed
         * up for the newsletter.
         *
         * @method showFormSection
         */
        var showFormSection = function () {
            $('.newsletterSignupForm').show();
            $('#newsletterSignupFooterForm').show();
            $('#newsletterSignupPPCForm').show();
            $('.newsletterSignupComplete').hide();
        };

        /**
         * Displays thank you section if already signed up for the newsletter.
         *
         * @method showThankYouSection
         */
        var showThankYouSection = function () {
            $('.newsletterSignupForm').hide();
            $('#newsletterSignupFooterForm').hide();
            $('#newsletterSignupPPCForm').hide();
            $('.newsletterSignupComplete').show();
        };
        /**
         * Sets the cookies for newsletter
         *
         * @method setCookies
         */
        var setCookies = function () {
            var expDate = new Date();
            expDate.setDate(expDate.getDate() + 15);

            cookie.set("NewsletterSignup", JSON.stringify(Newsletter.cookieValue), { path: '/', expires: expDate });
        };

        this.addInitializer(function () {
            if ($('.newsletter-signup').length > 0) {
            	Newsletter.newsletterLayout = new NewsletterLayout();
	            console.log('init la');
            }

            if (!ObjectUtil.isNullOrEmpty(this.newsletterCookie)) {
                showThankYouSection();
            } else {
                //always instantiate the footer layout
                Newsletter.footerLayout = new NewsletterFooterLayout();

                //instantiate only the layouts we need
                switch (templateId) {
                    case '{8A9FF1BC-0025-4B58-A229-056B14A6E075}' :
                        Newsletter.newsletterPPCLayout = new NewsletterPPCLayout();
                        break;
                    case '{D8754F09-ADA9-4B7C-B330-5BCB7E2BBC25}':
                    case '{4E671689-66E4-4482-888B-D66BDEB575A0}':
                    case '{C8257F87-B7C4-446A-BD81-E25D4004F1AB}':
                        Newsletter.newsletterFormLayout = new NewsletterFormLayout();
                        break;
                    default :
                        break;
                }

                showFormSection();
            }
        });

        this.addFinalizer(function () {
            if (!ObjectUtil.isNullOrEmpty(Newsletter.cookieValue)) {
                setCookies();
                showThankYouSection();
            }
        });
    });
});