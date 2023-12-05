// Determines which colour-coded raster dataset (and which timestamp within
// that dataset) to display on the map, which it passes to its parent via onChange.
// It narrows the selection down by indicator, model, and emissions scenario based
// on what the user is viewing in graphs, accessed via the zustand store.
// It selects climatology and individual timestamp based on user controls it displays.

import useStore from '../../store/useStore.js'
import React, {useState, useEffect} from 'react';
import {getMetadata, flattenMetadata} from '../../data-services/pcex-backend.js';
import _ from 'lodash';

import NextTimestampButton from './NextTimestampButton.js';
import PreviousTimestampButton from './PreviousTimestampButton.js';
import NextClimatologyButton from './NextClimatologyButton.js';
import PreviousClimatologyButton from './PreviousClimatologyButton.js';

import './MapControls.css';



function MapControls({onChange, mapDataset}) {
    //access user selections on the Data Display component
    const graphTab = useStore((state) => state.graphTab);
    const dailyIndicator = useStore((state) => state.dailyIndicator);
    const yearlyIndicator = useStore((state) => state.yearlyIndicator);
    const monthlyIndicator = useStore((state) => state.monthlyIndicator);
    const model = useStore((state) => state.model);
    const emission = useStore((state) => state.emission);
    
    //keep track of user selections on this component
    const [timeMetadata, setTimeMetadata] = useState(null);
    const [datasetSeries, setDatasetSeries] = useState([]);

    // this useEffect responds to user changes and selections made on the Data Display
    // component or its children, which it receives via the Zustand store.
    // it determines which datasets are described by the selection parameters and loads
    // one of them.
    useEffect(() => {        
        const datafiles = graphTab === 'day' ? dailyIndicator 
            : graphTab === 'month' ? monthlyIndicator 
            : graphTab === 'year' ? yearlyIndicator
            : undefined;
                
        // select a datafile
        if(datafiles) { 
            
            //datafiles contains all datasets with a particular indicator.
            //filter by model and emissions scenario to get the list of all the ones
            //viewable for current user selections on Data Display.
            const availableDatasets = _.filter(datafiles.value.contexts, {
                model_id: model.value.representative.model_id,
                experiment: emission.value.representative.experiment});
            setDatasetSeries(availableDatasets);
            
            // figure out how many runs are in this data, and select the earliest
            // one alphabetically (ie r1i1p1 before r2i1p1, etc)
            const availableRuns = getDatasetAttributes(availableDatasets, ['ensemble_member']);
            const defaultRun = _.map(availableRuns, 'ensemble_member').sort()[0];
            
            const selectedRunDatasets = _.filter(availableDatasets, {ensemble_member: defaultRun});
            
            // select a single dataset to view on the map. 
            // the climatology should match the one the user was previously viewing, if possible,
            // otherwise load the earliest climatology.
            let matchingClimo = null;
            if(mapDataset) {
                //this uses string sorting for dates; they're all year-first format
                function dateInClimatology(dataset, datestr) {
                    return(datestr > dataset.start_date && datestr < dataset.end_date);
                }
                matchingClimo = _.find(selectedRunDatasets, dateInClimatology(mapDataset.time));
            }
            const first_start = _.map(getDatasetAttributes(selectedRunDatasets, "start_date"), 'start_date').sort()[0];
            const earliest = _.find(selectedRunDatasets, {start_date: first_start});
            
            const dataset = mapDataset && matchingClimo ? matchingClimo : earliest;
            
            // fetch timestamp information for the selected datafile
            getMetadata(dataset.file_id).then(data => {
                const metadata = flattenMetadata(data, "file_id");
                setTimeMetadata(metadata);
                const indicator = metadata.variable_id;
                
                // if the new dataset contains the timestamp the user was previously,
                // looking at, keep using that timestamp, otherwise pick the first one
                // on the list.
                let timestamp = null;
                if(mapDataset && _.includes(metadata.times, mapDataset.time)) {
                    timestamp = mapDataset.time;
                }
                else {
                    timestamp = _.values(metadata.times)[0];
                }
                
                const mapDataLayer = {
                    file: metadata.filepath,
                    variable: indicator,
                    time: timestamp,
                    styles: "default-scalar/x-Occam",
                    file_id: metadata.file_id //not used by map but makes things easier.
                }
                onChange(mapDataLayer);
            });
        }
        else {
            console.log("no raster metadata");
        }
    }, [graphTab, dailyIndicator, yearlyIndicator, monthlyIndicator, model, emission]);
    
    // returns a list of all values for one or more attributes in a collection
    // of datasets, for example all experiments, start dates, etc.
    function getDatasetAttributes(datasets, attributes) {
        return(_.uniqWith(_.map(datasets, d=> {return _.pick(d, attributes)}),_.isEqual));
    }

    //given the id of a dataset, return the values of one of its attributes 
    function getDatasetAttribute(id, datasets, attribute) {
        const ds = _.find(datasets, {file_id: id});
        return ds[attribute];
    }

    function describeTimestamp() {
        const date = new Date(mapDataset.time);
        const monthNames = ["January", "February", "March", 
                "April", "May", "June", 
                "July", "August", "September", 
                "October", "November", "December"];
        
        if(graphTab === "year") {
            return "annual";
        }
        else if(graphTab === "month") {
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
            const start = new Date(timeMetadata.start_date);
            const end = new Date(timeMetadata.end_date);
            return `${start.getFullYear()}-${end.getFullYear()}`
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

    function nextTimestampExists() {
        if(!mapDataset || graphTab==="year") {
            return false;
        }
        const lastTime = timeMetadata.times[timeMetadata.times.length - 1];
        const currentTime = mapDataset.time;
        return lastTime > currentTime;
    }
    
    //advance to the next timestamp when the user clicks the corresponding button
    function nextTimestamp() {
        const currentTimeIndex = timeMetadata.times.findIndex((idx) => idx === mapDataset.time);
        let newMapLayer = _.pick(mapDataset, ["file", "variable", "styles", "file_id"]);
        newMapLayer["time"] = timeMetadata.times[currentTimeIndex + 1];
        onChange(newMapLayer);
    }
    
    function previousTimestampExists() {
        if(!mapDataset || graphTab==="year") {
            return false;
        }
        const firstTime = timeMetadata.times[0];
        const currentTime = mapDataset.time;
        return firstTime < currentTime;
    }
    
    //step back to the previous timestamp when user clicks the corresponding button
    function previousTimestamp() {
        const currentTimeIndex = timeMetadata.times.findIndex((idx) => idx === mapDataset.time);
        let newMapLayer = _.pick(mapDataset, ["file", "variable", "styles", "file_id"]);
        newMapLayer["time"] = timeMetadata.times[currentTimeIndex -1 ];
        onChange(newMapLayer);
    }
    
    function nextClimatologyExists() {
        if(!mapDataset) {
            return false;
        }
        const currentDataset = _.find(datasetSeries, {file_id: mapDataset.file_id});
        //a "next" climo is defined as one with a later end date.
        const next = _.find(datasetSeries, (ds) => {return(ds.end_date > currentDataset.end_date)});
        return !_.isUndefined(next);
    }
    
    function nextClimatology() {
        const currentDataset = _.find(datasetSeries, {file_id: mapDataset.file_id});
        // find the dataset with the smallest end_date larger than the current one.
        let nextClimatology;
        for(let i = 0; i < datasetSeries.length; i++) {
            if (datasetSeries[i].end_date > currentDataset.end_date && 
                    (_.isUndefined(nextClimatology) || datasetSeries[i].end_date < nextClimatology.end_date)) {
                        nextClimatology = datasetSeries[i];
                    }
        }

        // fetch time metadata for the next climatology's dataset
        getMetadata(nextClimatology.file_id).then(data => {
            const metadata = flattenMetadata(data, "file_id");

            // keep the same time index - if the user was looking at March 13 and 
            // switches to a climatology 30 years later, show March 13 then.
            const currentTimeIndex = timeMetadata.times.findIndex((idx) => idx === mapDataset.time);
            const timestamp = metadata.times[currentTimeIndex];
            
            //update the new map parameters and time metadata
            const mapDataLayer = {
              file: metadata.filepath,
              variable: mapDataset.variable,
              time: timestamp,
              styles: mapDataset.styles,
              file_id: metadata.file_id  
            };
            
            onChange(mapDataLayer);            
            setTimeMetadata(metadata);
        }); 
    }
    
    function previousClimatologyExists() {
        if(!mapDataset) {
            return false;
        }
        const currentDataset = _.find(datasetSeries, {file_id: mapDataset.file_id});
        //a "previous" climo is defined as one with an earlier start date
        const next = _.find(datasetSeries, (ds) => {return(ds.start_date < currentDataset.start_date)});
        return !_.isUndefined(next);
    }
    
    function previousClimatology() {
        const currentDataset = _.find(datasetSeries, {file_id: mapDataset.file_id});
        // find the dataset with the largest start_date smaller than the current one.
        let previousClimatology;
        for(let i = 0; i < datasetSeries.length; i++) {
            if (datasetSeries[i].start_date < currentDataset.start_date && 
                    (_.isUndefined(previousClimatology) || datasetSeries[i].start_date > previousClimatology.start_date)) {
                        previousClimatology = datasetSeries[i];
                    }
        }

        // fetch time metadata for the next climatology's dataset
        getMetadata(previousClimatology.file_id).then(data => {
            const metadata = flattenMetadata(data, "file_id");

            // keep the same time index - if the user was looking at March 13 and 
            // switches to a climatology 30 years later, show March 13 then.
            const currentTimeIndex = timeMetadata.times.findIndex((idx) => idx === mapDataset.time);
            const timestamp = metadata.times[currentTimeIndex];
            
            //update the new map parameters and time metadata
            const mapDataLayer = {
              file: metadata.filepath,
              variable: mapDataset.variable,
              time: timestamp,
              styles: mapDataset.styles,
              file_id: metadata.file_id  
            };
            
            onChange(mapDataLayer);            
            setTimeMetadata(metadata);
        }); 
    }

    return (
        <div classname="MapControls">
          <PreviousClimatologyButton
            disabled={!previousClimatologyExists()}
            onClick={previousClimatology}
          />
          <PreviousTimestampButton
            disabled={!previousTimestampExists()}
            onClick={previousTimestamp}
          />
          {describeMap()}
          <NextTimestampButton
            disabled={!nextTimestampExists()}
            onClick={nextTimestamp}
          />
         <NextClimatologyButton
            disabled={!nextClimatologyExists()}
            onClick={nextClimatology}
          />
        </div>
        );
}


export default MapControls;