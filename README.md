# Formson

Formson is a FormData to JSON converter.

It supports:

- Dot notation to create nestable objects
- Square bracket notation to create arrays
- Mixed object/array structures

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

## Examples

### Basic example

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
          alert(JSON.stringify(json));
        });
    </script>
  </body>
</html>
```

### Dot notation

Dot notation uses periods (`.`) to create nested objects.

```html
<form>
  <input name="user.firstName" value="John" />
  <input name="user.lastName" value="Doe" />
</form>
```

This will result in the following JSON structure:

```json
{
  "user": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Square bracket notation

Square bracket notation uses square brackets (`[]`) to create arrays and nested objects.

```html
<form>
  <input name="users[0]" value="Alice" />
  <input name="users[1]" value="Bob" />
  <input name="users[2]" value="Charlie" />
</form>
```

This will result in the following JSON structure:

```json
{
  "users": ["Alice", "Bob", "Charlie"]
}
```

### Complex structure

You can mix dot and square bracket notation to create complex structures.

```html
<form>
  <input type="text" name="user.name" value="John Doe" />

  <input type="text" name="user.skills[0]" value="JavaScript" />
  <input type="text" name="user.skills[1]" value="TypeScript" />
    
  <input type="text" name="user.address.street" value="123 Main St" />
  <input type="text" name="user.address.city" value="Anytown" />
    
  <input type="text" name="user.projects[0].name" value="Project A" />
  <input type="text" name="user.projects[0].tasks[0]" value="Task 1" />
  <input type="text" name="user.projects[0].tasks[1]" value="Task 2" />
  <input type="text" name="user.projects[1].name" value="Project B" />
  <input type="text" name="user.projects[1].tasks[0]" value="Task 3" />
  <button type="submit">Submit</button>
</form>
```

This will result in the following JSON structure:

```json
{
  "user": {
    "name": "John Doe",
    "skills": ["JavaScript", "TypeScript"],
    "address": {
      "street": "123 Main St",
      "city": "Anytown"
    },
    "projects": [
      {
        "name": "Project A",
        "tasks": ["Task 1", "Task 2"]
      },
      {
        "name": "Project B",
        "tasks": ["Task 3"]
      }
    ]
  }
}
```

## License

[MIT](https://opensource.org/licenses/MIT)
