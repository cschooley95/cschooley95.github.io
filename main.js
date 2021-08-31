require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/layers/TileLayer",
  "esri/layers/VectorTileLayer",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/TimeSlider"
], function (Map, MapView, FeatureLayer, TileLayer, VectorTileLayer, Expand, Legend, TimeSlider) {

  const state = new FeatureLayer({
    portalItem: {
      id: "1173c9605a2e47a3835452b67de39b79"
    }
  });

  const county = new FeatureLayer({
    portalItem: {
      id: "537469e5e771434491176824b7ec5a10"
    }
  });

  let OGLayerView;

  const layer = new FeatureLayer({
    portalItem: {
      id: "dd28d5595a2940929574e79522bb4245"
    }
  });

  let tableView;

  const table = new FeatureLayer({
    portalItem: {
      id: "770811c427724622ab85161500528577"
    },
    visible:false
  });

  // Create Map
const map = new Map({
  basemap: {
    baseLayers:[
      new TileLayer({
      portalItem: {
        id:"a66bfb7dd3b14228bf7ba42b138fe2ea" //firefly
      }
    }),
    new TileLayer({
      portalItem: {
        id: "a8588e0401e246469260f03ee44d69f1" //shaded releif
      },
      blendMode: "multiply"
    }),
    new VectorTileLayer({
      portalItem: {
        id:"30d6b8271e1849cd9c3042060001f425" // firefly reference
      }
    })
  ]
  },
  layers: [state,county,layer,table]
});

 // Set the map view
const view = new MapView({
  container: "viewDiv",
  map: map,
  center: [-109.71988355828537, 38.96201717886498],    // Centered on Thompson Springs  38.96201717886498, -109.71988355828537
  zoom:6.999
});

view.goTo(state);

// Create a collapsible legend
const legendExpand = new Expand({
  collapsedIconClass: "esri-icon-collapse",
  expandIconClass: "esri-icon-expand",
  expandTooltip: "Legend",
  view: view,
  content: new Legend({
    view:view,
    layerInfos: [{
      layer:layer,
      title:"Oil and Gas Surface Well Locations (1970-Present)"
    }]
  }),
  expanded: true
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
        value: 1,
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
        new Date(1970, 0, 1), new Date(1980, 0 , 1), new Date(1990, 0, 1), new Date(2000, 0, 1), new Date(2010, 0, 1), new Date(2020, 0, 1)
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
view.whenLayerView(table).then((layerView) => {
  tableView = layerView;

view.whenLayerView(layer).then((layerView) => {
    OGLayerView = layerView;

// Setting start date for time slider
  const start = new Date(1970, 0, 1);

 // Extent for time Slider 
  timeSlider.fullTimeExtent = {
    start: start,
    end: new Date(2021,0,1)
  };

// Show 5 year intervals

let end = new Date(start);

end.setDate(end.getDate() + 365); // the number here is in days (1825 = 5 years)

timeSlider.timeExtent = {start,end};

});


//// Table view

// watch timeslider timeExtent change
  timeSlider.watch("timeExtent", () => {
    //oil wells that popped up before the end of the current time extent
    tableView.definitionExpression = 
    "OrigComplDate <=" + timeSlider.timeExtent.end.getTime();                                                           
  // add grayscale effect to old wells (may or may not keep this)
    tableView.effect = {
      filter: {
        timeExtent:timeSlider.timeExtent
      },
      excludedEffect: "grayscale(20%) opacity(80%)"
    };

    OGLayerView.definitionExpression = 
  "OrigComplDate <=" + timeSlider.timeExtent.end.getTime();                                                           
// add grayscale effect to old wells (may or may not keep this)
  OGLayerView.effect = {
    filter: {
      timeExtent:timeSlider.timeExtent
    },
    excludedEffect: "grayscale(80%) opacity(20%)"
  };

// Run statistics for GDP within current time extent
const statQuery = OGLayerView.effect.filter.createQuery();
statQuery.outStatistics = [
wellCounts
];

layer.queryFeatures(statQuery).then((result) => {
statDiv.innerHTML = "";
if (result.error) {
  return result.error;
} else {
  if (result.features.length >= 1) {

    var yearOnly = {year:'numeric'}; //set to show year only in date strings
    const yearHtml =
      "Between " +
      "<span>" +
      timeSlider.timeExtent.start.toLocaleDateString("en-US", yearOnly) +
      "</span> and <span>" +
      timeSlider.timeExtent.end.toLocaleDateString("en-US", yearOnly) +
      "</span> the Oil and Gas Industry in Utah:<br />";
    
    var thousandsSep = {maximumFractionDigits:0}; //create thousands seperators  
    const oilHtml =
    "Had <span>" +
    result.features[0].attributes["Well_Counts"].toLocaleString("en-US", thousandsSep) +
    "</span> oil and gas wells.";

    statDiv.innerHTML =
      yearHtml + "<ul style = 'margin-bottom:0'><li>" + oilHtml + "</li></ul>";
}
}
})


// Run statistics for GDP/employment within current time extent
const tableQuery = tableView.effect.filter.createQuery();
tableQuery.outStatistics = [
GDPAvg,
employmentCount,
wageAvg
];

table.queryFeatures(tableQuery).then((result) => {
statsDiv1.innerHTML = "";
if (result.error) {
  return result.error;
} else {
  if (result.features.length >= 1) {
    const GDPHtml = result.features[0].attributes["GDP_Average"] == null
      ?"GDP data not available"
      :"Added " +
      "<span>" +
      result.features[0].attributes["GDP_Average"].toFixed(1) +
      "</span> million dollars to Utah's Gross Domestic Product" +
      ".<br />";
    
    var thousandsSep = {maximumFractionDigits:0}; //create thousands seperators
    const employmentHtml = result.features[0].attributes["Employment_Count"] == null
      ?"Employment data not available"
      :"Employed " +
      "<span>" +
      result.features[0].attributes["Employment_Count"].toLocaleString("en-US", thousandsSep) +
      "</span> full and part time employees (direct and supporting employees)" +
      ".<br />";

    const WageHtml = result.features[0].attributes["Wage_Average"] == null
      ?"Salary data not available"
      :"Paid employees " +
      "<span> $"+
      result.features[0].attributes["Wage_Average"].toFixed(2) +
      "/hr</span> on average (adjusted for inflation).";

    const referenceHtml =
    "<i><font size = '1'>" +
    "Estimates from the US Bureau of Economic Analysis, the US Bureau of Labor Statistics, and Utah's Division of Oil, Gas, and Mining.<br />GDP, employment, and wage calculations are averages based on current time frame selection." +
     "</font></i>";
    
    statsDiv1.innerHTML =
    "<ul style='margin-top:0'>" + "<li>" + GDPHtml + "</li> <li>" + employmentHtml + "</li> <li>" + WageHtml + "</li> </ul>" + referenceHtml;
    }
}
})
.catch((error) => {
console.log(error);
});
});

const wellCounts = {
  onStatisticField: "API",
  outStatisticFieldName: "Well_Counts",
  statisticType: "count"
};

const GDPAvg = {
  onStatisticField: "GDP_billions_",
  outStatisticFieldName: "GDP_Average",
  statisticType: "avg"
};

const employmentCount = {
  onStatisticField: "Employed",
  outStatisticFieldName: "Employment_Count",
  statisticType: "avg"
};

const wageAvg= {
  onStatisticField: "AverageInflation",
  outStatisticFieldName: "Wage_Average",
  statisticType: "avg"
};

const statDiv = document.getElementById("statDiv")
const statsDiv1 = document.getElementById("statsDiv1");
      const infoDiv = document.getElementById("infoDiv");
      const infoDivExpand = new Expand({
        collapsedIconClass: "esri-icon-collapse",
        expandIconClass: "esri-icon-expand",
        expandTooltip: "Expand Oil and Gas Industry info",
        view: view,
        content: infoDiv,
        expanded: true,
        group: "top-right"
      });
      view.ui.add({component: infoDivExpand, position: "top-right", index: 0});

});

//Create line graph
var definition = {
  type: "line",
  title: "Crude Oil Production",
  style: {
    colors: ["#77496B"]
  },
  datasets: [
    {
    url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/OilGasProduction19602019/FeatureServer/0",
    query: {
      orderByFields: "Year"
    }
}
],
series: [
  {
    category: { 
      field: "Year",
      label: "Year"},
    value: { 
      field: "Production",
      label: "Crude Oil Production (in barrels)"}
  },
]
};


var cedarChart = new cedar.Chart("productionPanel", definition);
cedarChart.show()

const productionPanel = document.getElementById("productionPanel")

view.when(function() {
  // Display the chart in an Expand widget
  const productionExpand = new Expand({
    expandIconClass: "esri-icon-chart",
    expandTooltip: "Oil Production Graph",
    expanded: false,
    view: view,
    content: productionPanel,
    group: "top-right"
  });
  view.ui.add(productionExpand, "top-right");
});

//Create line graph
var definition = {
  type: "line",
  title: "Crude Oil Production",
  style: {
    colors: ["#77496B"]
  },
  datasets: [
    {
    url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/OilGasProduction19602019/FeatureServer/0",
    query: {
      orderByFields: "Year"
    }
}
],
series: [
  {
    category: { 
      field: "Year",
      label: "Year"},
    value: { 
      field: "Crude_Oil_Reserves",
      label: "Crude Oil Reserves (in barrels)"}
  },
]
};

var cedarChart1 = new cedar.Chart("productionPanel1", definition);
cedarChart1.show()

const productionPanel1 = document.getElementById("productionPanel1")

view.when(function() {
  // Display the chart in an Expand widget
  const productionExpand1 = new Expand({
    expandIconClass: "esri-icon-chart",
    expandTooltip: "Crude Oil Reserves Graph",
    expanded: false,
    view: view,
    content: productionPanel1,
    group: "top-right"
  });
  view.ui.add(productionExpand1, "top-right");
});

//Create line graph
var definition = {
  type: "line",
  title: "Crude Oil Production",
  style: {
    colors: ["#77496B"]
  },
  datasets: [
    {
    url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/OilGasProduction19602019/FeatureServer/0",
    query: {
      orderByFields: "Year"
    }
}
],
series: [
  {
    category: { 
      field: "Year",
      label: "Year"},
    value: { 
      field: "Natural_Gas_Liquids_Reserves",
      label: "Natural Gas Reserves (in barrels)"}
  },
]
};

var cedarChart2 = new cedar.Chart("productionPanel2", definition);
cedarChart2.show()

const productionPanel2 = document.getElementById("productionPanel2")

view.when(function() {
  // Display the chart in an Expand widget
  const productionExpand1 = new Expand({
    expandIconClass: "esri-icon-chart",
    expandTooltip: "Natural Gas Reserves Graph",
    expanded: false,
    view: view,
    content: productionPanel2,
    group: "top-right"
  });
  view.ui.add(productionExpand1, "top-right");
});

});
