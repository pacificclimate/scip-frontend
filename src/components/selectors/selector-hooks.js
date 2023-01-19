// copied from pcic-react-components; may be someday replaced by
// importing pcic-react-components. 
//https://github.com/pacificclimate/pcic-react-components

// This module defines a hook that encapsulates the cascading logic used by
// the demo (and potentially any other user) of the selectors defined here.
//
// Notes regarding `immer`:
//
// In this hook we use the package `use-immer` (which depends on package
// `immer`) for managing state values. Package `immer` efficiently implements
// immutable objects with a remarkably developer-friendly interface. The value
// of immutable objects to developers is that they greatly simplify equality
// checking on non-atomic values such as hash objects and arrays: Immutable
// objects can be checked for value equality by checking only reference
// equality. There's no need for complicated expressions that compare deep
// object properties and that can become incorrect when the object structure
// changes. Immutable equality checks (reference comparisons) always remain
// correct. This is also very convenient in React, since checks whether to
// re-render on a props or state change are checks by reference, by not deep
// equality. With immer (and any other immutable value system), by reference is
// identical to by deep equality.
//
// Another nice feature of immer is that only those parts of a complex object
// that have been updated are actually changed; any unaffected parts remain
// not only the same (deep) value, but the same object and hence the same
// reference. Therefore, partial comparisons of parts by reference also remain
// valid and efficient.
//
// Package `immer` provides a particularly simple and convenient JS interface
// for creating and updating immutable objects. It was greeted with universal
// acclaim and a couple of awards upon its release and is in wide use in the
// React community. See https://immerjs.github.io/immer/ for more information.
//
// `use-immer` wraps `immer` in a React hook, and is what we use here.
// See https://immerjs.github.io/immer/example-setstate and
// https://www.npmjs.com/package/use-immer for more information.

import { useImmer } from 'use-immer';
import {
  every,
  flow,
  fromPairs,
  map,
  takeRightWhile,
  takeWhile
} from 'lodash/fp';
import { objUnion } from '../../utils/fp';

// The hook and its logic work as follows:
//
// The hook takes a required argument, `initialOrder`, which is an array of
// (arbitrary) names for the selectors; more specifically for the state values
// that correspond to them, in the order they are initially cascaded. (Cascade
// order can be modified if desired.) As a very typical example that we will use
// throughout this discussion:
//
//   ["model", "emissions", "variable"]
//
// The hook also takes an optional argument, `initialState` which is an object
// of initial values for the selector value (current option selection) states.
// One prop, nominally, for each of the names in `initialOrder`. For example:
//
//   { model: null, emissions: null, variable: null }
//
// (The nulls would cause RS to select no option in each selector, instead
// displaying the "Please select ..." message. The same object with `undefined`
// for each property (equivalently, the empty object `{}`, which is the default)
// would cause the selectors defined here to self-select the first valid
// (roughly: enabled) option, in cascade specified by `order`.
//
// From the array of names, the hook constructs three state objects, along
// with their corresponding setters.
//
//  `order`, `setOrder`: An immer (see above) state object with initial value
//  given by `initialOrder`.
//
//  `value`, `setValue`: An immer (see above) state object with one prop per
//  name in `initialOrder`, with initial values given by `initialState`.
//
//  `isSettled`, `setIsSettled`: An immer (see above)  state object with one
//  prop per name in `initialOrder`, with initial values `false`.
//
// Alone, these state objects and setters would be only moderately useful. This
// hook also returns several convenient state updaters (e.g., `onChange`
// handlers) that implement the cascading logic. The user could conceivably
// ignore these and roll their own from the states and setters returned, but
// why? Specifically these are:
//
// `moveOrderItemDown`: Make a handler to change the selector order by moving
// a specified item downstream one position (i.e., to the next higher index).
//
// `selectorCanReplace`: Compute a Boolean indicating whether a selector is
// permitted to replace its own value. The condition is that all upstream
// selectors have settled.
//
// `handleChangeValue`: Make a handler to change a specified selector value.
// Update both the selector value and the `isSettled` values accordingly.
//
// `handleNoChangeValue`: Make a handler for the case that a selector is
// permitted to update its value, but did not need to because its current value
// remains valid.
//
// Finally, the hook returns a utility function for computing the constraint
// cascaded down from upstream selector value selections.
// TODO: This is a PCIC react selectors specific computation, but the rest
//  of this hook is agnostic to how its `value` state is used. Therefore this
//  doesn't belong inside this hook, it belongs to the user of this hook.
//
// `selectorConstraint`: Compute the union of the upstream constraints for a
// given selector.
//
// The key to successfully cascading state, as implemented here, is the notion
// of whether a selector's value has settled or is still being updated. This is
// embodied in the `isSettled` state.
//
// Why? Transient invalid states from upstream selectors can fool downstream
// selectors into making self-updates from an apparently invalid state to a
// transiently valid but ultimately incorrect state. A common case of this is
// when, transiently, no options are valid and the selector moves into the
// always-valid null value. To prevent this effect, we introduce the `isSettled`
// flag for each cascaded selector. The change (and no-change) handlers update
// the `isSettled` state so that downstream selectors do not self-update at
// inappropriate times. Prior to this implementation, PRS had a mysterious and
// subtle algorithm for handling this problem, which has now been replaced by
// this (I sincerely hope) clearer one that is also exposed for the user to
// examine and potentially modify.

