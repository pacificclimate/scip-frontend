// Displays the results of a population API call to the SCIP backend as 
// a table using ag-grid.

import React from 'react';
import _ from 'lodash';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

export function PopulationTable({populations}) {

    function tableizePop(pop) {
        return {
            code: pop.conservation_unit.code,
            name: pop.conservation_unit.name,

            species: `${pop["common_name"]} ${pop.subgroup? "- " + pop.subgroup: ""}` 
        };
    }

    const ColumnDefs = [
        {field: 'species'},
        {field: 'code'},
        {field: 'name', flex: 1} //grant extra horizonal space to this column.
    ];
    
    //this is different than merely waiting for data to load.
    //if we are waiting for an initial data load, populations 
    //is undefined. If there are no salmon in an area, populations
    //is an empty list.
    const noSalmonHere = Array.isArray(populations) && populations.length===0;
    
    return (
        <div class="ag-theme-alpine" style={{height: "400px", "text-align": "left"}}>
        {noSalmonHere ? "No salmon populations recorded at this location" : 
            <AgGridReact
                rowData={_.map(populations, tableizePop)}
                columnDefs={ColumnDefs}>
            </AgGridReact>
        }
        </div>
    );
};