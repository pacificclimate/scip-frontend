// selector from which a user may pick a climatology

import React, { useMemo } from 'react';
import Select from 'react-select';
import ReplaceValue from './ReplaceValue';
import { makeOptionsFromItems, makeGetOptionIsDisabled, customStyles } from './selector-utils';
import { yearFromExtendedDate } from '../../helpers/APIDataHelpers'

export default function ClimatologySelector({
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
      getOptionRepresentative: ({start_date, end_date}) => 
      ({start_date, end_date}),
      // This is the climatology selector: group datafile by their climatology

      getOptionLabel: ({ value: { representative: { start_date, end_date }}}) =>
        `${yearFromExtendedDate(start_date)} - ${yearFromExtendedDate(end_date)}`,
      // Label has climatology range

      getOptionIsDisabled: makeGetOptionIsDisabled(constraint),
    },
    metadata
  ), [metadata, constraint]);


  return (
    <ReplaceValue
      name={"ClimatologySelector"}
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