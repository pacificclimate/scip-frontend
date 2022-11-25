//functions for parsing and verifying data from the API
import moment from 'moment/moment';


//returns the year from a date formatted like "2022-09-24T01:40:44Z"
export function yearFromExtendedDate(extended) {
     return parseInt(moment(extended, moment.ISO_8601).utc().format('YYYY'));
}