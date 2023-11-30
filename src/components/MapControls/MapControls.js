// Determines which colour-coded raster dataset (and which timestamp within
// that dataset) to display on the map, which it passes to its parent via onChange.
// It narrows the selection down by indicator, model, and emissions scenario based
// on what the user is viewing in graphs, accessed via the zustand store.
// It selects climatology and individual timestamp based on user controls it displays.

import useStore from '../../store/useStore.js'
import React, {useState, useEffect} from 'react';
import {getMetadata} from '../../data-services/pcex-backend.js';
import {unravelObject, only} from '../../helpers/APIDataHelpers.js'
import _ from 'lodash';

function MapControls({onChange, mapDataset}) {
    const graphTab = useStore((state) => state.graphTab);
    const dailyIndicator = useStore((state) => state.dailyIndicator);
    const yearlyIndicator = useStore((state) => state.yearlyIndicator);
    const monthlyIndicator = useStore((state) => state.monthlyIndicator);
    const model = useStore((state) => state.model);
    const emission = useStore((state) => state.emission);
    
    const [timeMetadata, setTimeMetadata] = useState(null);
    const [datasetSeries, setDatasetSeries] = useState([]);

    // switch to a new datafile when the user changes which graph they are looking at
    useEffect(() => {
        console.log("model is");
        console.log(model);
        
        const datafiles = graphTab === 'day' ? dailyIndicator 
            : graphTab === 'month' ? monthlyIndicator 
            : graphTab === 'year' ? yearlyIndicator
            : undefined;

        console.log("Indicator in useEffect is");
        console.log(`graphTab: ${graphTab}, dailyINdictaor: ${dailyIndicator} monthly: ${monthlyIndicator} yearly ${yearlyIndicator}`);
        console.log(datafiles);
                
        // select a datafile
        if(datafiles) { 
            setDatasetSeries(datafiles.value.contexts);
            console.log(`received ${datafiles.value.contexts.length} datasets`);
            //todo: non-random filtering here.
            const dataset = datafiles.value.contexts[0];
            
//            console.log("dataset chosen randomly is");
//            console.log(dataset)
            
            // fetch timestamp information for the selected datafile
            getMetadata(dataset.file_id).then(data => {
                const metadata = only(unravelObject(data, "file_id"));
                console.log("time metadata is ");
                console.log(metadata);
                setTimeMetadata(data);
//                console.log("here is the fetched data");
//                console.log(metadata);
                
                const indicator = only(Object.keys(metadata.variables));
                console.log(indicator);
                
                const timestamp = _.values(metadata.times)[0];
                
                const mapDataLayer = {
                    file: metadata.filepath,
                    variable: indicator,
                    time: timestamp,
                    styles: "default-scalar/x-Occam"
                }
                
                onChange(mapDataLayer);
            });
        }
        else {
            console.log("no raster metadata");
        }
    }, [graphTab, dailyIndicator, yearlyIndicator, monthlyIndicator, model, emission]);

    function describeTimestamp() {
        const date = new Date(mapDataset.time);
        const monthNames = ["January", "February", "March", 
                "April", "May", "June", 
                "July", "August", "September", 
                "October", "November", "December"];
        
        if(graphTab === "year") {
            return "annual";
        }
        else if(graphTab == "month") {
            return monthNames[date.getMonth()];
        }
        else if(graphTab === "day") {
            return `${monthNames[date.getMonth()]} ${date.getDate()}`;
        }
        else {
            return "unset timestamp";
        }
    }
    
    function describeClimatology() {
        if (timeMetadata) {
            console.log(`start date is ${timeMetadata.start_date}`);
            const start = new Date(timeMetadata.start_date);
            const end = new Date(timeMetadata.end_date);
            return `${start.getYear()}-${end.getYear()}`
        }
        else {
            return "unset climatology";
        }
    }

    function describeMap() {
        if (mapDataset) {
            return `${describeTimestamp()} mean ${mapDataset.variable} ${describeClimatology()}`;
        }
        else
        {
            return "Select an indicator on the Data Display to see it on the map";
        }
    }

    return describeMap();
}


export default MapControls;