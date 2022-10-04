//selector from which the user may pick a model
import React, { useMemo } from 'react';
import Select from 'react-select';
import ReplaceValue from './ReplaceValue';
import { makeOptionsFromItems, makeGetOptionIsDisabled, customStyles } from './selector-utils';

export default function ModelSelector({
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
      getOptionRepresentative: ({ model_id }) => ({ model_id }),
      // This is the model selector: group metadata items by model_id.

      getOptionLabel: option => option.value.representative.model_id,
      // Label with model_id

      getOptionIsDisabled: makeGetOptionIsDisabled(constraint),
    },
    metadata
  ), [metadata, constraint]);
  // console.log("### ModelSelector options", options)

  return (
    <ReplaceValue
      name={"ModelSelector"}
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