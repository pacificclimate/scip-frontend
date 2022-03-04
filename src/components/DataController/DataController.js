import './DataController.css';
import {testDataRequest} from '../../data-services/pcex-backend.js'


function DataController({currentRegionBoundary}) {
  
  //fetch data and format it  - currently just displaying as text. 
  testDataRequest(currentRegionBoundary).then(data => {
    console.log(data);  
    }
  );  
  
  const regionDescription = currentRegionBoundary ? " a boundary is set" : "no boundary";
  
  return (
    <div className="DataController">
        This will let you look at graphs and other data visualizations.
        {regionDescription}
    </div>
  );
}

export default DataController;