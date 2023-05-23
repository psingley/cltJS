define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'event.aggregator'
], function ($, _, Backbone, App, EventAggregator) {
    var securityService = {
        signIn: function(username, password, remember){
            var data = {
                username: username,
                password: password,
                remember: remember
            };
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/SSO/SSOService.asmx/Login',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            })
        },

        logout: function(){
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: '/Services/SSO/SSOService.asmx/Logout',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            })
        },

        companySearch: function(memberNumber, memberTypeId, postalCode){
            var data = {
                memberNumber: memberNumber,
                memberTypeId: memberTypeId,
                postalCode: postalCode
            };
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/AccountManagement/AccountManagement.asmx/CompanySearch',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            });
        },

        contactSearch: function(lastName){
            var data = {
                lastName: lastName,
                companyId:  App.createAccount.company.id
            };
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/AccountManagement/AccountManagement.asmx/ContactSearch',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            });
        },

        createAccount: function(login, password){
            var data = {
                password: password,
                login: login,
                contactId: App.createAccount.contact.id,
                companyId: App.createAccount.company.id
            };
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/AccountManagement/AccountManagement.asmx/CreateTravelProfessionalAccount',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            });
        },

        forgotPassword: function(login){
            var data = {
                login: login
            };
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/AccountManagement/AccountManagement.asmx/ForgotPassword',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            });
        },

        resetPassword: function(pas, token){
            var data = {
                password: pas,
                token: token
            };
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/AccountManagement/AccountManagement.asmx/ResetPassword',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            });
        },

        verifyTravelProfessionalAccount: function() {
            var data = {
                pivotalContactId: App.createAccount.contact.id
            };
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/AccountManagement/AccountManagement.asmx/VerifyTravelProfessionalAccount',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            });
        },

        submitRegisterForAccess: function(companyInfo, contactInfo) {
            var data = {
                companyInfoStr: JSON.stringify(companyInfo),
                contactInfoStr: JSON.stringify(contactInfo)
            };
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/AccountManagement/AccountManagement.asmx/RegisterForAccess',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            });
        },

        checkUsername: function(username){
            var data = {
                username: username
            };
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify(data),
                url: '/Services/AccountManagement/AccountManagement.asmx/CheckUsername',
                error: function (errorResponse) {
                    console.log("Inside Failure");
                    console.log(errorResponse.responseText);
                }
            });
        }
    };

    return securityService;
});