import {
  xy2n, n2xy, findGroup, findLiberties, captureGroup,
} from './go_helpers';

it('xy2n returns 0 for (0, 0) with any size', () => {
  expect(xy2n(0, 0, 0)).toEqual(0);
  expect(xy2n(0, 0, 9)).toEqual(0);
  expect(xy2n(0, 0, 13)).toEqual(0);
  expect(xy2n(0, 0, 19)).toEqual(0);
});

it('xy2n returns 1 for (0, 1) with any size', () => {
  expect(xy2n(0, 1, 0)).toEqual(1);
  expect(xy2n(0, 1, 9)).toEqual(1);
  expect(xy2n(0, 1, 13)).toEqual(1);
  expect(xy2n(0, 1, 19)).toEqual(1);
});

it('xy2n returns correct value for (1, 1) with any size', () => {
  expect(xy2n(1, 1, 0)).toEqual(1);
  expect(xy2n(1, 1, 9)).toEqual(10);
  expect(xy2n(1, 1, 13)).toEqual(14);
  expect(xy2n(1, 1, 19)).toEqual(20);
});

it('n2xy returns correct value for 0 with any size', () => {
  expect(n2xy(0, 9)).toEqual([0, 0]);
  expect(n2xy(0, 13)).toEqual([0, 0]);
  expect(n2xy(0, 19)).toEqual([0, 0]);
});

it('n2xy returns correct value for 1 with any size', () => {
  expect(n2xy(1, 9)).toEqual([0, 1]);
  expect(n2xy(1, 13)).toEqual([0, 1]);
  expect(n2xy(1, 19)).toEqual([0, 1]);
});

it('n2xy returns correct value for (1, 1) with any size', () => {
  expect(n2xy(10, 9)).toEqual([1, 1]);
  expect(n2xy(14, 13)).toEqual([1, 1]);
  expect(n2xy(20, 19)).toEqual([1, 1]);
});

// empty point
const x = undefined;

it('findLiberties finds liberties for a single stone', () => {
  const goban = [
    [x, x, x],
    [x, 1, x],
    [x, x, x],
  ];
  expect(findLiberties(goban, 0)).toEqual(new Set());
  expect(findLiberties(goban, 1)).toEqual(new Set());
  expect(findLiberties(goban, 2)).toEqual(new Set());
  expect(findLiberties(goban, 3)).toEqual(new Set());
  expect(findLiberties(goban, 4)).toEqual(new Set([1, 3, 5, 7]));
  expect(findLiberties(goban, 5)).toEqual(new Set());
  expect(findLiberties(goban, 6)).toEqual(new Set());
  expect(findLiberties(goban, 7)).toEqual(new Set());
  expect(findLiberties(goban, 8)).toEqual(new Set());
});

it('findLiberties finds liberties for multiple stones', () => {
  const goban = [
    [x, 1, x],
    [1, 1, x],
    [x, x, x],
  ];
  expect(findLiberties(goban, 0)).toEqual(new Set());
  expect(findLiberties(goban, 1)).toEqual(new Set([0, 2, 5, 6, 7]));
  expect(findLiberties(goban, 2)).toEqual(new Set());
  expect(findLiberties(goban, 3)).toEqual(new Set([0, 2, 5, 6, 7]));
  expect(findLiberties(goban, 4)).toEqual(new Set([0, 2, 5, 6, 7]));
  expect(findLiberties(goban, 5)).toEqual(new Set());
  expect(findLiberties(goban, 6)).toEqual(new Set());
  expect(findLiberties(goban, 7)).toEqual(new Set());
  expect(findLiberties(goban, 8)).toEqual(new Set());
});

it('findLiberties finds liberties for a single stone and handles another color', () => {
  const goban = [
    [x, 1, x],
    [x, 0, x],
    [x, x, x],
  ];
  expect(findLiberties(goban, 0)).toEqual(new Set());
  expect(findLiberties(goban, 1)).toEqual(new Set([0, 2]));
  expect(findLiberties(goban, 2)).toEqual(new Set());
  expect(findLiberties(goban, 3)).toEqual(new Set());
  expect(findLiberties(goban, 4)).toEqual(new Set([3, 5, 7]));
  expect(findLiberties(goban, 5)).toEqual(new Set());
  expect(findLiberties(goban, 6)).toEqual(new Set());
  expect(findLiberties(goban, 7)).toEqual(new Set());
  expect(findLiberties(goban, 8)).toEqual(new Set());
});

