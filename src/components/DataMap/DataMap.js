// Displays a leaflet map with an ncWMS data layer. 
// Upon receiving a watershed, displays a data overlay (ncWMS), and geoJSON objects
// representing the watershed boundary (from watershed object), as well as
// path to the sea and stream connectivity within the watershed (from PCEX API).

import { BCBaseMap, SetView } from 'pcic-react-leaflet-components';
import SimpleGeoJSON from '../SimpleGeoJSON/SimpleGeoJSON.js';
import { WMSTileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import {useState} from 'react';
import _ from 'lodash';

function DataMap({regionBoundary, downstream, onSelectOutlet, selectedOutlet}) {
  const viewport = BCBaseMap.initialViewport;
  const [outletMarker, setOutletMarker] = useState(null);
  
  console.log("selectedOutlet in DataMap is");
  console.log(selectedOutlet);
  
  //convert the geoJSON to a Feature so it can be displayed on the map.
  const boundaryFeature = regionBoundary ? {
      type: "Feature",
      geometry: regionBoundary
  } : null;

  const downstreamFeature = downstream ? {
      type: "Feature",
      properties: {test: "test"},
      geometry: {
          type: "LineString",
          coordinates: downstream.boundary.geometry.coordinates
      }
  } : null;
  
  function handleAreaCreated(e) {
      //clearMapMarker();
  
      const lat = e.layer._latlng.lat;
      const lon = e.layer._latlng.lng;
      const WKT = `POINT (${lon} ${lat})`;
      onSelectOutlet(WKT);
      
      setOutletMarker(e._layer);

      // delete the old circlemarker - we can iterate through the layers
      // of the map until we find one that has a radius and a latlng, 
      // which has to be a circlemarker. We can compare the latlong to the
      // current one to find the "old" circlemarker layer.
      const map = e.layer._map;
      const layers = map._layers;
      
      const oldMarker = _.findKey(layers, l => {
          return(l._radius && l._latlng?.lat !== lat && l._latlng?.lon !== lon);
      });
      
      if(oldMarker) {
          map.removeLayer(layers[oldMarker]);
          }
  }
  
  function handleAreaDeleted(e) {
      onSelectOutlet(null);
  }
  
  if(outletMarker && !selectedOutlet) {
      // there is a marker on the map, but the user is looking 
      // elsewhere - they have selected an area using the dropdowns
      // instead of marking an outlet. delete the map marker.
      console.log("need to delete map marker!");
      clearMapMarker();
  }
  
  function clearMapMarker() {
      // deletes the circle marker on the map
      // this function only deletes the most recent marker,
      // but we only allow one at a time, so that's all we need.
      console.log("clearing map marker");
  }
  
  return (
    <div className="DataMap">
        <BCBaseMap
          id={"map"}
          zoom={viewport.zoom}
          center={viewport.center}          
        >
          <SetView view={viewport}/>
          <SimpleGeoJSON data={boundaryFeature} fill={false} color="#ffffff"/>
          <SimpleGeoJSON data={downstreamFeature} fill={false} color="#6699FF"/>
          <FeatureGroup>
            <EditControl 
              onCreated={handleAreaCreated}
              onDeleted={handleAreaDeleted}
              draw={{
                  polyline: false,
                  polygon: false,
                  rectangle: false,
                  circle: false,
                  circlemarker: true,
                  marker: false
              }}
            />
          </FeatureGroup>
          <WMSTileLayer
            url={"https://services.pacificclimate.org/dev/ncwms"}
            format={'image/png'}
            noWrap={true}
            opacity={0.3}
            transparent={true}
            version={'1.1.1'}
            layers={"x/storage/data/projects/comp_support/bc-srif/climatologies/fraser+bccoast/annual/means/peakFlow_aClimMean_ensMean_VICGL-dynWat_rcp85_1971-2000_bccoast+fraser.nc/peakQmag_year"}
            time={"1985-07-02T00:00:00Z"}
            styles={"default-scalar/x-Occam"}
          />
        </BCBaseMap>
    </div>
  );
}

export default DataMap;