//functions for parsing and verifying data from the API
import moment from 'moment/moment';
import _ from 'lodash';

//returns the year from a date formatted like "2022-09-24T01:40:44Z"
export function yearFromExtendedDate(extended) {
     return parseInt(moment(extended, moment.ISO_8601).utc().format('YYYY'));
}

// converts an object whose properties are objects to an array of objects,
// adding the property that formerly denoted each object as a property of that 
// object.
// for example: {
//                  "iris": {"colour": "purple}, 
//                  "chrysanthemum": {"colour": "yellow"}
//               }
// would become [
//                  {"flower_name": "iris", "colour": "purple"},
//                  {"flower_name": "chrysanthemum". "colour": "yellow"}
//               ]
export function unravelObject(object, attribute_name){
    
    function makeObject(object, index, collection) {
        if(!_.isObject(object)) {
            return {};
        }
        else object[attribute_name] = index;
        return object
    }
    
    return _.map(object, makeObject);
}

// describes a taxon object as a string. Common name, and if
// there is a subgroup, it is appended with a dash.
export function taxonString(taxonObject) {
    if(taxonObject.subgroup){
        return(`${taxonObject.common_name} - ${taxonObject.subgroup}`);
    }
    else{
        return(`${taxonObject.common_name}`);
    }
}

// returns the taxon object associated with a string
// the inverse of taxonString
export function taxonObject(taxonStr, taxonObjects){
    let f = _.find(taxonObjects, t => {return taxonString(t) === taxonStr;});
    return f;
}

// returns the first and only item in a one-item list. 
// returns null if the list is empty, throws an error if there
// is more than one item.
export function only(list) {
    if (list.length === 0) {
        return null;
    }
    else if (list.length === 1) {
        return list[0];
    }
    else {
        throw new Error(`List contains more than one item: ${list}`);
    }
}