it('findLiberties finds liberties for a single stone and handles another color', () => {
  const goban = [
    [0, 1, 3],
    [2, x, 5],
    [4, 6, 7],
  ];
  expect(findLiberties(goban, 0)).toEqual(new Set([4]));
  expect(findLiberties(goban, 1)).toEqual(new Set([4]));
  expect(findLiberties(goban, 2)).toEqual(new Set([4]));
  expect(findLiberties(goban, 3)).toEqual(new Set([4]));
  expect(findLiberties(goban, 4)).toEqual(new Set());
  expect(findLiberties(goban, 5)).toEqual(new Set([4]));
  expect(findLiberties(goban, 6)).toEqual(new Set([4]));
  expect(findLiberties(goban, 7)).toEqual(new Set([4]));
  expect(findLiberties(goban, 8)).toEqual(new Set([4]));
});

it('captureGroup deletes single stone', () => {
  const goban = [
    [x, x, x],
    [x, 1, x],
    [x, x, x],
  ];

  expect(captureGroup(goban, 0)).toEqual(0);
  expect(captureGroup(goban, 1)).toEqual(0);
  expect(captureGroup(goban, 2)).toEqual(0);
  expect(captureGroup(goban, 3)).toEqual(0);
  expect(captureGroup(goban, 4)).toEqual(1);
  expect(captureGroup(goban, 5)).toEqual(0);
  expect(captureGroup(goban, 6)).toEqual(0);
  expect(captureGroup(goban, 7)).toEqual(0);
  expect(captureGroup(goban, 8)).toEqual(0);

  expect(goban).toEqual([
    [x, x, x],
    [x, x, x],
    [x, x, x],
  ]);
});

it('captureGroup deletes group', () => {
  const sourceGoban = [
    [2, 4, 6], // black group
    [1, 3, 5], // white group
    [8, 10, 12], // black group
  ];

  const resultGoban = [
    [x, x, x],
    [1, 3, 5], // white group
    [8, 10, 12], // black group
  ];

  [0, 1, 2].forEach((stone) => {
    const copiedGoban = sourceGoban.map(gobanRow => gobanRow.slice());
    expect(captureGroup(copiedGoban, stone)).toEqual(3);
    expect(copiedGoban).toEqual(resultGoban);
  });
});

it('captureGroup deletes group', () => {
  const sourceGoban = [
    [2, 4, 6], // black group
    [1, 3, 5], // white group
    [8, 10, 12], // black group
  ];

  const resultGoban = [
    [2, 4, 6], // black group
    [x, x, x],
    [8, 10, 12], // black group
  ];

  [3, 4, 5].forEach((stone) => {
    const copiedGoban = sourceGoban.map(gobanRow => gobanRow.slice());
    expect(captureGroup(copiedGoban, stone)).toEqual(3);
    expect(copiedGoban).toEqual(resultGoban);
  });
});

it('findGroup find group with a single stone', () => {
  const goban = [
    [x, x, x],
    [x, 1, x],
    [x, x, x],
  ];
  expect(findGroup(goban, 0)).toEqual([]);
  expect(findGroup(goban, 1)).toEqual([]);
  expect(findGroup(goban, 2)).toEqual([]);
  expect(findGroup(goban, 3)).toEqual([]);
  expect(findGroup(goban, 4)).toEqual([4]);
  expect(findGroup(goban, 5)).toEqual([]);
  expect(findGroup(goban, 6)).toEqual([]);
  expect(findGroup(goban, 7)).toEqual([]);
  expect(findGroup(goban, 8)).toEqual([]);
});

it('findGroup find group with multiple stones, doesnt catch stones of another color', () => {
  const goban = [
    [1, 2, 4],
    [3, 5, 6],
    [x, 7, 9],
  ];
  expect(findGroup(goban, 0).sort()).toEqual([0, 3, 4, 7, 8]);
  expect(findGroup(goban, 1).sort()).toEqual([1, 2, 5]);
  expect(findGroup(goban, 2).sort()).toEqual([1, 2, 5]);
  expect(findGroup(goban, 3).sort()).toEqual([0, 3, 4, 7, 8]);
  expect(findGroup(goban, 4).sort()).toEqual([0, 3, 4, 7, 8]);
  expect(findGroup(goban, 5).sort()).toEqual([1, 2, 5]);
  expect(findGroup(goban, 6).sort()).toEqual([]);
  expect(findGroup(goban, 7).sort()).toEqual([0, 3, 4, 7, 8]);
  expect(findGroup(goban, 8).sort()).toEqual([0, 3, 4, 7, 8]);
});
