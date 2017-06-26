const forEach = require('lodash.foreach')
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

module.exports = Schema
