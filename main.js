require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/layers/TileLayer",
  "esri/layers/VectorTileLayer",
  "esri/widgets/Expand",
  "esri/widgets/Legend",
  "esri/widgets/TimeSlider",
  "esri/tasks/QueryTask",
  "esri/rest/support/Query",
  "esri/rest/support/StatisticDefinition",
  "esri/popup/content/CustomContent"
], function (Map, MapView, FeatureLayer, TileLayer, VectorTileLayer, Expand, Legend, TimeSlider, QueryTask, Query, StatisticDefinition, CustomContent) {

  // state boundary feature layer
  const state = new FeatureLayer({
    portalItem: {
      id: "1173c9605a2e47a3835452b67de39b79"
    }
  });

  // county boundary feature layer
  var county = new FeatureLayer({
    portalItem: {
      id: "ba98baef19d447ca83fb2084c396acde"    
    },
    outFields: ["*"],
    minScale: 0,
    maxScale: 0,
    popupTemplate: {
      title: "{Name} County",
      content: queryWellCounts
    }
  });

  ///// Pop up function

  var queryWellsTask = new QueryTask({
    url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/OGHistory/FeatureServer/0"
  });

function queryWellCounts(target) {
    var counts = new StatisticDefinition({
      statisticType: "count",
      onStatisticField: "API",
      outStatisticFieldName: "count_county"
    });
    var query = new Query({
      geometry: target.graphic.geometry,
      outFields: ["*"],
      spatialRelationship: "intersects",
      timeExtent: timeSlider.timeExtent,
      outStatistics: [counts]
    });

    var yearOnly = {year:'numeric'}; //set to show year only in date strings 

    return queryWellsTask.execute(query).then(function(result) {
      var stats = result.features[0].attributes;
      if (stats.count_county==1) {
        return (
        "Between " +
        "<b>" +
        timeSlider.timeExtent.start.toLocaleDateString("en-us",yearOnly) + 
        "</b> and <b>" +
        timeSlider.timeExtent.end.toLocaleDateString("en-us",yearOnly) +
        "</b> there was " +
         "<b>" + 
         stats.count_county +
          "</b>" +
          " well in {NAME} County.") 
      }else{ 
        return(
          "Between " +
          "<b>" +
          timeSlider.timeExtent.start.toLocaleDateString("en-us",yearOnly) + 
          "</b> and <b>" +
          timeSlider.timeExtent.end.toLocaleDateString("en-us",yearOnly) +
          "</b> there were " +
           "<b>" + 
           stats.count_county +
            "</b>" +
            " wells in {NAME} County." )
      }
    });
  }

  let OGLayerView;

  // oil and gas well location layer
  const layer = new FeatureLayer({
    portalItem: {
      id: "dd28d5595a2940929574e79522bb4245"
    }
  });

  let tableView;

  // oil and gas layer hidden
  const table = new FeatureLayer({
    portalItem: {
      id: "c27b246d53f0430d8eb781e31e9a3c70"
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
var view = new MapView({
  container: "viewDiv",
  map: map,
  center: [-109.71988355828537, 38.96201717886498],    // Centered on Thompson Springs  38.96201717886498, -109.71988355828537
  zoom:6.999
});

/*
view.popup.watch("selectedFeature", function(e) {
  view.graphics.removeAll();
  if (e && e.geometry) {
    view.graphics.add(
      new Graphic({
        geometry: e.geometry,
        symbol: {
          type: "simple-fill",
          style: "none",
          outline: {
            color: "#6600FF",
            width: 2
          }
        }
      })
    );
  }
});
*/

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
  {name:`Creation of SITLA`, date: 1995},
  {name:`Great Recession`, date: 2008},
  {name: `Covid-19 Pandemic`, date: 2020}
];

// Create time slider with interval set to 1 years
const timeSlider = new TimeSlider({
    container: "timeSlider",
    playRate: 1000,
      stops: {
        interval: {
        value: 1,
        unit: "years"
       }
     }, 

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

// Creating view layer for hidden layer
view.whenLayerView(table).then((layerView) => {
  tableView = layerView;

// creating view layer for visible layer
view.whenLayerView(layer).then((layerView) => {
    OGLayerView = layerView;

// Setting start date for time slider
  const start = new Date(1970, 0, 1);

 // Extent for time Slider 
  timeSlider.fullTimeExtent = {
    start: start,
    end: new Date(2020,0,1)
  };

// Show 1 year intervals

let end = new Date(start);

end.setDate(end.getDate() + 1825); // the number here is in days (1825 = 5 years)

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
      excludedEffect: "grayscale(20%) opacity(80)"
    };

    OGLayerView.definitionExpression = 
  "OrigComplDate <=" + timeSlider.timeExtent.end.getTime();                                                           
// add grayscale effect to old wells (may or may not keep this)
  OGLayerView.effect = {
    filter: {
      timeExtent:timeSlider.timeExtent
    },
    excludedEffect: "grayscale(80%) opacity(30%)"
  };

// Run statistics for well counts within current time extent
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
      "</span> the Oil and Gas Industry in Utah:</br></br>";
    
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


// Run statistics for GDP/employment/salary within current time extent
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
      :"Added an average of " +
      "<span>" +
      result.features[0].attributes["GDP_Average"].toFixed(1) +
      "</span> million dollars to Utah's Gross Domestic Product per year" +
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

    statsDiv1.innerHTML =
    "<ul style='margin-bottom:0'>" + "<li>" + GDPHtml + "</li> <li>" + employmentHtml + "</li> <li>" +
    WageHtml + "</li> </ul>";
    }
}
})

// Run statistics for GDP/employment/salary within current time extent
const SITLAQuery = tableView.effect.filter.createQuery();
SITLAQuery.where = "YearStart > 1998"
SITLAQuery.outStatistics = [
OGRev,
OGofTotal
];

table.queryFeatures(SITLAQuery).then((result) => {
statsDiv2.innerHTML = "";
if (result.error) {
  return result.error;
} else {
  if (result.features.length >= 1) {
    const OGRevHtml = result.features[0].attributes["OGRev_Sum"] == null
      ?"Utah School and Institutional Trust Lands Administration (SITLA) revenue data not available"
      :"Contributed a total of " +
      "<span>" +
      result.features[0].attributes["OGRev_Sum"].toFixed(1) +
      "</span> million dollars to the Utah School and Institutional Trust Lands Administration" +
      ".<br />";

    const OGofTotalHtml = result.features[0].attributes["OGofTotal_Average"] == null | 0
      ?"Utah School and Institutional Trust Lands Administration (SITLA) revenue data not available"
      :"Was responsible for " +
      "<span>" +
      result.features[0].attributes["OGofTotal_Average"].toFixed(1) +
      "</span>% of the Utah School and Institutional Trust Lands Administration (SITLA) total gross revenue." +
      "<br />";

    const referenceHtml =
    "<i><font size = '1'>" +
    "Estimates from the US Bureau of Economic Analysis, the US Bureau of Labor Statistics, Utah School and Institutional Trust Lands Administration and Utah's Division of Oil, Gas, and Mining." +
    "<br />GDP, employment, wage, and SITLA revenue percentage calculations are averages based on current time frame selection." +
    "<br />SITLA revenue calculation is the total amount contributed based on current time frame selection." +
    "<br />SITLA financial data for oil and gas revenue was not available for 2013, before 1999 or after 2020." +
     "</font></i>";
    
    statsDiv2.innerHTML =
    "<ul style='margin-top:0'>" + "</li> <li>" + OGRevHtml + "</li> <li>" + OGofTotalHtml + "</li> </ul></br>" + referenceHtml;
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

const OGRev = {
  onStatisticField: "OGRev",
  outStatisticFieldName: "OGRev_Sum",
  statisticType: "sum"
};

const OGofTotal = {
  onStatisticField: "OGPercent",
  outStatisticFieldName: "OGofTotal_Average",
  statisticType: "avg"
};



const statDiv = document.getElementById("statDiv")
const statsDiv1 = document.getElementById("statsDiv1");
const statsDiv2 = document.getElementById("statsDiv2");
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

//Create line graph for crude oil production
var definition = {
  type: "line",
  title: "Crude Oil Production",
  style: {
    colors: ["#52c2de"]
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
      label: "Crude Oil Production (thousand barrels)"}
  },
]
};

var cedarChart = new cedar.Chart("chart", definition);
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

//Create line graph for crude oil reserves
var definition = {
  type: "line",
  title: "Crude Oil Reserves",
  style: {
    colors: ["#9230c7"] 
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
      label: "Crude Oil Reserves (thousands barrels)"}
  },
]
};

var cedarChart1 = new cedar.Chart("chart1", definition);
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

//Create line graph for natural gas reserves
var definition = {
  type: "line",
  title: "Natural Gas Reserves",
  style: {
    colors: ["#5a3382"]
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
      label: "Natural Gas Reserves (thousand barrels)"}
  },
]
};

var cedarChart2 = new cedar.Chart("chart2", definition);
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
