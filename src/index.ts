import { useRef, useState } from 'react';

/**
 * Provides a shorthand for binding a React state to an input element
 * @param getter The current value of the state
 * @param setter The setter function for the state
 * @param propName The name of the value prop to bind to (defaults to value)
 */
export function bindState(getter: any, setter: (a:any) => void, propName?: string): {
  [key: string]: any,
  onChange: (e:any) => void
};

/**
 * Provides a shorthand for binding a React state to an input element
 * @param array An array containing the current value and the setter function for a state
 *              (basically the array that useState returns)
 * @param propName The name of the value prop to bind to (defaults to value)
 */
export function bindState(array:[any, (a:any) => void], propName?: string): {
  [key: string]: any,
  onChange: (e:any) => void
};

export function bindState(
  arrayOrGetter: any | [any, (a:any) => void],
  setterOrPropName?: string | ((a:any) => void),
  propName?: string,
): {
    [key: string]: any,
    onChange: (e:any) => void
  } {
  if (setterOrPropName === undefined) {
    const [state, setState] = arrayOrGetter;
    return {
      value: state,
      onChange: (e) => setState(e.currentTarget.value),
    };
  }
  if (typeof setterOrPropName === 'string') {
    const [state, setState] = arrayOrGetter;
    return {
      [setterOrPropName]: state,
      onChange: (e) => setState(e.currentTarget[setterOrPropName]),
    };
  }
  if (propName === undefined) {
    return {
      value: arrayOrGetter,
      onChange: (e) => setterOrPropName(e.currentTarget.value),
    };
  }
  return {
    [propName]: arrayOrGetter,
    onChange: (e) => setterOrPropName(e.currentTarget[propName]),
  };
}

/**
 * Provides a shorthand for binding a React state to an input element and
 * executing a side effect on state change
 * @param getter The current value of the state
 * @param setter The setter function for the state
 * @param callback The function to be executed when the state changes
 */
export function bindStateEffect(
  getter: any,
  setter: (a:any) => void,
  callback: (newValue: any) => void
): {
  value: any,
  onChange: (e:any) => void
};

/**
 * Provides a shorthand for binding a React state to an input element and
 * executing a side effect on state change
 * @param getter The current value of the state
 * @param setter The setter function for the state
 * @param fieldName The name of the value prop to bind to (defaults to value)
 * @param callback The function to be executed when the state changes
 */
export function bindStateEffect(
  getter: any,
  setter: (a:any) => void,
  fieldName: string,
  callback: (newValue: any) => void
): {
  [key: string]: any,
  onChange: (e:any) => void
};

/**
 * Provides a shorthand for binding a React state to an input element and
 * executing a side effect on state change
 * @param array An array containing the current value and the setter function for a state
 *              (basically the array that useState returns)
 * @param callback The function to be executed when the state changes
 */
export function bindStateEffect(
  array:[any, (a:any) => void],
  callback: (newValue: any) => void
): {
  value: any,
  onChange: (e:any) => void
};

/**
 * Provides a shorthand for binding a React state to an input element and
 * executing a side effect on state change
 * @param array An array containing the current value and the setter function for a state
 *              (basically the array that useState returns)
 * @param fieldName The name of the value prop to bind to (defaults to value)
 * @param callback The function to be executed when the state changes
 */
export function bindStateEffect(
  array:[any, (a:any) => void],
  fieldName: string,
  callback: (newValue: any) => void
): {
  [key: string]: any,
  onChange: (e:any) => void
};

export function bindStateEffect(
  arrayOrGetter: any | [any, (a:any) => void],
  setterOrFieldName?: string | ((a:any) => void),
  fieldNameOrCallback?: string | ((a:any) => void),
  callback?: (newValue: any) => void,
): {
    [key: string]: any,
    onChange: (e:any) => void
  } {
  if (fieldNameOrCallback === undefined && typeof setterOrFieldName === 'function') {
    const [state, setState] = arrayOrGetter;
    return {
      value: state,
      onChange: (e) => {
        setState(e.currentTarget.value);
        setterOrFieldName(e.currentTarget.value);
      },
    };
  }
  if (
    callback === undefined
    && typeof setterOrFieldName === 'string'
    && typeof fieldNameOrCallback === 'function'
  ) {
    const [state, setState] = arrayOrGetter;
    return {
      [setterOrFieldName]: state,
      onChange: (e) => {
        setState(e.currentTarget[setterOrFieldName]);
        fieldNameOrCallback(e.currentTarget[setterOrFieldName]);
      },
    };
  }
  if (
    callback === undefined
    && typeof setterOrFieldName === 'function'
    && typeof fieldNameOrCallback === 'function'
  ) {
    return {
      value: arrayOrGetter,
      onChange: (e) => {
        setterOrFieldName(e.currentTarget.value);
        fieldNameOrCallback(e.currentTarget.value);
      },
    };
  }
  if (
    typeof setterOrFieldName === 'function'
    && typeof fieldNameOrCallback === 'string'
    && typeof callback === 'function'
  ) {
    return {
      [fieldNameOrCallback]: arrayOrGetter,
      onChange: (e) => {
        setterOrFieldName(e.currentTarget[fieldNameOrCallback]);
        callback(e.currentTarget[fieldNameOrCallback]);
      },
    };
  }
  return {
    value: undefined,
    onChange: undefined,
  };
}

/**
 * Makes every property in an object of initial values to be stateful
 * @param initialValues An object of initial values
 * @returns An object with the same properties but the properties are all stateful
 */
export function useStates(
  initialValues: Record<string, any>,
) : Record<string, any> & Record<`$${string}`, any> {
  const data = {};
  Object.entries(initialValues).forEach(([key, value]) => {
    const [state, setState] = useState.call(this, value);
    const stateContainer = useRef(null);
    stateContainer.current = state;
    data[key] = [stateContainer, (val) => {
      setState(val);
      stateContainer.current = val;
    }];
  });
  const proxy = new Proxy(data, {
    get(target, name, receiver) {
      if (typeof name === 'symbol') {
        return Reflect.get(target, name, receiver);
      }
      if (name === '__isProxy') {
        return true;
      }
      if (name.startsWith('$')) {
        const key = name.substr(1);
        return [target[key][0].current, target[key][1]];
      }
      return target[name][0].current;
    },
    set(target, name, value, receiver) {
      if (typeof name === 'symbol') {
        return Reflect.set(target, name, value, receiver);
      }
      if (name.startsWith('$')) {
        if (!(value instanceof Array)) return false;
        if (value.length < 2) return false;
        const key = name.substr(1);
        target[key] = value;
        return true;
      }
      target[name][1](value);
      return true;
    },
  });
  return proxy;
}
