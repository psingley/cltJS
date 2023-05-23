define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'event.aggregator',
    'models/instantChat/SendMessageModel',
    'models/instantChat/StartChatSessionModel',
    'models/instantChat/CloseChatSessionModel',
    'models/instantChat/UpdateChatStatusModel'

], function ($, _, Backbone, App, EventAggregator, SendMessageModel, StartChatSessionModel, CloseChatSessionModel, UpdateChatStatusModel) {
    var instantChatService = {

        startChatSession: function (initialQuestion,currentItemId) {
        	//fetch the results

	        var url = document.location.href;
            var startChatSessionModel = new StartChatSessionModel();
            var request = '{initialQuestion:"' + initialQuestion + '",currentItemId:"' + currentItemId + '",url:"' + url + '"}';
            startChatSessionModel.fetch({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data:request,
                success: function (response) {
                },
                error: function (errorResponse) {
                    console.log("startChatSession Inside Failure");
                }
            })  //have to wait for the fetch to complete
                .complete(function () {
                    EventAggregator.trigger('onStartChatSessionComplete', startChatSessionModel);
                });
        } ,
        sendMessage: function (message,currentItemId,sessionId,statusCode) {
            //fetch the results
            var sendMessageModel = new SendMessageModel();
            var request = '{message:"'+message+'",currentItemId:"'+currentItemId+'",sessionId:"'+sessionId+'",statusCode:"'+statusCode+'"}';
            sendMessageModel.fetch({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data:request,
                success: function (response) {
                },
                error: function (errorResponse) {
                    console.log("sendMessage Inside Failure");
                }
            })  //have to wait for the fetch to complete
                .complete(function () {
                	EventAggregator.trigger('onSendMessageComplete', sendMessageModel);
                	$(".chat_window").scrollTop($(".chat_window")[0].scrollHeight);
                });
        },
        closeChatSession: function (sessionId,statusCode) {
            //fetch the results
            var closeChatSessionModel = new CloseChatSessionModel();
            var request ='{sessionId:"'+sessionId+'",statusCode:"'+statusCode+'"}';
            closeChatSessionModel.fetch({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data:request,
                success: function (response) {
                },
                error: function (errorResponse) {
	                console.log("closeChatSession Inside Failure");
                }
            })  //have to wait for the fetch to complete
                .complete(function () {
                    EventAggregator.trigger('onCloseChatSessionComplete', closeChatSessionModel);
                });
        } ,
        updateChatStatus: function (currentItemId,sessionId,statusCode) {
            //fetch the results
            var updateChatStatusModel = new UpdateChatStatusModel();
            var request ='{currentItemId:"'+currentItemId+'",sessionId:"'+sessionId+'",statusCode:"'+statusCode+'"}';
            updateChatStatusModel.fetch({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data:request,
                success: function (response) {
                },
                error: function (errorResponse) {
	                console.log("updateChatStatus Inside Failure");
                }
            })  //have to wait for the fetch to complete
                .complete(function () {
                    EventAggregator.trigger('onUpdateChatStatusComplete', updateChatStatusModel);
                });
        }
    }

    return instantChatService;
});