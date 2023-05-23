function datalayerPush()
{
    if (localStorage.getItem("SearchTerm") !== null && localStorage.getItem("Action") === "anchor tag") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'SearchTerm': localStorage.SearchTerm,
            'SearchTrigger': localStorage.Action,
            'ResultCount': 1,
            'event': "dataLayerPush",
            'isAgent': isAgent()

        });
        localStorage.removeItem("SearchTerm");
        localStorage.removeItem("Action");
    }
}

function datalayerOtherPush() {
    if (localStorage.getItem("SearchTerm") !== null) { 
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'SearchTerm': localStorage.SearchTerm,
            'SearchTrigger': localStorage.Action,
            'event': "dataLayerPush",
            'isAgent': isAgent()
        });
    }
}

