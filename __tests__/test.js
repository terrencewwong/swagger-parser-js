const Schema = require('../src')

describe('swagger-parser-js', () => {
  it('operations', () => {
    const pathParameters = [{ in: 'query', name: 'limit', type: 'number' }]
    const getParameters = [{ in: 'query', name: 'type', type: 'string' }]

    const schema = {
      paths: {
        '/pet': {
          parameters: pathParameters,
          get: {
            summary: 'get a pet',
            parameters: getParameters
          }
        }
      }
    }

    expect(new Schema(schema).operations()).toEqual([
      {
        id: 'get-/pet',
        method: 'get',
        operation: {
          summary: 'get a pet',
          parameters: pathParameters.concat(getParameters)
        },
        path: '/pet'
      }
    ])
  })

  it('operationsWithRootInherited', () => {
    const schema = {
      consumes: 'consumes',
      produces: 'produces',
      paths: {
        '/pet': {
          post: {
            summary: 'Add a new pet to the store'
          }
        }
      }
    }

    expect(new Schema(schema).operationsWithRootInherited()).toEqual([
      {
        id: 'post-/pet',
        method: 'post',
        operation: {
          summary: 'Add a new pet to the store',
          consumes: 'consumes',
          produces: 'produces'
        },
        path: '/pet'
      }
    ])
  })

  it('operationsWithTags', () => {
    const schema = {
      consumes: 'consumes',
      produces: 'produces',
      paths: {
        '/pet': {
          post: {
            summary: 'Add a new pet to the store',
            tags: ['pets']
          }
        },
        '/hipster-things': {
          post: {
            summary: 'some hipster stuff',
            tags: ['carbon-neutral']
          }
        }
      }
    }

    expect(new Schema(schema).operationsWithTags()).toEqual({
      pets: [
        {
          id: 'post-/pet',
          method: 'post',
          operation: {
            summary: 'Add a new pet to the store',
            tags: ['pets'],
            consumes: 'consumes',
            produces: 'produces'
          },
          path: '/pet'
        }
      ],
      'carbon-neutral': [
        {
          id: 'post-/hipster-things',
          method: 'post',
          operation: {
            summary: 'some hipster stuff',
            tags: ['carbon-neutral'],
            consumes: 'consumes',
            produces: 'produces'
          },
          path: '/hipster-things'
        }
      ]
    })
  })

  it('tagDetails', () => {
    const tagDetails = {
      name: 'pets',
      description: 'pets are the best!'
    }
    const schema = {
      tags: [tagDetails]
    }
    expect(new Schema(schema).tagDetails('pets')).toBe(tagDetails)
  })

  it('taggedOperations', () => {
    const schema = {
      tags: [
        {
          name: 'pets',
          description: 'pets are the best!'
        },
        {
          name: 'carbon-neutral',
          description: 'carbon neutral is also the best!'
        }
      ],
      consumes: 'consumes',
      produces: 'produces',
      paths: {
        '/pet': {
          post: {
            summary: 'Add a new pet to the store',
            tags: ['pets']
          }
        },
        '/hipster-things': {
          post: {
            summary: 'some hipster stuff',
            tags: ['carbon-neutral']
          }
        }
      }
    }

    expect(new Schema(schema).taggedOperations()).toEqual({
      pets: {
        tagDetails: {
          name: 'pets',
          description: 'pets are the best!'
        },
        operations: [
          {
            id: 'post-/pet',
            method: 'post',
            operation: {
              summary: 'Add a new pet to the store',
              tags: ['pets'],
              consumes: 'consumes',
              produces: 'produces'
            },
            path: '/pet'
          }
        ]
      },
      'carbon-neutral': {
        tagDetails: {
          name: 'carbon-neutral',
          description: 'carbon neutral is also the best!'
        },
        operations: [
          {
            id: 'post-/hipster-things',
            method: 'post',
            operation: {
              summary: 'some hipster stuff',
              tags: ['carbon-neutral'],
              consumes: 'consumes',
              produces: 'produces'
            },
            path: '/hipster-things'
          }
        ]
      }
    })
  })
})
