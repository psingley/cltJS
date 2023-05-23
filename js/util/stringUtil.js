define([],
function () {
    var stringUtil = {
        format: function(format) {
            var args = Array.prototype.slice.call(arguments, 1);
	        return format.replace(/{(\d+)}/g,
		        function(match, number) {
			        return typeof args[number] != 'undefined'
				        ? args[number]
				        : match;
		        });
        },
			//For all browser support
        trim: function (input) {
        	return input.replace(/^\s+|\s+$/g, '');
        },

        toTitleCase: function (input) {
            return input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        },
		protectSpecialSymbols : function(input) {
			if (!input) {
				return input;
			}

			return input.replace(/>/g, "&gt;").replace(/</g, "&lt;");
		}
    }
    return stringUtil;
})