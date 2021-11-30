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
], function (Map, MapView, FeatureLayer, TileLayer, VectorTileLayer, Expand, Legend, TimeSlider, QueryTask, Query, StatisticDefinition) {

  // state boundary feature layer
  const state = new FeatureLayer({
    portalItem: {
      id: "1173c9605a2e47a3835452b67de39b79"
    }
  });


  
  ///// Pop up function for counties

  var queryWellsTask = new QueryTask({
    url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/Mines2000/FeatureServer/0"
  });

function queryWellCounts(target) {
    var counts = new StatisticDefinition({
      statisticType: "count",
      onStatisticField: "MineID",
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
        "<span>" +
        timeSlider.timeExtent.start.toLocaleDateString("en-us",yearOnly) + 
        "</span> and <span>" +
        timeSlider.timeExtent.end.toLocaleDateString("en-us",yearOnly) +
        "</span> there was " +
         "<span>" + 
         stats.count_county +
          "</span>" +
          " well in {Name} County.") 
      }else{ 
        return(
          "Between " +
          "<span>" +
          timeSlider.timeExtent.start.toLocaleDateString("en-us",yearOnly) + 
          "</span> and <span>" +
          timeSlider.timeExtent.end.toLocaleDateString("en-us",yearOnly) +
          "</span> there were " +
           "<span>" + 
           stats.count_county +
            "</span>" +
            " wells in {Name} County." )
      }
    });
  }


  // county boundary feature layer
  var county = new FeatureLayer({
    portalItem: {
      id: "ba98baef19d447ca83fb2084c396acde"    
    },
    outFields: ["*"],
    minScale: 0,
    maxScale: 0,
    popupTemplate: {
      title: "{Name} County" ,
      content: queryWellCounts
    }
  });

  let MineLayerView;

  // mineral mine location layer
  const layer = new FeatureLayer({
    portalItem: {
      id: "2b76042221894a37bcc3335dae874fb3"
    }
  });

  /* let tableView;

  // oil and gas layer hidden
  const table = new FeatureLayer({
    portalItem: {
      id: "c27b246d53f0430d8eb781e31e9a3c70"
    },
    visible:false
  });
*/

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
  layers: [state, county, layer]
});

 // Set the map view
var view = new MapView({
  container: "viewDiv",
  map: map,
  center: [-109.71988355828537, 38.96201717886498],    // Centered on Thompson Springs  38.96201717886498, -109.71988355828537
  zoom:6.999
});

// Pop up watch
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
      title:"Mineral Mine Locations (2000-Present)"
    }]
  }),
  expanded: false,
  group: "top-left"
});
view.ui.add(legendExpand, "top-left");

// Create events for the time slider
const events = [
  //{name:`Creation of SITLA`, date: 1995},
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
        new Date(2000, 0, 1), new Date(2005, 0, 1), new Date(2008,0,1), new Date(2010, 0, 1), new Date(2015, 0, 1), new Date(2020, 0, 1)
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

/*
// Creating view layer for hidden layer
view.whenLayerView(table).then((layerView) => {
  tableView = layerView;
*/

// creating view layer for visible layer
view.whenLayerView(layer).then((layerView) => {
    MineLayerView = layerView;

// Setting start date for time slider
  const start = new Date(1999, 0, 1);

 // Extent for time Slider 
  timeSlider.fullTimeExtent = {
    start: start,
    end: new Date(2022,0,1)
  };

// Show 1 year intervals

let end = new Date(start);

end.setDate(end.getDate() + 366); // the number here is in days (1825 = 5 years)

timeSlider.timeExtent = {start,end};  

});
//// Table view


// watch timeslider timeExtent change
  timeSlider.watch("timeExtent", () => {
  MineLayerView.definitionExpression = 
  "EndDate <=" + timeSlider.timeExtent.end.getTime();                                                           
// add grayscale effect to old wells (may or may not keep this)
  MineLayerView.effect = {
    filter: {
      timeExtent:timeSlider.timeExtent
    },
    excludedEffect: "grayscale(80%) opacity(30%)"
  };


  const mineQuery = MineLayerView.effect.filter.createQuery();
  // mineQuery.where = "Status = 'Active'"
  mineQuery.outStatistics = [
  MineCounts
  ];
  
  layer.queryFeatures(mineQuery).then((result) => {
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
      "</span> the Mineral Mining Industry in Utah:</br></br>";
    
    var thousandsSep = {maximumFractionDigits:0}; //create thousands seperators  
    const MineHtml =
    "Had <span>" +
    result.features[0].attributes["Mine_Counts"].toLocaleString("en-US", thousandsSep) +
    "</span> mineral mining locations.";

    statDiv.innerHTML =
    yearHtml + "<ul style = 'margin-bottom:0'><li>" + MineHtml + "</li></ul>";
  }
  }
  })
  
  
// Run statistics for well counts within current time extent
const statQuery = MineLayerView.effect.filter.createQuery();
statQuery.outStatistics = [
employmentCount,
wageAvg,
MineRev,
MineofTotal
];

layer.queryFeatures(statQuery).then((result) => {
statsDiv1.innerHTML = "";
if (result.error) {
  return result.error;
} else {
  if (result.features.length >= 1) {

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

    const MineRevHtml = result.features[0].attributes["MineRevAvg"] == null
      ?"Utah School and Institutional Trust Lands Administration (SITLA) revenue data not available"
      :"Contributed an average of " +
      "<span>" +
    result.features[0].attributes["MineRevAvg"].toFixed(1) +
      "</span> million dollars to the Utah School and Institutional Trust Lands Administration per year" +
      ".<br />";

    const MineofTotalHtml = result.features[0].attributes["MineofTotal_Average"] == null | 0
      ?"Utah School and Institutional Trust Lands Administration (SITLA) revenue data not available"
      :"Was responsible for " +
      "<span>" +
    result.features[0].attributes["MineofTotal_Average"].toFixed(1) +
      "</span>% of the Utah School and Institutional Trust Lands Administration (SITLA) total gross revenue." +
      "<br />";

    const referenceHtml =
    "<i><font size = '1'>" +
    "Estimates from the US Bureau of Economic Analysis, the US Bureau of Labor Statistics, Utah School and Institutional Trust Lands Administration and Utah's Division of Oil, Gas, and Mining." +
    "<br />GDP, employment, wage, SITLA revenue, and SITLA revenue percentage calculations are averages based on current time frame selection." +
    "<br />SITLA financial data for mineral mining revenue was not available before 2000." +
     "</font></i>";

    statsDiv1.innerHTML =
      "<ul style = 'margin-bottom:0'><li>" + employmentHtml +
      "</li> <li>" + WageHtml + "</li> <li>" + MineRevHtml + "</li> <li>" + MineofTotalHtml + "</ul><br />" +
       referenceHtml;
}
}
})

.catch((error) => {
console.log(error);
});
});

