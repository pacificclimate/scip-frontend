// copied from pcic-react-components; may be someday replaced by
// importing pcic-react-components. 
//https://github.com/pacificclimate/pcic-react-components

// Component that factors out common selector self-replace logic. It is used by
// wrapping the selector in question as a child. At one point, it rendered null
// in some cases, but at present it always renders its children.

import { find, isNull, isUndefined } from 'lodash/fp';
import React from 'react';

export default function ReplaceValue({
  name,
  // For debugging purposes, entirely optional.

  children,
  // Nominally, and in all useful cases, the selector managed by this component.

  options,
  // Options for the selector.

  value,
  // Current selector value (option).

  canReplace = true,
  // Are we allowed to replace?

  onChange,
  // Handler for case that we replace the current (invalid) value.

  onNoChange,
  // Handler for case that we do not replace the current (still valid) value.
}) {
  // If value replacement is not allowed, do absolutely nothing
  if (!canReplace) {
    return children;
  }

  // Value replacement is allowed: Does it need to be replaced?
  // The only tricky part is accounting for the change in the `isDisabled` prop
  // of each option. The options list has updated (with new props), so we can't
  // test the old option value, which in the absence of bugs is enabled; we have
  // to find its equivalent in the new options by searching for the one with the
  // same key.
  const needsReplacing =
    !isNull(value)  // Null is always an allowed value
    && (
      isUndefined(value)  // undefined = replace me
      || find({ label: value.label }, options).isDisabled  // disabled = replace me
    );

  if (needsReplacing) {
    // Replace with first enabled value. If none enabled, replace with null.
    const replacementValue = find({ isDisabled: false }, options) || null;
    onChange(replacementValue);
    return children;
  }

  // Not replaced: communicate no change (for purposes of cascading).
  onNoChange()
  return children;
}