// makes data requests of the PCEX API
import axios from 'axios';

//function geoJSONtoWKT(area) {
    
//}


export function testDataRequest(area) {
    // accepts only a specified area - 
    // always gets data from the same file.
    
    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/timeseries",
    {
      params: {
        id_: "tasmax_mClimMean_BCCAQv2_PCIC12_historical-rcp85_rXi1p1_19610101-19901231_Canada",
        variable: "tasmax",
        area: area,
      }
    }
  )
  .then(response => response.data)
}