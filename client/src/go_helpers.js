export const xy2n = (x, y, size) => (x * size) + y;

export const n2xy = (n, size) => {
  const x = Math.floor(n / size);
  const y = n % size;
  return [x, y];
};

export const findGroup = (goban, n, isBlackOpt = undefined, visited = []) => {
  const visitedCopy = visited.slice();
  visitedCopy.push(n);

  const size = goban.length;
  const [x, y] = n2xy(n, size);

  let isBlack;
  if (isBlackOpt === undefined) {
    // set current color if not set
    isBlack = (goban[x][y] % 2 === 0);
  } else {
    isBlack = isBlackOpt;
  }

  let currentGroup = [];

  // if point is empty return itself
  if (goban[x][y] !== undefined && isBlack === (goban[x][y] % 2 === 0)) {
    currentGroup.push(n);

    const
      nUp = n - size;


    const nLeft = n - 1;


    const nDown = n + size;


    const nRight = n + 1;

    if (x > 0 && !visitedCopy.includes(nUp)) { // up
      currentGroup = currentGroup.concat(findGroup(goban, nUp, isBlack, visitedCopy));
    }
    if (y > 0 && !visitedCopy.includes(nLeft)) { // left
      currentGroup = currentGroup.concat(findGroup(goban, nLeft, isBlack, visitedCopy));
    }
    if (x < size - 1 && !visitedCopy.includes(nDown)) { // down
      currentGroup = currentGroup.concat(findGroup(goban, nDown, isBlack, visitedCopy));
    }
    if (y < size - 1 && !visitedCopy.includes(nRight)) { // right
      currentGroup = currentGroup.concat(findGroup(goban, nRight, isBlack, visitedCopy));
    }
  }

  return currentGroup;
};

export const findLiberties = (goban, n) => {
  const size = goban.length;

  const group = findGroup(goban, n);

  const liberties = new Set();
  group.forEach((groupStoneN) => {
    const [x, y] = n2xy(groupStoneN, size);
    const
      nUp = groupStoneN - size;


    const nLeft = groupStoneN - 1;


    const nDown = groupStoneN + size;


    const nRight = groupStoneN + 1;

    if (x > 0 && !group.includes(nUp) && goban[x - 1][y] === undefined) { // up
      liberties.add(nUp);
    }
    if (y > 0 && !group.includes(nLeft) && goban[x][y - 1] === undefined) { // left
      liberties.add(nLeft);
    }
    if (x < size - 1 && !group.includes(nDown) && goban[x + 1][y] === undefined) { // down
      liberties.add(nDown);
    }
    if (y < size - 1 && !group.includes(nRight) && goban[x][y + 1] === undefined) { // right
      liberties.add(nRight);
    }
  });
  return liberties;
};

export const captureGroup = (goban, n) => {
  const size = goban.length;

  const group = findGroup(goban, n).map(groupN => n2xy(groupN, size));

  group.forEach(([x, y]) => {
    // eslint-disable-next-line no-param-reassign
    goban[x][y] = undefined;
  });

  return group.length;
};

export const goban2boolarray = goban => goban.map(gobanRow => gobanRow.map((point) => {
  if (!Number.isNaN(point)) {
    return point % 2;
  }
  return undefined;
}));

export const isGobanEqual = (goban1, goban2) => {
  const goban1b = goban2boolarray(goban1);
  const goban2b = goban2boolarray(goban2);
  return goban1b.length === goban2b.length && goban1b.every((goban1row, i) => {
    const goban2row = goban2b[i];
    return (
      goban1row.length === goban2row.length
      && goban1row.every((value, j) => value === goban2row[j])
    );
  });
};

export const updateGoban = (sourceGoban, move, x, y, pass) => {
  const gobanSize = sourceGoban.length;

  // deep copy of current goban state
  const goban = sourceGoban.map(gobanRow => gobanRow.slice());

  // pass
  if (pass) {
    return { goban, captured: 0 };
  }

  // the place is taken
  if (goban[x][y] !== undefined) {
    return { goban: undefined, captured: undefined, error: 'the point is taken' };
  }

  goban[x][y] = move;

  let captured = 0;

  const updatedGroup = findGroup(goban, xy2n(x, y, gobanSize));

  for (let i = 0; i < gobanSize; i += 1) {
    for (let j = 0; j < gobanSize; j += 1) {
      const n = xy2n(i, j, gobanSize);
      if (goban[i][j] !== undefined && !updatedGroup.includes(n)) {
        const hasLiberties = findLiberties(goban, n).size > 0;
        if (!hasLiberties) {
          const capturedCount = captureGroup(goban, n);
          captured += capturedCount;
        }
      }
    }
  }

  const isSuicideMove = findLiberties(goban, xy2n(x, y, gobanSize)).size === 0;
  if (isSuicideMove) {
    return { goban: false, captured: 0, error: 'suicide move is not allowed' };
  }

  return { goban, captured, error: undefined };
};
