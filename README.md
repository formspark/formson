# Formson

Formson is a FormData to JSON converter.

Features:

- Dot notation for (nested) objects
- Square bracket notation for (nested) arrays
- Support for data structures combining objects and arrays
- Lightweight
- Zero dependencies
- TypeScript support
- 100% test coverage

Sponsored by <a href="https://formspark.io">Formspark</a>, the simple & powerful form solution for developers.

## Installation

Add the Formson script.

```html
<script src="https://unpkg.com/@formspark/formson"></script>
```

You can now use the `Formson.toJSON` function to convert a FormData object to a JSON object.

```javascript
const json = Formson.toJSON(formData);
```

## Example

```html
<!doctype html>
<html lang="en">
  <head>
    <script src="https://unpkg.com/@formspark/formson"></script>
  </head>
  <body>
    <h1>Example</h1>
    <form id="form">
      <input name="firstName" />
      <input name="lastName" />
      <button type="submit">Submit</button>
    </form>

    <script>
      document
        .getElementById("form")
        .addEventListener("submit", function (event) {
          event.preventDefault();
          const formData = new FormData(this);
          const json = Formson.toJSON(formData);
          alert(JSON.stringify(json, null, 2));
        });
    </script>
  </body>
</html>
```

## License

[MIT](https://opensource.org/licenses/MIT)
