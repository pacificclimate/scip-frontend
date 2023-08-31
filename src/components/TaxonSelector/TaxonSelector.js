// Panel with a checkbox for each species of salmon a user might concentrate
// on. Receives the list of possible species from its parent, creates a checkbox
// for each, and passes any user changes of what is check to its parent via 
// onChange.
import React, {useState, useEffect} from 'react';
import TaxonCheckbox from'./TaxonCheckbox.js'; 
import _ from 'lodash';

import './TaxonSelector.css';



function TaxonSelector({taxons, selectedTaxons, onChange}) {

const [checkBoxes, setCheckBoxes] = useState([]);
    
    function handleChange(taxon, checked) {
        onChange(taxon, checked);
    }


    useEffect(() => {
        setCheckBoxes(_.map(taxons, makeTaxonCheckbox));
      }, [taxons, selectedTaxons]
    );

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
        {checkBoxes}
        </div>
    );
}

export default TaxonSelector;