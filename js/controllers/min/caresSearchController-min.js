define(["domReady","app","jquery","backbone","marionette","views/search/SearchTextView","event.aggregator","util/searchOptionsUtil","services/searchService","util/timeoutUtil","objects/factories/searchContextFactory","models/search/PerformSearchModel"],function(e,t,$,r,s,i,n,o,a,c,l,u){return r.Marionette.Controller.extend({initialize:function(){var e=t.siteSettings.siteId,r=new l({siteId:e});this.timeoutUtil=new c},performSearch:function(){var e=this;$.when(t.dictionary.getDictionaries()).done(function(){var r=t.siteSettings.currentItemId;if(null==t.Search.searchOptions.get("currentItemId")){var s={currentItemId:r};o.setUrlSearchOptions(r),n.trigger("setSearchOptionsComplete")}e.timeoutUtil.suspendOperation(t.Search.searchSettings.get("searchDelayInMilliseconds"),function(){o.setUrlSearchOptions(r)},function(){a.requestSearchResults(t.Search.searchOptions)})})},showDefaultResults:function(){var e=new u,r=$.Deferred(function(t){var r=$("#defaultSearchResults");return 0===r.length?(console.log("could not find default search results element"),void t.reject()):(e.set($.parseJSON(r.val())),void t.resolve())});this.getDefaultSearchResults=function(){return r.promise()},$.when(this.getDefaultSearchResults()).done(function(){var r=t.siteSettings.currentItemId;o.setUrlSearchOptions(r),n.trigger("requestResultsComplete",e)})}})});