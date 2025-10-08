# Product list

## Table of contents

- [Overview](#overview)
  - [Screenshot and live site URL](#screenshot-and-live-site-url)
- [My process](#my-process)
  - [Timeline](#timeline)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
- [Author](#author)
- [Attribution](#attribution)

## Overview

### Screenshot and live site URL

| Desktop                              | Tablet                             | Mobile                             |
| ------------------------------------ | ---------------------------------- | ---------------------------------- |
| ![desktop](/screenshot/desktop.jpeg) | ![Tablet](/screenshot/tablet.jpeg) | ![Mobile](/screenshot/mobile.jpeg) |

[Live Site URL](https://dezerts.netlify.app)

## My process

### Timeline
- Estimated: 3 days
- Actual: 5 days

### Built with

- HTML
- CSS
- JS

### What I Learned

- The `::backdrop` pseudo-element can be used to style the layer behind a `<dialog>` element.

- The `window.getComputedStyle()` method allows you to get the final computed styles of an element.

- How to use a `Map` in JavaScript.

- When creating multiple promises inside an async function, avoid adding `await` to each one individually. For example:

  ```js
  const promise1 = fetch("url-1").then((r) => r.text());
  const promise2 = fetch("url-2").then((r) => r.json());
  [data1, data2] = await Promise.all([promise1, promise2]);
  ```

  The first two lines run immediately, creating promises and attaching handlers. The actual waiting happens in the third line, where `Promise.all` resolves all promises together.
  This approach is more efficient than awaiting each promise separately, since it allows the requests to run in parallel while still giving you full control over the flow.

- Setting `el.style.property = ''` removes an inline style property, allowing external CSS to take effect again. Alternatively, you can use `el.style.removeProperty('property-name')`.

- If you plan to work with promises and asynchronous operations in JavaScript, learning `async`/`await` as soon as possible is essential. It provides a much cleaner and more effective way to handle async logic compared to chaining `.then()` calls.

- When building a program that mixes synchronous and asynchronous actions but needs to follow a clear step-by-step sequence, define a `main()` function and make it `async`. Inside `main`, you can use `await` for asynchronous functions and call synchronous functions normally.
  This allows you to structure your program like a narrative—clean and sequential.

- In JavaScript, any function that returns a Promise can be awaited. So you can create helper functions that do some async work and return a promise then `await` for that promise to resolve in your `async main` function.

- When styling an open `<dialog>` (e.g., a modal), you might set its position to `absolute` or `fixed` and use `top` or `bottom` to position it—but sometimes this doesn’t work as expected.
  This is because some browsers apply a default `inset: 0;` (from the user-agent stylesheet) to dialog elements. To fix this, override it by setting `inset: unset;`, which then allows `top` and `bottom` properties to work properly.

## Author

- Github - [@aminforouzan](https://github.com/aminforouzan)
- Frontend Mentor - [@AminForouzan](https://www.frontendmentor.io/profile/AminForouzan)

## Attribution

- [Product list challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/product-list-with-cart-5MmqLVAp_d).
