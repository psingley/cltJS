"use strict";

/* globals xml2json, sforce, console */
; (function (window) {

    var EXP = window.EXP = window.EXP || {};

    (function (lib) {
        lib.MethodEnum = {
            GET: 'GET',
            POST: 'POST'
        };
        lib.DataTypeEnum = {
            XML: 'xml',
            JSON: 'json'
        };
        lib.SFDataTypeEnum = {
            XML: 'text/xml',
            JSON: 'text/json'
        };
        return lib;
    }(EXP || {}));

    EXP.DQ = (function (win, dq, $) {
        dq.UrlEnum = {
            ADDRESS: 0,
            EMAIL: 1,
            MOBILE: 2,
            GEO: 3
        };

        dq.TokenEnum = {
            ADDRESS: 0,
            EMAIL: 1,
            MOBILE: 2
        };

        dq.Urls = {};
        dq.Tokens = {};

        dq.addUrl = function (service, url) {
            for (var enumVal in EXP.DQ.UrlEnum) {
                if (EXP.DQ.UrlEnum.hasOwnProperty(enumVal)) {
                    if (service === EXP.DQ.UrlEnum[enumVal]) {
                        EXP.DQ.Urls[service] = url;
                        return;
                    }
                }
            }
            throw "Not an EXP DQ service: " + service;
        };

        dq.addToken = function (service, token) {
            for (var enumVal in EXP.DQ.TokenEnum) {
                if (EXP.DQ.TokenEnum.hasOwnProperty(enumVal)) {
                    if (service === EXP.DQ.TokenEnum[enumVal]) {
                        EXP.DQ.Tokens[service] = token;
                        return;
                    }
                }
            }
            throw "Not an EXP DQ token: " + token;
        };

        dq.reset = function () {
            dq.Urls = {};
            dq.Tokens = {};
        };

        /*	This work is licensed under Creative Commons GNU LGPL License.

            License: http://creativecommons.org/licenses/LGPL/2.1/
        Version: 0.9
            Author:  Stefan Goessner/2006
            Web:     http://goessner.net/
        */
        function xml2json(xml, tab) {
            var X = {
                toObj: function (xml) {
                    var o = {};
                    if (xml.nodeType === 1) {   // element node ..
                        if (xml.attributes.length) { // element with attributes  ..
                            for (var i = 0; i < xml.attributes.length; i++) {
                                o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                            }
                        }

                        if (xml.firstChild) { // element has child nodes ..
                            var textChild = 0, cdataChild = 0, hasElementChild = false;
                            var n;
                            for (n = xml.firstChild; n; n = n.nextSibling) {
                                if (n.nodeType === 1) {
                                    hasElementChild = true;
                                }
                                else if (n.nodeType === 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                                    // non-whitespace text
                                    textChild++;
                                }
                                else if (n.nodeType === 4) {
                                    // cdata section node
                                    cdataChild++;
                                }
                            }

                            if (hasElementChild) {
                                if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                    X.removeWhite(xml);
                                    for (n = xml.firstChild; n; n = n.nextSibling) {
                                        if (n.nodeType === 3) {
                                            // text node
                                            o["#text"] = X.escape(n.nodeValue);
                                        } else if (n.nodeType === 4) {
                                            // cdata node
                                            o["#cdata"] = X.escape(n.nodeValue);
                                        } else if (o[n.nodeName]) {
                                            // multiple occurence of element ..
                                            if (o[n.nodeName] instanceof Array) {
                                                o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                            } else {
                                                o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                            }
                                        } else {
                                            // first occurence of element..
                                            o[n.nodeName] = X.toObj(n);
                                        }
                                    }
                                }
                                else {
                                    if (!xml.attributes.length) {
                                        // mixed content
                                        o = X.escape(X.innerXml(xml));
                                    } else {
                                        o["#text"] = X.escape(X.innerXml(xml));
                                    }
                                }
                            }
                            else if (textChild) {
                                // pure text
                                if (!xml.attributes.length) {
                                    o = X.escape(X.innerXml(xml));
                                } else {
                                    o["#text"] = X.escape(X.innerXml(xml));
                                }
                            }
                            else if (cdataChild) {
                                // cdata
                                if (cdataChild > 1) {
                                    o = X.escape(X.innerXml(xml));
                                } else {
                                    for (n = xml.firstChild; n; n = n.nextSibling) {
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    }
                                }
                            }
                        }
                        if (!xml.attributes.length && !xml.firstChild) {
                            o = null;
                        }
                    } else if (xml.nodeType === 9) {
                        // document.node
                        o = X.toObj(xml.documentElement);
                    } else {
                        console.error("unhandled node type: " + xml.nodeType);
                    }

                    return o;
                },
                toJson: function (o, name, ind) {
                    var json = name ? ("\"" + name + "\"") : "";
                    if (o instanceof Array) {
                        for (var i = 0, n = o.length; i < n; i++) {
                            o[i] = X.toJson(o[i], "", ind + "\t");
                        }
                        json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                    } else if (o === null) {
                        json += (name && ":") + "null";
                    } else if (typeof (o) === "object") {
                        var arr = [];
                        for (var m in o) {
                            if (o.hasOwnProperty(m)) {
                                arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                            } else {
                                arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                            }
                        }
                        json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                    } else if (typeof (o) === "string") {
                        json += (name && ":") + "\"" + o.toString() + "\"";
                    } else {
                        json += (name && ":") + o.toString();
                    }
                    return json;
                },
                innerXml: function (node) {
                    var s = "";
                    if ("innerHTML" in node) {
                        s = node.innerHTML;
                    } else {
                        var asXml = function (n) {
                            var s = "";
                            if (n.nodeType === 1) {
                                s += "<" + n.nodeName;
                                for (var i = 0; i < n.attributes.length; i++) {
                                    s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                                }
                                if (n.firstChild) {
                                    s += ">";
                                    for (var c = n.firstChild; c; c = c.nextSibling) {
                                        s += asXml(c);
                                    }
                                    s += "</" + n.nodeName + ">";
                                } else {
                                    s += "/>";
                                }
                            } else if (n.nodeType === 3) {
                                s += n.nodeValue;
                            } else if (n.nodeType === 4) {
                                s += "<![CDATA[" + n.nodeValue + "]]>";
                            }

                            return s;
                        };
                        for (var c = node.firstChild; c; c = c.nextSibling) {
                            s += asXml(c);
                        }
                    }
                    return s;
                },
                escape: function (txt) {
                    return txt.replace(/[\\]/g, "\\\\")
                        .replace(/[\"]/g, '\\"')
                        .replace(/[\n]/g, '\\n')
                        .replace(/[\r]/g, '\\r');
                },
                removeWhite: function (e) {
                    e.normalize();
                    for (var n = e.firstChild; n;) {
                        if (n.nodeType === 3) {
                            // text node
                            if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
                                // pure whitespace text node
                                var nxt = n.nextSibling;
                                e.removeChild(n);
                                n = nxt;
                            } else {
                                n = n.nextSibling;
                            }
                        } else if (n.nodeType === 1) {
                            // element node
                            X.removeWhite(n);
                            n = n.nextSibling;
                        } else {
                            // any other node
                            n = n.nextSibling;
                        }
                    }
                    return e;
                }
            };
            if (xml.nodeType === 9) {
                // document node
                xml = xml.documentElement;
            }

            var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
            return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
        }

        dq.convertXml2Json = function (content) {
            if (typeof xml2json !== 'function') {
                throw 'xml2json.js not found - load this script before EDQ scripts.';
            }

            return xml2json(content, '');
        };

        // Initialize logging methods to ensure no exceptions when using logging.
        dq.logger = win.console || {};
        dq.logger.log = dq.logger.log || function (message) { };
        dq.logger.error = dq.logger.error || function (error) { };

        return dq;
    })(window, window.EXP.DQ || {}, window.jQuery);

    EXP.createWebServiceClient = function ($) {
        var client = {};

        client.ajax = null;

        client.callWebService = function (method, url, headers, content, datatype, timeout) {
            if (!EXP.DQ.Urls[url]) {
                throw "Unable to search, missing url: " + url;
            }

            if (client.ajax !== null) {
                try {
                    client.ajax.abort();
                    client.ajax = null;
                } catch (e) { }
            }

            var $self = this;
            var $dataType;
            var $url;

            if (typeof sforce !== 'undefined' && typeof sforce.connection !== 'undefined' && sforce && sforce.connection && $.isFunction(sforce.connection.remoteFunction)) {
                var $date = new Date();

                headers['salesforceproxy-endpoint'] = EXP.DQ.Urls[url];
                headers['salesforceproxy-sid'] = sforce.connection.sessionId;
                $url = '/services/proxy?no-cache=' + $date.getTime();
                $dataType = EXP.SFDataTypeEnum[datatype.toUpperCase()];
            } else {
                $url = EXP.DQ.Urls[url];
                $dataType = EXP.DataTypeEnum[datatype.toUpperCase()];
            }

            $.support.cors = true;

            client.ajax = $.ajax({
                context: $self,                
                type: EXP.MethodEnum[method],
                headers: headers,
                url: $url,
                data: content,
                dataType: $dataType,
                timeout: timeout === null ? 10000 : timeout
            });

            return client.ajax;
        };

        return client;
    };

    return EXP;

})(window);

"use strict";

