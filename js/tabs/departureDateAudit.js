var report = new Object();
report.pageName = "DepartureDateAudit";
report.itemId = "{56A80C06-1AF9-457D-A82D-49BAC3F274C9}";

$(function () {
    $(document).on("click", ".open-button", function () {
        var packageId = this.getAttribute("data-package-id");
        var lang = this.getAttribute("data-lang");
        var url = '/sitecore/shell/sitecore/content/Applications/Content Editor.aspx?id=' + packageId + '&la=' + lang + '&fo=' + packageId;
        window.open(url);
    });
});