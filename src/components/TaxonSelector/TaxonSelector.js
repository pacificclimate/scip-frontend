// Panel with a checkbox for each species of salmon a user might concentrate
// on. Receives the list of possible species from its parent, creates a checkbox
// for each, and passes any user changes of what is check to its parent via 
// onChange.
import React from 'react';
import TaxonCheckbox from'./TaxonCheckbox.js'; 
import ButtonToolbar from 'react-bootstrap/ButtonGroup';
import _ from 'lodash';

import './TaxonSelector.css';



function TaxonSelector({taxons, selectedTaxons, onChange}) {
    
    function handleChange(taxon, checked) {
        onChange(taxon, checked);
    }


    const checkboxes = _.map(taxons, makeTaxonCheckbox);

    function makeTaxonCheckbox(taxon) {
        return(
            <TaxonCheckbox
                taxon={taxon}
                selectedTaxons={selectedTaxons}
                onChange={handleChange}
            />
        );
    }
    
    return(
        <div className="DataDisplay">
            {checkboxes}
        </div>
    );
}

export default TaxonSelector;