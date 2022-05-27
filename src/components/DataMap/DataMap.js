// Displays a leaflet map with an ncWMS data layer. 
// Upon receiving a watershed, displays a data overlay (ncWMS), and geoJSON objects
// representing the watershed boundary (from watershed object), as well as
// path to the sea and stream connectivity within the watershed (from PCEX API).

import { BCBaseMap, SetView } from 'pcic-react-leaflet-components';
import SimpleGeoJSON from '../SimpleGeoJSON/SimpleGeoJSON.js';
import { WMSTileLayer } from 'react-leaflet';

function DataMap({currentRegionBoundary, currentWatershedStreams, currentDownstream}) {
  const viewport = BCBaseMap.initialViewport;
  //convert the geoJSON to a Feature so it can be displayed on the map.
  const boundaryFeature = currentRegionBoundary ? {
      type: "Feature",
      geometry: currentRegionBoundary
  } : {};

  const watershedMouth = currentWatershedStreams ? {
      type: "Feature",
      geometry: currentWatershedStreams.streams.geometry
  } : {};

  const downstream = currentDownstream ? {
      type: "Feature",
      properties: {test: "test"},
      geometry: {
          type: "LineString",
          coordinates: currentDownstream.boundary.geometry.coordinates
      }
  } : {};

  return (
    <div className="DataMap">
        <BCBaseMap
          id={"map"}
          zoom={viewport.zoom}
          center={viewport.center}
        >
          <SetView view={viewport}/>
          <SimpleGeoJSON data={boundaryFeature} fill={false} color="#ffffff"/>
          <SimpleGeoJSON data={watershedMouth} fill={false} color="#6699FF"/>
          <SimpleGeoJSON data={downstream} fill={false} color="#6699FF"/>
          <WMSTileLayer
            url={"https://services.pacificclimate.org/ncwms"}
            format={'image/png'}
            noWrap={true}
            opacity={0.3}
            transparent={true}
            version={'1.1.1'}
            layers={"x/storage/data/projects/comp_support/climate_explorer_data_prep/climatological_means/pcic12/tasmax_aClimMean_BCCAQv2_PCIC12_historical+rcp85_rXi1p1_19610101-19901231_Canada.nc/tasmax"}
            time={"1977-07-02T00:00:00Z"}
            styles={"default-scalar/x-Occam"}
          />
        </BCBaseMap>
    </div>
  );
}

export default DataMap;