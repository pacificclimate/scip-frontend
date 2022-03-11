import { BCBaseMap, SetView } from 'pcic-react-leaflet-components';
import SimpleGeoJSON from '../SimpleGeoJSON/SimpleGeoJSON.js';
import { WMSTileLayer } from 'react-leaflet';

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