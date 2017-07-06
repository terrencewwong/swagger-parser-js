const forEach = require('lodash.foreach')
const reduce = require('lodash.reduce')
const OPERATION_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch'
]
const DEFAULT_TAG = 'default'

class Schema {
  constructor (spec) {
    this.spec = spec
  }

  info () {
    return this.spec.info
  }

  title () {
    return this.spec.info.title
  }

  description () {
    return this.spec.info.description
  }

  version () {
    return this.spec.info.version
  }

  paths () {
    return this.spec.paths
  }

  operations () {
    const paths = this.paths()

    if (!paths || !Object.keys(paths)) return []

    let list = []

    forEach(paths, (path, pathName) => {
      forEach(path, (operation, method) => {
        if (OPERATION_METHODS.indexOf(method) === -1) {
          return
        }

        list.push({
          path: pathName,
          method,
          operation,
          id: `${method}-${pathName}`
        })
      })
    })

    return list
  }

  operationsWithRootInherited () {
    const operations = this.operations()
    const consumes = this.consumes()
    const produces = this.produces()

    return operations.map(operationObject => {
      const { operation } = operationObject
      if (!operation.consumes) operation.consumes = consumes
      if (!operation.produces) operation.produces = produces
      return Object.assign({}, operationObject, { operation })
    })
  }

  operationsWithTags () {
    const operations = this.operationsWithRootInherited()
    return operations.reduce((taggedMap, operationObject) => {
      const tags = operationObject.operation.tags || []
      if (!tags.length) {
        taggedMap[DEFAULT_TAG]
          ? taggedMap[DEFAULT_TAG].push(operationObject)
          : (taggedMap[DEFAULT_TAG] = [operationObject])
      }

      return tags.reduce((result, tag) => {
        result[tag]
          ? result[tag].push(operationObject)
          : (result[tag] = [operationObject])
        return result
      }, taggedMap)
    }, {})
  }

  tagDetails (tag) {
    const tags = this.tags()
    return tags.find(({ name }) => name === tag)
  }

  taggedOperations () {
    const taggedMap = this.operationsWithTags()

    forEach(taggedMap, (operations, tag) => {
      taggedMap[tag] = {
        tagDetails: this.tagDetails(tag),
        operations
      }
    })

    return taggedMap
  }

  taggedOperationsWithExamples () {
    const taggedMap = this.taggedOperations()

    forEach(taggedMap, ({ operations, tagDetails }, tag) => {
      const operationsWithExamples = operations.map(operation => {
        const { responses } = operation.operation
        if (!responses) return operation

        const response = responses['200']
        if (!response) return operation

        const { schema } = response
        if (!schema) return operation

        const exampleResponse = convertSchemaToExample(schema)

        return Object.assign({}, operation, {
          'x-response-example': exampleResponse
        })
      })

      taggedMap[tag].operations = operationsWithExamples
    })

    return taggedMap
  }

  consumes () {
    return this.spec.consumes
  }

  produces () {
    return this.spec.produces
  }

  security () {
    return this.spec.security
  }

  securityDefinitions () {
    return this.spec.securityDefinitions
  }

  definitions () {
    return this.spec.definitions
  }

  basePath () {
    return this.spec.basePath
  }

  host () {
    return this.spec.host
  }

  schemes () {
    return this.spec.schemes
  }

  tags () {
    return this.spec.tags
  }
}

function convertSwaggerTypeToExample (type, name) {
  switch (type) {
    case 'integer':
      return 0
    case 'number':
      return 0
    case 'boolean':
      return true
    case 'string':
      return name || type
    default:
      return type
  }
}

function convertSchemaToExample (schema = {}, name) {
  // base case, there is an example!
  const { example } = schema
  if (example) return example

  switch (schema.type) {
    case 'object':
      const { properties } = schema
      return reduce(
        properties,
        (example, schema, name) => {
          example[name] = convertSchemaToExample(schema, name)
          return example
        },
        {}
      )
    case 'array':
      const { items } = schema
      return [convertSchemaToExample(items)]
    default:
      return schema.default || convertSwaggerTypeToExample(schema.type, name)
  }
}
module.exports = Schema
