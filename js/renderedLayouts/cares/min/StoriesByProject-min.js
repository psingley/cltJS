define(["jquery","underscore","backbone","app","util/taxonomy/taxonomyDomUtil","util/objectUtil","util/validationUtil","views/validation/ErrorView","views/validation/SuccessView","extensions/marionette/views/RenderedLayout","goalsUtil"],function($,i,e,t,a,o,n,s,l,c,r){var m=c.extend({el:".stories-by-project",events:{"click a":"linkClick"},initialize:function(){console.log("caresContactUsLayout initialized")},linkClick:function(i){i.preventDefault();var e=t.dictionary.get("common.FormValidations.Message"),a=t.dictionary.get("common.FormValidations.Subject"),o=t.dictionary.get("common.FormValidations.FirstName"),c=t.dictionary.get("common.FormValidations.LastName"),m=this.ui.$email.val(),u=this.ui.$confirmEmail.val(),d=this.ui.$firstName.val(),v=this.ui.$lastName.val(),g=this.ui.$subject.val(),h=this.ui.$message.val(),y=[];(null==d||""==d)&&y.push(o),(null==v||""==v)&&y.push(c);var p=n.validateEmail(m,u);if(y=y.concat(p),(null==g||""==g)&&y.push(a),(null==h||""==h)&&y.push(e),t.addRegions({messagesRegion:"#contact-us-messages"}),0==y.length){var w=new l([t.dictionary.get("common.Misc.ThankYou")]);return t.messagesRegion.show(w),r.contactUsFormComplete(),!0}var f=new s(y);return t.messagesRegion.show(f),!1}});return m});