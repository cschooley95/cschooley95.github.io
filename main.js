  
require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/TimeSlider"
], function (WebMap, MapView, TimeSlider) {

    //Grabbing my web map
  const map = new WebMap({
    portalItem: {
      id: "1e9a6937760e46d3bd047c108ebf8246"
    }
  });

  const view = new MapView({
    container: "viewDiv",
    map: map
  });

  const events = [
    {name: "Recession of 2008", date: 2008},
    {name: "Covid-19 Pandemic", date: 2020}
  ];
  
  //Creating Timeslider
  const timeSlider = new TimeSlider({
      container: "timeSlider",
      fullTimeExtent: {
          start: new Date(1900,0,1),
          end: new Date(2022,0,1)
      },

      tickConfigs: [{
        mode: "position",
        values: events
          .map((event) => new Date(event.date, 0, 1))
          .map((date) => date.getTime()),
        labelsVisible = true,
        labelFormatFunction: (value)=> {
          const event = events.find(
            (s) => new Date(s.date, 0, 1).getTime() === value
          );
          return event.name + ", " + event.date;
        }
      }]
  });

  view.ui.add(timeSlider)

});