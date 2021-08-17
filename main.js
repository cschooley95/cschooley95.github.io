require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/Layer",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/TimeSlider"
], function (Map, MapView, Layer, Expand, Legend, TimeSlider) {

  // Create Map
const map = new Map({
  basemap: "topo"
});

 // Set the map view
const view = new MapView({
  container: "viewDiv",
  map: map,
  center: [-111.65124179920204, 39.707361735142236],
  zoom:7
});

Layer.fromPortalItem({
  portalItem: {
    id: "1e9a6937760e46d3bd047c108ebf8246"
  }
  })
  .then((layer) => {
    map.add(layer)
  });

// Create a collapsible legend
const legendExpand = new Expand({
  collapsedIconClass: "esri-icon-collapse",
  expandIconClass: "esri-icon-expand",
  expandTooltip: "Legend",
  view: view,
  content: new Legend({
    view: view
  }),
  expanded: false
});
view.ui.add(legendExpand, "top-left");

// Create events for the time slider
const events = [
  {name:`Great Recession`, date: 2008},
  {name: `Covid-19 Pandemic`, date: 2020}
];

// Create time slider with interval set to 5 years
const timeSlider = new TimeSlider({
    container: "timeSlider",
    mode: "time-window",
    view: view,
    playRate: 750,
    stops: {
      interval: {
        value: 5,
        unit: "years"
      }
    },

    // time slider time extent
    fullTimeExtent: {
        start: new Date(1900,0,1),
        end: new Date(2022,0,1)
    },

    // configure ticks for dates
    tickConfigs: [{
      mode: "position",
      values: [
        new Date(1900, 0, 1), new Date(1910, 0, 1), new Date(1920, 0, 1), new Date(1930, 0, 1), new Date(1940, 0, 1), new Date(1950, 0, 1), new Date(1960, 0, 1), new Date(1970, 0, 1),
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

// add time slider to view
view.ui.add(timeSlider);
});

