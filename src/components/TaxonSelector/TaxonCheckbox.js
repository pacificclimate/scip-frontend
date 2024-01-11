// checkbox that keeps track of whether or not a given taxon 
// has been selected by the user. It does not track its own
// checked/unchecked state, but rather sends events to and receives
// checked/unchecked props from its parent.

import React from 'react';
import Form from 'react-bootstrap/Form';
import {taxonString} from '../../helpers/APIDataHelpers.js';
import _ from 'lodash';

function TaxonCheckbox({taxon, selectedTaxons, onChange}) {
    
    const checked = _.find(selectedTaxons, taxon, _.isEqual) ? true : false;
    
    const handleChange = () => {
        onChange(taxon, !checked);
    };
    
    return (
            <Form.Check
                type="checkbox"
                className="me-2"
                checked={checked}
                onChange={handleChange}
                inline
                label={taxonString(taxon)}
            />
        );
}

export default TaxonCheckbox;