define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    String.prototype.trimRight = function (charlist) {
        if (charlist === undefined)
            charlist = "\s";

        return this.replace(new RegExp("[" + charlist + "]+$"), "");
    };

    String.prototype.trimLeft = function (charlist) {
        if (charlist === undefined)
            charlist = "\s";

        return this.replace(new RegExp("^[" + charlist + "]+"), "");
    };

    String.prototype.replaceAt = function (str, strToReplace, strToReplaceWith) {
        //get the index of the parameter to replace
        var n = str.indexOf(strToReplace);
        //get a substring starting at the index of the parameter to replace
        var cutOffString = str.substring(n);
        //find the next occurrence of an amperstan (which will tell us where the next param starts)
        var nextParamOccurrence = cutOffString.indexOf('&');

        //get the exact string of the parameter we are going to replace
        var paramToReplace = cutOffString.length;
        if (nextParamOccurrence !== -1) {
            var paramToReplace = cutOffString.substring(0, nextParamOccurrence);
        }

        var beginningString = str.substring(0, n);
        var endingString = str.substring(n + paramToReplace);

        //substitute the new parameter value.
        return beginningString + strToReplaceWith + endingString;
    };
});