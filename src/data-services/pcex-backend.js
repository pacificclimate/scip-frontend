// makes data requests of the PCEX API
import axios from 'axios';

function geoJSONtoWKT(area) {
    // todo: more elegant parsing here.
    var wkt;
    if (area === null) {
        wkt = "";
    }
    else if (area.type === "MultiPolygon") {
        wkt = "MULTIPOLYGON ((";
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
    else if (area.type === "Point"){
        wkt = `POINT (${area.coordinates[0]} ${area.coordinates[1]})`
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

export function testLongTermAverageDataRequest(area) {
    // accept only a specified area -
    // always gets data from the same set of files.
    // used for testing/development only

    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/data",
        {
            params: {
                ensemble_name: "scip_files",
                model: "PCIC12",
                variable: "tasmax",
                emission: "historical,rcp85",
                timescale: "monthly",
                time: "5",
                area: geoJSONtoWKT(area),
            }
        }
    )
    .then(response => response.data);
}

export function getWatershedStreams(point) {
    // accepts only a specified point, gets data from the same
    // set of files
    return axios.get(
    process.env.REACT_APP_PCEX_API_URL + "/streamflow/watershed_streams",
        {
            params: {
                station: geoJSONtoWKT(point),
                ensemble_name: "fraser_watershed"
            }
        }
    )
    .then(response => response.data);
}