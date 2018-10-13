export const xy2n = (x, y, size) => {
    return (x * size) + y;
};

export const n2xy = (n, size) => {
    const x = Math.floor(n / size);
    const y = n % size;
    return [x, y];
};

export const findLiberties = (goban, n, visited = []) => {
    const visitedCopy = visited.slice();
    visitedCopy.add(n);

    const size = goban.length;
    const [x, y] = n2xy(n, size);

    let liberties = new Set();

    // if point is empty return itself
    if (goban[x][y] === undefined) {
        liberties.add(n);
    } else {
        // or check adjacent points
        const
            n_up = n - size,
            n_down = n + size,
            n_right = n + 1,
            n_left = n - 1;

        if (x > 0 && !visitedCopy.includes(n_up)) { // up
            liberties = liberties && findLiberties(goban, n_up, visitedCopy);
        }
        if (y > 0 && !visitedCopy.includes(n_left)) { // left
            liberties = liberties && findLiberties(goban, n_left, visitedCopy);
        }
        if (x < size - 1 && !visitedCopy.includes(n_down)) { // down
            liberties = liberties && findLiberties(goban, n_down, visitedCopy);
        }
        if (y < size - 1 && !visitedCopy.includes(n_right)) { // right
            liberties = liberties && findLiberties(goban, n_right, visitedCopy);
        }
    }

    return liberties;
};