import {
  createShortSidebarItem,
  getItemTypeFromString,
  removeItemTypeFromString,
  validateItemString,
  convertToProperTzOffset,
} from '../utils'

describe('Creating a short project name testing', () => {
  it('should handle making a project name short with two words, no emoji', () => {
    expect(createShortSidebarItem('Foo Bar')).toEqual('FB')
  })
  it('should handle making a project name short with two words, and an emoji', () => {
    expect(createShortSidebarItem('Foo Bar📊')).toEqual('📊')
  })
  it('should handle making a project name short with one words', () => {
    expect(createShortSidebarItem('Foo')).toEqual('Fo')
  })
  it('should handle one word and an emoji', () => {
    expect(createShortSidebarItem('🐱 Work')).toEqual('🐱')
  })
  it('should handle just an emoji', () => {
    expect(createShortSidebarItem('🗄')).toEqual('🗄')
  })
  it('should handle lots of words', () => {
    expect(createShortSidebarItem('this is a long project name with stuff')).toEqual('TI')
  })
})

describe('Getting an item type from string', () => {
  it('should handle a regular todo item in upper case', () => {
    expect(getItemTypeFromString('TODO Foo Bar')).toEqual('TODO')
  })
  it('should handle a regular todo item in lower case', () => {
    expect(getItemTypeFromString('todo Foo Bar')).toEqual('TODO')
  })
  it('should handle an incomplete todo', () => {
    expect(getItemTypeFromString('tod o')).toEqual('TODO')
  })
  it('should handle a note in upper case', () => {
    expect(getItemTypeFromString('NOTE this is a note')).toEqual('NOTE')
  })
  it('should handle a note in lower case', () => {
    expect(getItemTypeFromString('note this is a note')).toEqual('NOTE')
  })
  it('should handle a todo then note as a todo', () => {
    expect(getItemTypeFromString('todo note')).toEqual('TODO')
  })
  it('should handle a note then todo as a note', () => {
    expect(getItemTypeFromString('note todo')).toEqual('NOTE')
  })
})

describe('Removing an item type from a string', () => {
  it('should handle a regular todo item in upper case', () => {
    expect(removeItemTypeFromString('TODO Foo Bar')).toEqual('Foo Bar')
  })
  it('should handle a regular todo item in lower case', () => {
    expect(removeItemTypeFromString('todo Foo Bar')).toEqual('Foo Bar')
  })
  it('should handle a note item', () => {
    expect(removeItemTypeFromString('note Foo Bar')).toEqual('Foo Bar')
  })
  it('should fail on a random item', () => {
    expect(removeItemTypeFromString('cat Foo Bar')).toEqual(null)
  })
})

describe('Validation of items', () => {
  it('should handle a regular todo item in upper case', () => {
    expect(validateItemString('TODO Foo Bar')).toEqual(true)
  })
  it('should handle a regular todo item in lower case', () => {
    expect(validateItemString('todo Foo Bar')).toEqual(true)
  })
  it('should handle a note item in lower case', () => {
    expect(validateItemString('note Foo Bar')).toEqual(true)
  })
  it('should handle a note item in upper case', () => {
    expect(validateItemString('NOTE Foo Bar')).toEqual(true)
  })
  it('should fail on a combined note/todo', () => {
    expect(validateItemString('notetodo fjdakslfdajsl')).toEqual(false)
  })
  it('should fail on a combined todo/note', () => {
    expect(validateItemString('todonote fjdakslfdajsl')).toEqual(false)
  })
  it('should fail on a todo stretched across two words', () => {
    expect(validateItemString('tod o bar')).toEqual(false)
  })
  it('should fail on a note stretched across two words', () => {
    expect(validateItemString('not e bar')).toEqual(false)
  })
  it('should fail on a random item', () => {
    expect(validateItemString('cat Foo Bar')).toEqual(false)
  })
})

describe('TZ conversion', () => {
  it('should handle a positive int timezone', () => {
    expect(convertToProperTzOffset('2')).toEqual('+02')
  })
  it('should handle a positive fractional timezone', () => {
    expect(convertToProperTzOffset('2.5')).toEqual('+0230')
  })
  it('should handle a negative fractional timezone', () => {
    expect(convertToProperTzOffset('-2.5')).toEqual('-0230')
  })
  it('should handle a negative int timezone', () => {
    expect(convertToProperTzOffset('-2')).toEqual('-02')
  })
  it('should handle a 0', () => {
    expect(convertToProperTzOffset('0')).toEqual('+00')
  })
  it('should handle a positive 0', () => {
    expect(convertToProperTzOffset('+0')).toEqual('+00')
  })
  it('should handle a negative 0', () => {
    expect(convertToProperTzOffset('-0')).toEqual('+00')
  })
  it('should throw on a ridiculous high int', () => {
    expect(() => {
      convertToProperTzOffset('23423543543')
    }).toThrow()
  })
  it('should throw on a ridiculous small int', () => {
    expect(() => {
      convertToProperTzOffset('-23423543543')
    }).toThrow()
  })
})