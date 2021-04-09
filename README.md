# use-states

A wrapper for multiple `useState` and `useRef` calls for React function components.

## Installation

```bash
# npm
npm install use-states

#yarn
yarn add use-states
```

## Usage

### `useStates`

Converts all properties in an object of initial values to be stateful, similar to calling `useState` and `useRef` on each property.

```jsx
import { useStates } from 'use-states';

export default function App() {
  const data = useStates({
    num: 0,
    str: 'abc',
  });

  return (
    <div>
      {/* Notice that you can directly assign to data.str instead of calling a setter function */}
      <input
        type="text"
        value={data.str}
        onChange={(e) => (data.str = e.currentTarget.value)}
      ></input>
      <p>{data.str}</p>

      <input
        type="range"
        value={data.num}
        onChange={(e) => (data.num = e.currentTarget.value)}
      ></input>
      <p>{data.num}</p>
    </div>
  );
}
```

Besides allowing direct assignment, `useStates` wraps each state with a `useRef` container to ensure the newest state can be accessed:

```jsx
import { useEffect } from 'react';
import { useStates } from 'use-states';

export default function App() {
  const data = useStates({
    test: 'old',
  });

  useEffect(() => {
    data.test = 'new';
    console.log(data.test);
    // Using useState causes 'old' to be printed
    // useStates ensures that 'new' is printed
    // by wrapping the state value in a useRef
  }, []);

  return <div>{data.test}</div>;
}
```

### `bindState`

`bindState` is a shorthand for binding a state to an input element.

```jsx
import { useStates, bindState } from 'use-states';

export default function App() {
  const data = useStates({
    num: 0,
    check: true,
  });

  const [num2, setNum2] = useState(0); // for comparison

  return (
    <div>
      {/* Shorthand for onChange and value */}
      {/* append a $ to get a [value, function] array instead of the value only */}
      <input type="range" {...bindState(data.$num)}></input>
      <p>{data.num}</p>

      {/* bindState binds to value by default, but you can supply another prop name */}
      <input type="checkbox" {...bindState(data.$check, 'checked')}></input>
      <p>{data.check + ''}</p>

      {/* Also works with useState */}
      <input type="range" {...bindState(num2, setNum2)}></input>
      <p>{num2}</p>
    </div>
  );
}
```

### `bindStateEffect`

Same as `bindState`, but executes a side effect on state change.

```jsx
import { useStates, bindStateEffect } from 'use-states';

export default function App() {
  const data = useStates({
    str: 'abc',
    check: true,
  });

  return (
    <div>
      <input
        type="text"
        {...bindStateEffect(data.$str, (val) => console.log(val))}
      ></input>
      <p>{data.str}</p>

      {/* can also customize prop name */}
      <input
        type="checkbox"
        {...bindStateEffect(data.$check, 'checked', (val) => console.log(val))}
      ></input>
      <p>{data.check + ''}</p>
    </div>
  );
}
```
