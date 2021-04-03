# optimize-paths

Optimize-paths reorders, filters and merges polylines, for example in
preparation to send to a pen plotter.

To use with SVGs, first convert the SVG to linear paths with
[flatten-svg](https://github.com/nornagon/flatten-svg).

## Installation

```
$ npm install optimize-paths
```

## Usage

```js
import { reorder, elideShort, merge } from 'optimize-paths'

const paths = [
  [{x: 0, y: 0}, {x: 10, y: 10}, {x: 20, y: 10}],
  // ...
]

const elided = elideShorterThan(paths, 0.5)
const reordered = reorder(elided)
const merged = merge(reordered, /* tolerance = */ 0.5)
```

## API

### Struct: Vec2

All points are represented as objects of type `{ x: number, y: number }`.

### elideShorterThan(paths, minimumPathLength)

* `paths: Vec2[][]` - List of paths to filter
* `minimumPathLength: number` - Paths whose length is less than this value will be filtered out.

Returns `Vec2[][]` - A new path list, with short paths excluded.

Filters out paths shorter than a certain length.

### reorder(paths)

* `paths: Vec2[][]` - List of paths to reorder

Returns `Vec2[][]` - A new path list, reordered for minimal pen-up travel time.

Reorders paths greedily, attempting to minimize the amount of pen-up travel time.

### merge(paths[, tolerance])

* `paths: Vec2[][]` - List of paths to join
* `tolerance: number` - When the endpoints of adjacent paths are closer than this, they will be joined into one path. Defaults to 0.5.

Returns `Vec2[][]` - A new path list, with nearby paths merged.

Joins adjacent pairs of pointLists where the first ends within tolerance of
where the second begins. e.g. with tolerance >= 0.1,
`[[{x: 0, y: 0}, {x: 10, y: 0}], [{x: 10.1, y: 0}, {x: 20, y: 0}]]` becomes
`[[{x: 0, y: 0}, {x: 10, y: 0}, {x: 20, y: 0}]]`.
