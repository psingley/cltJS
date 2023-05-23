define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'util/objectUtil',
    'services/instantChatService',
    'models/instantChat/ChatMessageModel',
    'models/instantChat/SendMessageModel',
    'models/instantChat/StartChatSessionModel',
    'models/instantChat/CloseChatSessionModel',
    'models/instantChat/UpdateChatStatusModel',
    'views/instantChat/ChatResponseView',
    'views/instantChat/ChatResponseListView',
    'collections/instantChat/ChatMessageCollection',
    'views/validation/ErrorView',
    'extensions/marionette/views/RenderedLayout',
    'util/titleAlertUtil',
    'goalsUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil, InstantChatService, ChatMessageModel, SendMessageModel, StartChatSessionModel, CloseChatSessionModel, UpdateChatStatusModel, ChatResponseView, ChatResponseListView, ChatMessageCollection, ErrorView, RenderedLayout, TitleAlertUtil,goalsUtil) {
    var InstantChatLayout = RenderedLayout.extend({
        el: '#click-to-chat',
        defaults: {
            messages: ChatMessageCollection,
            chatResponseListView: ChatResponseListView,
            chatSessionStarted: false,
            chatUpdateTimer: null,
            sessionClosed: true
        },
        regions: {
            chatTitle: '.chat_title',
            incomingMessages: '.incomingMessages',
            errorMessage: '.errorMessage'
        },
        events: {
            'click .send_chat': 'sendChatMessage',
            'click .close_chat': 'closeChatWindow',
            'click .minimize_chat': 'minimizeChatWindow',
            'keyup .chat_input': 'sendChatMessageKeyPress'
        },
        ui: {
            '$chatContent': '.click_to_chat',
            '$chatTitle': '.chat_title',
            '$newMessage': '.new_message',
            '$incomingMessages': '.incomingMessages',
            '$firstMessage': '.firstMessage',
            '$errorMessage': '.errorMessage',
            '$chatInput': '.chat_input',
            '$sendChat': '.send_chat',
            '$minimizeChat': '.minimize_chat',
            '$minimizeChatImg': '.minimize_chat img',
            '$chatWindow': '.chat_window'
        },
        initialize: function () {
            var viewContext = this;

            //clear modal
            this.ui.$incomingMessages.html('');
            this.ui.$firstMessage.html('');
            this.ui.$errorMessage.html('');
            this.ui.$chatInput.val('');

            this.enableControls();
            this.chatSessionStarted = false;
            this.isMinimized = false;
            this.chatBoxTitleAlert =
                new TitleAlertUtil(App.siteSettings.chatSettings.newMessageText,
                    {
                        requireBlur: false,
                        stopOnFocus: true,
                        duration: 0,
                        interval: 700
                    }, this.ui.$chatTitle);

            //get the title tag and then create the title alert object
            var $title = $('html head').find('title');
            this.documentTitleAlert =
                new TitleAlertUtil(App.siteSettings.chatSettings.newMessageText,
                    {
                        requireBlur: true,
                        stopOnFocus: true,
                        duration: 0,
                        interval: 700
                    }, $title);

            /**
             * @event onStartChatSessionComplete
             */
            EventAggregator.on('onStartChatSessionComplete', function (startChatSessionModel) {
                viewContext.startChatSessionComplete(startChatSessionModel);
            });

            /**
             * @event onUpdateChatStatusComplete
             */
            EventAggregator.on('onUpdateChatStatusComplete', function (updateChatStatusModel) {
                viewContext.updateChatMessages(updateChatStatusModel);
            });

            /**
             * @event onSendMessageComplete
             */
            EventAggregator.on('onSendMessageComplete', function (sendChatModel) {
                viewContext.onSendMessageComplete(sendChatModel);
            });

            /**
             * @event onCloseChatSessionComplete
             */
            EventAggregator.on('onCloseChatSessionComplete', function (closeChatSessionModel) {
                viewContext.onCloseChatSessionComplete(closeChatSessionModel);
            });
        },
        /**
         * Minimizes the chat window
         *
         * @method minimizeChatWindow
         * @param e
         */
        minimizeChatWindow: function (e) {
            e.preventDefault();

            if (this.isMinimized) {
                this.ui.$chatContent.slideDown({duration: 220});

                this.$el.animate({
                    bottom: 100,
                    right: 10,
                    duration: 220
                });

                //scroll the chat window to the top
                this.scrollChatWindow();

                //set icon
                var url = this.ui.$minimizeChat.data('maximize-url');
                var alt = this.ui.$minimizeChat.data('maximize-alt');
                this.ui.$minimizeChatImg.attr('src', url);
                this.ui.$minimizeChatImg.attr('alt', alt);

                this.isMinimized = false;

                //stop the message alert if it is running
                if (this.chatBoxTitleAlert.isRunning()) {
                    this.chatBoxTitleAlert.stop();
                }
            } else {
                this.ui.$chatContent.slideUp({duration: 220});

                this.$el.animate({
                    bottom: 0,
                    right: 10,
                    duration: 220
                });

                //set icon
                var url = this.ui.$minimizeChat.data('minimize-url');
                var alt = this.ui.$minimizeChat.data('minimize-alt');
                this.ui.$minimizeChatImg.attr('src', url);
                this.ui.$minimizeChatImg.attr('alt', alt);

                this.isMinimized = true;
            }
        },
        /**
         * After the message is received by
         * the chat service adds it to the chatMessages
         * collection and renders it in the view
         *
         * @method onSendMessageComplete
         * @param sendChatModel
         */
        onSendMessageComplete: function (sendChatModel) {
            var newChatMessages = sendChatModel.chatMessageResponse.chatMessages;
            if (newChatMessages.length > 0) {
                newChatMessages.each(function (message) {
                        App.InstantChat.chatMessages.add(message);
                    }
                );
            }
            App.InstantChat.sessionId = sendChatModel.chatMessageResponse.sessionId;
            App.InstantChat.statusCode = sendChatModel.chatMessageResponse.chatStatusCode;
        },
        /**
         * Receives the new chat messages and if there are new ones adds
         * them to the InstantChat.chatMessages collection and renders
         * the list view.
         *
         * @method startChatSessionComplete
         * @param startChatSessionModel
         */
        startChatSessionComplete: function (startChatSessionModel) {
            var newChatMessages = startChatSessionModel.chatMessageResponse.chatMessages;
            if (newChatMessages.length > 0) {
                newChatMessages.each(function (message) {
                        App.InstantChat.chatMessages.add(message);
                    }
                );
            }

            App.InstantChat.sessionId = startChatSessionModel.chatMessageResponse.sessionId;
            App.InstantChat.statusCode = startChatSessionModel.chatMessageResponse.chatStatusCode;

            this.setChatResponseListView();
            this.updateChatStatus();
            goalsUtil.communicateWithAExpert('Chat');
        },
        /**
         *
         * @method onCloseChatSessionComplete
         */
        onCloseChatSessionComplete: function (closeChatSessionModel) {
            //stop the timer
            clearInterval(this.chatUpdateTimer);
            this.chatUpdateTimer = null;
            App.InstantChat.sessionId = closeChatSessionModel.chatMessageResponse.sessionId;
            App.InstantChat.statusCode = closeChatSessionModel.chatMessageResponse.chatStatusCode;
        },
        /**
         * Creates the chat list view and renders it.
         *
         * @method setChatResponseListView
         */
        setChatResponseListView: function () {
            var chatResponseListView = new ChatResponseListView({collection: App.InstantChat.chatMessages});
            this.incomingMessages.show(chatResponseListView);
            this.sessionClosed = false;
        },
        /**
         * Updates the current list view with new chat messages
         *
         * @method updateChatMessages
         * @param updateChatStatusModel
         */
        updateChatMessages: function (updateChatStatusModel) {
            this.processChatMessageResponse(updateChatStatusModel.chatMessageResponse);

            var newChatMessages = updateChatStatusModel.chatMessageResponse.chatMessages;
            if (newChatMessages.length > 0 && updateChatStatusModel.get('sessionActive') === true) {
                newChatMessages.each(function (message) {
                        var msg = message.get("message").replace("The conversation request has been accepted by an agent. Please start the conversation.", "The conversation request has been accepted by an agent. " + App.dictionary.get('common.Misc.PleaseStartTheConversation', ''));
                        message.set("message", msg);
                        App.InstantChat.chatMessages.add(message);
                    }
                );

                this.scrollChatWindow();
                this.documentTitleAlert.start();
                if (this.isMinimized && !this.chatBoxTitleAlert.isRunning()) {
                    this.chatBoxTitleAlert.start();
                }
            }
            App.InstantChat.sessionId = updateChatStatusModel.chatMessageResponse.sessionId;
            App.InstantChat.statusCode = updateChatStatusModel.chatMessageResponse.chatStatusCode;

            this.startChatUpdateTimer();
        },
        /**
         * Checks the response of the server and
         * response appropriately
         *
         * @method processChatMessageResponse
         * @param chatMessageResponse
         */
        processChatMessageResponse: function (chatMessageResponse) {
            if (chatMessageResponse.chatStatusCode == "6") {
                //display message
                // chatResponseListView = new ChatResponseListView({collection:chatMessages})
                //outerScope.errorMessage.show(chatResponseListView);
                this.disableControls();
                this.closeChatSession();
            }
        },
        /**
         * Scrolls the chat window back to the top
         *
         * @method scrollChatWindow
         */
        scrollChatWindow: function () {
            this.ui.$chatWindow.scrollTop(this.ui.$chatWindow[0].scrollHeight);
        },
        /**
         * Sends chat message when the user
         * hits enter.
         *
         * @method sendChatMessageKeyPress
         * @param e
         */
        sendChatMessageKeyPress: function (e) {
            if (e.which === 13) {
                e.preventDefault();
                this.sendChatMessage(e);
            }
        },
        /**
         * Receives the chat message and sends it
         * to the sevice
         *
         * @method sendChatMessage
         * @param e
         */
        sendChatMessage: function (e) {
            e.preventDefault();
            if (this.ui.$sendChat.hasClass('disabled') == true) {
                return;
            }

            var message = this.ui.$chatInput.val();

            if (!ObjectUtil.isNullOrEmpty(message)) {
                if (this.chatSessionStarted == true) {
                    InstantChatService.sendMessage(message, App.siteSettings.currentItemId, App.InstantChat.sessionId, App.InstantChat.statusCode);
                    this.scrollChatWindow();
                } else {
                    //start the chat session
                    this.startChatSession();
                }

            }
            //clear the chat text field
            this.ui.$chatInput.val('');
        },
        /**
         * Starts the chat session and sends back the initial question.
         *
         * @method startChatSession
         */
        startChatSession: function () {
        	this.ui.$firstMessage.html('');//clear first/intro message
            var initialQuestion = this.ui.$chatInput.val();
            var firstMessage =
                new Backbone.Model({
                    message: initialQuestion,
                    chatterName: App.siteSettings.chatSettings.defaultUserName,
                    isOperator: false
                });

            App.InstantChat.chatMessages.add(firstMessage);

            InstantChatService.startChatSession(initialQuestion, App.siteSettings.currentItemId);
            this.chatSessionStarted = true;
        },
        /**
         * Clears the interval and checks to see
         * if there has been a response from the server
         *
         * @method updateChatStatus
         */
        updateChatStatus: function () {
            this.stopChatUpdateTimer();

            if (this.sessionClosed === false) {
                InstantChatService.updateChatStatus(App.siteSettings.currentItemId, App.InstantChat.sessionId, App.InstantChat.statusCode);
            }
        },
        /**
         * Closes the chat session.
         *
         * @method closeChatSession
         */
        closeChatSession: function () {
            this.stopChatUpdateTimer();
            this.chatSessionStarted = false;
            this.sessionClosed = true;

            if (App.InstantChat.chatMessages.length > 0) {
                App.InstantChat.chatMessages.reset();
            }

            InstantChatService.closeChatSession(App.InstantChat.sessionId, App.InstantChat.statusCode);
        },
        /**
         * @method closeChatWindow
         * @param e
         */
        closeChatWindow: function (e) {
            e.preventDefault();
            if (confirm(App.siteSettings.chatSettings.confirmExitMessage)) {
                this.closeChatSession();
                this.$el.css({
                    display: "none"
                });
                //stop the module
                App.module('InstantChat').stop();
            }
        },
        /**
         * @method openChatWindow
         */
        openChatWindow: function () {
            this.$el.css({
                display: "block"
            });

            $('#click-to-chat img').unveil();
        },
        /**
         * Sets the interval for polling the server.
         *
         * @method startChatUpdateTimer
         */
        startChatUpdateTimer: function () {
            var serverPollingInterval = $("#serverPollingInterval").val();
            var outerScope = this;
            this.chatUpdateTimer = setInterval(function () {
                outerScope.updateChatStatus()
            }, serverPollingInterval);
        },
        /**
         * Clears the interval for polling the server.
         *
         * @method stopChatUpdateTimer
         */
        stopChatUpdateTimer: function () {
            clearInterval(this.chatUpdateTimer);
            //this.chatUpdateTimer=null;
        },
        /**
         * @method disableControls
         */
        disableControls: function () {
            this.ui.$sendChat.removeAttr('href');
            this.ui.$sendChat.addClass('disabled');

            this.ui.$chatInput.val('');
            this.ui.$chatInput.attr('disabled', true);
        },
        /**
         * @method enableControls
         */
        enableControls: function () {
            this.ui.$sendChat.attr('href', '');
            this.ui.$sendChat.removeClass('disabled');

            this.ui.$chatInput.val('');
            this.ui.$chatInput.removeAttr('disabled');
        },

    	/**
         * @method setIntroMessage
         */
        setIntroMessage: function (message) {
        	this.ui.$firstMessage.html(message);
        }
    });

    return InstantChatLayout;
});
