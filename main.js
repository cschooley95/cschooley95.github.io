require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/TimeSlider"
  ], (Map, MapView, FeatureLayer, TimeSlider) => {
    const layer = new FeatureLayer({
      url:
        "https://services.arcgis.com/ZzrwjTRez6FJiOq4/arcgis/rest/services/OGHistory/FeatureServer/0"
    });

    const map = new Map({
      basemap: "hybrid",
      layers: [layer]
    });

    const view = new MapView({
      map: map,
      container: "viewDiv",
      zoom: 4,
      center: [-100, 30]
    });

    // time slider widget initialization
    const timeSlider = new TimeSlider({
      container: "timeSlider",
      view: view,
      timeVisible: true, // show the time stamps on the timeslider
      loop: true
    });

    view.whenLayerView(layer).then((lv) => {
      // around up the full time extent to full hour
      timeSlider.fullTimeExtent = layer.timeInfo.fullTimeExtent.expandTo(
        "years"
      );
      timeSlider.stops = {
        interval: layer.timeInfo.interval
      };
    });
  });