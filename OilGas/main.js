require([
    "esri/WebMap",
    "esri/views/MapView",
], function(WebMap, MapView) {

    const map = new WebMap({
        portalItem: {
            id: "abfd3ac06bb34826a772a9f49fde3ace"
        }
    });

    const view = new MapView({
        container: "viewDiv",
        map: map
    })
})