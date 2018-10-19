export const xy2n = (x, y, size) => {
    return (x * size) + y;
};

export const n2xy = (n, size) => {
    const x = Math.floor(n / size);
    const y = n % size;
    return [x, y];
};

export const findGroup = (goban, n, isBlack = undefined, visited = []) => {
    const visitedCopy = visited.slice();
    visitedCopy.push(n);

    const size = goban.length;
    const [x, y] = n2xy(n, size);

    if (isBlack === undefined) {
        // set current color if not set
        isBlack = (goban[x][y] % 2 === 0);
    }

    let currentGroup = [];

    // if point is empty return itself
    if (goban[x][y] !== undefined && isBlack === (goban[x][y] % 2 === 0)) {
        currentGroup.push(n);

        const
            n_up = n - size,
            n_left = n - 1,
            n_down = n + size,
            n_right = n + 1;

        if (x > 0 && !visitedCopy.includes(n_up)) { // up
            currentGroup = currentGroup.concat(findGroup(goban, n_up, isBlack, visitedCopy));
        }
        if (y > 0 && !visitedCopy.includes(n_left)) { // left
            currentGroup = currentGroup.concat(findGroup(goban, n_left, isBlack, visitedCopy));
        }
        if (x < size - 1 && !visitedCopy.includes(n_down)) { // down
            currentGroup = currentGroup.concat(findGroup(goban, n_down, isBlack, visitedCopy));
        }
        if (y < size - 1 && !visitedCopy.includes(n_right)) { // right
            currentGroup = currentGroup.concat(findGroup(goban, n_right, isBlack, visitedCopy));
        }
    }

    return currentGroup;
}

export const findLiberties = (goban, n) => {
    const size = goban.length;

    const group = findGroup(goban, n);

    let liberties = new Set();
    group.forEach(n => {
        const [x, y] = n2xy(n, size);
        const
            n_up = n - size,
            n_left = n - 1,
            n_down = n + size,
            n_right = n + 1;

        if (x > 0 && !group.includes(n_up) && goban[x-1][y] === undefined) { // up
            liberties.add(n_up);
        }
        if (y > 0 && !group.includes(n_left) && goban[x][y-1] === undefined) { // left
            liberties.add(n_left);
        }
        if (x < size - 1 && !group.includes(n_down) && goban[x+1][y] === undefined) { // down
            liberties.add(n_down);
        }
        if (y < size - 1 && !group.includes(n_right) && goban[x][y+1] === undefined) { // right
            liberties.add(n_right);
        }
    });
    return liberties;
};

export const captureGroup = (goban, n) => {
    const size = goban.length;

    const group = findGroup(goban, n).map(n => n2xy(n, size));
    
    group.forEach(([x, y]) => {
        goban[x][y] = undefined;
    });

    return group.length;
};

export const goban2boolarray = (goban) => {
    return goban.map(gobanRow => gobanRow.map(point => {
        if (!isNaN(point)) {
            return point % 2;
        } else {
            return undefined;
        }
    }));
}

export const isGobanEqual = (goban1, goban2) => {
    goban1 = goban2boolarray(goban1);
    goban2 = goban2boolarray(goban2);
    return goban1.length === goban2.length && goban1.every((goban1row, i) => {
        const goban2row = goban2[i];
        return goban1row.length === goban2row.length && goban1row.every((value, j) => value === goban2row[j]);
    })
}

export const updateGoban = (sourceGoban, move, x, y, pass) => {
    const gobanSize = sourceGoban.length;

    // deep copy of current goban state
    const goban = sourceGoban.map(gobanRow => gobanRow.slice());

    // pass
    if (pass) {
        return {goban: goban, captured: 0};
    }

    // the place is taken
    if (goban[x][y] !== undefined) {
        return {goban: undefined, captured: undefined, error: 'the point is taken'};
    }

    goban[x][y] = move;

    let captured = 0;

    const updatedGroup = findGroup(goban, xy2n(x, y, gobanSize));

    for (let i = 0; i < gobanSize; i++) {
        for (let j = 0; j < gobanSize; j++) {
            const n = xy2n(i, j, gobanSize);
            if (goban[i][j] === undefined ||
                updatedGroup.includes(n)) {
                continue;
            }
            const hasLiberties = findLiberties(goban, n).size > 0;
            if (!hasLiberties) {
                const capturedCount = captureGroup(goban, n);
                captured += capturedCount;
            }
        }
    }

    const isSuicideMove = findLiberties(goban, xy2n(x, y, gobanSize)).size === 0;
    if (isSuicideMove) {
        return { goban: false, captured: 0, error: 'suicide move is not allowed'};
    }

    return { goban: goban, captured: captured, error: undefined };
};