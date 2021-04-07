import { areParamsEqual } from '../src/api/use-read';

test('compareParams', () => {
  function testParamFields(selector: string, vals: [any, any]) {
    const [valA, valB] = vals;
    a[selector] = valA;
    b[selector] = valB;
    expect(areParamsEqual<any>(a, b)).toBe(false);

    b[selector] = valA;
    expect(areParamsEqual<any>(a, b)).toBe(true);
  }

  let [a, b] = [undefined, undefined];
  expect(areParamsEqual<any>(a, b)).toBe(true);

  [a, b] = [null, undefined];
  expect(areParamsEqual<any>(a, b)).toBe(true);

  [a, b] = [{}, {}];
  expect(areParamsEqual<any>(a, b)).toBe(true);

  [a, b] = [{}, undefined];
  expect(areParamsEqual<any>(a, b)).toBe(false);
  [a, b] = [null, {}];
  expect(areParamsEqual<any>(a, b)).toBe(false);

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
  expect(areParamsEqual<any>(a, b)).toBe(false);

  [a, b] = [{ direction: 'next' }, { index: 'A' }];
  expect(areParamsEqual<any>(a, b)).toBe(false);

  [a, b] = [{ direction: 'next' }, { direction: 'next', index: 'A' }];
  expect(areParamsEqual<any>(a, b)).toBe(false);
});
