import { createShortSidebarItem, convertToProperTzOffset } from '../utils'

describe('Creating a short project name testing', () => {
  it('should handle making a project name short with two words, no emoji', () => {
    expect(createShortSidebarItem('Foo Bar')).toEqual('FB')
  })
  it('should handle making a project name short with one words', () => {
    expect(createShortSidebarItem('Foo')).toEqual('Fo')
  })
  it('should handle lots of words', () => {
    expect(createShortSidebarItem('this is a long project name with stuff')).toEqual('TI')
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