;(function (window) {
    var EXP = window.EXP = window.EXP || {};
    EXP.DQ = EXP.DQ || {};
    EXP.DQ.Address = (function (lib, dq, $, undefined) {

        /**
         * A SOAP address search client.
         */
        lib.SoapClient = function (options) {
            var _self = this;
            var client = EXP.createWebServiceClient($);

            _self.options = {
                overridePrefix: 'Use entered: ',
                overrideSuffix: ''
            };
            options = options === undefined ? {} : options;
            $.extend(_self.options, options);


            /**
             * Search for address.
             * @param {string} query Text containing address to be searched for.
             * @param {string} dataset Dataset or country to search for.
             * @param {string} layout Layout name to be used. Defaults to empty string.
             * @param {string} engine Engine name to be used. Defaults to Intuitive engine.
             */
            this.search = function (query, dataset, layout, engine) {
                return lib.promise.call(_self, function (dfd) {
                    // Engine might change for each search, thus not defined in constructor.
                    // Default engine is intuitive.
                    engine = engine === undefined || engine === null ?
                        new lib.Engine({ engineType: lib.EngineEnum.INTUITIVE }) :
                        new lib.Engine({ engineType: lib.EngineEnum[engine.toUpperCase()] });

                    layout = layout === undefined || layout === null ? null : new lib.Layout(layout, layout);

                    dq.addUrl(dq.UrlEnum.ADDRESS, _self.options.soapUrl);
                    dq.addToken(dq.TokenEnum.ADDRESS, _self.options.token);

                    _self.setLayout(layout);
                    _self.setEngine(engine);
                    _self.setDataSet(new lib.DataSet(dataset, dataset));
                    lib.rejectIfThrow.call(_self, dfd, function (dfd) {
                        dq.addUrl(dq.UrlEnum.ADDRESS, _self.options.soapUrl);
                        dq.addToken(dq.TokenEnum.ADDRESS, _self.options.token);
                        _self.setEngine(engine);
                        _self.setDataSet(new lib.DataSet(dataset, dataset));
                        _self.doSearch(query)
                            .done(function (result) { dfd.resolve(result); })
                            .fail(function (e) { dfd.reject(e); });
                    });
                });
            };

            /**
             * Get final address using a moniker a.k.a format address.
             * @param {string} moniker Moniker returned in the Search step, which is used to identify address to be formatted.
             * @param {string} dataset Dataset or country to search for.
             * @param {string} layout Layout used to format the address. Address components are defined in layout.
             * @param {string} engine Engine name to be used. Defaults to Intuitive engine.
             */
            this.format = function (moniker, dataset, layout, engine) {
                return lib.promise.call(_self, function (dfd) {
                    // Engine might change for each search, thus not defined in constructor.
                    // Default engine is intuitive.
                    engine = engine === undefined || engine === null ?
                        new lib.Engine({ engineType: lib.EngineEnum.INTUITIVE }) :
                        new lib.Engine({ engineType: lib.EngineEnum[engine.toUpperCase()] });

                    dq.addUrl(dq.UrlEnum.ADDRESS, _self.options.soapUrl);
                    dq.addToken(dq.TokenEnum.ADDRESS, _self.options.token);
                    _self.setEngine(engine);
                    _self.setDataSet(new lib.DataSet(dataset, dataset));
                    lib.rejectIfThrow.call(_self, dfd, function (dfd) {
                        dq.addUrl(dq.UrlEnum.ADDRESS, _self.options.soapUrl);
                        dq.addToken(dq.TokenEnum.ADDRESS, _self.options.token);
                        _self.setEngine(engine);
                        _self.setDataSet(new lib.DataSet(dataset, dataset));
                        _self.setLayout(new dq.Address.Layout(layout, layout));
                        _self.doGetAddress(moniker)
                            .done(function (result) { dfd.resolve(result); })
                            .fail(function (e) { dfd.reject(e); });
                    });
                });
            };

            var doGetDataPacket = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ond="http://www.qas.com/OnDemand-2011-03"><soapenv:Header><ond:QAQueryHeader /></soapenv:Header><soapenv:Body><ond:QAGetData Localisation="?" /></soapenv:Body></soapenv:Envelope>';
            var doGetLayoutsPacket = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ond="http://www.qas.com/OnDemand-2011-03"><soapenv:Header><ond:QAQueryHeader /></soapenv:Header><soapenv:Body><ond:QAGetLayouts Localisation="?"><ond:Country>{{country}}</ond:Country></ond:QAGetLayouts></soapenv:Body></soapenv:Envelope>';
            var doCanSearchPacket = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ond="http://www.qas.com/OnDemand-2011-03"><soapenv:Header></soapenv:Header><soapenv:Body><ond:QACanSearch><ond:Country>{{country}}</ond:Country><ond:Engine>{{engine}}</ond:Engine><ond:Layout>{{layout}}</ond:Layout></ond:QACanSearch></soapenv:Body></soapenv:Envelope>';
            var doSearchPacket = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ond="http://www.qas.com/OnDemand-2011-03"><soapenv:Header><ond:QAQueryHeader /></soapenv:Header><soapenv:Body><ond:QASearch><ond:Country>{{country}}</ond:Country><ond:Engine Flatten="{{flatten}}" Intensity="{{intensity}}" PromptSet="{{promptSet}}" Threshold="{{threshold}}" Timeout="{{timeout}}">{{engine}}</ond:Engine><ond:Layout>{{layout}}</ond:Layout><ond:Search>{{searchTerm}}</ond:Search></ond:QASearch></soapenv:Body></soapenv:Envelope>';
            var doGetAddressPacket = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ond="http://www.qas.com/OnDemand-2011-03"><soapenv:Header><ond:QAQueryHeader /></soapenv:Header><soapenv:Body><ond:QAGetAddress><ond:Layout>{{layout}}</ond:Layout><ond:Moniker>{{moniker}}</ond:Moniker></ond:QAGetAddress></soapenv:Body></soapenv:Envelope>';

            var headersTemplate = {
                "Content-Type": "text/xml"
            };

            var datasets = [];
            var currentLayouts = [];
            var defaultEngine;
            var defaultDataSet;
            var defaultLayout;
            var lastCanSearchResult = false;

            var preparedDoGetLayoutsPacket;
            var preparedDoCanSearchPacket;
            var preparedDoSearchPacket;
            var preparedDoGetAddressPacket;


            var prepareDoGetLayouts = function prepareDoGetLayouts() {
                preparedDoGetLayoutsPacket = doGetLayoutsPacket
                    .replace('{{country}}', defaultDataSet !== undefined && defaultDataSet !== null ? defaultDataSet.getId() : '');
            };

            var prepareDoCanSearch = function prepareDoCanSearch() {
                preparedDoCanSearchPacket = doCanSearchPacket
                    .replace('{{layout}}', defaultLayout ? defaultLayout.getName() : '')
                    .replace('{{country}}', defaultDataSet !== undefined && defaultDataSet !== null ? defaultDataSet.getId() : '')
                    .replace('{{engine}}', defaultEngine.getEngineType());
            };

            var prepareDoSearch = function prepareDoSearch() {
                preparedDoSearchPacket = doSearchPacket
                    .replace("{{flatten}}", defaultEngine.isFlatten())
                    .replace("{{country}}", defaultDataSet !== undefined && defaultDataSet !== null ? defaultDataSet.getId() : '')
                    .replace("{{engine}}", defaultEngine.getEngineType())
                    .replace("{{intensity}}", defaultEngine.getIntensity())
                    .replace("{{promptSet}}", defaultEngine.getPromptSet())
                    .replace("{{threshold}}", defaultEngine.getThreshold())
                    .replace("{{timeout}}", defaultEngine.getTimeout())
                    .replace('{{layout}}', defaultLayout !== undefined && defaultLayout !== null ? defaultLayout.getName() : '');
            };

            var prepareDoGetAddress = function prepareDoGetAddress() {
                preparedDoGetAddressPacket = doGetAddressPacket
                    .replace("{{layout}}", defaultLayout !== undefined && defaultLayout !== null ? defaultLayout.getName() : '');
            };

            function logError(result, xml) {
                try {
                    // Try parse XML.
                    $.parseXML(xml);

                    // No failure, log as generic error.
                    dq.logger.error('Request error (usually caused by invalid token or license not supported): ' + xml);
                } catch (e) {
                    // XML parse error, log xml error.
                    dq.logger.error('XML error (' + e + '): ' + xml);
                }
            }

            this.setEngine = function (engine) {
                if (engine instanceof lib.Engine) {
                    defaultEngine = engine;
                } else {
                    throw 'Parameter is not an Engine object';
                }
            };

            this.setDataSet = function (dataSet) {
                if (typeof dataSet === 'string') {
                    for (var dataSetIndex = 0; dataSetIndex < datasets.length; dataSetIndex++) {
                        if (datasets[dataSetIndex].id === dataSet) {
                            dataSet = datasets[dataSetIndex];
                            break;
                        }
                    }
                }

                if (dataSet instanceof lib.DataSet) {
                    defaultDataSet = dataSet;
                } else {
                    throw 'Parameter is not a DataSet object';
                }
            };

            this.getDataSet = function () {
                return defaultDataSet;
            };

            this.setLayout = function (layout) {
                if (layout instanceof lib.Layout) {
                    defaultLayout = layout;
                } else if (layout === null || layout === undefined) {
                    defaultLayout = new lib.Layout('', '');
                } else {
                    throw 'Parameter is not a Layout object';
                }
            };

            this.getLayout = function (layout) {
                var ret;
                currentLayouts.forEach(function (lo) {
                    if (lo.getId() === layout) {
                        ret = lo;
                    }
                });
                if (ret) {
                    return ret;
                } else {
                    throw "Layout not found for current dataset.";
                }
            };

            this.doGetData = function () {
                return lib.promise.call(this, function (dfd) {
                    var headers = headersTemplate;
                    headers['Auth-Token'] = dq.Tokens[dq.TokenEnum.ADDRESS];
                    headers['SoapAction'] = "http://www.qas.com/OnDemand-2011-03/DoGetData";

                    var content = doGetDataPacket;
                    var promise = client.callWebService(EXP.MethodEnum.POST, EXP.DQ.UrlEnum.ADDRESS, headers, doGetDataPacket, EXP.DataTypeEnum.XML, _self.options.timeout);
                    promise.done(function (evt, result, data) {
                        lib.rejectIfThrow.call(this, dfd, function (dfd) {
                            var response = JSON.parse(dq.convertXml2Json(data.responseXML));
                            var datasetArray = [];
                            var jDataSets = response['soap:Envelope']['soap:Body'].QAData;
                            if ($.type(jDataSets.DataSet) === "array") {
                                jDataSets.DataSet.forEach(function (entry) {
                                    datasetArray.push(new lib.DataSet(entry.ID, entry.Name));
                                });
                            } else if ($.type(jDataSets.DataSet) === "object") {
                                datasetArray.push(new lib.DataSet(jDataSets.DataSet.ID, jDataSets.DataSet.Name));
                            }
                            var dataResult = new lib.QAData(datasetArray);
                            dfd.resolve(dataResult);
                        });
                    }).fail(function (evt, result, data) {
                        logError(result, content);
                        dfd.reject(_self.options.errorText);
                    });
                });
            };

            this.doGetLayouts = function () {
                prepareDoGetLayouts();
                var content = preparedDoGetLayoutsPacket;

                return lib.promise.call(this, function (dfd) {
                    var headers = headersTemplate;
                    headers['Auth-Token'] = dq.Tokens[EXP.DQ.TokenEnum.ADDRESS];
                    headers['SoapAction'] = "http://www.qas.com/OnDemand-2011-03/DoGetLayouts";

                    var promise = client.callWebService(EXP.MethodEnum.POST, EXP.DQ.UrlEnum.ADDRESS, headers, content, EXP.DataTypeEnum.XML, _self.options.timeout);
                    promise.done(function (evt, result, data) {
                        lib.rejectIfThrow.call(this, dfd, function (dfd) {
                            var response = JSON.parse(dq.convertXml2Json(data.responseXML));
                            var layoutArray = [];
                            var jLayouts = response['soap:Envelope']['soap:Body'].QALayouts;
                            if ($.type(jLayouts.Layout) === "array") {
                                jLayouts.Layout.forEach(function (entry) {
                                    layoutArray.push(new lib.Layout(entry.Name, entry.Comment));
                                });
                            } else if ($.type(jLayouts.Layout) === "object") {
                                layoutArray.push(new lib.Layout(jLayouts.Layout.Name, jLayouts.Layout.Comment));
                            }
                            var layoutResult = new lib.QALayouts(layoutArray);
                            currentLayouts = layoutResult.getLayouts();
                            dfd.resolve(layoutResult.getLayouts());
                        });
                    }).fail(function (evt, result, data) {
                        logError(result, content);
                        dfd.reject(_self.options.errorText);
                    });
                });
            };

            this.doCanSearch = function () {
                prepareDoCanSearch();

                return lib.promise.call(this, function (dfd) {
                    var headers = headersTemplate;
                    headers['Auth-Token'] = dq.Tokens[EXP.DQ.TokenEnum.ADDRESS];
                    headers['SoapAction'] = "http://www.qas.com/OnDemand-2011-03/DoCanSearch";

                    var content = preparedDoCanSearchPacket;
                    var promise = client.callWebService(EXP.MethodEnum.POST, EXP.DQ.UrlEnum.ADDRESS, headers, content, EXP.DataTypeEnum.XML, _self.options.timeout);
                    promise.done(function (evt, result, data) {
                        lib.rejectIfThrow.call(this, dfd, function (dfd) {
                            var response = JSON.parse(dq.convertXml2Json(data.responseXML));
                            var layoutArray = [];
                            var jOk = response['soap:Envelope']['soap:Body'].QASearchOk;
                            var isOk = jOk.IsOk;
                            if (isOk === "true") {
                                lastCanSearchResult = new lib.QASearchOk(isOk);
                            } else {
                                lastCanSearchResult = new lib.QASearchOk(isOk, jOk.ErrorCode, jOk.ErrorMessage);
                            }
                            dfd.resolve(lastCanSearchResult);
                        });
                    }).fail(function (evt, result, data) {
                        logError(result, content);
                        dfd.reject(_self.options.errorText);
                    });
                });
            };

            this.doSearch = function (search) {
                prepareDoSearch();

                return lib.promise.call(this, function (dfd) {
                    if (search.length > 200) {
                        dfd.reject("Search term is too long");
                    }

                    var content = preparedDoSearchPacket.replace("{{searchTerm}}", search);
                    var headers = headersTemplate;
                    headers['Auth-Token'] = dq.Tokens[EXP.DQ.TokenEnum.ADDRESS];
                    headers['SoapAction'] = "http://www.qas.com/OnDemand-2011-03/DoSearch";

                    var promise = client.callWebService(EXP.MethodEnum.POST, EXP.DQ.UrlEnum.ADDRESS, headers, content, EXP.DataTypeEnum.XML, _self.options.timeout);
                    promise.done(function (evt, result, data) {

                        lib.rejectIfThrow.call(this, dfd, function (dfd) {
                            var response = JSON.parse(dq.convertXml2Json(data.responseXML));
                            var jSearchResult = response['soap:Envelope']['soap:Body'].QASearchResult;
                            var jPicklist = jSearchResult.QAPicklist;

                            var picklistArray = [];

                            // Add "Override" or "Use entered" picklist item as the first item
                            var override = null;
                            if (jPicklist.FullPicklistMoniker !== undefined && jPicklist.FullPicklistMoniker !== null) {
                                var overridePicklistItem = _self.options.overridePrefix + search + _self.options.overrideSuffix;
                                override = new lib.QAPicklistEntry(overridePicklistItem, jPicklist.FullPicklistMoniker, overridePicklistItem, overridePicklistItem, '', '0');
                            }

                            // Parse SOAP response for picklist items
                            if ($.type(jPicklist.PicklistEntry) === "array") {
                                jPicklist.PicklistEntry.forEach(function (entry) {
                                    picklistArray.push(new lib.QAPicklistEntry(entry['@fullAddress'], entry.Moniker, entry.PartialAddress, entry.Picklist, entry.Postcode, entry.Score));
                                });
                            } else if ($.type(jPicklist.PicklistEntry) === "object") {
                                var entry = jPicklist.PicklistEntry;
                                picklistArray.push(new lib.QAPicklistEntry(entry['@fullAddress'], entry.Moniker, entry.PartialAddress, entry.Picklist, entry.Postcode, entry.Score));
                            }

                            // Remove "No matches" picklist item
                            for (var picklistIndex in picklistArray) {
                                if (!picklistArray.hasOwnProperty(picklistIndex)) {
                                    continue;
                                }
                                if (typeof picklistArray[picklistIndex].picklist !== 'string') {
                                    continue;
                                }

                                if (picklistArray[picklistIndex].picklist.toUpperCase() === "No matches".toUpperCase()) {
                                    picklistArray.splice(picklistIndex, 1);
                                    break;
                                }
                            }

                            // Prepare the final picklist container to be returned.
                            var picklist = new lib.QAPicklist(jPicklist.FullPicklistMoniker, picklistArray, jPicklist.Prompt, jPicklist.Total, jPicklist['@OverThreshold'], jPicklist['@MoreOtherMatches']);

                            var searchResult = new lib.QASearchResult(picklist, override);

                            dfd.resolve(searchResult);
                        });

                    }).fail(function (evt, result, data) {
                        logError(result, content);
                        dfd.reject(_self.options.errorText);
                    });
                });
            };

            this.doGetAddress = function (moniker) {
                prepareDoGetAddress();
                var content = preparedDoGetAddressPacket.replace("{{moniker}}", moniker);

                return lib.promise.call(this, function (dfd) {

                    var headers = headersTemplate;
                    headers['Auth-Token'] = dq.Tokens[EXP.DQ.TokenEnum.ADDRESS];
                    headers['SoapAction'] = "http://www.qas.com/OnDemand-2011-03/DoGetAddress";

                    var promise = client.callWebService(EXP.MethodEnum.POST, EXP.DQ.UrlEnum.ADDRESS, headers, content, EXP.DataTypeEnum.XML, _self.options.timeout);
                    promise.done(function (evt, result, data) {
                        lib.rejectIfThrow.call(this, dfd, function (dfd) {
                            var response = JSON.parse(dq.convertXml2Json(data.responseXML));
                            var addressLineArray = [];
                            var jAddress = response['soap:Envelope']['soap:Body'].Address.QAAddress;
                            if ($.type(jAddress.AddressLine) === 'object') {
                                var newArr = [];
                                newArr.push(jAddress.AddressLine);
                                jAddress.AddressLine = newArr;
                            }

                            var formattedAddressMap = {};

                            if ($.type(jAddress.AddressLine) === "array") {
                                jAddress.AddressLine.forEach(function (entry, entryIndex) {
                                    var dpGroup = [];
                                    if (entry.LineContent === 'DataPlus') {
                                        if ($.type(entry.DataPlusGroup) === 'object') {
                                            var newArr = [];
                                            newArr.push(entry.DataPlusGroup);
                                            entry.DataPlusGroup = newArr;
                                        }
                                        if ($.type(entry.DataPlusGroup) === 'array') {
                                            entry.DataPlusGroup.forEach(function (dpgEntry) {
                                                var dpItemsArray = [];
                                                if ($.type(dpgEntry.DataPlusGroupItem) === 'array') {
                                                    dpgEntry.DataPlusGroupItem.forEach(function (dpEntry) {
                                                        dpItemsArray.push(dpEntry);
                                                    });
                                                } else if ($.type(dpgEntry.DataPlusGroupItem) === 'object') {
                                                    dpItemsArray.push(dpgEntry.DataPlusGroupItem);
                                                }
                                                var dGroup = new lib.DataPlusGroup(dpgEntry.GroupName, dpItemsArray);
                                                dpGroup.push(dGroup);
                                            });
                                        }
                                    }

                                    var label = typeof entry.Label === 'string' ? entry.Label : 'addressLine' + (entryIndex + 1);
                                    var line = typeof entry.Line === 'string' ? entry.Line : '';

                                    formattedAddressMap[label] = line;

                                    addressLineArray.push(new lib.AddressLine(label, line, entry.LineContent, dpGroup, entry.Overflow, entry.Truncated));
                                });
                            }

                            // Add shorthand to access layout line value
                            // e.g. result.get('addressLine1')
                            // e.g. result.get(0)
                            addressLineArray.get = function (i) {
                                if (typeof i === 'number') {
                                    return this.address[i].line || '';
                                } else if (typeof i === 'string') {
                                    return this.address[i] || '';
                                } else {
                                    return '';
                                }
                            };

                            var addressResult = new lib.QAAddress(addressLineArray, jAddress.Overflow, jAddress.Truncated, jAddress.DPVStatus);

                            addressResult.address = formattedAddressMap;

                            dfd.resolve(addressResult);
                        });
                    }).fail(function (evt, result, data) {
                        logError(result, content);
                        dfd.reject(_self.options.errorText);
                    });
                });
            };
        };

        // Extend this object with a new instance of soap client.
        // This allows usage of soap api using the namespace.
        $.extend(lib, new lib.SoapClient());

        /**
         * A class to determine whether to use SOAP or REST API based on the given options and parameters.
         */
        lib.ClientBuilder = function () {
            var _self = this;
            _self.options = {};

            _self.withOptions = function (newOptions) {
                $.extend(_self.options, newOptions);

                return this;
            };
            _self.withDataset = function (dataset) {
                _self.options.dataset = dataset;
                return this;
            };
            _self.withEngine = function (engine) {
                _self.options.engine = engine;
                return this;
            };
            _self.build = function () {
                // Proxy only supports REST
                if (_self.options.isProxy !== undefined &&
                    _self.options.isProxy !== null &&
                    _self.options.isProxy) {
                    return new lib.RestClient(_self.options);
                }

                // Specific intuitive engine can only be supported via REST.
                var soapDatasets = ['AUE', 'AUS', 'AUG', 'NZL', 'NZD', 'FRH'];
                var d = _self.options.dataset.toUpperCase();
                if (_self.options.engine.toUpperCase() === 'INTUITIVE' && soapDatasets.indexOf(d) === -1) {
                    return new lib.RestClient(_self.options);
                }

                return new lib.SoapClient(_self.options);
            };
        };

        /**
         * A generic address search client.
         * Token, REST Proxy URL is single setting for all search instances, thus defined in constructor as options.
         */
        lib.Client = function (options) {
            var _self = this;

            // Options, built manually.
            _self.options = {
                timeout: 10 * 1000,
                token: '',
                soapUrl: 'https://ws3.ondemand.qas.com/ProOnDemand/V3/ProOnDemandService.asmx',
                restUrl: 'https://api.edq.com/capture/address/v2/',
                isProxy: false,
                engine: 'INTUITIVE',
                errorText: 'Failed to communicate with address validation service'
            };

            $.extend(_self.options, options);

            /**
             * Search for address.
             * @param {string} query Text containing address to be searched for.
             * @param {string} dataset Dataset or country to search for.
             * @param {string} layout Layout name to be used. Defaults to empty string.
             * @param {string} engine Engine name to be used. Defaults to Intuitive engine.
             */
            this.search = function (query, dataset, layout, engine) {
                if (engine === undefined || engine === null) {
                    engine = 'Intuitive';
                }
                if (layout === undefined || layout === null) {
                    layout = '';
                }

                var client = new lib.ClientBuilder()
                    .withOptions(_self.options)
                    .withDataset(dataset)
                    .withEngine(engine)
                    .build();

                return client.search(query, dataset, layout, engine);
            };

            /**
             * Get final address using a moniker a.k.a format address.
             * @param {string} moniker Moniker returned in the Search step, which is used to identify address to be formatted.
             * @param {string} dataset Dataset or country to search for.
             * @param {string} layout Layout used to format the address. Address components are defined in layout.
             * @param {string} engine Engine name to be used. Defaults to Intuitive engine.
             */
            this.format = function (moniker, dataset, layout, engine) {
                if (engine === undefined || engine === null) {
                    engine = 'Intuitive';
                }

                var client = new lib.ClientBuilder()
                    .withOptions(_self.options)
                    .withDataset(dataset)
                    .withEngine(engine)
                    .build();

                return client.format(moniker, dataset, layout, engine);
            };
        };

        lib.promise = function (fn) {
            var dfd = $.Deferred();
            try { fn.call(this, dfd); } catch (e) {
                dfd.reject(e);
            }
            return dfd.promise();
        };

        lib.rejectIfThrow = function (promise, fn) {
            try { 
                fn.call(this, promise); 
            } 
            catch (e) { 
                console.log(e);
                promise.reject(e); 
            }
            return promise;
        };

        /**
         * A REST address search client.
         */
        lib.RestClient = function (options) {
            var _self = this;

            _self.options = {};
            $.extend(_self.options, options);

            /**
             * Search for address.
             * @param {string} query Text containing address to be searched for.
             * @param {string} dataset Dataset or country to search for.
             * @param {string} layout Optional (no default) Layout to be used.
             * @param {string} engine Optional (default Intuitive) Engine name to be used.
             */
            this.search = function (query, dataset, layout, engine) {
                return lib.promise.call(this, function (promise) {
                    var queryString = "query=" + query + "&country=" + dataset;

                    if (layout !== undefined && layout !== null) {
                        queryString += "&layout=" + layout;
                    }

                    if (engine !== undefined && engine !== null) {
                        queryString += "&engine=" + engine;
                    }

                    if (_self.options.token !== undefined && _self.options.token !== null) {
                        queryString += "&auth-token=" + _self.options.token;
                    }

                    var ajaxOptions = {
                        url: _self.options.restUrl + '/search',
                        data: queryString,
                        headers: { 'Auth-Token': _self.options.token },
                        dataType: "json",
                        timeout: _self.options.timeout
                    };

                    $.ajax(ajaxOptions)
                        .done(function (data) {
                            lib.rejectIfThrow.call(this, promise, function (promise) {
                                var picklistArray = [];
                                for (var picklistIndex in data.results) {
                                    if (!data.results.hasOwnProperty(picklistIndex)) {
                                        continue;
                                    }
                                    var item = data.results[picklistIndex];

                                    // The API's response for moniker is a URL
                                    // Extract the moniker here
                                    var formatUrl = item.format;
                                    if (item.format === null) {
                                        // "No match" item in the picklist item found. Try do nothing...
                                        continue;
                                    } else {
                                        var moniker = /.*id=([^&]*)/g.exec(formatUrl)[1];
                                        picklistArray.push(new lib.QAPicklistEntry(item.suggestion, moniker, item.suggestion, item.suggestion, '', ''));
                                    }
                                }

                                var override = null;
                                if (picklistArray.length > 0 && picklistArray[0].fullAddress.indexOf('Use entered') === 0) {
                                    override = picklistArray[0];
                                    picklistArray.splice(0, 1);
                                }

                                var picklist = new lib.QAPicklist('', picklistArray, '', data.count, '', '');
                                var searchResult = new lib.QASearchResult(picklist, override);

                                promise.resolve(searchResult);
                            });
                        })
                        .fail(function (e) {
                            promise.reject(_self.options.errorText);
                        });
                });
            };

            /**
             * Get final address using a moniker a.k.a format address.
             * @param {string} moniker Moniker returned in the Search step, which is used to identify address to be formatted.
             * @param {string} dataset Dataset or country to search for.
             * @param {string} layout Layout used to format the address. Address components are defined in layout.
             * @param {string} engine Optional (default Intuitive). Engine name to be used.
             */
            this.format = function (moniker, dataset, layout, engine) {
                return lib.promise.call(this, function (promise) {
                    var queryString = "id=" + moniker + "&country=" + dataset + "&layout=" + layout;

                    if (layout !== undefined && layout !== null) {
                        queryString += "&layout=" + layout;
                    }

                    if (_self.options.token !== undefined && _self.options.token !== null) {
                        queryString += "&auth-token=" + _self.options.token;
                    }

                    $.ajax({
                        url: _self.options.restUrl + '/format',
                        data: queryString,
                        headers: { 'Auth-Token': _self.options.token },
                        dataType: "json",
                        timeout: _self.options.timeout
                    })
                        .done(function (data) {
                            lib.rejectIfThrow.call(this, promise, function (promise) {
                                var formattedAddress = {};
                                $.map(data.address, function (addressObj) {
                                    for(var propIndex in addressObj) {
                                        if(!addressObj.hasOwnProperty(propIndex)) {
                                            continue;
                                        }
                                        
                                        formattedAddress[propIndex] = addressObj[propIndex];
                                    }
                                });                                

                                var addressLineArray = [];                  
                                for (var dataIndex in data.address) {
                                    if (!data.address.hasOwnProperty(dataIndex)) {
                                        continue;
                                    }

                                    var item = data.address[dataIndex];
                                    var layoutLineName = Object.keys(item)[0];

                                    var label = typeof layoutLineName === 'string' ? layoutLineName : 'addressLine' + (dataIndex + 1);

                                    addressLineArray.push(new lib.AddressLine(label, item[layoutLineName], '', '', false, false));
                                }

                                // Add shorthand to access layout line value
                                // e.g. result.get('addressLine1')
                                // e.g. result.get(0)
                                addressLineArray.get = function (i) {
                                    if (typeof i === 'number') {
                                        return this[i].line || '';
                                    } else if (typeof i === 'string') {
                                        return this[i] || '';
                                    } else {
                                        return '';
                                    }
                                };

                                var addressResult = new lib.QAAddress(addressLineArray, '', '', '');
                                addressResult.address = formattedAddress;

                                promise.resolve(addressResult, dataset);
                            });
                        })
                        .fail(function (e) { promise.reject(e); });
                });
            };
        };

        // Classes DoGetData
        lib.QAData = function QAData(dataSets) {
            this.dataSets = dataSets;
        };
        lib.DataSet = function DataSet(id, name) {
            if (id === undefined || id === null || id.length !== 3) {
                throw 'Dataset ID must be a string with length 3.';
            }

            this.id = id;
            this.name = name;
        };
        lib.DataSet.prototype.getId = function () {
            return this.id;
        };
        lib.DataSet.prototype.getName = function () {
            return this.name;
        };

        //Classes DoGetLayouts
        lib.QALayouts = function QALayouts(layouts) {
            this.layouts = layouts;
        };
        lib.QALayouts.prototype.getLayouts = function () {
            return this.layouts;
        };

        lib.Layout = function Layout(name, comment) {
            this.name = name;
            this.comment = comment;
        };
        lib.Layout.prototype.getName = function () {
            return this.name;
        };
        lib.Layout.prototype.getComment = function () {
            return this.comment;
        };

        // Classes DoSearch  
        lib.QASearchResult = function QASearchResult(qaPicklist, overridePicklistItem) {
            this.qaPicklist = qaPicklist;

            // Easy-access property to search results.
            this.picklist = [];
            for (var itemIndex in this.qaPicklist.picklistArray) {
                if (!qaPicklist.picklistArray.hasOwnProperty(itemIndex)) {
                    continue;
                }
                this.picklist.push(this.qaPicklist.picklistArray[itemIndex]);
            }

            this.override = overridePicklistItem;
            this.hasOverride = typeof overridePicklistItem !== 'undefined' && overridePicklistItem !== null;
        };

        lib.QASearchResult.prototype.getPicklist = function () {
            return this.qaPicklist;
        };

        lib.QASearchResult.prototype.getOverride = function () {
            return this.override;
        };

        lib.QAPicklist = function QAPicklist(fullPicklistMoniker, picklistArray, prompt, total, overThreshold, moreMatches) {
            this.fullPicklistMoniker = fullPicklistMoniker;
            this.picklistArray = picklistArray;
            this.prompt = prompt;
            this.total = parseInt(total);
            this.overThreshold = overThreshold;
            this.moreMatches = moreMatches;
        };
        lib.QAPicklist.prototype.getMoniker = function () {
            return this.fullPicklistMoniker;
        };
        lib.QAPicklist.prototype.getPicklistItems = function () {
            return this.picklistArray;
        };
        lib.QAPicklist.prototype.getPrompt = function () {
            return this.prompt;
        };
        lib.QAPicklist.prototype.getTotal = function () {
            return this.total;
        };
        lib.QAPicklist.prototype.isOverThreshold = function () {
            return this.overThreshold;
        };
        lib.QAPicklist.prototype.isMoreMatches = function () {
            return this.moreMatches;
        };
        lib.QAPicklist.prototype.getSimplifiedPicklistArray = function () {
            var array = [];
            this.picklistArray.forEach(function (picklistEntry) {
                array.push({
                    label: picklistEntry.getPartialAddress(),
                    value: picklistEntry.getMoniker()
                });
            });
            return array;
        };

        lib.QAPicklistEntry = function QAPicklistEntry(fullAddress, moniker, partialAddress, picklist, postcode, score) {
            this.fullAddress = fullAddress || partialAddress;
            this.moniker = moniker;
            this.partialAddress = partialAddress;
            this.picklist = picklist;
            this.postcode = postcode;
            this.score = score;
            this.isOverride = typeof this.fullAddress === 'string' && this.fullAddress.indexOf('Use entered') === 0;
        };

        lib.QAPicklistEntry.prototype.getFullAddress = function () {
            return this.fullAddress;
        };
        lib.QAPicklistEntry.prototype.getMoniker = function () {
            return this.moniker;
        };
        lib.QAPicklistEntry.prototype.getPartialAddress = function () {
            return this.partialAddress;
        };
        lib.QAPicklistEntry.prototype.getPicklistText = function () {
            return this.picklist;
        };
        lib.QAPicklistEntry.prototype.getPostcode = function () {
            return this.postcode;
        };
        lib.QAPicklistEntry.prototype.getScore = function () {
            return this.score;
        };

        // Classes DoCanSearch
        lib.QASearchOk = function QASearchOk(isOk, errorCode, errorMessage) {
            this.isOk = isOk === 'true' ? true : false;
            this.errorCode = errorCode;
            this.errorMessage = errorMessage;
        };
        lib.QASearchOk.prototype.isOk = function () {
            return this.isOk;
        };
        lib.QASearchOk.prototype.getErrorCode = function () {
            return this.errorCode;
        };
        lib.QASearchOk.prototype.getErrorMessage = function () {
            return this.errorMessage;
        };

        // Classes DoGetAddress
        lib.QAAddress = function QAAddress(addressLines, overflow, truncated, dpvStatus) {
            this.addressLines = addressLines;
            this.overflow = overflow;
            this.truncated = truncated;
            this.dpvStatus = dpvStatus;
            this.addressLinesMap = {};
        };
        lib.QAAddress.prototype.getAddressLines = function () {
            return this.addressLines;
        };
        lib.QAAddress.prototype.getAddressLineByLabel = function (label) {
            if (!this.addressLinesMap.hasOwnProperty(label)) {
                throw "No address line with this label";
            } else {
                return this.addressLinesMap[label];
            }
        };
        lib.QAAddress.prototype.isOverflow = function () {
            return this.overflow;
        };
        lib.QAAddress.prototype.isTruncated = function () {
            return this.truncated;
        };
        lib.QAAddress.prototype.getDpvStatus = function () {
            return this.dpvStatus;
        };

        lib.AddressLine = function AddressLine(label, line, lineContent, dataplusGroup, overflow, truncated) {
            this.label = label;
            this.line = line;
            this.lineContent = lineContent;
            this.dataplusGroup = dataplusGroup;
            this.overflow = overflow;
            this.truncated = truncated;
        };
        lib.AddressLine.prototype.getLabel = function () {
            return this.label;
        };
        lib.AddressLine.prototype.getLine = function () {
            return this.line;
        };
        lib.AddressLine.prototype.getLineContent = function () {
            return this.lineContent;
        };
        lib.AddressLine.prototype.getDataplusGroup = function () {
            return this.dataplusGroup;
        };
        lib.AddressLine.prototype.isOverflow = function () {
            return this.overflow;
        };
        lib.AddressLine.prototype.isTruncated = function () {
            return this.truncated;
        };

        lib.DataPlusGroup = function DataPlusGroup(groupName, items) {
            this.groupName = groupName;
            this.items = items;
        };
        lib.DataPlusGroup.prototype.getGroupName = function () {
            return this.groupName;
        };
        lib.DataPlusGroup.prototype.getItems = function () {
            return this.items;
        };

        // Classes Engine
        lib.EngineEnum = {
            INTUITIVE: "Intuitive"//,
            //SINGLELINE: "Singleline",
            //TYPEDOWN: "Typedown",
            //VERIFICATION: "Verification",
            //KEYFINDER: "Keyfinder"
        };
        lib.IntensityEnum = {
            EXACT: "Exact",
            CLOSE: "Close",
            EXTENSIVE: "Extensive"
        };
        lib.PromptSetEnum = {
            DEFAULT: "Default",
            OPTIMAL: "Optimal",
            ALTERNATIVE: "Alternative",
            GENERIC: "Generic",
            ONELINE: "OneLine"
        };
        lib.Engine = function Engine(options) {
            var oengineType = options.engineType;
            var oflatten = options.flatten === undefined ? true : options.flatten;
            var ointensity = options.intensity === undefined ? lib.IntensityEnum.CLOSE : options.intensity;
            var opromptSet = options.promptSet === undefined ? lib.PromptSetEnum.DEFAULT : options.promptSet;
            var othreshold = options.threshold === undefined ? 25 : options.threshold;
            var otimeout = options.timeout === undefined ? 10000 : options.timeout;


            for (var engineNum in lib.EngineEnum) {
                if (lib.EngineEnum.hasOwnProperty(engineNum)) {
                    if (oengineType === lib.EngineEnum[engineNum]) {
                        this.engineType = lib.EngineEnum[engineNum];
                        break;
                    }
                }
            }
            if (!this.engineType) {
                throw 'Engine type not recognised';
            }
            if ($.type(oflatten) === "boolean") {
                this.flatten = oflatten;
            } else {
                throw "Flatten must be set to true or false";
            }
            if ($.type(othreshold) === "number") {
                this.threshold = othreshold;
            } else {
                throw "Threshold must be a number";
            }
            if ($.type(otimeout) === "number") {
                this.timeout = otimeout;
            } else {
                throw "Timeout must be a number";
            }
            for (var intensityVal in lib.IntensityEnum) {
                if (lib.IntensityEnum.hasOwnProperty(intensityVal)) {
                    if (ointensity === lib.IntensityEnum[intensityVal]) {
                        this.intensity = lib.IntensityEnum[intensityVal];
                        break;
                    }
                }
            }
            for (var promptSetVal in lib.PromptSetEnum) {
                if (lib.PromptSetEnum.hasOwnProperty(promptSetVal)) {
                    if (opromptSet === lib.PromptSetEnum[promptSetVal]) {
                        this.promptSet = lib.PromptSetEnum[promptSetVal];
                        break;
                    }
                }
            }

            if (!this.intensity) {
                throw "Engine intensity value not recognised.";
            }

            if (!this.promptSet) {
                throw "Promptset value not recognised.";
            }
        };
        lib.Engine.prototype.getEngineType = function () {
            return this.engineType;
        };
        lib.Engine.prototype.isFlatten = function () {
            return this.flatten;
        };
        lib.Engine.prototype.getIntensity = function () {
            return this.intensity;
        };
        lib.Engine.prototype.getPromptSet = function () {
            return this.promptSet;
        };
        lib.Engine.prototype.getThreshold = function () {
            return this.threshold;
        };
        lib.Engine.prototype.getTimeout = function () {
            return this.timeout;
        };

        return lib;
    }(EXP.DQ.Address || {}, EXP.DQ, window.jQuery));

    return EXP;
})(window);
"use strict";

