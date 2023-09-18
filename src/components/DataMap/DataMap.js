// Displays a leaflet map with an ncWMS data layer. 
// Upon receiving a watershed, displays a data overlay (ncWMS), and geoJSON objects
// representing the watershed boundary (from watershed object), as well as
// path to the sea and stream connectivity within the watershed (from PCEX API).

import { BCBaseMap, SetView } from 'pcic-react-leaflet-components';
import SimpleGeoJSON from '../SimpleGeoJSON/SimpleGeoJSON.js';
import { WMSTileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

function DataMap({regionBoundary, watershedStreams, downstream, onSelectOutlet, selectedOutlet}) {
  const viewport = BCBaseMap.initialViewport;
  //convert the geoJSON to a Feature so it can be displayed on the map.
  const boundaryFeature = regionBoundary ? {
      type: "Feature",
      geometry: regionBoundary
  } : {};

  const watershedFeature = watershedStreams ? {
      type: "Feature",
      geometry: watershedStreams.streams.geometry
  } : {};

  const downstreamFeature = downstream ? {
      type: "Feature",
      properties: {test: "test"},
      geometry: {
          type: "LineString",
          coordinates: downstream.boundary.geometry.coordinates
      }
  } : {};

  function handlePoint(e) {
      console.log("handlePoint called");
      console.log(e);
  }
  
  function handleAreaCreated(e) {
      console.log("handleAreaCreated called");
      console.log(e);
      const lat = e.layer._latlng.lat;
      const lon = e.layer._latlng.lng;
      const WKT = `POINT (${lon} ${lat})`;
      onSelectOutlet(WKT);
  }
  
  //TODO: area deleted - turn seletedPoint back into null!


  return (
    <div className="DataMap">
        <BCBaseMap
          id={"map"}
          zoom={viewport.zoom}
          center={viewport.center}
        >
          <SetView view={viewport}/>
          <SimpleGeoJSON data={boundaryFeature} fill={false} color="#ffffff"/>
          <SimpleGeoJSON data={watershedFeature} fill={false} color="#6699FF"/>
          <SimpleGeoJSON data={downstreamFeature} fill={false} color="#6699FF"/>
          <FeatureGroup>
            <EditControl 
              onEditMove={handlePoint}
              onCreated={handleAreaCreated}
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