export const useCascadingSelectorState = (initialOrder, initialState = {}) => {
  // Selector order state.
  const [order, setOrder] = useImmer(initialOrder);

  // Make a handler to change the selector order by moving the ordering item
  // at `index` downstream one position (i.e., to the next higher index).
  const moveOrderItemDown = index => () => {
    if (index < 0 || index >= order.length - 1) {
      return;
    }
    setOrder(draft => {
      // Swap order[index] and order[index+1]
      draft[index] = order[index + 1];
      draft[index + 1] = order[index];
    });
  }

  // Selector value (currently selected option) state.
  const [value, setValue] = useImmer(
    flow(
      map(name => [name, initialState[name]]),
      fromPairs,
    )(initialOrder)
  );

  // Selector value-settled state.
  const [isSettled, setIsSettled] = useImmer(
    flow(
      map(name => [name, false]),
      fromPairs,
    )(initialOrder)
  );

  // Compute a Boolean indicating whether a selector is permitted to replace
  // its own value. The condition is that all upstream selectors have settled.
  const selectorCanReplace = (selectorId) => flow(
    takeWhile(id => id !== selectorId),
    map(id => isSettled[id]),
    every(Boolean),
  )(order);

  // Make a handler to change a specified selector value. This change may
  // require downstream selectors to update their own values depending on how
  // the constraints cascaded down to them change (possibly making their current
  // value invalid). Hence: Set the selector state value for the specified
  // selector, declare that selector settled, and declare all downstream
  // selectors unsettled.
  const handleChangeValue = selectorId => option => {
    setValue(draft => {
      draft[selectorId] = option;
    });

    setIsSettled(draft => {
      // This selector's value is now settled.
      draft[selectorId] = true;
      // Downstream selectors may need updating because constraints from an
      // upstream selector have changed.
      const downstreamIds = takeRightWhile(
        id => id !== selectorId, order
      );
      for (const id of downstreamIds) {
        draft[id] = false;
      }
    })
  }

  // Make a handler for the case that a selector was allowed to update its
  // value, but did not have to change its value because the current one
  // remains valid. Hence: Change the specified selector's `isSettled` state to
  // `true`, and do nothing else.
  const handleNoChangeValue = selectorId => () => {
    setIsSettled(draft => {
      draft[selectorId] = true;
    });
  }

  // Compute the union of the upstream constraints for a given selector.
  const selectorConstraint = (selectorId) =>
    flow(
      takeWhile(id => id !== selectorId),
      map(id => value[id] && value[id].value.representative),
      objUnion,
    )(order);

  return {
    order,
    setOrder,
    moveOrderItemDown,
    value,
    setValue,
    isSettled,
    setIsSettled,
    handleChangeValue,
    handleNoChangeValue,
    selectorConstraint,
    selectorCanReplace,
  };
}