// Determines which colour-coded raster dataset (and which timestamp within
// that dataset) to display on the map, which it passes to its parent via onChange.
// It narrows the selection down by indicator, model, and emissions scenario based
// on what the user is viewing in graphs, accessed via the zustand store.
// It selects climatology and individual timestamp based on user controls it displays.

import useStore from '../../store/useStore.js'
import React, {useState, useEffect} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import {getMetadata, flattenMetadata} from '../../data-services/pcex-backend.js';
import {getNcwmsMinMax} from '../../data-services/ncwms.js'; 
import {getIndicatorMapOptions} from '../../data-services/public.js';
import _ from 'lodash';

import NextTimestampButton from './NextTimestampButton.js';
import PreviousTimestampButton from './PreviousTimestampButton.js';
import NextClimatologyButton from './NextClimatologyButton.js';
import PreviousClimatologyButton from './PreviousClimatologyButton.js';
import ColourLegend from './ColourLegend.js';
import LogScaleCheckbox from './LogScaleCheckbox';
import PaletteSelector from './PaletteSelector';
import OpacitySlider from './OpacitySlider';

import InfoPopup from '../InfoPopup/InfoPopup.js';

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
    const [datasetMinMax, setDatasetMinMax] = useState({});
    const [datasetSeries, setDatasetSeries] = useState([]);
    const [indicatorConfig, setIndicatorConfig] = useState(null);
    
    //load the indicator configuration options; only needs to be done once
    useEffect(() => {
        getIndicatorMapOptions().then((options) => setIndicatorConfig(options));
    }, []);
    
    // this useEffect responds to changes in the selected dataset, via the mapDataset
    // prop. It fetches the minimum and maximum values of the dataset and stores them.
    // It is inefficient - the dataset minimum and maximum do not change if
    // a user merely goes to the next timestamp, but they will be fetched anyway.
    // this is such a small request it is not an issue.
    useEffect(() => {
        if(mapDataset) {
            getNcwmsMinMax(mapDataset.file, mapDataset.variable).then(data => {
                setDatasetMinMax(data);
            });
        }
    }, [mapDataset]);

    // this useEffect responds to user changes in selected dataset made on the Data Display
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
                
                //use indicator-specific colouration if available
                const config = indicatorConfig?.[indicator]; 
                const palette = config ? config.palette : 'x-Occam';

                // currently data is buggy - datasets that are supposed to 
                // always be greater than zero (stream flow magnitudes)
                // contain zeros. ncWMS throws an error if asked to display
                // a dataset with zero values and logarithmic scale colour.
                // Accordingly, since there are no datasets that can actualle
                // BE displayed with logairthmic colour scaling right noe, 
                // logarithmic scaling is disabled.
                // TODO: uncomment following line when data is fixed.                
                // const logscale = config ? config.logscale : false;
                const logscale = false;
                                
                const mapDataLayer = {
                    file: metadata.filepath,
                    variable: indicator,
                    time: timestamp,
                    styles: `default-scalar/${palette}`,
                    logscale: logscale,
                    opacity: 0.5,
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
    
    // updates a single attribute of the displayed dataset, 
    // used in cases where the dataset itself hasn't changed, only
    // the way it is displayed, so we don't need to fetch a new dataset.
    function updateMapDisplayParameter(parameter, value) {
        let newMapDataLayer = {...mapDataset};
        newMapDataLayer[parameter] = value;
        onChange(newMapDataLayer);
    }

    function handleLogScale(selected) {
        updateMapDisplayParameter("logscale", !mapDataset.logscale);
    }
    
    function handlePalette(selected) {
        updateMapDisplayParameter("styles", "default-scalar/"+selected.target.value);
    }
    
    function handleOpacity(selected) {
        updateMapDisplayParameter("opacity", selected.target.valueAsNumber / 100);
    }

    function describeTimestamp() {
        const date = new Date(mapDataset.time);
        const monthNames = ["January", "February", "March", 
                "April", "May", "June", 
                "July", "August", "September", 
                "October", "November", "December"];
        
        if(graphTab === "year") {
            return "Annual";
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
            return `${describeTimestamp()} Mean ${describeClimatology()}`;
        }
        else
        {
            return "No dataset";
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
        let newMapLayer = _.pick(mapDataset, ["file", "variable", "styles", "file_id", "logscale", "opacity"]);
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
        let newMapLayer = _.pick(mapDataset, ["file", "variable", "styles", "file_id", "logscale", "opacity"]);
        newMapLayer["time"] = timeMetadata.times[currentTimeIndex -1 ];
        onChange(newMapLayer);
    }
    
    function nextClimatologyExists() {
        if(!mapDataset) {
            return false;
        }
        const currentDataset = _.find(datasetSeries, {file_id: mapDataset.file_id});
        if(!currentDataset) {
            return false;
        }
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
              logscale: mapDataset.logscale,
              opacity: mapDataset.opacity,
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
        if(!currentDataset) {
            return false;
        }
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
              logscale: mapDataset.logscale,
              opacity: mapDataset.opacity,
              file_id: metadata.file_id  
            };
            
            onChange(mapDataLayer);            
            setTimeMetadata(metadata);
        });
    }

    return (
        <div classname="MapControls">
          <div classname="TimeContols">
            <InfoPopup index={"map-controls"}/>
            <ButtonGroup>
              <PreviousClimatologyButton
                disabled={!previousClimatologyExists()}
                onClick={previousClimatology}
              />
              <PreviousTimestampButton
                disabled={!previousTimestampExists()}
                onClick={previousTimestamp}
              />
              <Button
                variant="secondary" 
                size="sm"
                title={describeMap()}
                disabled={true}>
                  {describeMap()}
              </Button>
              <NextTimestampButton
                disabled={!nextTimestampExists()}
                onClick={nextTimestamp}
              />
              <NextClimatologyButton
                disabled={!nextClimatologyExists()}
                onClick={nextClimatology}
              />
            </ButtonGroup>
          </div>
          {mapDataset ? (
            <Container>
              <Row>
                  <ColourLegend 
                    mapDataset={mapDataset}
                    minmax={datasetMinMax}
                    units={timeMetadata.units} 
                  />
              </Row>
              <Row>
                <Col>
                  Map Palette
                  <PaletteSelector
                      mapDataset={mapDataset}
                      handleChange={handlePalette}
                  />
                </Col>
                <Col>
                  <LogScaleCheckbox
                    mapDataset={mapDataset}
                    minmax={datasetMinMax}
                    handleChange={handleLogScale}
                    indicatorConfig={indicatorConfig}
                  />
                </Col>
                <Col>
                  Opacity
                  <OpacitySlider
                    mapDataset={mapDataset}
                    handleChange={handleOpacity}
                  />
                </Col>
              </Row>
            </Container>
              ) : "Select an indicator on the data display to see it on the map"}
        </div>
        );
}


export default MapControls;