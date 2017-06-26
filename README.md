# swagger-parser-js

```js
const swaggerJson = require('./path/to/your/swagger.json')
const Schema = require('swagger-parser-js')
const schema = new Schema(swaggerJson)

// get properties about the schema
schema.info()
schema.version()
schema.paths()
...
// you get it...

// the useful methods:
// returns an array of Operations
schema.operations()

// returns an array of Operations and also includes `consumes` and `produces` properties
schema.operationsWithRootInherited()

// returns a map of tags to an array of operations for that tag
schema.operationsWithTags()

// returns a map of tags to objects containing tag details and an array of operations
schema.taggedOperations()

// TODO: document this way better
```
