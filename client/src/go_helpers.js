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
