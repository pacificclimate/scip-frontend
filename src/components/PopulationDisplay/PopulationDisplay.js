import React, {useState, useEffect} from 'react';
import {getSalmonPopulation} from '../../data-services/scip-backend.js'
import {noGraphMessage} from '../../helpers/GraphHelpers.js'
import {PopulationTable} from '../PopulationTable/PopulationTable.js';

function PopulationDisplay({region}) {
    const [salmonPopulations, setSalmonPopulations] = useState(null);
    
    useEffect(() => {
      if(region) {
        getSalmonPopulation(region.boundary).then((api_response) => setSalmonPopulations(api_response));
        }        
  }, [region]);

    
  return (
    <div className="PopulationDisplay">
        <br/>
        { salmonPopulations ?
            <PopulationTable
                populations={salmonPopulations}
            />
            : noGraphMessage({
              region: region,
          })}
    </div>
    );
}

export default PopulationDisplay;