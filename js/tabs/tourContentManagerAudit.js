var report = new Object();
report.pageName = "TourContentManagerAudit";
report.itemId = "{E9A18A3B-5D67-49F7-8603-5316D632789C}";

$(function() {
    $(document).on("click", ".open-button", function () {
        var tourId = this.getAttribute("data-tour-id");
        var lang = this.getAttribute("data-lang");
        var url = '/sitecore/shell/sitecore/content/Applications/Content Editor.aspx?id=' + tourId + '&la=' + lang + '&fo=' + tourId;
        window.open(url);
    });
});
