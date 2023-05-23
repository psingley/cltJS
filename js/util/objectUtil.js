define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var objectUtil = {
        isNullOrEmpty: function (object) {
            if (object === undefined) {
                return true;
            } else {
                if (object === null) {
	                return true;
                } else {
                    if (object === '' || object === "") {
                        return true;
                    }
                }
            }
            return false;
        },
        isInteger: function (object)
        {
            return parseInt(object) == object;
        },
		isEven: function(number) {
			return (this.isInteger(number) && (number % 2 == 0));
		},
		getObjectLength: function(obj) {

    		var size = 0, key;

    		for (key in obj) {
    			if (obj.hasOwnProperty(key))
    				size++;
    		}

    	return size;
		}
    };

    return objectUtil;
});