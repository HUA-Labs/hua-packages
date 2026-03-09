import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('object-fit', () => {
  it('resolves object-contain', () => {
    expect(dot('object-contain')).toEqual({ objectFit: 'contain' });
  });
  it('resolves object-cover', () => {
    expect(dot('object-cover')).toEqual({ objectFit: 'cover' });
  });
  it('resolves object-fill', () => {
    expect(dot('object-fill')).toEqual({ objectFit: 'fill' });
  });
  it('resolves object-none', () => {
    expect(dot('object-none')).toEqual({ objectFit: 'none' });
  });
  it('resolves object-scale-down', () => {
    expect(dot('object-scale-down')).toEqual({ objectFit: 'scale-down' });
  });
  it('resolves object-center', () => {
    expect(dot('object-center')).toEqual({ objectPosition: 'center' });
  });
  it('resolves object-top', () => {
    expect(dot('object-top')).toEqual({ objectPosition: 'top' });
  });
  it('resolves object-right-bottom', () => {
    expect(dot('object-right-bottom')).toEqual({ objectPosition: 'right bottom' });
  });
});

describe('flex-basis', () => {
  it('resolves basis-auto', () => {
    expect(dot('basis-auto')).toEqual({ flexBasis: 'auto' });
  });
  it('resolves basis-full', () => {
    expect(dot('basis-full')).toEqual({ flexBasis: '100%' });
  });
  it('resolves basis-1/2', () => {
    expect(dot('basis-1/2')).toEqual({ flexBasis: '50%' });
  });
  it('resolves basis-1/3', () => {
    expect(dot('basis-1/3')).toEqual({ flexBasis: '33.333333%' });
  });
  it('resolves basis from spacing scale (basis-4)', () => {
    expect(dot('basis-4')).toEqual({ flexBasis: '16px' });
  });
  it('resolves basis-0', () => {
    expect(dot('basis-0')).toEqual({ flexBasis: '0px' });
  });
});

describe('place utilities', () => {
  it('resolves place-content-center', () => {
    expect(dot('place-content-center')).toEqual({ placeContent: 'center' });
  });
  it('resolves place-content-between', () => {
    expect(dot('place-content-between')).toEqual({ placeContent: 'space-between' });
  });
  it('resolves place-items-center', () => {
    expect(dot('place-items-center')).toEqual({ placeItems: 'center' });
  });
  it('resolves place-items-stretch', () => {
    expect(dot('place-items-stretch')).toEqual({ placeItems: 'stretch' });
  });
  it('resolves place-self-auto', () => {
    expect(dot('place-self-auto')).toEqual({ placeSelf: 'auto' });
  });
  it('resolves place-self-end', () => {
    expect(dot('place-self-end')).toEqual({ placeSelf: 'end' });
  });
});
