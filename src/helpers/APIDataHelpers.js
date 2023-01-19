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