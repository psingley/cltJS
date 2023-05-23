define([
    'jquery',
    'underscore',
    'backbone',
    'app'
], function ($, _, Backbone, App) {
    var bookingErrorService = {
        logClientMessages: function (errortype, messages, stepname) {
            var data = {
                messages: "Url: " + window.location + ", Error Type: " + errortype + ", Step Number: " + stepname + ", Error Message: " + messages
            }
            var result = $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/Booking/BookingService.asmx/LogClientMessages',
                error: function (errorResponse) {
                    console.log(errorResponse.responseText);
                    result = errorResponse.responseText;
                }
            }).complete(function () {
                result = "Success";
            });
            return result;
        }
    }
    return bookingErrorService;
    });