/* globals EXP */
/*jshint bitwise: false*/
; (function ($, window, document, undefined) {
    // define your widget under a namespace of your choice
    //  with additional parameters e.g.
    // $.widget( "namespace.widgetname", (optional) - an
    // existing widget prototype to inherit from, an object
    // literal to become the widget's prototype );        

    $.widget("experian.address", {

        //Options to be used as defaults
        options: {
            token: '',
            required: true,
            searchDelayTimeout: 400,
            searchCountry: null,
            searchLayout: 'IntuitiveDefault',
            manualOverrideText: "Click here to enter address manually.",
            addressLineLabels: [
                "addressLine1",
                "addressLine2",
                "addressLine3",
                "locality",
                "province",
                "postalCode",
                "country"
            ],
            resultMappings: [],
            minSearchLength: 6,
            placeholderText: "Start typing an address...",
            continueTypingText: "Enter more information to narrow down your search. E.g. 60 Lett",
            notFoundText: "Enter more information to narrow down your search. E.g. 60 Lett",
            baseCss: 'xpn-address',
            verifiedCss: 'xpn-address-verified',
            unverifiedCss: 'xpn-address-unverified',
            exceptionCss: 'xpn-address-exception',
            errorMessageCss: 'xpn-address-errormsg',
            spinnerCss: 'xpn-address-loader',
            picklistContainerCss: 'xpn-address-picklist-container',
            picklistCss: 'xpn-address-picklist',
            picklistItemCss: 'xpn-address-picklist-item',
            picklistItemSelectedCss: 'selected',
            picklistItemInfoCss: 'xpn-address-picklist-item-info',
            picklistItemErrorCss: 'xpn-address-picklist-item-error',
            picklistOverrideItemCss: "xpn-address-picklist-item-override",
            serviceClientOptions: {   
                timeout: 10 * 1000,                         
                soapUrl: 'https://ws3.ondemand.qas.com/ProOnDemand/V3/ProOnDemandService.asmx',
                restUrl: 'https://api.edq.com/capture/address/v2/',
                isProxy: false,
                engine: 'INTUITIVE',
                errorText: 'Failed to communicate with address validation service'
            }
        },

        //Setup widget (eg. element creation, apply theming
        // , bind events etc.)
        _create: function () {

            // _create will automatically run the first time
            // this widget is called. Put the initial widget
            // setup code here, then you can access the element
            // on which the widget was called via this.element.
            // The options defined above can be accessed
            // via this.options this.element.addStuff();                                        

            // Extended properties
            this._workspace = new Workspace(this);
            this._fsm = new StateMachine(this);
            this._resultMapper = new ResultMapper();

            this._init();

            this._setOptions({
                "baseCss": this.options.baseCss,
                "verifiedCss": this.options.verifiedCss,
                "unverifiedCss": this.options.unverifiedCss,
                "exceptionCss": this.options.exceptionCss,
                "errorMessageCss": this.options.errorMessageCss,
                "spinnerCss": this.options.spinnerCss,
                "picklistContainerCss": this.options.picklistContainerCss,
                "picklistCss ": this.options.picklistCss,
                "picklistItemCss": this.options.picklistItemCss,
                "picklistItemInfoCss": this.options.picklistItemInfoCss
            });
        },

        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        destroy: function () {
            this.reset();

            // this.element.removeStuff();
            // For UI 1.8, destroy must be invoked from the
            // base widget
            $.Widget.prototype.destroy.call(this);
            // For UI 1.9, define _destroy instead and don't
            // worry about
            // calling the base widget
        },

        search: function () {
            var self = this;

            if (self.element.val() === '' && !self.options.required) {
                self._fsm.changeState("initial");
                return;
            }

            if (self.element.data("oldValue") === self.element.val()) {
                return;
            }

            self.element.data("oldValue", self.element.val());

            if (self.element.val().length < self.options.minSearchLength) {
                self._fsm.changeState("searchLengthNotMet");
                return;
            }

            var selectedCountry = $.isFunction(self.options.searchCountry) ? self.options.searchCountry() : self.options.searchCountry;

            if (!selectedCountry) {
                self._fsm.changeState("exception", msgMap["country-not-set"]);
                return;
            }
            
            var searchValue = { address: self.element.val() };
            self._trigger("beforesearch", null, searchValue);

            if (!searchValue || !searchValue.address || searchValue.address === '') {
                searchValue = { address: self.element.val() };
            }

            self._fsm.changeState("loading", null, function () {
                var clientOptions = {
                    token: self.options.token
                };

                $.extend(clientOptions, self.options.serviceClientOptions);

                var client = new EXP.DQ.Address.Client(clientOptions);

                client.search(searchValue.address, selectedCountry, self.options.searchLayout)
                    .done(function (r) {
                        self._handleSearchResult(r);
                    })
                    .fail(function (e) {
                        self._fsm.changeState("exception", e);
                    });
            });
        },

        format: function (moniker, override) {
            var self = this;
            var isOverride = override || false;

            var selectedCountry = $.isFunction(self.options.searchCountry) ? self.options.searchCountry() : self.options.searchCountry;

            if (!selectedCountry) {
                self._fsm.changeState("exception", msgMap["country-not-set"]);
                return;
            }

            self._trigger("beforeformat", null, moniker);

            self._fsm.changeState("loading", null, function () {
                var clientOptions = {
                    token: self.options.token
                };

                $.extend(clientOptions, self.options.serviceClientOptions);

                var client = new EXP.DQ.Address.Client(clientOptions);

                client.format(moniker, selectedCountry, self.options.searchLayout)
                    .done(function (result) {
                        self._handleFormatResult(result, isOverride);
                    })
                    .fail(function (e) {
                        self._fsm.changeState("exception", e);
                    });
            });
        },

        // Handles address validation results and updates UI
        _handleSearchResult: function (result) {
            var args = result || { results: [] };

            if (args.picklist) {
                args.count = result.picklist.length;
                args.hasOverride = result.hasOverride;

                if (args.hasOverride) {
                    args.override = {
                        suggestion: this.options.manualOverrideText,
                        format: result.override.moniker
                    };
                }

                args.results = [];
                $.each(result.picklist, function (index, item) {
                    args.results.push({
                        suggestion: item.partialAddress,
                        format: item.moniker,
                        matched: []
                    });
                });
            }

            this._fsm.changeState("displaySearch", args);
        },

        _handleFormatResult: function (result, isOverride) {
            var args = {
                address: {},
                override: isOverride
            };

            for (var prop in result.address) {
                if (!result.address.hasOwnProperty(prop)) {
                    continue;
                }

                args.address[prop] = result.address[prop];
            }

            this._fsm.changeState("displayFormat", args);
        },

        _init: function () {
            var self = this;

            this.element.attr("placeholder", this.options.placeholderText);
            self.element.data("oldValue", self.element.val());

            this.element.off("keydown");
            this.element.on("keydown", function (e) {
                return self._workspace.getPicklist().navigate(e);
            });

            this.element.off("input");
            this.element.on("input", function (e) {
                if (self.searchDelayTimer) {
                    clearTimeout(self.searchDelayTimer);
                }

                self.searchDelayTimer = setTimeout(function () {
                    self.search();
                }, self.options.searchDelayTimeout);
            });
        },

        reset: function () {
            this._workspace.destroy();

            this.element.removeAttr("placeholder");
            this.element.removeClass(this.options.verifiedCss);
            this.element.removeClass(this.options.unverifiedCss);
            this.element.removeClass(this.options.exceptionCss);
            this.element.off("keydown");
            this.element.off("input");
        },

        // Respond to any changes the user makes to the
        // option method
        _setOption: function (key, value) {
            var self = this,
                prev = this.options[key],
                fnMap = {
                    "baseCss": function () {
                        self.element.removeClass(prev);
                        self.element.addClass(value);
                    },
                    "verifiedCss": function () {
                        if (self.element.hasClass(prev)) {
                            self.element.removeClass(prev);
                            self.element.addClass(value);
                        }
                    },
                    "unverifiedCss": function () {
                        if (self.element.hasClass(prev)) {
                            self.element.removeClass(prev);
                            self.element.addClass(value);
                        }
                    },
                    "exceptionCss": function () {
                        if (self.element.hasClass(prev)) {
                            self.element.removeClass(prev);
                            self.element.addClass(value);
                        }
                    },
                    "errorMessageCss": function () {
                        var errorMsg = self._workspace.getErrorMessage();
                        if (errorMsg.element) {
                            errorMsg.element.removeClass(prev);
                            errorMsg.element.addClass(value);
                        }
                    },
                    "spinnerCss": function () {
                        var loader = self._workspace.getSpinner();
                        if (loader.element) {
                            loader.element.removeClass(prev);
                            loader.element.addClass(value);
                        }
                    },
                };

            // For UI 1.8, _setOption must be manually invoked
            // from the base widget
            // $.Widget.prototype._setOption.apply( this, arguments );
            // For UI 1.9 the _super method can be used instead
            this._super(key, value);

            if (key in fnMap) {
                fnMap[key]();
            }
        },

        _setOptions: function (options) {
            this._super(options);
        }
    });

    function StateMachine(widget) {
        this._currentState = '';

        this.initial = {
            enter: function (args, done) {
                done();
            }
        };

        this.searchLengthNotMet = {
            enter: function (args, done) {
                widget._handleSearchResult(null);
                done();
            }
        };

        this.displaySearch = {
            enter: function (args, done) {
                if (widget._trigger("beforecreatepicklist", null, args.params)) {
                    widget._workspace.getPicklist(args.params).show(function () {
                        widget._trigger("aftercreatepicklist");
                        done();
                    });
                }
            }
        };

        this.displayFormat = {
            enter: function (args, done) {
                widget._workspace.getPicklist().hide(function () {
                    if (args.params.override === false) {
                        widget.element.addClass(widget.options.verifiedCss);
                    }

                    if (widget._trigger("beforemap", null, args.params)) {
                        widget._resultMapper.mapResults(widget.options.resultMappings, args.params);
                        widget._trigger("aftermap", null, null);
                    }
                    
                    done();
                });
            },
            exit: function (args, done) {
                widget.element.removeClass(widget.options.verifiedCss);
                done();
            }
        };

        this.loading = {
            enter: function (args, done) {
                widget._workspace.getSpinner().show(done);
            },
            exit: function (args, done) {
                widget._workspace.getSpinner().hide(done);
            }
        };

        this.exception = {
            enter: function (args, done) {
                var errorMsg = widget._workspace.getErrorMessage({ message: args.params }).show(done);
            },
            exit: function (args, done) {
                widget._workspace.getErrorMessage().hide(done);
            }
        };

        // Changes the state of the widget
        this.changeState = function (state, args, done) {
            var self = this;
            var stateArgs = {
                currentState: self._currentState,
                targetState: state,
                params: args
            };

            var fnEnter = function () {
                self[state].enter(stateArgs, function () {
                    self._currentState = state;
                    if ($.isFunction(done)) {
                        executeCallback.call(widget, done);
                    }
                });
            };

            if (state in this) {
                if (this._currentState === '' || !$.isFunction(this[this._currentState].exit)) {
                    fnEnter();
                    return;
                }

                this[this._currentState].exit(stateArgs, fnEnter);
            }
        };
    }

    function Workspace(widget) {
        this._picklist = new Picklist(widget, this);
        this._spinner = new Spinner(widget, this);
        this._errorMessage = new ErrorMessage(widget, this);

        this.init = function () {
            if (this.element === undefined || this.element === null) {
                this._create();
                widget.element.after(this.element);
            }
        };

        /**
         * Creates a relative-positioned container for loader, error message and picklist 
         */
        this._create = function () {
            this.element = $("<div class='xpn-address-workspace'></div>");
            this.element.css({
                "position": "relative",
                "margin": 0,
                "padding": 0,
                "border": 0
            });

            return this;
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.getSpinner = function () {
            this.element.prepend(this._spinner.create().element);
            return this._spinner;
        };

        this.getPicklist = function (args) {
            if (args === undefined || args === null) {
                return this._picklist;
            }

            this.element.append(this._picklist.create(args).element);
            return this._picklist;
        };

        this.getErrorMessage = function (args) {
            var error = args || {};

            if (this._errorMessage.create(error).element) {
                this.element.prepend(this._errorMessage.element);
            }

            return this._errorMessage;
        };

        this.init();
    }

    function Picklist(widget, workspace) {
        this.oldArgs = null;
        this.args = null;

        /**
         * Creates the picklist element and store it in the containing object
         */
        this.create = function (args) {
            if (args === undefined || args === null || args === this.oldArgs) {
                return this;
            }

            this.oldArgs = this.args;
            this.args = args;

            if (!this.element) {
                this.element = $("<div class='" + widget.options.picklistContainerCss + "'></div>");
                this.element.hide();
                this.picklistContainer = $("<div class='" + widget.options.picklistCss + "'></div>");
                this.element.append(this.picklistContainer);
            } else {
                this.picklistContainer.empty();
                this.selectedItem = null;
            }

            if (args.results.length > 0) {
                this.appendAll(args.results);
            } else {
                var text = "";

                if (widget.element.val().length < widget.options.minSearchLength) {
                    text = widget.options.continueTypingText;
                } else {
                    text = widget.options.notFoundText;
                }

                this.appendItem({
                    suggestion: text,
                    format: ""
                });
            }

            this.enteredAddress.destroy();

			//commented the following code since manual override option was not available for all languages
            /*if (args.hasOverride) {
                var enteredAddr = this.enteredAddress.create(args.override);
                this.picklistContainer.after(enteredAddr.element);
            }*/

            return this;
        };

        this.createItem = function (item) {
            var builder = [];

            builder.push("<div class='");
            builder.push(widget.options.picklistItemCss);
            builder.push("'>");
            builder.push(addMatchingEmphasis(item));
            builder.push("</div>");

            var picklistItem = $(builder.join(""));

            picklistItem.attr(dataKeys.picklist.moniker, item.format);
            picklistItem.data(dataKeys.picklist.moniker, item.format);

            if (!item.format || item.format.length < 1) {
                picklistItem.addClass(widget.options.picklistItemInfoCss);
            }

            if (item.error) {
                picklistItem.addClass(widget.options.picklistItemErrorCss);
            }

            return picklistItem;
        };

        /**
         * Appends an item to the picklist
         */
        this.appendItem = function (item) {
            var picklistItem = this.createItem(item);
            this.picklistContainer.append(picklistItem);

            if ((item.format && item.format.length > 0) && !item.error) {
                this.listen(picklistItem);
            }

            return picklistItem;
        };

        /**
         * Appends all items to picklist
         */
        this.appendAll = function (items) {
            var self = this;
            $.each(items, function (index, item) {
                self.appendItem(item);
            });
        };

        this.listen = function (item) {
            item.on("click", function () {
                widget.format(item.data(dataKeys.picklist.moniker));
            });
        };

        // #region Navigation

        this.navigationHandlers = {
            /* Enter */
            "13": function (e) {
                if (!e.ctrlKey) {
                    if (!this.selectedItem) {
                        return true;
                    }

                    widget.format(this.selectedItem.data(dataKeys.picklist.moniker));
                }
                else {
                    this.enteredAddress.element.triggerHandler("click");
                }

                return false;
            },

            /* Up */
            "38": function (e) {
                if (!this.selectedItem) {
                    return true;
                }

                this.movePrevious();
                return false;
            },

            /* Down */
            "40": function (e) {
                this.moveNext();
                return false;
            }
        };

        this.navigate = function (event) {
            var e = event || window.event;
            var key = e.which || e.keyCode;

            widget.element.focus();
            if (this.hasItems() && key in this.navigationHandlers) {
                return this.navigationHandlers[key].call(this, event);
            }

            // Returns true if unhandled
            return true;
        };

        this.hasItems = function () {
            if (this.args && this.args.results) {
                return this.args.results.length > 0;
            }

            return false;
        };

        this.moveNext = function () {
            var item;

            if (!this.selectedItem) {
                item = this.select(0);
            }
            else {
                var next = this.selectedItem.next("." + widget.options.picklistItemCss);
                item = this.selectItem(next);
            }

            this.scrollTo(item);

            return item;
        };

        this.movePrevious = function () {
            var prev = this.selectedItem.prev("." + widget.options.picklistItemCss);
            var item = this.selectItem(prev);

            this.scrollTo(item);

            return item;
        };

        this.selectItem = function (item) {
            if (!item || !item.jquery || item.length < 1) {
                return null;
            }

            this.unselectItem(this.selectedItem);
            this.selectedItem = item;
            this.selectedItem.addClass(widget.options.picklistItemSelectedCss);

            return this.selectedItem;
        };

        this.select = function (index) {
            var item = this.picklistContainer.find("." + widget.options.picklistItemCss + ":eq(" + index + ")");
            return this.selectItem(item);
        };

        this.unselectItem = function (item) {
            if (!item) {
                return;
            }

            item.removeClass(widget.options.picklistItemSelectedCss);
            item = null;
        };

        this.scrollTo = function (item) {
            if (!item || !item.jquery || item.length < 1) {
                return;
            }

            this.picklistContainer.stop();
            var position = this.where(item);

            this.picklistContainer.animate({
                scrollTop: position + "px"
            }, "fast");

            return this;
        };

        this.where = function (item) {
            var viewportTop = this.picklistContainer.offset().top + this.picklistContainer.scrollTop();
            var viewportBottom = viewportTop + this.picklistContainer.outerHeight();

            var itemTop = item.offset().top + this.picklistContainer.scrollTop();
            var itemBottom = itemTop + item.outerHeight();

            return itemTop < viewportTop ? itemTop - this.picklistContainer.offset().top
                : (itemBottom > viewportBottom) ? itemTop + item.outerHeight() - (this.picklistContainer.offset().top + this.picklistContainer.outerHeight())
                    : this.picklistContainer.scrollTop();
        };

        //#endregion        

        this.updatePosition = function () {
            this.element.css({
                left: widget.element.position().left - workspace.element.position().left,
                width: widget.element.outerWidth()
            });
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.show = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.updatePosition();
            this.element.slideDown(250, done);
        };

        this.hide = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.element.slideUp(100, done);
        };

        this.enteredAddress = {
            create: function (item) {
                if (this.element) {
                    return this;
                }

                this.element = workspace._picklist.createItem(item);
                this.element.addClass(widget.options.picklistOverrideItemCss);

                if (item.format) {
                    var self = this;
                    this.element.on("click", function () {
                        widget.format(self.element.data(dataKeys.picklist.moniker), true);
                    });
                }
                else {
                    this.element.on("click", this.click);
                }

                return this;
            },

            destroy: function () {
                if (this.element !== undefined && this.element !== null && this.element.jquery) {
                    this.element.remove();
                    this.element = null;
                }
            },

            click: function (item) {
                var inputData = {
                    address: {},
                    override: true
                };

                if (widget.element.val() !== "") {
                    // Try and split into lines by using comma delimiter
                    var lines = widget.element.val().split(",");

                    $.each(widget.options.addressLineLabels, function (index, item) {
                        inputData.address[item] = (index in lines) ? lines[index] : "";
                    });
                }

                widget._fsm.changeState("displayFormat", inputData);
            }
        };
    }

    function ErrorMessage(widget, workspace) {
        this.create = function (args) {
            if (!args.message) {
                return this;
            }

            if (!this.element) {
                this.element = $("<div class='" + widget.options.errorMessageCss + "'></div>");
                this.element.hide();
            }

            this.element.html(args.message);

            return this;
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.updatePosition = function () {
            this.element.css({
                left: widget.element.position().left - workspace.element.position().left,
                width: widget.element.outerWidth()
            });
        };

        this.show = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.updatePosition();
            this.element.slideDown(250, done);
        };

        this.hide = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.element.slideUp(100, done);
        };
    }

    function Spinner(widget, workspace) {
        this.create = function () {
            if (!this.element) {
                this.element = $("<div class='" + widget.options.spinnerCss + "'></div>");
                this.element.hide();
            }

            return this;
        };

        this.updatePosition = function () {
            var self = this.element;

            this.element.css({
                left: widget.element.position().left - workspace.element.position().left + parseInt(widget.element.css("border-left-width")),
                width: widget.element.innerWidth()
            });
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.show = function (done) {
            this.updatePosition();
            this.element.show();
            done();
        };

        this.hide = function (done) {
            this.element.hide();
            done();
        };
    }

    function ResultMapper() {
        this.mapResults = function (mappings, result) {
            var self = this;

            $.each(mappings, function (index, item) {
                var mappedElement = $(item.selector);
                var format = item.format;

                if (mappedElement.length === 0) {
                    return true;
                }

                var searchPatternPre = "\{\{";
                var searchPatternPost = "\}\}";

                for (var addressElement in result.address) {
                    if (!result.address.hasOwnProperty(addressElement)) {
                        continue;
                    }

                    var regex = new RegExp(searchPatternPre + addressElement + searchPatternPost);
                    format = format.replace(regex, result.address[addressElement]);
                }

                // Remove spaces between words, and consecutive commas
                format = format.replace(/\s+/g, ' ')    // remove consecutive spaces
                    .replace(/\s*,+\s*/g, ',')          // remove spaces before and after commas
                    .replace(/,+/g, ', ')               // remove consecutive commas
                    .replace(/,+\s*$/g, '');            // remove trailing commas 

                self._setValue(mappedElement, format);
            });
        };

        this._setValue = function (element, mappedValue) {
            if ($(element).is('input') || $(element).is('text') || $(element).is('select')) {
                if ($(element).val() !== mappedValue) {
                    $(element).val(mappedValue);
                }
            } else {
                if ($(element).html() !== mappedValue) {
                    $(element).html(mappedValue);
                }
            }
        };
    }

    function addMatchingEmphasis(item) {
        var highlights = item.matched || [],
            label = item.suggestion;

        for (var i = 0; i < highlights.length; i++) {
            var replacement = '<b>' + label.substring(highlights[i][0], highlights[i][1]) + '</b>';
            label = label.substring(0, highlights[i][0]) + replacement + label.substring(highlights[i][1]);
        }

        return label;
    }

    function executeCallback(callback) {
        if (callback !== undefined && callback !== null && $.isFunction(callback)) {
            callback();
        }
    }

    var msgMap = {
        "country-not-set": "Search is disabled because country was not configured."
    };

    var dataKeys = {
        picklist: {
            moniker: "xpn-moniker"
        }
    };

})(jQuery, window, document);

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {

            // 1. Let O be ? ToObject(this value).
            if (this === null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                // c. Increase k by 1. 
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}
"use strict";

; (function (window) {
    var EXP = window.EXP = window.EXP || {};
    EXP.DQ = EXP.DQ || {};
    EXP.DQ.Email = (function (lib, dq, $, undefined) {
        var headersTemplate = {
            "Content-Type": "application/json"
        };

        //Helper function
        function checkStatus() {
            if (!dq.Urls[EXP.DQ.UrlEnum.EMAIL]) {
                throw "Unable to search, missing url.";
            }
            if (!dq.Tokens[EXP.DQ.TokenEnum.EMAIL]) {
                throw "Unable to search, missing token.";
            }
            return true;
        }

        lib.Client = function Client(options) {
            var _self = this;
            var client = EXP.createWebServiceClient($);

            // Options
            this.options = {
                restUrl: 'https://api.experianmarketingservices.com/sync/queryresult/EmailValidate/1.0/'
            };

            // Override options
            options = options === undefined ? {} : options;
            $.extend(_self.options, options === undefined || options);

            this.validate = function (email) {
                dq.addUrl(EXP.DQ.UrlEnum.EMAIL, _self.options.restUrl);
                dq.addToken(EXP.DQ.TokenEnum.EMAIL, _self.options.token);

                return lib.validateEmail(client, email);
            };
        };

        lib.validateEmail = function (client, emailToValidate) {
            var dfd = $.Deferred();
            try {
                checkStatus();

                var headers = headersTemplate;
                headers['Auth-Token'] = dq.Tokens[EXP.DQ.TokenEnum.EMAIL];
                var content = JSON.stringify({ "email": emailToValidate });
                var promise = client.callWebService(EXP.MethodEnum.POST, EXP.DQ.UrlEnum.EMAIL, headers, content, EXP.DataTypeEnum.JSON);

                promise.done(function (rJ) {
                    var searchResult = new lib.EmailSearchResult(rJ.Certainty, rJ.Email, rJ.Message, rJ.Corrections);
                    dfd.resolve(searchResult);
                }).fail(function (result) {
                    var msg = "Failed to communicate with email validation service";

                    switch (result.status) {
                        case 400:
                            msg = "Bad request submitted. Please check your input.";
                            break;
                        case 401:
                            msg = "Unauthorized request to email validation service.";
                            break;
                        default:
                    }

                    dfd.reject(msg);
                });
            } catch (e) {
                dfd.reject(e);
            }

            return dfd.promise();
        };

        //Classes
        lib.EmailSearchResult = function EmailSearchResult(certainty, email, message, corrections) {
            this.certainty = certainty;
            this.email = email;
            this.message = message;
            this.suggestions = corrections;
        };
        lib.EmailSearchResult.prototype.getCertainty = function () {
            return this.certainty;
        };
        lib.EmailSearchResult.prototype.getEmail = function () {
            return this.email;
        };
        lib.EmailSearchResult.prototype.isOk = function () {
            return (this.message === 'OK');
        };
        lib.EmailSearchResult.prototype.getSuggestions = function () {
            return this.suggestions;
        };
        lib.EmailSearchResult.prototype.hasSuggestions = function () {
            return this.suggestions && this.suggestions.length > 0;
        };
        lib.EmailSearchResult.prototype.getSuggestionsCount = function () {
            if (this.suggestions) {
                return this.suggestions.length;
            } else {
                return 0;
            }
        };

        return lib;

    }(EXP.DQ.Email || {}, EXP.DQ, window.jQuery));

    return EXP;
})(window);
"use strict";

/* globals EXP */
/*jshint bitwise: false*/
; (function ($, window, document, undefined) {
    // define your widget under a namespace of your choice
    //  with additional parameters e.g.
    // $.widget( "namespace.widgetname", (optional) - an
    // existing widget prototype to inherit from, an object
    // literal to become the widget's prototype );        

    $.widget("experian.email", {

        //Options to be used as defaults
        options: {
            token: '',
            required: true,
            searchTrigger: 'input', // [input | blur] Default: input
            searchDelayTimeout: 850,
            acceptedResults: [
                "verified", 
                "unknown"
            ],
            suggestionEnabled: true,
            baseCss: 'xpn-email',
            verifiedCss: 'xpn-email-verified',
            unverifiedCss: 'xpn-email-unverified',
            exceptionCss: 'xpn-email-exception',
            errorMessageCss: 'xpn-email-errormsg',
            spinnerCss: 'xpn-email-loader',
            suggestionPicklistContainerCss: 'xpn-email-picklist-container',
            suggestionPicklistCss: 'xpn-email-picklist',
            suggestionPicklistItemCss: 'xpn-email-picklist-item',
            suggestionPicklistItemSelectedCss: 'selected',
            suggestionPicklistItemInfoCss: 'xpn-email-picklist-item-info'
        },

        //Setup widget (eg. element creation, apply theming
        // , bind events etc.)
        _create: function () {

            // _create will automatically run the first time
            // this widget is called. Put the initial widget
            // setup code here, then you can access the element
            // on which the widget was called via this.element.
            // The options defined above can be accessed
            // via this.options this.element.addStuff();                            

            this.currentState = '';
            this._workspace = new Workspace(this);
            this._fsm = new StateMachine(this);

            this._init();
        },

        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        destroy: function () {
            this.reset();

            // this.element.removeStuff();
            // For UI 1.8, destroy must be invoked from the
            // base widget
            $.Widget.prototype.destroy.call(this);
            // For UI 1.9, define _destroy instead and don't
            // worry about
            // calling the base widget
        },

        validate: function () {
            var self = this;

            if (self.element.data("oldValue") === self.element.val()) {
                return;
            }

            self.element.data("oldValue", self.element.val());

            this._fsm.changeState("loading", null, function () {
                if (self.element.val() === '') {
                    if (self.options.required) {
                        self._fsm.changeState("invalid", msgMap["empty"]);
                    } else {
                        self._fsm.changeState("initial");
                    }

                    return;
                }

                if (regex.test(self.element.val()) === false) {
                    self._fsm.changeState("invalid", msgMap["invalid-pattern"]);
                    return;
                }

                new EXP.DQ.Email.Client({
                    token: self.options.token
                })
                    .validate(self.element.val())
                    .fail(function (e) {
                        self._fsm.changeState("exception", e);
                    })
                    .done(function (e) {
                        handleResult(self, e);
                    });
            });
        },

        _init: function () {
            this._setOptions({
                "token": this.options.token,
                "baseCss": this.options.baseCss,
                "verifiedCss": this.options.verifiedCss,
                "unverifiedCss": this.options.unverifiedCss,
                "exceptionCss": this.options.exceptionCss,
                "errorMessageCss": this.options.errorMessageCss,
                "spinnerCss": this.options.spinnerCss,
                'suggestionPicklistContainerCss': this.options.suggestionPicklistContainerCss,
                "suggestionPicklistCss": this.options.suggestionPicklistCss,
                "suggestionPicklistItemCss": this.options.suggestionPicklistItemCss,
                "suggestionPicklistItemSelectedCss": this.options.suggestionPicklistItemSelectedCss,
                "suggestionPicklistItemInfoCss": this.options.suggestionPicklistItemInfoCss,
                "searchTrigger": this.options.searchTrigger
            });
        },

        reset: function () {
            this._workspace.destroy();

            this.element.removeClass(this.options.verifiedCss);
            this.element.removeClass(this.options.unverifiedCss);
            this.element.removeClass(this.options.exceptionCss);
            this.element.off("keydown");
            this.element.off("input");
        },

        // Respond to any changes the user makes to the
        // option method
        _setOption: function (key, value) {
            var self = this,
                prev = this.options[key],
                fnMap = {
                    "baseCss": function () {
                        self.element.removeClass(prev);
                        self.element.addClass(value);
                    },
                    "verifiedCss": function () {
                        if (self.element.hasClass(prev)) {
                            self.element.removeClass(prev);
                            self.element.addClass(value);
                        }
                    },
                    "unverifiedCss": function () {
                        if (self.element.hasClass(prev)) {
                            self.element.removeClass(prev);
                            self.element.addClass(value);
                        }
                    },
                    "exceptionCss": function () {
                        if (self.element.hasClass(prev)) {
                            self.element.removeClass(prev);
                            self.element.addClass(value);
                        }
                    },
                    "errorMessageCss": function () {
                        var errorMsg = self._workspace.getErrorMessage();
                        if (errorMsg.element) {
                            errorMsg.element.removeClass(prev);
                            errorMsg.element.addClass(value);
                        }
                    },
                    "spinnerCss": function () {
                        var loader = self._workspace.getSpinner();
                        if (loader.element) {
                            loader.element.removeClass(prev);
                            loader.element.addClass(value);
                        }
                    },
                    "searchTrigger": function () {
                        var searchFn = function () {
                            if (self.searchDelayTimer) {
                                clearTimeout(self.searchDelayTimer);
                            }

                            self.searchDelayTimer = setTimeout(function () {
                                self.validate();
                            }, self.options.searchDelayTimeout);
                        };

                        self.element.off("input");
                        self.element.off(self.options.searchTrigger);

                        if (searchTriggerModes.includes(self.options.searchTrigger)) {
                            self.element.off(self.options.searchTrigger);
                            self.element.on(self.options.searchTrigger, searchFn);
                        } else {
                            self.element.off("input");
                            self.element.on("input", searchFn);
                        }                    

                        self.element.off("keydown");
                        self.element.on("keydown", function (e) {
                            return self._workspace.getPicklist().navigate(e);
                        });
                    }
                };

            // For UI 1.8, _setOption must be manually invoked
            // from the base widget
            // $.Widget.prototype._setOption.apply( this, arguments );
            // For UI 1.9 the _super method can be used instead
            this._super(key, value);

            if (key in fnMap) {
                fnMap[key]();
            }
        },

        _setOptions: function (options) {
            this._super(options);
        }
    });

    // Handles email validation results and updates UI
    function handleResult(widget, result) {
        if (result.email === widget.element.val()) {
            var state = mapCertaintyToState(widget, result.getCertainty());
            widget._fsm.changeState(state, result);
        }
    }

    // Translate certainty from service to implemented values
    function mapCertaintyToState(widget, value) {
        var result = "unverified";
        var accepted = $.isArray(widget.options.acceptedResults) ? widget.options.acceptedResults : acceptedResults;

        if (accepted.includes(value)) {
            result = "verified";
        }

        return result;
    }

    function getMappedMessage(error) {
        if (error.getCertainty() in msgMap) {
            return msgMap[error.getCertainty()];
        }

        return "Unexpected response from server. Please contact administrator.";
    }

    function StateMachine(widget) {
        this._currentState = '';

        this.initial = {
            enter: function (args, done) {
                done();
            }
        };

        this.verified = {
            enter: function (args, done) {
                widget.element.addClass(widget.options.verifiedCss);
                done();
            },
            exit: function (args, done) {
                widget.element.removeClass(widget.options.verifiedCss);
                done();
            }
        };

        this.unverified = {
            enter: function (args, done) {
                var error = args.params;

                widget.element.addClass(widget.options.unverifiedCss);

                widget._workspace.getErrorMessage(getMappedMessage(error)).show(function () {
                    if (!error.hasSuggestions()) {
                        done();
                        return;
                    }
                    
                    if (widget.options.suggestionEnabled) {
                        widget._workspace.getPicklist(error.getSuggestions()).show(done);
                        return;
                    }                    

                    done();
                });
            },
            exit: function (args, done) {
                widget.element.removeClass(widget.options.unverifiedCss);

                widget._workspace.getPicklist().hide(function () {
                    widget._workspace.getErrorMessage().hide(done);
                });
            }
        };

        this.loading = {
            enter: function (args, done) {
                widget._workspace.getSpinner().show(done);
            },
            exit: function (args, done) {
                widget._workspace.getSpinner().hide(done);
            }
        };

        this.exception = {
            enter: function (args, done) {
                widget.element.addClass(widget.options.exceptionCss);
                widget._workspace.getErrorMessage(args.params).show(done);
            },
            exit: function (args, done) {
                widget.element.removeClass(widget.options.exceptionCss);
                widget._workspace.getErrorMessage().hide(done);
            }
        };

        this.invalid = {
            enter: function (args, done) {
                widget.element.addClass(widget.options.exceptionCss);
                widget._workspace.getErrorMessage(args.params).show(done);
            },
            exit: function (args, done) {
                widget.element.removeClass(widget.options.exceptionCss);
                widget._workspace.getErrorMessage().hide(done);
            }
        };

        // Changes the state of the widget
        this.changeState = function (state, args, done) {
            var self = this;
            var stateArgs = {
                currentState: self._currentState,
                targetState: state,
                params: args
            };

            var fnEnter = function () {
                self[state].enter(stateArgs, function () {
                    self._currentState = state;
                    if ($.isFunction(done)) {
                        executeCallback.call(widget, done);
                    }
                });
            };

            if (state in this) {
                if (this._currentState === '' || !$.isFunction(this[this._currentState].exit)) {
                    fnEnter();
                    return;
                }

                this[this._currentState].exit(stateArgs, fnEnter);
            }
        };
    }

    function Workspace(widget) {
        this._picklist = new Picklist(widget, this);
        this._spinner = new Spinner(widget, this);
        this._errorMessage = new ErrorMessage(widget, this);

        this.init = function () {
            if (this.element === undefined || this.element === null) {
                this._create();
                widget.element.after(this.element);
            }
        };

        /**
         * Creates a relative-positioned container for loader, error message and picklist 
         */
        this._create = function () {
            this.element = $("<div class='xpn-email-workspace'></div>");
            this.element.css({
                "position": "relative",
                "margin": 0,
                "padding": 0,
                "border": 0
            });

            return this;
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.getSpinner = function () {
            this.element.prepend(this._spinner.create().element);
            return this._spinner;
        };

        this.getPicklist = function (args) {
            if (args === undefined || args === null) {
                return this._picklist;
            }

            this.element.append(this._picklist.create(args).element);
            return this._picklist;
        };

        this.getErrorMessage = function (args) {
            if (this._errorMessage.create(args).element) {
                this.element.prepend(this._errorMessage.element);
            }

            return this._errorMessage;
        };

        this.init();
    }

    function Picklist(widget, workspace) {
        this.oldArgs = null;
        this.args = null;

        /**
         * Creates the picklist element and store it in the containing object
         */
        this.create = function (args) {
            if (args === undefined || args === null || args === this.oldArgs) {
                return this;
            }

            this.oldArgs = this.args;
            this.args = args;

            if (!this.element) {
                this.element = $("<div class='" + widget.options.suggestionPicklistContainerCss + "'></div>");
                this.element.hide();

                this.picklistContainer = $("<div class='" + widget.options.suggestionPicklistCss + "'></div>");
                this.element.append(this.picklistContainer);
            } else {
                this.picklistContainer.empty();
                this.selectedItem = null;
            }

            if (args.length > 0) {
                this.appendAll(args);
            }

            return this;
        };

        this.createItem = function (item) {
            var builder = [];

            builder.push("<div class='");
            builder.push(widget.options.suggestionPicklistItemCss);
            builder.push("'>");
            builder.push(item);
            builder.push("</div>");

            var picklistItem = $(builder.join(""));

            picklistItem.attr(dataKeys.picklist.suggestions, item);
            picklistItem.data(dataKeys.picklist.suggestions, item);

            return picklistItem;
        };

        /**
         * Appends an item to the picklist
         */
        this.appendItem = function (item) {
            var picklistItem = this.createItem(item);
            this.picklistContainer.append(picklistItem);

            this.listen(picklistItem);

            return picklistItem;
        };

        /**
         * Appends all items to picklist
         */
        this.appendAll = function (items) {
            var self = this;
            $.each(items, function (index, item) {
                self.appendItem(item);
            });
        };

        this.listen = function (item) {
            item.on("click", function () {
                widget.element.val(item.data(dataKeys.picklist.suggestions));
                widget.validate();
            });
        };

        // #region Navigation

        this.navigationHandlers = {
            /* Enter */
            "13": function (e) {
                if (!this.selectedItem) {
                    return true;
                }

                this.selectedItem.triggerHandler("click");
                return false;
            },

            /* Up */
            "38": function (e) {
                if (!this.selectedItem) {
                    return true;
                }

                this.movePrevious();
                return false;
            },

            /* Down */
            "40": function (e) {
                this.moveNext();
                return false;
            }
        };

        this.navigate = function (event) {
            var e = event || window.event;
            var key = e.which || e.keyCode;

            if (this.hasItems() && key in this.navigationHandlers) {
                //widget.element.focus();
                return this.navigationHandlers[key].call(this, event);
            }

            // Returns true if unhandled
            return true;
        };

        this.hasItems = function () {
            if (this.args) {
                return this.args.length > 0;
            }

            return false;
        };

        this.moveNext = function () {
            var item;

            if (!this.selectedItem) {
                item = this.select(0);
            }
            else {
                var next = this.selectedItem.next("." + widget.options.suggestionPicklistItemCss);
                item = this.selectItem(next);
            }

            this.scrollTo(item);

            return item;
        };

        this.movePrevious = function () {
            var prev = this.selectedItem.prev("." + widget.options.suggestionPicklistItemCss);
            var item = this.selectItem(prev);

            this.scrollTo(item);

            return item;
        };

        this.selectItem = function (item) {
            if (!item || !item.jquery || item.length < 1) {
                return null;
            }

            this.unselectItem(this.selectedItem);
            this.selectedItem = item;
            this.selectedItem.addClass(widget.options.suggestionPicklistItemSelectedCss);

            return this.selectedItem;
        };

        this.select = function (index) {
            var item = this.picklistContainer.find("." + widget.options.suggestionPicklistItemCss + ":eq(" + index + ")");
            return this.selectItem(item);
        };

        this.unselectItem = function (item) {
            if (!item) {
                return;
            }

            item.removeClass(widget.options.suggestionPicklistItemSelectedCss);
            item = null;
        };

        this.scrollTo = function (item) {
            if (!item || !item.jquery || item.length < 1) {
                return;
            }

            this.picklistContainer.stop();
            var position = this.where(item);

            this.picklistContainer.animate({
                scrollTop: position + "px"
            }, "fast");

            return this;
        };

        this.where = function (item) {
            var viewportTop = this.picklistContainer.offset().top + this.picklistContainer.scrollTop();
            var viewportBottom = viewportTop + this.picklistContainer.outerHeight();

            var itemTop = item.offset().top + this.picklistContainer.scrollTop();
            var itemBottom = itemTop + item.outerHeight();

            return itemTop < viewportTop ? itemTop - this.picklistContainer.offset().top
                : (itemBottom > viewportBottom) ? itemTop + item.outerHeight() - (this.picklistContainer.offset().top + this.picklistContainer.outerHeight())
                    : this.picklistContainer.scrollTop();
        };

        //#endregion        

        this.updatePosition = function () {
            this.element.css({
                left: widget.element.position().left - workspace.element.position().left,
                width: widget.element.outerWidth()
            });
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.show = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.updatePosition();
            this.element.slideDown(250, done);
        };

        this.hide = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.element.slideUp(100, done);
        };
    }

    function ErrorMessage(widget, workspace) {
        this.create = function (args) {
            if (!args) {
                return this;
            }

            if (!this.element) {
                this.element = $("<div class='" + widget.options.errorMessageCss + "'></div>");
                this.element.hide();
            }

            this.element.html(args);

            return this;
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.updatePosition = function () {
            this.element.css({
                left: widget.element.position().left - workspace.element.position().left,
                width: widget.element.outerWidth()
            });
        };

        this.show = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.updatePosition();
            this.element.slideDown(250, done);
        };

        this.hide = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.element.slideUp(100, done);
        };
    }

    function Spinner(widget, workspace) {
        this.create = function () {
            if (!this.element) {
                this.element = $("<div class='" + widget.options.spinnerCss + "'></div>");
                this.element.hide();
            }

            return this;
        };

        this.updatePosition = function () {
            var self = this.element;

            this.element.css({
                left: widget.element.position().left - workspace.element.position().left + parseInt(widget.element.css("border-left-width")),
                width: widget.element.innerWidth()
            });
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.show = function (done) {
            this.updatePosition();
            this.element.show();
            done();
        };

        this.hide = function (done) {
            this.element.hide();
            done();
        };
    }

    function executeCallback(callback) {
        if (callback !== undefined && callback !== null && $.isFunction(callback)) {
            callback();
        }
    }

    var msgMap = {
        "undeliverable": "Email or domain does not exist, or mailbox is suspended or disabled",
        "unreachable": "Email domain could not be reached or verified",
        "illegitimate": "Email could not be verified",
        "disposable": "Email could not be verified",
        "unknown": "Email could not be verified",
        "invalid-pattern": "Please enter a valid email",
        "empty": "Please fill out this field"
    };

    var acceptedResults = ["verified", "unknown"],
        validPattern = "^(([^<>()\\[\\]\\\\.,;:\\s@\"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@\"]+)*)|(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$",
        regex = new RegExp(validPattern);


    var suggestionInfoMessage = "Did you mean?";

    var dataKeys = {
        picklist: {
            suggestions: "xpn-suggestions"
        }
    };

    var searchTriggerModes = ["input", "blur"];

})(jQuery, window, document);

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {

            // 1. Let O be ? ToObject(this value).
            if (this === null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                // c. Increase k by 1. 
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}
"use strict";

/* globals console */
; (function (window) {
    var EXP = window.EXP = window.EXP || {};
    EXP.DQ = EXP.DQ || {};
    EXP.DQ.Mobile = (function (lib, dq, $, undefined) {

        var headersTemplate = {
            "Content-Type": "application/json"
        };

        //Helper function
        function checkStatus() {
            if (!dq.Urls[EXP.DQ.UrlEnum.MOBILE]) {
                throw "Unable to search, missing url.";
            }
            if (!dq.Tokens[EXP.DQ.TokenEnum.MOBILE]) {
                throw "Unable to search, missing token.";
            }
            return true;
        }

        /**
         * A mobile number validation service client.
         */
        lib.Client = function (options) {
            var _self = this;            
            var client = EXP.createWebServiceClient($);

            _self.options = {
                restUrl: 'https://api.experianmarketingservices.com/sync/queryresult/PhoneValidate/3.0/'
            };

            options = options === undefined ? {} : options;
            $.extend(_self.options, options);

            _self.validate = function (mobileNumber) {
                dq.addUrl(EXP.DQ.UrlEnum.MOBILE, _self.options.restUrl);
                dq.addToken(EXP.DQ.TokenEnum.MOBILE, _self.options.token);

                return EXP.DQ.Mobile.validateMobile(client, mobileNumber);
            };
        };

        lib.validateMobile = function (client, mobileToValidate) {
            var dfd = $.Deferred();
            try {
                checkStatus();

                var headers = headersTemplate;
                headers['Auth-Token'] = dq.Tokens[EXP.DQ.TokenEnum.MOBILE];
                var content = JSON.stringify({ "Number": mobileToValidate });
                var promise = client.callWebService(EXP.MethodEnum.POST, EXP.DQ.UrlEnum.MOBILE, headers, content, EXP.DataTypeEnum.JSON);
                promise.done(function (rJ) {
                    var searchResult = new lib.MobileSearchResult(rJ.Certainty, rJ.Number, rJ.ResultCode, rJ.PhoneType, rJ.AdditionalPhoneInfo);
                    dfd.resolve(searchResult);
                }).fail(function (result) {
                    var msg = "Failed to communicate with mobile validation service";

                    switch (result.status) {
                        case 400:
                            msg = "Bad request submitted. Please check your input.";
                            break;
                        case 401:
                            msg = "Unauthorized request to mobile validation service.";
                            break;
                        default:                            
                    }                    

                    dfd.reject(msg);
                });
            } catch (e) {
                dfd.reject(e);
            }

            return dfd.promise();
        };

        //Classes
        lib.MobileSearchResult = function MobileSearchResult(certainty, number, resultCode, phoneType, additionalPhoneInfo) {
            this.certainty = certainty;
            this.number = number;
            this.resultCode = resultCode;
            this.phoneType = phoneType;
            this.additionalPhoneInfo = additionalPhoneInfo;
        };
        lib.MobileSearchResult.prototype.getCertainty = function () {
            return this.certainty;
        };
        lib.MobileSearchResult.prototype.getNumber = function () {
            return this.number;
        };
        lib.MobileSearchResult.prototype.getResultCode = function () {
            return this.resultCode;
        };
        lib.MobileSearchResult.prototype.getPhoneType = function () {
            return this.phoneType;
        };
        lib.MobileSearchResult.prototype.isVerified = function () {
            return (this.certainty === 'Verified');
        };
        lib.MobileSearchResult.prototype.isAbsent = function () {
            return (this.certainty === 'Absent');
        };
        return lib;

    })(EXP.DQ.Mobile || {}, EXP.DQ, window.jQuery);

    return EXP;
})(window);

"use strict";

/* globals EXP */
/*jshint bitwise: false*/
; (function ($, window, document, undefined) {
    // define your widget under a namespace of your choice
    //  with additional parameters e.g.
    // $.widget( "namespace.widgetname", (optional) - an
    // existing widget prototype to inherit from, an object
    // literal to become the widget's prototype );        

    $.widget("experian.mobile", {

        //Options to be used as defaults
        options: {
            token: '',
            required: true,
            searchTrigger: 'input', // [input | blur] Default: input
            searchDelayTimeout: 850, // input timeout in millisecond before search is triggered
            acceptedResults: ["1", "2", "3", "4"],
            baseCss: 'xpn-mobile',
            verifiedCss: 'xpn-mobile-verified',
            unverifiedCss: 'xpn-mobile-unverified',
            exceptionCss: 'xpn-mobile-exception',
            errorMessageCss: 'xpn-mobile-errormsg',
            spinnerCss: 'xpn-mobile-loader',

            /**
             * This function will be called, if provided, to retrieve the mobile number for validation. It will 
             * override the value in the input element, thus, giving user a chance to format the value into proper
             * format before submitting for validation.
             * 
             * The function should accept a single parameter, val, which is the value from the input element and it is
             * expected that the function will return a value.
             */
            getMobileInputFn: function (val) {
                return val;
            }
        },

        //Setup widget (eg. element creation, apply theming
        // , bind events etc.)
        _create: function () {

            // _create will automatically run the first time
            // this widget is called. Put the initial widget
            // setup code here, then you can access the element
            // on which the widget was called via this.element.
            // The options defined above can be accessed
            // via this.options this.element.addStuff();                            

            this._workspace = new Workspace(this);
            this._fsm = new StateMachine(this);
            this._init();
        },

        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        destroy: function () {
            this.reset();

            // this.element.removeStuff();
            // For UI 1.8, destroy must be invoked from the
            // base widget
            $.Widget.prototype.destroy.call(this);
            // For UI 1.9, define _destroy instead and don't
            // worry about
            // calling the base widget
        },

        _init: function () {
            this._setOptions({
                "token": this.options.token,
                "baseCss": this.options.baseCss,
                "verifiedCss": this.options.verifiedCss,
                "unverifiedCss": this.options.unverifiedCss,
                "exceptionCss": this.options.exceptionCss,
                "errorMessageCss": this.options.errorMessageCss,
                "spinnerCss": this.options.spinnerCss,
                "getMobileInputFn": this.options.getMobileInputFn,
                "searchTrigger": this.options.searchTrigger                
            });
        },

        reset: function () {
            this._workspace.destroy();
            this.element.removeClass(this.options.verifiedCss);
            this.element.removeClass(this.options.unverifiedCss);
            this.element.removeClass(this.options.exceptionCss);
            this.element.off("input");
            this.element.off(this.options.searchTrigger);
        },

        validate: function () {
            var self = this;

            if (self.element.data("oldValue") === self.element.val()) {
                return;
            }

            self.element.data("oldValue", self.element.val());

            this._fsm.changeState("loading", null, function () {
                var inputNum = self.element.val();

                if (inputNum === '') {
                    if (self.options.required) {
                        self._fsm.changeState("invalid", msgMap["empty"]);
                    } else {
                        self._fsm.changeState("initial");
                    }

                    return;
                }
                
                var overrideNum = { number: inputNum };
                self._trigger("beforevalidate", null, overrideNum);
                if (overrideNum && overrideNum.number && overrideNum.number !== '') {
                    inputNum = overrideNum.number;
                }

                new EXP.DQ.Mobile.Client({
                    token: self.options.token
                })
                    .validate(inputNum)
                    .fail(function (e) {
                        self._fsm.changeState("exception", {
                            message: e
                        });
                    })
                    .done(function (e) {
                        self.__handleResult(self, e);
                    });
            });
        },

        // Respond to any changes the user makes to the
        // option method
        _setOption: function (key, value) {
            var self = this,
                prev = this.options[key],
                fnMap = {
                    "baseCss": function () {
                        self.element.removeClass(prev);
                        self.element.addClass(value);
                    },
                    "verifiedCss": function () {
                        if (self.element.hasClass(prev)) {
                            self.element.removeClass(prev);
                            self.element.addClass(value);
                        }
                    },
                    "unverifiedCss": function () {
                        if (self.element.hasClass(prev)) {
                            self.element.removeClass(prev);
                            self.element.addClass(value);
                        }
                    },
                    "exceptionCss": function () {
                        if (self.element.hasClass(prev)) {
                            self.element.removeClass(prev);
                            self.element.addClass(value);
                        }
                    },
                    "errorMessageCss": function () {
                        var errorMsg = self._workspace.getErrorMessage();
                        if (errorMsg.element) {
                            errorMsg.element.removeClass(prev);
                            errorMsg.element.addClass(value);
                        }
                    },
                    "spinnerCss": function () {
                        var loader = self._workspace.getSpinner();
                        if (loader.element) {
                            loader.element.removeClass(prev);
                            loader.element.addClass(value);
                        }
                    },
                    "searchTrigger": function () {
                        var searchFn = function () {
                            if (self.searchDelayTimer) {
                                clearTimeout(self.searchDelayTimer);
                            }

                            self.searchDelayTimer = setTimeout(function () {
                                self.validate();
                            }, self.options.searchDelayTimeout);
                        };

                        self.element.off("input");
                        self.element.off(self.options.searchTrigger);

                        if (searchTriggerModes.includes(self.options.searchTrigger)) {
                            self.element.off(self.options.searchTrigger);
                            self.element.on(self.options.searchTrigger, searchFn);
                        } else {
                            self.element.off("input");
                            self.element.on("input", searchFn);
                        }
                    }
                };

            // For UI 1.8, _setOption must be manually invoked
            // from the base widget
            // $.Widget.prototype._setOption.apply( this, arguments );
            // For UI 1.9 the _super method can be used instead
            this._super(key, value);

            if (key in fnMap) {
                fnMap[key]();
            }
        },

        _setOptions: function (options) {
            this._super(options);
        },

        // Handles mobile validation results and updates UI
        __handleResult: function (widget, result) {
            widget._trigger("aftervalidate", null, result);
            var state = mapCertaintyToState(widget, result.getResultCode());
            this._fsm.changeState(state, result);
        },
    });


    function Workspace(widget) {
        this._spinner = new Spinner(widget, this);
        this._errorMessage = new ErrorMessage(widget, this);

        this.init = function () {
            if (this.element === undefined || this.element === null) {
                this._create();
                widget.element.after(this.element);
            }
        };

        /**
         * Creates a relative-positioned container for loader, error message and picklist 
         */
        this._create = function () {
            this.element = $("<div class='xpn-mobile-workspace'></div>");
            this.element.css({
                "position": "relative",
                "margin": 0,
                "padding": 0,
                "border": 0
            });

            return this;
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.getSpinner = function () {
            this.element.prepend(this._spinner.create().element);
            return this._spinner;
        };

        this.getErrorMessage = function (args) {
            if (this._errorMessage.create(args).element) {
                this.element.prepend(this._errorMessage.element);
            }

            return this._errorMessage;
        };

        this.init();
    }

    function StateMachine(widget) {
        this._currentState = '';

        this.initial = {
            enter: function (args, done) {
                done();
            }
        };

        this.verified = {
            enter: function (args, done) {
                widget.element.addClass(widget.options.verifiedCss);
                done();
            },
            exit: function (args, done) {
                widget.element.removeClass(widget.options.verifiedCss);
                done();
            }
        };

        this.unverified = {
            enter: function (args, done) {
                var error = args.params;

                widget.element.addClass(widget.options.unverifiedCss);
                widget._workspace.getErrorMessage(mapErrorMessage(error)).show(done);
            },
            exit: function (args, done) {
                widget.element.removeClass(widget.options.unverifiedCss);
                widget._workspace.getErrorMessage().hide(done);
            }
        };

        this.loading = {
            enter: function (args, done) {
                widget._workspace.getSpinner().show(done);
            },
            exit: function (args, done) {
                widget._workspace.getSpinner().hide(done);
            }
        };

        this.exception = {
            enter: function (args, done) {
                widget.element.addClass(widget.options.exceptionCss);
                widget._workspace.getErrorMessage(args.params.message).show(done);
            },
            exit: function (args, done) {
                widget.element.removeClass(widget.options.exceptionCss);
                widget._workspace.getErrorMessage().hide(done);
            }
        };

        this.invalid = {
            enter: function (args, done) {
                widget.element.addClass(widget.options.exceptionCss);
                widget._workspace.getErrorMessage(args.params).show(done);
            },
            exit: function (args, done) {
                widget.element.removeClass(widget.options.exceptionCss);
                widget._workspace.getErrorMessage().hide(done);
            }
        };

        // Changes the state of the widget
        this.changeState = function (state, args, done) {
            var self = this;
            var stateArgs = {
                currentState: self._currentState,
                targetState: state,
                params: args
            };

            var fnEnter = function () {
                self[state].enter(stateArgs, function () {
                    self._currentState = state;
                    if ($.isFunction(done)) {
                        executeCallback.call(widget, done);
                    }
                });
            };

            if (state in this) {
                if (this._currentState === '' || !$.isFunction(this[this._currentState].exit)) {
                    fnEnter();
                    return;
                }

                this[this._currentState].exit(stateArgs, fnEnter);
            }
        };
    }

    function Spinner(widget, workspace) {
        this.create = function () {
            if (!this.element) {
                this.element = $("<div class='" + widget.options.spinnerCss + "'></div>");
                this.element.hide();
            }

            return this;
        };

        this.updatePosition = function () {
            var self = this.element;

            this.element.css({
                left: widget.element.position().left - workspace.element.position().left + parseInt(widget.element.css("border-left-width")),
                width: widget.element.innerWidth()
            });
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.show = function (done) {
            this.updatePosition();
            this.element.show();
            done();
        };

        this.hide = function (done) {
            this.element.hide();
            done();
        };
    }

    function ErrorMessage(widget, workspace) {
        this.create = function (args) {
            if (!args) {
                return this;
            }

            if (!this.element) {
                this.element = $("<div class='" + widget.options.errorMessageCss + "'></div>");
                this.element.hide();
            }

            this.element.html(args);

            return this;
        };

        this.destroy = function () {
            if (this.element !== undefined && this.element !== null && this.element.jquery) {
                this.element.remove();
                this.element = null;
            }
        };

        this.updatePosition = function () {
            this.element.css({
                left: widget.element.position().left - workspace.element.position().left,
                width: widget.element.outerWidth()
            });
        };

        this.show = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.updatePosition();
            this.element.slideDown(250, done);
        };

        this.hide = function (done) {
            if (!this.element) {
                done();
                return;
            }

            this.element.slideUp(100, done);
        };
    }

    // Translate certainty from service to implemented values
    function mapCertaintyToState(widget, value) {
        var result = "unverified";
        var accepted = $.isArray(widget.options.acceptedResults) ? widget.options.acceptedResults : acceptedResults;

        if (accepted.includes(value)) {
            result = "verified";
        }

        return result;
    }

    function mapErrorMessage(error) {
        if (error.getResultCode() in msgMap) {
            return msgMap[error.getResultCode()];
        }

        return "Unexpected response from server. Please contact administrator.";
    }

    //#endregion

    function executeCallback(callback) {
        if (callback !== undefined && callback !== null && $.isFunction(callback)) {
            callback();
        }
    }

    var msgMap = {
        "0": "Invalid number format supplied", /* Unverified */
        "1": "Valid number format but not verified with network lookup", /* Unknown */
        "2": "Number format validated and number verified via network lookup but not currently available (i.e. phone off, out of range)", /* Absent */
        "3": "Number format validated and number verified", /* Verified */
        "4": "Valid number but not active on a network", /* Teleservice not provisioned */
        "empty": "Please fill out this field"
    };

    var acceptedResults = ["1", "2", "3", "4"];

    var searchTriggerModes = ["input", "blur"];

})(jQuery, window, document);

// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {

            // 1. Let O be ? ToObject(this value).
            if (this === null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If len is 0, return false.
            if (len === 0) {
                return false;
            }

            // 4. Let n be ? ToInteger(fromIndex).
            //    (If fromIndex is undefined, this step produces the value 0.)
            var n = fromIndex | 0;

            // 5. If n ≥ 0, then
            //  a. Let k be n.
            // 6. Else n < 0,
            //  a. Let k be len + n.
            //  b. If k < 0, let k be 0.
            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            // 7. Repeat, while k < len
            while (k < len) {
                // a. Let elementK be the result of ? Get(O, ! ToString(k)).
                // b. If SameValueZero(searchElement, elementK) is true, return true.
                // c. Increase k by 1. 
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                k++;
            }

            // 8. Return false
            return false;
        }
    });
}