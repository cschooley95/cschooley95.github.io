require([
  "esri/WebMap",
  "esri/views/MapView",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/TimeSlider"
], function (WebMap, MapView, Expand, Legend, TimeSlider) {

const map = new WebMap({
  portalItem: { 
    id: "1e9a6937760e46d3bd047c108ebf8246"
  }
});

const view = new MapView({
  container: "viewDiv",
  map: map
});

let layerView;

const layer = map.layers.getItemAt(0);

let end = new Date(start);
end.setDate(end.getDate() + 1);

timeSlider.timeExtent = { start, end };

});



  const statquery = layer.filter.createQuery();
  statquery.outStatistics = [
    GDP
  ];

  layer.queryFeatures(statquery)
  .then((result) => {
    let htmls = [];
    statsDiv.innerHTML = "";
    if (result.error) {
      return result.error;
    } else {
      if (result.queryFeatures.length >= 1) {
        const attributes = result.features[0].attributes;
        for (name in statsFields) {
          if (attributes[name] && attributes[name] != null){
            const html =
            "<br/>" +
            statsFields[name] +
            ": <b><span>" +
            attributes[name].toFixed(2) +
            "</span></b>";
            htmls.push(html);
          }
        }
        const yearHtml =
        "<span>" +
        result.features[0].attributes["GDP"] +
         "billion dollars </span> were added to Utah's GDP by the Oil and Gas Industry in" +
         timeSlider.timeExtent.end.toLocaleDateString() + ".<br/>";

         if (htmls[0] == undefined) {
          statsDiv.innerHTML = yearHtml;
        } else {
          statsDiv.innerHTML =
            yearHtml + htmls[0] + htmls[1] + htmls[2] + htmls[3]; 
      }
    }
    }
  });

});

const GDPamount = {
  onStatisticField: "GDP",
  outStatisticFieldName: "GDP_billions",
  statisticType: "avg"
};

const statsDiv = document.getElementById("statsDiv")
const infoDiv = document.getElementById("infoDiv");
const infoDivExpand = new Expand({
  collapsedIconClass: "esri-icon-collapse",
  expandTooltip: "Expand Oil and Gas Industry Info",
  view:view,
  content: infoDiv,
  expanded: true
});

view.ui.add(infoDivExpand, "top-right")

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


const events = [
  {name:`Great Recession`, date: 2008},
  {name: `Covid-19 Pandemic`, date: 2020}
];

const timeSlider = new TimeSlider({
    container: "timeSlider",
    mode: "time-window",
    view: view,
    playRate: 750,
    stops: {
      interval: {
        value: 1,
        unit: "years"
      }
    },

    fullTimeExtent: {
        start: new Date(1900,0,1),
        end: new Date(2022,0,1)
    },

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

view.ui.add(timeSlider);

view.whenLayerView(layer).then((lv) => {
  layerView = lv;

  const start = new Date(1900, 0, 1);
  timeSlider.fullTimeExtent = {
    start: start,
    end: layer.timeInfo.fullTimeExtent.end 
  };

timeSlider.watch("timeExtent", function(value) {
  layerView.filter = {
    timeExtent:value
  }
}
)

let end = new Date(start);
end.setDate(end.getDate() + 1);

timeSlider.timeExtent = { start, end };

});



  const statquery = layer.filter.createQuery();
  statquery.outStatistics = [
    GDP
  ];

  layer.queryFeatures(statquery)
  .then((result) => {
    let htmls = [];
    statsDiv.innerHTML = "";
    if (result.error) {
      return result.error;
    } else {
      if (result.queryFeatures.length >= 1) {
        const attributes = result.features[0].attributes;
        for (name in statsFields) {
          if (attributes[name] && attributes[name] != null){
            const html =
            "<br/>" +
            statsFields[name] +
            ": <b><span>" +
            attributes[name].toFixed(2) +
            "</span></b>";
            htmls.push(html);
          }
        }
        const yearHtml =
        "<span>" +
        result.features[0].attributes["GDP"] +
         "billion dollars </span> were added to Utah's GDP by the Oil and Gas Industry in" +
         timeSlider.timeExtent.end.toLocaleDateString() + ".<br/>";

         if (htmls[0] == undefined) {
          statsDiv.innerHTML = yearHtml;
        } else {
          statsDiv.innerHTML =
            yearHtml + htmls[0] + htmls[1] + htmls[2] + htmls[3]; 
      }
    }
    }
  });

});

const GDPamount = {
  onStatisticField: "GDP",
  outStatisticFieldName: "GDP_billions",
  statisticType: "avg"
};

const statsDiv = document.getElementById("statsDiv")
const infoDiv = document.getElementById("infoDiv");
const infoDivExpand = new Expand({
  collapsedIconClass: "esri-icon-collapse",
  expandTooltip: "Expand Oil and Gas Industry Info",
  view:view,
  content: infoDiv,
  expanded: true
});

view.ui.add(infoDivExpand, "top-right")

