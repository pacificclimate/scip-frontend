// dropdown selector user picks an area of interest with

import Select from 'react-select'
import React from 'react'
import InfoPopup from '../InfoPopup/InfoPopup.js'


function AreaSelector({regionNames, onChange, currentRegion, kind}) {
  var valueOptions = [];
  regionNames.forEach(name => valueOptions.push({"value": name, "label": name}));

  return (
    <div className="AreaSelector">
        <InfoPopup index={kind.replace(" ", "-")} />
        Select a {kind}.
        <Select
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
