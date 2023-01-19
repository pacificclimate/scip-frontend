// copied from pcic-react-components; may be someday replaced by
// importing pcic-react-components. 
//https://github.com/pacificclimate/pcic-react-components

// This module contains functions that are used to build selectors for CE
// metadata; for example, a model selector, an emissions scenario selector, a
// variable selector. The selectors are constructed using React Select.
//
//
// Notes regarding CE metadata:
//
// CE metadata comes in a form that is slightly more compact to transfer but
// harder to process for purposes such as the selectors. In the CE frontend,
// a function (see https://github.com/pacificclimate/climate-explorer-frontend/blob/master/src/data-services/ce-backend.js#L12-L40)
// transforms the compact representation of metadata into a form in which there
// is exactly one metadata item per unique_id/file. The result is an array of
// objects of the form below. Effectively, each unique_id/file is tagged with
// all relevant properties that characterize it. This makes filtering and
// otherwise processing them much simpler.
//
//    {
//      unique_id,
//      filepath,
//      model_id,
//      experiment,
//      variable_id,
//      variable_name,
//      multi_year_mean,
//      start_date,
//      end_date,
//      ...
//    }
//
// All functions defined here assume list of metadata items like this one.
//
//
// Notes on React Select:
//
// At the top level, so to speak, RS deals only in "options". In principle, an
// option can be any arbitrary JS value. The default configuration of RS means
// that an option typically is an object with the following structure:
//
//    {
//      label: <String>,  // Displayed label for this option in rendered selector
//      isDisabled: <Boolean>, // Option is enabled/disabled in rendered selector
//      value: <any>,  // Value associated with this option.
//    }
//
// Regarding `option.value`: This name is partly a holdover from a naming
// *requirement* from an earlier version of RS. Its contents could conceivably
// be spread out into the options object, but that risks stepping on other
// default meaningful prop names (e.g., `isDisabled`), whereas `value` is
// guaranteed to be safe. Unfortunately it creates an awkward naming situation
// as noted immediately below.
//
// RS `<Select>` takes three primary arguments (props): `options`, `value`, and
// `onChange`.
//
// - `options`: Array of option objects that populate the rendered selector.
//
// - `value`: The currently selected option (*not* value!). This is an
//    unfortunate naming convention. Really it should be called `option` or
//    `selectedOption`, but the convention in React generally is to use the
//    name `value` for this purpose, and RS evidently followed it. It does
//    make for awkward discussions and JS expressions -- by "value", do we mean
//    the option or the expression `option.value`?
//
// - `onChange`: A callback function called when an option is selected by
//   user interaction. This callback is called with one argument, the *option*
//   (not label or value) selected by the user.
//
// This is what I meant by RS dealing only in options. Its basic interactions
// as a controlled component only refer to options.
//
// RS `<Select>` also accepts an enormous number of other props that allow you
// to control its appearance and behaviour, and to override its default
// configuration. I've used very few of these here.
//
//
// Notes regarding constraints:
//
// Each of the selectors (defined elsewhere using these functions) accepts a
// `constraint` prop which determines which of its options are enabled.
// A `constraint` prop is an object containing a subset of metadata item props.
// If any metadata item associated with an option (`option.value.contexts`)
// matches all the values in the constraint object, then the option is enabled
// -- there is at least one file associated with that option that can match
// the constraint, so it is legitimate to choose this option. Otherwise (no
// matching associated metadata item -- no matching files), the option is
// disabled. A typical constraint object looks like the following examples:
//
//    {
//      model_id: "CanESM",
//    }
//
//    {
//      model_id: "CanESM",
//      experiment: "historical, rcp8.5",
//    }



import { flow, isMatch, map, some } from 'lodash/fp';
import { groupByGeneral } from './selector-fp.js';

// This function transforms an array of (normalized; see above) metadata items
// into options acceptable to RS (see above). Its basic operation is:
//
//    - Extract a subset of props from the metadata item that is relevant to
//      the selector being built (e.g., for a model selector, `model_id`) into
//      an object (e.g., `{ model_id: <whatever> }`. This object containing
//      the subset is called the "representative" of the metadata item.
//
//    - Group metadata items by representative.
//
//    - Create one RS option per group, including both representative and the
//      list of metadata items that share that same representative. Each option
//      generated has the following contents:
//
//          {
//            label: <String>,
//            isDisabled: <Boolean>,
//            value: {
//              representative: { ... },
//              contexts: [ <metadata item>, ... ]
//            },
//          }
export const makeOptionsFromItems = (
  {
    getOptionRepresentative,
    // Function mapping a metadata item to its representative.

    getOptionLabel,
    // Function mapping an option to the value to be used for its label.

    getOptionIsDisabled = () => false,
    // Function mapping an option to the `isDisabled` value.
    // Generally speaking, the default function is too simple for real use.
  },
  items
) => {
  return flow(
    // Construct objects containing both the item and representative.
    map(item => ({
      context: item,
      representative: getOptionRepresentative(item),
    })),

    // Group these objects by representative.
    groupByGeneral(({ representative }) => representative),

    // Convert groups to partial React Select option objects. Each such object
    // contains only the required `value` prop, which is converted to a simpler
    // and more convenient from the group.
    map(group => ({
      // Each group has a `by` prop, which is the representative it was grouped
      // by, and an `items` prop, which is a list of all input objects sharing
      // the same `by` value.
      value: {
        // `context` is the list of metadata items sharing the same
        // representative. It needs to be dug out of the grouped items.
        contexts: map(item => item.context)(group.items),
        representative: group.by,
      },
    })),

    // Complete the React Select option. Prop `label` is always required.
    map(option => ({
      value: option.value,
      label: getOptionLabel(option),
      isDisabled: getOptionIsDisabled(option),
    })),
  )(items);
}

// This function receives a constraint object and returns a function mapping
// an option to the value for `isDisabled`. The resulting function is passed
// to function `makeOptionsFromItems` (above) as the `getOptionIsDisabled`
// argument.
export const makeGetOptionIsDisabled = constraint => option =>
  !some(context => isMatch(constraint, context))(option.value.contexts);
  
export const customStyles = {
    option: (provided) => ({
      ...provided,
      color: 'grey'
    })
  } 


