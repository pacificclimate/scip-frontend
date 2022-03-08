import {SelectWithValueReplacement as Select} from 'pcic-react-components'
import React from 'react'

function AreaSelector({regionNames, onChange, currentRegion}) {

  return (
    <div className="AreaSelector">
        Select a watershed.
        <Select
            isSearchable
            isLoading={regionNames === null}
            options={regionNames || []}
            value={currentRegion}
            onChange={onChange}
        />
    </div>
  );
    
}

export default AreaSelector;
