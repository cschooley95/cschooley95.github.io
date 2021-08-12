  
require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/TimeSlider"
], function (WebMap, MapView, TimeSlider) {

  /******************************************************************
   *
   * Webmap example
   *
   ******************************************************************/

  // Step 1: Pass a webmap instance to the map and specify the id for the webmap item
  const map = new WebMap({
    portalItem: { // autocast (no need to specifically require it above)
      id: "1e9a6937760e46d3bd047c108ebf8246"
    }
  });

  const view = new MapView({
    container: "viewDiv",
    map: map
  });
  
  const timeSlider = new TimeSlider({
      container: "timeSlider",
      fullTimeExtent: {
          start: new Date(1900,0,1),
          end: new Date(2022,0,1)
      }
  });

  view.ui.add(timeSlider)

});