//selector from which the user may pick an emissions scenario
import React, { useMemo } from 'react';
import Select from 'react-select';
import ReplaceValue from './ReplaceValue';
import { flow, join, map, split } from 'lodash/fp';
import { makeOptionsFromItems, makeGetOptionIsDisabled, customStyles } from './selector-utils';

// helpers to make emissions scenario names more user-friendly
const formattedPart = {
  historical: 'Historical',
  rcp26: 'RCP 2.6',
  rcp45: 'RCP 4.5',
  rcp85: 'RCP 8.5',
  ssp126: 'SSP 1-2.6',
  ssp245: 'SSP 2-4.5',
  ssp585: 'SSP 5-8.5',
};

const formatPart = part => {
  try {
    return formattedPart[part];
  } catch {
    return part;
  }
};

export default function EmissionSelector({
  metadata,
  // Metadata from which to form the options.

  constraint,
  // Constraint determining which options are enabled/disabled.
  // See Notes regarding constraints in utils.js

  value,
  // Current selection (option).

  canReplace,
  // Is this selector permitted to self-replace?

  onChange,
  // Change handler.

  onNoChange,
  // No-changed handler. Needed by self-replace logic.

  ...rest
  // Passed through to React Select.
}) {
  const options = useMemo(() => makeOptionsFromItems(
    {
      getOptionRepresentative: ({ experiment }) => ({ experiment }),
      // This is the emissions scenario selector: group metadata items by emissions scenario.

      getOptionLabel: option => (
        flow(
          split(/\s*,\s*/),
          map(formatPart),
          join(', then '),
        )(option.value.representative.experiment)
      ),

      getOptionIsDisabled: makeGetOptionIsDisabled(constraint),
    },
    metadata
  ), [metadata, constraint]);

  return (
    <ReplaceValue
      name={"EmissionSelector"}
      options={options}
      value={value}
      onChange={onChange}
      canReplace={canReplace}
      onNoChange={onNoChange}
    >
      <Select
        options={options}
        value={value}
        onChange={onChange}
        styles={customStyles}
        {...rest}
      />
    </ReplaceValue>
  );
}