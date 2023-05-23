define([
	'jquery',
	'underscore',
	'backbone',
	'app'
], function ($, _, Backbone, App) {
	var uriUtil = {
		getUriHash: function (object) {
			var str = this.serializeUrl(object);
			return "q/" + str;
		},
		getUrlVars: function () {
			//set to a key value pair for each parameter
			var hash;
			var jsonObject = {};
			var hashes = location.hash.slice(location.hash.indexOf('#q/') + 3).split('&');
			for (var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				jsonObject[hash[0]] = decodeURIComponent(hash[1]);
			}
			return jsonObject;
		},
		setHash: function (value) {
			location.hash = value;
		},
		setHashByObject: function (obj) {
			var hash = this.getUriHash(obj);
			location.hash = hash;
		},
		updateSearchOptionsHash: function (params) {
			var serializableObject = params.serializableObject(App.Search.searchOptions);
			this.setHashByObject(serializableObject);
		},
		//encodes the object for a url
		serializeUrl: function (object) {
			var str = [];
			for (var p in object)
				str.push(encodeURIComponent(p) + "=" + encodeURIComponent(object[p]));
			return str.join("&");
		},
		getParameterByName: function (name) {
			name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
			var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", 'i'),
				results = regex.exec(location.search);
			return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		},
		deleteParameterByName: function (url, parameter) {
			//delete parameter in server part only
			var urlParts = url.split("#");
			//if there is hash in url, get everything before it
			var urlPartWithoutHash = urlParts[0];
			//get array of parameters
			var urlParameters = String(urlPartWithoutHash).split("?");
			if (urlParameters.length > 1) {
				var prefix = encodeURIComponent(parameter) + "=";
				var parameters = urlParameters[1].split(/[&;]/g);
				for (var j = parameters.length; j-- > 0;) {
					if (parameters[j].lastIndexOf(prefix, 0) !== -1) {
						parameters.splice(j, 1);
					}
				}
				url = urlParameters[0]	//pathname
					+ (parameters.length > 0 ? "?" + parameters.join("&") : "")		//parameters
					+ (urlParts.length > 1 ? "#" + urlParts[urlParts.length - 1] : "");		//hash
			}
			return url;
		},
		replaceParameterByName: function (paramName, paramValue, url) {
			if (paramValue == null) {
				paramValue = '';
			}
			var pattern = new RegExp('\\b(' + paramName + '=).*?(&|$)');
			if (url.search(pattern) >= 0) {
				return url.replace(pattern, '$1' + paramValue + '$2');
			}
			url = url.replace(/\?$/, '');
			return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
		}
	};

	return uriUtil;
});