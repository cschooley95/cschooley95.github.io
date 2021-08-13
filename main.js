require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/TimeSlider"
], function (WebMap, MapView, TimeSlider) {

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
    {name:`Great Recession`, date: 2008},
    {name: `Covid-19 Pandemic`, date: 2020}
  ];
  
  const timeSlider = new TimeSlider({
      container: "timeSlider",
      view: view,
      playRate: 10,
      stops: {
        interval: {
          value: 1,
          unit: "years"
        }
      },

      fullTimeExtent: {
          start: new Date(1940,0,1),
          end: new Date(2022,0,1)
      },

      tickConfigs: [{
        mode: "position",
        values: [
          new Date(1940, 0, 1), new Date(1950, 0, 1), new Date(1960, 0, 1), new Date(1970, 0, 1),
          new Date(1980, 0 , 1), new Date(1990, 0, 1), new Date(2000, 0, 1), new Date(2010, 0, 1), new Date(2020, 0, 1)
        ].map((date) => date.getTime()),
        labelsVisible: true,
        labelFormatFunction: (value) => {
          const date = new Date(value);
          return `${date.getUTCFullYear()}`;
        },
        tickCreatedFunction: (value, tickElement, labelElement) => {
          tickElement.classList.add("custom-ticks2");
          labelElement.classList.add("custom-labels2");
        }
      }, {
        mode: "position",
        values: events
          .map((event) => new Date(event.date, 0, 1))
          .map((date) => date.getTime()),
        labelsVisible: true,
        labelFormatFunction: (value) => {
          const event = events.find(
            (s) => new Date(s.date, 0, 1).getTime() === value
          );
          return event.name;
        },
        tickCreatedFunction: (value, tickElement, labelElement) => {
          tickElement.classList.add("custom-ticks");
          labelElement.classList.add("custom-labels");
        }
      }
    ]
  });

  view.ui.add(timeSlider)

});
