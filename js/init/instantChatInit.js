define([
        "app",
        'jquery',
        'underscore',
        'marionette',
        'backbone',
        'renderedLayouts/instantChat/InstantChatLayout',
        'util/objectUtil',
        'goalsUtil',
		'cookie'
    ],
    function (App, $, _, Marionette, Backbone, InstantChatLayout, ObjectUtil,  goalsUtil, cookie) {
        $(".instant_chat").on("click", function (e) {
        	e.preventDefault();
        	$('#talk-expert-modal').modal('hide');
        	if ($("[data-type='popup']:visible").length > 0)
        	{
		        $("[data-type='popup']:visible .closeBtn").trigger('click');
	        }
	        App.module('InstantChat').start();
        });

        /**
         * Instant Chat Module
         *
         * @module InstantChat
         */
        App.module("InstantChat", function (InstantChat) {
            /**
             * Make sure it doesn't start with the App
             *
             * @property startWithParent
             * @type {boolean}
             */
            this.startWithParent = false;

            /**
             * The chat session cookie
             *
             * @property cookieChatSession
             */
            var cookieChatSession = cookie("chatSessionCookie");

            /**
             * Chat session cookie parsed into a
             * javascript object
             *
             * Checks to see if the cookieChatSession is undefined or not
             * before trying to parse
             *
             * @property chatSession
             */
            this.chatSessionCookie = cookieChatSession ? JSON.parse(cookieChatSession) : undefined;

            /**
             * The instant chat layout instantiated
             *
             * @property instantChatLayout
             * @type {renderedLayouts.instantChat.InstantChatLayout}
             */
            this.instantChatLayout = new InstantChatLayout();

            //if we have a cookie lets start the module
            if (!ObjectUtil.isNullOrEmpty(this.chatSessionCookie)) {
                this.start();
            }

            /**
             * Sets the cookies for instant chat
             *
             * @method setCookies
             */
            var setCookies = function () {
                var instantChatLayout = InstantChat.instantChatLayout;

                //if the session has been closed lets set the chatSessionCookie cookie to null
                if (instantChatLayout.sessionClosed != undefined && instantChatLayout.sessionClosed) {
                    cookie.remove("chatSessionCookie");
                } else {
                    //make sure we have a collection of chat messages set and that there is more chat messages than previously entered
                    if (InstantChat.chatMessages.length > 0) {
                        //make it expire in 15 minutes
                        var expDate = new Date();
                        expDate.setMinutes(expDate.getMinutes() + 15);

                        var data = {
                            messages: InstantChat.chatMessages,
                            statusCode: InstantChat.statusCode,
                            sessionId: InstantChat.sessionId,
                            isMinimized: instantChatLayout.isMinimized
                        };

                        cookie.set("chatSessionCookie", JSON.stringify(data), { path: '/', expires: expDate });
                    }
                }
            };

            /**
             * Opens chat with cookies set
             *
             * @method openChatWithCookies
             * @param chatSession
             */
            var openChatWithCookies = function (chatSession) {
                var instantChatLayout = InstantChat.instantChatLayout;

                //if it was minimized then make sure it is minimized on the next screen
                instantChatLayout.isMinimized = chatSession.isMinimized;
                if (instantChatLayout.isMinimized) {
                    instantChatLayout.$el.css({
                        bottom: 0,
                        right: 10
                    });

                    instantChatLayout.ui.$chatContent.hide();
                }

                if (chatSession.messages.length > 0) {
                    //make sure we know that the chat session was already started
                    instantChatLayout.chatSessionStarted = true;
                    instantChatLayout.openChatWindow();

                    _.each(chatSession.messages, function (chatMessage) {
                        InstantChat.chatMessages.add(chatMessage);
                    });

                    InstantChat.sessionId = chatSession.sessionId;
                    InstantChat.statusCode = chatSession.statusCode;

                    instantChatLayout.setChatResponseListView();
                    instantChatLayout.updateChatStatus();
                    instantChatLayout.scrollChatWindow();
                }
            };

            /**
             * Gets called when the module is started
             *
             * @method addInitializer
             */
            this.addInitializer(function () {
                    InstantChat.chatMessages = new Backbone.Collection();

                    if (!ObjectUtil.isNullOrEmpty(InstantChat.chatSessionCookie) && InstantChat.chatSessionCookie.messages.length > 0) {
                        openChatWithCookies(InstantChat.chatSessionCookie);
                    } else {
                        InstantChat.instantChatLayout.openChatWindow();
                    }

                    //submit goal for starting an instant chat Session / Contacting and Expert
                    goalsUtil.communicateWithAExpert();
            });

            /**
             * Gets called when the module is stopped
             *
             * @method addFinalizer
             */
            this.addFinalizer(function () {
                setCookies();
            });
        });
    });