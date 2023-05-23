define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'extensions/marionette/views/RenderedLayout',
		'util/validationUtil',
		'util/objectUtil',
		'views/validation/ErrorView',
		'views/validation/SuccessView', 
		'event.aggregator',
		'services/marketingCenterService'
], function ($, _, Backbone, Marionette, App, RenderedLayout, ValidationUtil, ObjectUtil, ErrorView, SuccessView, EventAggregator, MarketingCenterService) {
    var parameters;
	var emailUnsubscribe = RenderedLayout.extend({
		el: '.section-unsubscribe',
		events: {
			'click a.btn': 'unsubscribe',
			'keyup #txtEmailAddress': 'hitEnter'
		},
		ui: {
			'$emailAddress': '#txtEmailAddress',
			'$button': 'a.btn'
		},
		regions: {
			messagesRegion: '.messages'
		},
		initialize: function () {
			var outerScope = this;
			this.getParameters();

			EventAggregator.on('emailUnsubscribe.done', function (response) {
			    var messages = [];
			    if (response) {
			        messages.push(App.dictionary.get('common.Misc.EmailUnsubscribe'));
			        outerScope.messagesRegion.show(new SuccessView(messages));
			    } else {
			        messages.push(App.dictionary.get('common.Misc.EmailUnsubscribeProblem'));
			        outerScope.messagesRegion.show(new ErrorView(messages));
			    }
			});
			EventAggregator.on('getQueryParams.done', function (response) {
			    parameters = response;
			});
		},
		hitEnter: function (e) {
			if (e.which === 13) {
				this.ui.$button.trigger('click');
			}
		},
		unsubscribe: function (e) {
			e.preventDefault();
		    
		    var automationStateId = this.getParameterByName("ec_as");
		    var messageId = this.getParameterByName("ec_message_id");
		    var contactId = this.getParameterByName("ec_contact_id");

		    this.messagesRegion.close();

		    var validationMessages = ValidationUtil.validateEmailConfirmEmail(this.ui.$emailAddress.val(), this.ui.$emailAddress.val());

		    if (ObjectUtil.isNullOrEmpty(automationStateId)) {
		        if (ObjectUtil.isNullOrEmpty(messageId)) {
		            validationMessages.push(App.dictionary.get("common.Misc.EmailUnsubscribeNoAutomationStateOrMessageId"));
		        } else {
		            if (ObjectUtil.isNullOrEmpty(contactId)) {
		                validationMessages.push(App.dictionary.get("common.Misc.EmailUnsubscribeNoContactId"));
		            }
		        }
		    }

		    if (validationMessages.length > 0) {
		        var errorView = new ErrorView(validationMessages);
		        this.messagesRegion.show(errorView);
		    } else {
		        MarketingCenterService.unsubscribe(this.ui.$emailAddress.val(), automationStateId, messageId, contactId);
		    }
		},
	    getParameters: function () {
            return MarketingCenterService.getQueryParams(location.search);
	    },
	    getParameterByName: function (name) {
	        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(parameters);
	        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	    }
});
	return emailUnsubscribe;
});