// allows users to switch between showing mean data across the entire selected area
// and showing data at the outlet only, if the outlet is known.

import Form from 'react-bootstrap/Form';
import React from 'react';
import useStore from '../../store/useStore.js';

function OutletToggle({region}) {
    
    const storeViewOutletIndicators = useStore((state) => state.setViewOutletIndicators);
    const viewOutletIndicators = useStore((state) => state.viewOutletIndicators);
    
    function outletKnown() {
        if(region && region.outlet) {
            const outlet = JSON.parse(region.outlet);
            return ( outlet.coordinates.length === 2);
        }
        return false;
    }
        
    function handleChange(event) {
        storeViewOutletIndicators(!viewOutletIndicators);
    }

    return (
        <Form.Check
          disabled = {!outletKnown()}
          type="switch"
          value={viewOutletIndicators && outletKnown()} 
          onChange={handleChange}
          label="View Indictors at outlet only"
        />
    );
    
    
}

export default OutletToggle;