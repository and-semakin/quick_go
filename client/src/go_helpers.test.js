import {xy2n, n2xy, findLiberties} from './go_helpers';

it('xy2n returns 0 for (0, 0) with any size', () => {
    expect(xy2n(0, 0, 0)).toEqual(0);
    expect(xy2n(0, 0, 9)).toEqual(0);
    expect(xy2n(0, 0, 13)).toEqual(0);
    expect(xy2n(0, 0, 19)).toEqual(0);
});