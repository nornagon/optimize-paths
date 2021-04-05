// Copied from https://github.com/mourner/rbush-knn to work around esm/webpack issues
import RBush from "rbush";
import Queue from "tinyqueue";

export function knn<T>(tree: RBush<T>, x: number, y: number, n: number, predicate?: (x: T) => boolean, maxDistance?: number) {
    let node = (tree as any).data,
        result = [],
        toBBox = tree.toBBox,
        i, child, dist, candidate;

    let queue = new Queue<any>(undefined, compareDist);

    while (node) {
        for (i = 0; i < node.children.length; i++) {
            child = node.children[i];
            dist = boxDist(x, y, node.leaf ? toBBox(child) : child);
            if (!maxDistance || dist <= maxDistance * maxDistance) {
                queue.push({
                    node: child,
                    isItem: node.leaf,
                    dist: dist
                });
            }
        }

        while (queue.length && queue.peek().isItem) {
            candidate = queue.pop().node;
            if (!predicate || predicate(candidate))
                result.push(candidate);
            if (n && result.length === n) return result;
        }

        node = queue.pop();
        if (node) node = node.node;
    }

    return result;
}

function compareDist(a: {dist: number}, b: {dist: number}) {
    return a.dist - b.dist;
}

function boxDist(x: number, y: number, box: {minX: number, minY: number, maxX: number, maxY: number}) {
    var dx = axisDist(x, box.minX, box.maxX),
        dy = axisDist(y, box.minY, box.maxY);
    return dx * dx + dy * dy;
}

function axisDist(k: number, min: number, max: number) {
    return k < min ? min - k : k <= max ? 0 : k - max;
}
