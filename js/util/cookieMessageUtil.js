define([
    'jquery',
    'underscore',
    'app',
	'cookie'
], function ($, _, App, cookie) {
    var cookieMessageUtil = {
        cookieName: 'CLOSECOOKIETIP',
        SetMessageCookieValue: function () {
            var cookier = cookie.get(this.cookieName);
            var exdays = 90;
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + exdays);
            cookie.set(this.cookieName, '1',{ expires: exdate});
        },
        IsMessageCookieSet: function () {
            var cookieRes = cookie.get(this.cookieName);
            return (cookieRes != null);
        }
    }
    return cookieMessageUtil;
});



