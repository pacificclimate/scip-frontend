// checkbox that keeps track of whether or not a given taxon 
// has been selected by the user. It does not track its own
// checked/unchecked state, but rather sends events to and receives
// checked/unchecked props from its parent.

import React, {useState, useEffect} from 'react';
import {taxonString} from '../../helpers/APIDataHelpers.js';
import _ from 'lodash';

function TaxonCheckbox({taxon, selectedTaxons, onChange}) {
    const [checked, setChecked] = useState(true);
        
    useEffect(() => {
        setChecked(_.find(selectedTaxons, taxon, _.isEqual) ? true : false); 
      }, [taxon, selectedTaxons]
    );    
    
    const handleChange = () => {
        onChange(taxon, !checked);
        setChecked(!checked);
    };
    
    return (
        <label>
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                inline
            />
            {taxonString(taxon)}
        </label>
        );
}

export default TaxonCheckbox;