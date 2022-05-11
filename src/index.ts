import { Vec2, vlen, vsub } from "./vec";
import { knn } from "./knn";
import RBush from "rbush";

function dropWhile<T>(a: T[], f: (t: T) => boolean): T[] {
  return a.slice(a.findIndex((x) => !f(x)));
}

/**
 * Joins adjacent pairs of pointLists where the first ends within tolerance of where the second begins.
 *
 * e.g. with tolerance >= 0.1,
 * `[[{x: 0, y: 0}, {x: 10, y: 0}], [{x: 10.1, y: 0}, {x: 20, y: 0}]]` becomes
 * `[[{x: 0, y: 0}, {x: 10, y: 0}, {x: 20, y: 0}]]`.
 *
 * @param pointLists List of paths to join
 * @param tolerance When the endpoints of adjacent paths are closer than this, they will be joined into one path.
 * @return The optimized path list.
 */
export function merge(pointLists: Vec2[][], tolerance: number = 0.5): Vec2[][] {
  if (pointLists.length === 0) return [];
  const tol2 = tolerance * tolerance;
  const pl = pointLists.slice()
  const result = [pl.shift()!]
  while (pl.length) {
    const l = result[result.length - 1]
    const n = pl.shift()!
    const lp = l[l.length - 1]
    const np = n[0]
    // inline d = vlen2(vsub(lp, np))
    const dx = lp.x - np.x
    const dy = lp.y - np.y
    const d = dx * dx + dy * dy
    if (d <= tol2) {
      result[result.length - 1] = result[result.length - 1].concat(
        dropWhile(n, (v) => {
          // inline d = vlen2(vsub(lp, v))
          const dx = lp.x - v.x
          const dy = lp.y - v.y
          const d = dx * dx + dy * dy
          return d <= tol2
        })
      )
    } else {
      result.push(n)
    }
  }
  return result
}

function pathLength(pointList: Vec2[]): number {
  if (pointList.length <= 1) { return 0; }
  let length = 0;
  let lastPoint = pointList[0];
  for (let i = 1; i < pointList.length; i++) {
    length += vlen(vsub(lastPoint, pointList[i]));
    lastPoint = pointList[i];
  }
  return length;
}

/**
 * Filters out paths shorter than a certain length.
 *
 * @param pointLists List of paths to filter
 * @param minimumPathLength Paths whose length is less than this value will be filtered out.
 * @returns A new point list, with short paths excluded.
 */
export function elideShorterThan(pointLists: Vec2[][], minimumPathLength: number): Vec2[][] {
  return pointLists.filter((pl) => pathLength(pl) >= minimumPathLength);
}

function* range(lo: number, hi: number) {
  for (let i = lo; i < hi; i++) yield i
}

/** Reorder paths greedily, attempting to minimize the amount of pen-up travel time. */
export function reorder(pointLists: Vec2[][]): Vec2[][] {
  if (pointLists.length === 0) { return pointLists; }

  const pt = (i: number): Vec2 =>
    i % 2 === 0
    ? pointLists[(i / 2)|0][0]
    : pointLists[(i / 2)|0][pointLists[(i / 2)|0].length - 1]

  class PointRBush extends RBush<number> {
    toBBox(i: number) { const {x, y} = pt(i); return {minX: x, minY: y, maxX: x, maxY: y}; }
    compareMinX(a: number, b: number) { return pt(a).x - pt(b).x; }
    compareMinY(a: number, b: number) { return pt(a).y - pt(b).y; }
  }

  const tree = new PointRBush
  tree.load([...range(2, pointLists.length * 2)])

  const sortedPointLists: Vec2[][] = [];
  sortedPointLists.push(pointLists[0]);
  let cur = pt(1)
  let n = pointLists.length * 2 - 2
  while (n) {
    const [nn] = knn(tree, cur.x, cur.y, 1)
    const plId = (nn/2)|0
    tree.remove(plId * 2)
    tree.remove(plId * 2 + 1)
    sortedPointLists.push(
      nn % 2 === 0
        ? pointLists[plId]
        : pointLists[plId].slice().reverse()
    )
    
    // if nn points to the beginning of a path, next search is from end of the path
    // if nn points to the end of a path, next search is from beginning of the path
    cur = pt(nn % 2 === 0 ? nn + 1 : nn - 1)
    n -= 2
  }
  return sortedPointLists;
}
