define([
    'jquery',
    'underscore',
    'app',
	'cookie'
], function ($, _, App, cookie) {
	var idleVisitorChatUtil = {
		cookieName: 'VisitorIdleTracking',
		showChat: function () {
			
			//in case there's already a chat session
			if ($("#click-to-chat").is(':visible')) {
				return;
			}
			// let's disable it for the user's session so we don't prompt the user again
			this.disableForSession();

			$('#talk-expert-modal').modal('hide');
			App.InstantChat.start();

			var firstMessage = this.getFirstMessage();
			if (firstMessage.length > 0) {
				showFirstMessage();
			}

			function postFirstMessage() {
				App.InstantChat.instantChatLayout.setIntroMessage(firstMessage);
			}

			//shows initial message with a delay
			function showFirstMessage() {
				window.setTimeout(postFirstMessage, 2000);
			}

		},

		trackIdleTime: function () {

			if ($("#click-to-chat").is(':visible')) {
				return false;
			}

			if (this.isChatAvailable() == false) {
				return false;
			}
			
			if (this.isDisabledForSession() == true) {
				return false;
			}

			return true;
			
		},

		//disables idle time tracking for user's session
		disableForSession: function () {
			cookie.set(this.cookieName, '0');
		},

		//check to see if idle time tracking is enabled
		isDisabledForSession: function () {
			var cookieRes = cookie.get(this.cookieName);
			return (cookieRes != null && cookieRes == "0");
		},
		start: function () {
			try {
				var outerScope = this;
				var idleTimer;

				console.log("isChatAvailable:" + App.siteSettings.chatSettings.isChatAvailable);
				console.log("idleChatEnabled for page:" + outerScope.pageIdleChatEnabled());

				if (outerScope.trackIdleTime() == false) {
					return;
				}

				resetTimer();
				document.onmousemove = resetTimer;
				document.onkeypress = resetTimer;

				var hasOpenedModal = function () {
					return $('body').hasClass('modal-open') || 
						  ($("[data-type='popup']:visible").length > 0); 
				}

				function onIdle() {
					if (hasOpenedModal()) {
						clearTimeout(idleTimer);
						idleTimer = setTimeout(onIdle, 2000);
					} else {
						outerScope.showChat();
					}
				}

				function resetTimer() {
					console.log("trackIdleTime:" + outerScope.trackIdleTime());

					if (!outerScope.trackIdleTime()) return;
					clearTimeout(idleTimer);
					idleTimer = setTimeout(onIdle, outerScope.getChatInterval());
				}
			} catch (e) {
				console.log("" + e);
			} 
			

		},

		pageIdleChatEnabled: function () {
			return ($('#idleVisitorChatEnabled') && $('#idleVisitorChatEnabled').val() == "true" && this.getChatInterval() > 1000); //greater than 1 sec
		},

		isChatAvailable: function () {
			return (App.siteSettings.chatSettings.isChatAvailable && this.pageIdleChatEnabled());
		},

		getChatInterval: function () {
			//greater than 1 sec
			if ($('#idleVisitorChatInterval')) {
				return $('#idleVisitorChatInterval').val();
			}
			return 0;
		},

		getFirstMessage: function () {
			if ($('#idleVisitorChatIntroMessage').length > 0) {
				
				return $('#idleVisitorChatIntroMessage').val();
			}
			return "";
		}
	};
	return idleVisitorChatUtil;
});