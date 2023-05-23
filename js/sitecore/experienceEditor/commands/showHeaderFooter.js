define(["sitecore", "/-/speak/v1/ExperienceEditor/ExperienceEditor.js"], function (Sitecore, ExperienceEditor) {
  // this is javascript responsible for a work of one button on Experience Editor ribbon called 'Show Header and Footer'
  // if they are shown, button should be shown as pressed
  //button click will reload the page using correct url parameter value

  const urlParameter = 'showHeaderFooter';
  var headerShown;
  Sitecore.Commands.ShowHideFooter =
  {
    canExecute: function (context) {
      if (headerShown == undefined){
        var regex = new RegExp("[\\?&]" + urlParameter + "=([^&#]*)", 'i'),
            results = regex.exec(window.parent.location.search);
        headerShown = results != null && results[1] == '1';
      }
      context.button.set({ isPressed:headerShown });
      return true;
    },

    execute: function (context) {
      var currentUrl = window.parent.location.href;
      if (headerShown){
        window.parent.location = currentUrl.replace('&' + urlParameter + '=1','');
      }
      else {
        window.parent.location = currentUrl + '&' + urlParameter + '=1';
      }
    }
  };
});