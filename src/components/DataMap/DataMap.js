import './DataMap.css';
import { BCBaseMap, SetView } from 'pcic-react-leaflet-components';
import SimpleGeoJSON from '../SimpleGeoJSON/SimpleGeoJSON.js';

function DataMap({currentRegionBoundary}) {
  console.log("REACT_APP_BC_BASE_MAP_TILES_URL is " + process.env.REACT_APP_BC_BASE_MAP_TILES_URL);
  console.log("REACT_APP_BASE_MAP is " + process.env.REACT_APP_BASE_MAP);
  console.log(BCBaseMap.initialViewport);
  const viewport = BCBaseMap.initialViewport;
  
//  console.log("currentRegionBoundary in DataMap is");
//  console.log(currentRegionBoundary);
//  const geoJSONobj = JSON.parse(currentRegionBoundary);
  
//  console.log("printing object in DataMap.js");
//  console.log(geoJSONobj);

  //convert the geoJSON to a Feature so it can be displayed on the map.
  const boundaryFeature = currentRegionBoundary ? {
      type: "Feature",
      geometry: currentRegionBoundary
  } : {};
  
  console.log(boundaryFeature);
  
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