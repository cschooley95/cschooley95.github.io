require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/TimeSlider"
], function (Map, MapView, FeatureLayer, Expand, Legend, TimeSlider) {

let OGLayerView;

  const layer = new FeatureLayer({
    portalItem: {
      id: "dd28d5595a2940929574e79522bb4245"
    }
  });

  // Create Map
const map = new Map({
  basemap: "topo",
  layers: [layer]
});

 // Set the map view
const view = new MapView({
  container: "viewDiv",
  map: map,
  center: [-111.65124179920204, 39.707361735142236],
  zoom:7
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
    playRate: 750,
    stops: {
      interval: {
        value: 5,
        unit: "years"
      }
    },

    // time slider time extent
    //fullTimeExtent: {
       // start: new Date(1900,0,1),
       // end: new Date(2022,0,1)
    //},

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

// Creating view layer???
view.whenLayerView(layer).then((layerView) => {
  OGLayerView = layerView;

// Setting start date for time slider
  const start = new Date(1900, 0, 1);

 // Extent for time Slider 
  timeSlider.fullTimeExtent = {
    start: start,
    end: layer.timeInfo.fullTimeExtent.end
  };

// Show 5 year intervals

let end = new Date(start);

end.setDate(end.getDate() + 1825); // the number here is in days (1825 = 5 years)

timeSlider.timeExtent = {start,end};

});

// watch timeslider timeExtent change
timeSlider.watch("timeExtent", () => {
  //oil wells that popped up before the end of the current time extent
OGLayerView.filter = {
  where: "OrigComplDate <=" + timeSlider.timeExtent.end.getTime(),
}
// add grayscale effect to old wells (may or may not keep this)
  OGLayerView.effect = {
    filter: {
      timeExtent:timeSlider.timeExtent,
      geometry: view.extent
    },
    excludedEffect: "grayscale(80%) opacity(20%)"
  };

// Run statistics for GDP within current time extent
const statQuery = OGLayerView.effect.filter.createQuery();
statQuery.outStatistics = [
  GDPAvg
];

layer.queryFeatures(statQuery).then((result) => {
  let htmls = [];
  statsDiv.innerHTML = "";
  if (result.error) {
    return result.error;
  } else {
    if (result.feature.length >= 1) {
      const attributes = result.features[0].attributes;
      for (stat in statsFields) {
        if (attributes[stat] && attributes[stat] != null) {
          const html =
          "<br/>" +
          statsFields[stat] +
          ": <b><span>" + // setting bolding and styling
          attributes[stat].toFixed(0) + // How many decimal places
          "</span></b>"; // setting bolding and styling to attribute information
          htmls.push(html) // push html into code into information box with attribute information
        }
      }
      const yearHtml =
        "<span>" +
        result.features[0].attributes["Employment_Average"] +
        "</span> earthquakes were recorded between " +
        timeSlider.timeExtent.start.toLocaleDateString() +
        " - " +
        timeSlider.timeExtent.end.toLocaleDateString() +
        ".<br/>";

      if (htmls[0] == undefined) {
        statsDiv.innerHTML = yearHtml;
      } else {
        statsDiv.innerHTML =
          htmls[0];
    }
  }
}
})
.catch((error) => {
  console.log(error);
});

});

const GDPAvg = {
  onstatisticField: "GDP",
  outStatisticFieldName: "GDP_Average",
  statisticType: "avg"
};

const statsFields = {
  Employment_Avearge: "Employment Average"
};

const statsDiv = document.getElementById("statsDiv");
        const infoDiv = document.getElementById("infoDiv");
        const infoDivExpand = new Expand({
          collapsedIconClass: "esri-icon-collapse",
          expandIconClass: "esri-icon-expand",
          expandTooltip: "Expand Oil and Gas Industry info",
          view: view,
          content: infoDiv,
          expanded: true
        });
        view.ui.add(infoDivExpand, "top-right");
});
