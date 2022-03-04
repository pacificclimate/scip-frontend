//Gets information abotu various types of regions from Geoserver
import axios from 'axios';

export function fetchWatersheds() {
  // Fetch GeoJSON descriptions of the watersheds
  return axios.get(
    process.env.REACT_APP_REGIONS_SERVICE_URL,
    {
      params: {
        version: '1.0.0',
        service: 'WFS',
        request: 'GetFeature',
//        typeName: 'watersheds:watershed polygons',
        typeName: 'watersheds:watershed-degrees',
        maxFeatures: 500,
        outputFormat: 'application/json',
      }
    }
  )
  .then(response => response.data)
}