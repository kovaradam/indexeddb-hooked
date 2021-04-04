import { areParamsEqueal } from './use-read';

test('compareParams', () => {
  function testParamFields(selector: string, vals: [any, any]) {
    const [valA, valB] = vals;
    a[selector] = valA;
    b[selector] = valB;
    expect(areParamsEqueal<any>(a, b)).toBe(false);

    b[selector] = valA;
    expect(areParamsEqueal<any>(a, b)).toBe(true);
  }

  let [a, b] = [undefined, undefined];
  expect(areParamsEqueal<any>(a, b)).toBe(true);

  [a, b] = [null, undefined];
  expect(areParamsEqueal<any>(a, b)).toBe(true);

  [a, b] = [{}, {}];
  expect(areParamsEqueal<any>(a, b)).toBe(true);

  [a, b] = [{}, undefined];
  expect(areParamsEqueal<any>(a, b)).toBe(false);
  [a, b] = [null, {}];
  expect(areParamsEqueal<any>(a, b)).toBe(false);

  [a, b] = [{}, {}];
  let filterA = () => true;
  let filterB = () => true;

  testParamFields('filter', [filterA, filterB]);
  testParamFields('key', ['keyA', 'keyB']);
  testParamFields('direction', ['prev', 'next']);
  testParamFields('index', ['A', 'B']);
  testParamFields('returnWithKey', [true, false]);
  testParamFields('keyRange', [
    { lower: 1, upper: 4 },
    { lower: 1, upper: 3 },
  ]);
  testParamFields('keyRange', [{ lower: 1 }, { lower: 1, upper: 3 }]);
  testParamFields('keyRange', [{ lower: 1 }, { upper: 3 }]);
  testParamFields('keyRange', [{ lower: 1 }, {}]);

  [a, b] = [{ direction: 'next' }, {}];
  expect(areParamsEqueal<any>(a, b)).toBe(false);

  [a, b] = [{ direction: 'next' }, { index: 'A' }];
  expect(areParamsEqueal<any>(a, b)).toBe(false);

  [a, b] = [{ direction: 'next' }, { direction: 'next', index: 'A' }];
  expect(areParamsEqueal<any>(a, b)).toBe(false);
});
