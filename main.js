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
      mode: "instant",
      fullTimeExtent: {
          start: new Date(1900,0,1),
          end: new Date(2022,0,1)
      },

      tickConfigs: [{
        mode: "position",
        values: events
          .map((event) => new Date(event.date, 0, 1))
          .map((date) => date.getTime()),
        labelsVisible: true,
        labelFormatFunction: (value) => {
          const event = events.find(
            (s) => new Date(s.date, 0, 1).getTime() === value
          );
          return event.name + ", " + event.date;
        }
      }]
  });

  view.ui.add(timeSlider)

});
