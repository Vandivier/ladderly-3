---
title: '11. Hook Fundamentals'
author: John Vandivier
---

This article discusses the fundamentals of hook functions in the context of Ladderly's project-based curriculum. The article reviews:

1. What is a hook?
2. Two Core Built-In Hooks
3. A Project-Based Custom Hook in Three Levels of Complexity

## What is a Hook?

A hook is a special function that is invoked as part of the React rendering process.

Hooks have certain naming and implementation conventions, such as a conventional `use` prefix.

An important distinction exists between [built-in hooks](https://react.dev/reference/react/hooks) and custom hooks.

In the Ladderly curriculum, hooks are introduced as part of the Next.js LocalStorage Blog project.

## Two Core Built-In Hooks

Two of the most frequently used hooks are [useState](https://react.dev/reference/react/useState) and [useEffect](https://react.dev/reference/react/useEffect).

These hooks are used across Ladderly projects, including a particular case that will be illustrated in the following section.

Ladderly recommends conventionally calling these and other built-in hooks with their object container name, like `React.useState`, in order to keep hook origin clear in larger projects and to keep them distinct from custom hooks.

Please do refer to the official documentation on the hooks. Here are some additional notes that students have found helpful:

1. `useEffect` creates side effects.
   1. A side effect is a logical operation that is not directly returned to the client or consumer. The client or consumer can operate in total ignorance of the side effect.
   2. Baking cookies is an analogy. A person might bake cookies with the direct purpose of eating cookies, but as a side effect the house might end up smelling like cookies. Whether or not the house smells like cookies does not determine the ability to actually eat cookies.
   3. Side effects often involve calling systems outside of React itself to send or receive data.
      1. Those external systems can be client-side or they might have their own remote server. `useEffect` can wrap async code.
      2. In the next section we look at a use case involving [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
      3. Another common use case is the use case of an enterprise logger. In this case, our software logs something to the server, but the React render chain doesn't directly know or care about any such logs.
2. `useState` enables state management, data manipulation, and data persistence.
   1. [CRUD operations](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) describe data manipulation. `useState` provides two return values which can support all CRUD operations.
   2. Each of those topics can be talked about at length. You should spend at least thirty minutes applying [search techniques](https://www.youtube.com/watch?v=oHQiJ3kq52M) to learn more about these topics outside of the Ladderly website.
   3. A simple way to think about application state is that it is the data which alters the way users view and use your website.
      1. Authentication state is one common and important kind of state because many applications allow users to see and do different things when they are logged in.
      2. Color themes including dark mode and light mode and language state are also examples of application state. Your site can have an English state and a Spanish state which changes the way the site looks.

## A Project-Based Custom Hook in Three Levels of Complexity

The Ladderly curriculum involves building a [next-localstorage-blog](https://github.com/Vandivier/next-localstorage-blog) as a way to get familiar with Next.js and CRUD operations without needing a runtime server and database.

As part of that project, students build a custom hook called `useLocalStorage` which supports localStorage-based authentication and blog article manipulation.

In this section, I transcribe a prompt conversation with GPT-4. I recommend you read this entire article, not just this section, twice. This is for two reasons:

1. GPT-4 begins with a complex implementation and I strip the complexity away with chained prompts. This means you will see the simplest implementation last. After you understand that, it will be easier to understand the former implementations.
2. After you have seen these implementations, reviewing earlier sections which discuss hooks at a higher level will make more sense and the repetition between low and high level descriptions will lead to stronger concept reinforcement.

### The Transcript:

User:
For a Next.js application using the app router, provide an example implementation of a custom `useLocalStorage.ts` hook. As a matter of style, call built-in hooks explicitly on their object container, like `React.useState` instead of importing them individually.

ChatGPT:
Below is an example implementation of a custom useLocalStorage hook for a Next.js application that adheres to the style of calling built-in hooks explicitly on their object container (React.useState, React.useEffect, etc.). This approach is particularly useful for distinguishing React hooks from custom hooks or other functions.

This custom hook, useLocalStorage, allows you to store a value in localStorage so that it persists across browser sessions. It also synchronizes the state within the component whenever the stored value changes.

Implementation of useLocalStorage.ts

```typescript
import React from 'react'

/**
 * A hook that manages a piece of state that is synchronized with localStorage.
 * @param key The key under which to store the value in localStorage.
 * @param initialValue The initial value or a function that returns it if the key does not exist.
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Define a state managed by this hook
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    try {
      // Get from localStorage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item
        ? JSON.parse(item)
        : initialValue instanceof Function
          ? initialValue()
          : initialValue
    } catch (error) {
      // If error also return initialValue
      console.error(error)
      return initialValue instanceof Function ? initialValue() : initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: React.Dispatch<React.SetStateAction<T>> = React.useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        // Save state
        setStoredValue(valueToStore)
        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        // A more advanced implementation could handle errors, for example by retrying to save the value.
        console.error(error)
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue]
}

export default useLocalStorage
```

Key Features of the useLocalStorage Hook:

1. Lazy Initialization: The hook initializes the state lazily. The state will only get the value from localStorage when it is first used. This is achieved through a function passed to React.useState().
2. Error Handling: Basic error handling is included, which logs errors to the console if there are issues accessing localStorage or parsing stored values.
3. Synchronization with localStorage: The state is automatically synchronized with localStorage using React.useEffect() and React.useState() to ensure that updates to the state are reflected in localStorage.
4. Function Updates: The setter function setValue can accept a new state value directly or a function that updates the state based on the previous value, similar to React.setState().

This hook can be directly used in any React component to manage state that needs to persist across sessions. It's particularly useful for preferences, session states, or any data that should be retained locally.

User:
Now create a simpler useLocalStorage.js without types to illustrate the difference between JavaScript and TypeScript implementation.

ChatGPT:
Below is a simpler version of the useLocalStorage hook implemented in JavaScript. This version omits the TypeScript types and annotations, providing a more straightforward example of how the same functionality can be achieved using plain JavaScript. This example still follows the stylistic preference of calling React hooks explicitly on the React object.

Implementation of useLocalStorage.js

```javascript
import React from 'react'

/**
 * A hook that manages a piece of state that is synchronized with localStorage.
 * @param key The key under which to store the value in localStorage.
 * @param initialValue The initial value or a function that returns it if the key does not exist.
 */
function useLocalStorage(key, initialValue) {
  // Define a state managed by this hook
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      // Get from localStorage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item
        ? JSON.parse(item)
        : initialValue instanceof Function
          ? initialValue()
          : initialValue
    } catch (error) {
      // If error also return initialValue
      console.error(error)
      return initialValue instanceof Function ? initialValue() : initialValue
    }
  })

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = React.useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        // Save state
        setStoredValue(valueToStore)
        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        // A more advanced implementation could handle errors, for example by retrying to save the value.
        console.error(error)
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue]
}

export default useLocalStorage
```

Differences from the TypeScript Version

1. Type Annotations Removed: The TypeScript version includes type annotations for parameters, return types, and state management. These types help enforce data consistency and facilitate developer tools' ability to provide intelligent code completion and error detection. The JavaScript version lacks these annotations, which makes it more flexible but also less safe regarding data type expectations.
2. Simplicity and Flexibility: Without TypeScript's strict type enforcement, the JavaScript version can be easier for some developers to work with, especially those not familiar with TypeScript or those working on smaller projects without complex data structures.
3. Error Handling and Debugging: The lack of type checking at compile-time means that errors related to incorrect data types might only be caught at runtime, making debugging potentially more challenging.

This version works just like the TypeScript one but is more suitable for environments where TypeScript is not used, allowing for rapid prototyping and development in plain JavaScript.

User:
Provide an even simpler form that doesn't include comments, error handling, or callback wrapping.

ChatGPT:
Here's an even simpler version of the useLocalStorage hook implemented in JavaScript, stripped down to the bare essentials without comments, error handling, or the use of React.useCallback for wrapping the setter function. This minimalist approach focuses solely on the core functionality:

Implementation of useLocalStorage.js

```javascript
import React from 'react'

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = React.useState(() => {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  })

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    window.localStorage.setItem(key, JSON.stringify(valueToStore))
  }

  return [storedValue, setValue]
}

export default useLocalStorage
```

Simplifications Made:

1. No Error Handling: Any issues with localStorage access or JSON parsing will lead to runtime errors that are not caught or logged.
2. No React.useCallback: The setter function is not wrapped in React.useCallback, which means it does not optimize the function's dependency on re-renders. This might result in less efficient rendering behavior in components that use this hook extensively, especially in large applications.
3. No Comments: There are no explanatory comments, which makes the code more compact but less understandable for someone not familiar with what it's supposed to do.

This version of the hook is straightforward and might be suitable for personal projects, prototypes, or learning exercises where simplicity is preferred over robustness and performance.
