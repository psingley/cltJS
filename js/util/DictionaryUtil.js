define([
    'jquery',
    'underscore',
    'models/dictionary/DictionaryModel',
    'event.aggregator',
    'util/objectUtil'
], function ($, _, DictionaryModel, EventAggregator, ObjectUtil) {
    var dictionaryUtil = (function () {

        //constructor
        var constructor = function () {
            //private instance variables.
        	var _dictionaries = new DictionaryModel();        	
	        var deferred = $.Deferred(function (defer) {            	
	        	_dictionaries.fetch({
	        		type: "GET",
	        		contentType: "application/json; charset=utf-8",
	        		dataType: "json",
	        		success: function (response) {
	        		    defer.resolve(_dictionaries);
	        		},
	        		error: function (errorResponse) {
	        			console.log("Inside Failure");
	        			console.log(errorResponse.responseText);
	        			defer.reject();
	        		}
	        	});
            });

            //public instance variable
            this.getDictionaries = function(){
                return deferred.promise();
            }

            //public method
            this.get = function (key) {
                if (_dictionaries != null) {
                    var dictionaryTerm = _dictionaries.get(key);

                    if (ObjectUtil.isNullOrEmpty(dictionaryTerm)) {
                        console.log('could not find the dictionary item ' + key);
                        return '';
                    }

                    return dictionaryTerm;
                }

                console.log('dictionary is still null');
                return '';
            }

        	//public method
            this.get = function (key, defaultValue) {
            	if (_dictionaries != null) {
            		var dictionaryTerm = _dictionaries.get(key);

            		if (ObjectUtil.isNullOrEmpty(dictionaryTerm)) {
            			console.log('could not find the dictionary item, using default text. key: ' + key);
            			return defaultValue;
            		}

            		return dictionaryTerm;
            	}

            	console.log('dictionary is still null');
            	return defaultValue;
            }
        };

        return constructor;
    })();

    return dictionaryUtil;
});