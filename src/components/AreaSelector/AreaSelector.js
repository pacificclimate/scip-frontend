import {SelectWithValueReplacement as Select} from 'pcic-react-components'
import React from 'react'

function AreaSelector({regionNames, onChange, currentRegion}) {

  return (
    <div className="AreaSelector">
        Here is a selector. You can select an area.
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