const MineCounts = {
  onStatisticField: "MineID",
  outStatisticFieldName: "Mine_Counts",
  statisticType: "count"
};

const employmentCount = {
  onStatisticField: "Employees",
  outStatisticFieldName: "Employment_Count",
  statisticType: "avg"
};

const wageAvg= {
  onStatisticField: "Wage",
  outStatisticFieldName: "Wage_Average",
  statisticType: "avg"
};

const MineRev = {
  onStatisticField: "MineRevenue",
  outStatisticFieldName: "MineRevAvg",
  statisticType: "avg"
};

const MineofTotal = {
  onStatisticField: "RevenuePercent",
  outStatisticFieldName: "MineofTotal_Average",
  statisticType: "avg"
};



const statDiv = document.getElementById("statDiv");
const statsDiv1 = document.getElementById("statsDiv1");
//const statsDiv2 = document.getElementById("statsDiv2");
      const infoDiv = document.getElementById("infoDiv");
      const infoDivExpand = new Expand({
        collapsedIconClass: "esri-icon-collapse",
        expandIconClass: "esri-icon-expand",
        expandTooltip: "Expand Mineral Mining Industry info",
        view: view,
        content: infoDiv,
        expanded: true,
        group: "top-right"
      });
      view.ui.add({component: infoDivExpand, position: "top-right", index: 0});


    
// Instruction Box

const instructions = document.getElementById("instructionDiv")

const instructionBox = new Expand({
  expandIconClass: "esri-icon-collapse",
  expandTooltip: "How to use this map",
  expanded: true,
  view: view,
  content: instructions,
  group : "top-left"
});
view.ui.add({component: instructionBox, position: "top-left", index: 1});


//// Line Graphs


//Create line graph for copper production
var definition = {
  type: "line",
  title: "Copper Production",
  style: {
    colors: ["#52c2de"]
  },
  datasets: [
    {
    url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/SelectedMetalsTable20002020/FeatureServer/0",
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
      field: "Copper",
      label: "Copper Production (tons)"}
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
    expandTooltip: "Copper Production Graph",
    expanded: false,
    view: view,
    content: productionPanel,
    group: "top-right"
  });
  view.ui.add(productionExpand, "top-right");
});

//Create line graph for gold and silver production
var definition = {
  type: "line",
  title: "Gold and Silver Production (2000-2018)",
  style: {
    colors: ["#9230c7", "#77496B"] 
  },
  datasets: [
    {
    url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/SelectedMetalsTable20002020/FeatureServer/0",
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
      field: "Gold",
      label: "Gold (ounces)"}
  },
  {
    category: { 
      field: "Year",
      label: "Year"
    },
    value: { 
      field: "Silver",
      label: "Silver (ounces)"}
  },
],
overrides: {
  valueAxis: {
    title: "Ounces"
  }
}
};

var cedarChart1 = new cedar.Chart("chart1", definition)
cedarChart1.show()

const productionPanel1 = document.getElementById("productionPanel1")

view.when(function() {
  // Display the chart in an Expand widget
  const productionExpand1 = new Expand({
    expandIconClass: "esri-icon-chart",
    expandTooltip: "Gold and Silver Production Graph",
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
  title: "Sand, Gravel, and Stone",
  style: {
    colors: ["#bcbbff", "#3a027f"]
  },
  datasets: [
    {
    url: "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/RocksTable20002020/FeatureServer/0",
    query: {
      orderByFields: "Year"
    }
}
],
series: [
  {
    category: { 
      field: "Year",
      label: "Year"
    },
    value: { 
      field: "Sand____Gravel",
      label: "Sand & Gravel (million tons)"}
  },
  {
    category: { 
      field: "Year",
      label: "Year"
    },
    value: { 
      field: "Crushed_Stone",
      label: "Crushed Stone (million tons)"}
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
    expandTooltip: "Sand, Gravel, and Stone Graph",
    expanded: false,
    view: view,
    content: productionPanel2,
    group: "top-right"
  });
  view.ui.add(productionExpand1, "top-right");
});

});
