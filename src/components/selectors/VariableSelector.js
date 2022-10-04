// selector from which a user may pick an indicator

import React, { useMemo } from 'react';
import Select from 'react-select';
import ReplaceValue from './ReplaceValue';
import { makeOptionsFromItems, makeGetOptionIsDisabled, customStyles } from './selector-utils';

export default function VariableSelector({
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
      getOptionRepresentative: ({variable_id, variable_description}) => 
      ({variable_id, variable_description}),
      // This is the variable selector: group variables by  metadata items by variable_id.

      getOptionLabel: ({ value: { representative: { variable_id, variable_description }}}) =>
        `${variable_id} - ${variable_description}`,
      // Label has variable name and explanation

      getOptionIsDisabled: makeGetOptionIsDisabled(constraint),
    },
    metadata
  ), [metadata, constraint]);
  // console.log("### ModelSelector options", options)

  return (
    <ReplaceValue
      name={"VariableSelector"}
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