import { BCBaseMap, SetView } from 'pcic-react-leaflet-components';
import SimpleGeoJSON from '../SimpleGeoJSON/SimpleGeoJSON.js';

function DataMap({currentRegionBoundary}) {
  const viewport = BCBaseMap.initialViewport;

  //convert the geoJSON to a Feature so it can be displayed on the map.
  const boundaryFeature = currentRegionBoundary ? {
      type: "Feature",
      geometry: currentRegionBoundary
  } : {};
    
  return (
    <div className="DataMap">
        <BCBaseMap
          id={"map"}
          zoom={viewport.zoom}
          center={viewport.center}
        >
          <SetView view={viewport}/>
          <SimpleGeoJSON data={boundaryFeature} fill={false}/>
        </BCBaseMap>
    </div>
  );
}

export default DataMap;