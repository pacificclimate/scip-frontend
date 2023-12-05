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


function DataMap({regionBoundary, downstream, onSelectOutlet, selectedOutlet, dataset}) {
  const viewport = BCBaseMap.initialViewport;
  const [cmMap, setCMMap] = useState(null);
  
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
  
      const lat = e.layer._latlng.lat;
      const lon = e.layer._latlng.lng;
      const WKT = `POINT (${lon} ${lat})`;
      onSelectOutlet(WKT);

      // delete the old circlemarker - we can iterate through the layers
      // of the map until we find one that has a radius and a latlng, 
      // which has to be a circlemarker. We can compare the latlong to the
      // current one to find the "old" circlemarker layer.
      const map = e.layer._map;
      
      // set map reference so we can delete this layer later
      // if we switch to selcting a region from tha dropdowns
      setCMMap(map);
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
    
  // this cleans up a residual layer containing a circlemarker
  // if the user has placed a circlemarker on the map to select
  // the area upstream of a point, but then the user switches to 
  // selecting regions from the dropdown menus.
  // the triggering of this cleanup is a little bit messy, but I was
  // unable to get more reasonable ways to work.
  // when a circlemarker is placed on the map, the drawing handler
  // function stores the map in the cmMap state variable and sends a 
  // callback to the parent component with the latlong of the 
  // circlemaker, which is eventually received by this component
  // in the selectedOutlet state variable.
  // When the user selects a region from a dropdown, SelectedOutlet
  // is set to null, because dropdown regions are not selected with 
  // an outlet.
  // this cleanup is triggered by the combination of cmMap being set
  // (ie, the user has ever drawn a circlemarker) and selectedOutlet
  // being unset (ie, the user is not looking at a circlemarker 
  // right now). 
  // it accesses the map via cmMap, finds the layer corresponding to 
  // a circle outlet, and deletes it. Then it unsets cmMap, so that
  // this cleanup is only run once (until the user draws another marker,
  // which will set cmMap again).
  if (cmMap !== null && selectedOutlet == null) {
    const layers = cmMap._layers;
      
    const oldMarker = _.findKey(layers, l => {
      return(l._radius && l._latlng);
    });


    if(oldMarker) {
      cmMap.removeLayer(layers[oldMarker]);
    }
    
    setCMMap(null);
  }
  
  // WMSTileLayer does not update itself in response to updates made to the
  // "layer" parameter, but does update in responds to changes made to
  // parameters in the "params" objecf. Therefore, we need anything that
  // might change over the course of a user session to be in this 
  // object.
  const wmsParams = dataset ? {
    layers: `x${dataset.file}/${dataset.variable}`,
    time: dataset.time,
    styles: dataset.styles
    }: {};

  return (
    <div className="DataMap">
        <BCBaseMap
          id={"map"}
          zoom={viewport.zoom}
          center={viewport.center}
        >
          <SetView view={viewport}/>
          <SimpleGeoJSON data={boundaryFeature} fill={false} color="#000000"/>
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
              edit={{edit: false}}
            />
          </FeatureGroup>
          {dataset &&
          <WMSTileLayer
            url={"https://services.pacificclimate.org/dev/ncwms"}
            format={'image/png'}
            noWrap={true}
            opacity={0.3}
            transparent={true}
            version={'1.1.1'}
            params={wmsParams}
          />
          }
        </BCBaseMap>
    </div>
  );
}

export default DataMap;
