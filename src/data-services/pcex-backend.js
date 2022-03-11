// makes data requests of the PCEX API
import axios from 'axios';

function geoJSONtoWKT(area) {
    // todo: more elegant parsing here.
    var wkt;
    if (area === null) {
        wkt = "";
    }
    else if (area.type === "MultiPolygon") {
        var wkt = "MULTIPOLYGON ((";
        area.coordinates.forEach(function(polygon, index){
            wkt = wkt.concat("(");
                polygon[0].forEach(function(point, index) {
                    wkt = wkt.concat(`${point[0]} ${point[1]},`);
                });
            wkt = wkt.slice(0, -1); //remove final comma
            wkt = wkt.concat(")");
        });
        wkt = wkt.concat("))");
    }
    else{
        console.log("other conversions not implemented yet.");
        wkt = ""
    }
    return wkt;
}


export function testDataRequest(area) {
    // accepts only a specified area - 
    // always gets data from the same file.
    // used for testing/development only
    
    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/timeseries",
    {
      params: {
        id_: process.env.REACT_APP_TEST_API_FILE,
        variable: "tasmax",
        area: geoJSONtoWKT(area),
      }
    }
  )
  .then(response => response.data);
}