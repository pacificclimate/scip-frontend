// dropdown selector user picks an area of interest with

import {SelectWithValueReplacement as Select} from 'pcic-react-components'
import React from 'react'

function AreaSelector({regionNames, onChange, currentRegion}) {
  var valueOptions = [];
  regionNames.forEach(name => valueOptions.push({"value": name, "label": name}));

  const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'grey'
    })
  } 

  return (
    <div className="AreaSelector">
        Select a watershed.
        <Select
            styles={customStyles}
            isSearchable
            isLoading={regionNames === null}
            options={valueOptions || []}
            labels={regionNames || []}
            value={currentRegion}
            onChange={onChange}
        />
    </div>
  );
    
}

export default AreaSelector;
