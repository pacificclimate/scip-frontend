// zustand data store. This holds some state information used by the entire App, 
// specifically data generated far "down" the component tree by user input, but 
// which one of the other branches of the component tree (Data, Map, Area) needs 
// to respond to. 

import {create} from "zustand";

const startingEmission = {
    isDisabled: false,
    label: "Historical, then RCP 8.5",
    value: {
        contexts: [],
        representative: {experiment: "historical, rcp85"}
    }
};

const startingModel = {
    isDisabled: false,
    label: "PCIC-HYDRO",
    value: {
        contexts: [],
        representative: {model_id: "PCIC-HYDRO"}
    }
};


const useStore = create((set) => {
        return {
            // graph indicator - tracks which graph and indicator the user is looking 
            // at (in DataDisplay, DailyDataDisplay, MonthlyDataDisplay, YearlyDataDisplay) 
            // so that the map can be updated to match it by MapControls (which uses this
            // state but doesn't change it)
            graphTab: "year",
            setGraphTab: (tab) => set((state) => ({graphTab: tab})),
            yearlyIndicator: null,
            setYearlyIndicator: (ind) => set((state) => ({yearlyIndicator: ind})),
            monthlyIndicator: null,
            setMonthlyIndicator: (ind) => set((state) => ({monthlyIndicator: ind})),
            dailyIndicator: null,
            setDailyIndicator: (ind) => set((state) => ({dailyIndicator: ind})),
            
            // climate model and emissions scenario - set un the DataDisplay, consumed
            // by MapControls, used to decide which dataset to display on the map.
            model: startingModel,
            setModel: (mod) => set((state) => ({model: mod})),
            emission: startingEmission,
            setEmission: (em) => set((state) => ({emission: em})),

            // user-selected region and related data
            // users may select a region either from a dropdown in AreaDisplay
            // or by clicking on the map to select everything upstream in DataMap
            // there's a lot of tangled logic related to handling regions in AreaDisplay 
            // that should eventually be moved into this store.
            // region selection data is consumed by *DataDisplay to generate graphs
            viewOutletIndicators: false,
            setViewOutletIndicators: (view) => set((state) => ({viewOutletIndicators: view})),

            // configuration files that are loaded once (by App) and used by various
            // components
            // variable map display options (map colour, log scale, minmax)
            indicatorOptions: {},
            setIndicatorOptions: (options) => set((state) => ({indicatorOptions: options})),
            // help popup texts and titles
            helpText: {},
            setHelpText: (help) => set((state) => ({helpText: help}))
        }
    }
);

export default useStore;