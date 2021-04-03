import {merge, elideShorterThan, reorder} from '..';

describe("merge", () => {
  it("can handle an empty input", () => {
    expect(merge([])).toEqual([])
  })

  it("can handle a point", () => {
    expect(merge([[{x:0,y:0}]])).toEqual([[{x:0,y:0}]])
  })

  it("can handle a single line", () => {
    expect(merge([[{x:0,y:0},{x:1,y:0}]])).toEqual([[{x:0,y:0},{x:1,y:0}]])
  })

  it("doesn't join far-apart lines", () => {
    expect(merge([
      [{x:0,y:0},{x:1,y:0}],
      [{x:0,y:10},{x:1,y:10}]
    ], 0.5)).toEqual([
      [{x:0,y:0},{x:1,y:0}],
      [{x:0,y:10},{x:1,y:10}]
    ])
  })

  it("joins two lines that start & end on the same point", () => {
    expect(merge([
      [{x:0,y:0},{x:1,y:0}],
      [{x:1,y:0},{x:2,y:0}]
    ], 0.5)).toEqual([
      [{x:0,y:0},{x:1,y:0},{x:2,y:0}],
    ])
  })

  it("joins two lines that are separated by less than the tolerance", () => {
    expect(merge([
      [{x:0,y:0},{x:1,y:0}],
      [{x:1.1,y:0},{x:2,y:0}]
    ], 0.5)).toEqual([
      [{x:0,y:0},{x:1,y:0},{x:2,y:0}],
    ])
  })
})

describe("elideShorterThan", () => {
  it("can handle an empty input", () => {
    expect(elideShorterThan([], 1)).toEqual([])
  })

  it("elides a point", () => {
    expect(elideShorterThan([[{x:0,y:0}]], 1)).toEqual([])
  })

  it("does not elide a single long line", () => {
    expect(elideShorterThan([[{x:0,y:0},{x:10,y:0}]], 1)).toEqual([[{x:0,y:0},{x:10,y:0}]])
  })

  it("elides a short line", () => {
    expect(elideShorterThan([[{x:0,y:0},{x:0,y:0}]], 1)).toEqual([])
  })

  it("keeps a long line, elides a short one", () => {
    expect(elideShorterThan([[{x:0,y:0},{x:10,y:0}], [{x:0,y:0}]], 1)).toEqual([[{x:0,y:0},{x:10,y:0}]])
  })

  it("counts the full length of a line", () => {
    const lines = [
      [{x:0,y:0}, {x:1,y:0}, {x:1,y:1}]
    ]
    expect(elideShorterThan(lines, 1.5)).toEqual(lines)
  })
})

describe("reorder", () => {
  it("can handle an empty input", () => {
    expect(reorder([])).toEqual([])
  })

  it("can handle a point", () => {
    expect(reorder([[{x:0,y:0}]])).toEqual([[{x:0,y:0}]])
  })

  it("can handle a single line", () => {
    expect(reorder([[{x:0,y:0},{x:1,y:0}]])).toEqual([[{x:0,y:0},{x:1,y:0}]])
  })

  it("reverses a line", () => {
    expect(reorder([
      [{x:0,y:0}, {x:10,y:0}],
      [{x:0,y:1}, {x:10,y:1}],
    ])).toEqual([
      [{x:0,y:0}, {x:10,y:0}],
      [{x:10,y:1}, {x:0,y:1}],
    ])
  })

  it("reorders lines", () => {
    expect(reorder([
      [{x:0,y:0}, {x:1,y:0}],
      [{x:2,y:0}, {x:3,y:0}],
      [{x:1,y:0}, {x:2,y:0}],
    ])).toEqual([
      [{x:0,y:0}, {x:1,y:0}],
      [{x:1,y:0}, {x:2,y:0}],
      [{x:2,y:0}, {x:3,y:0}],
    ])
  })
})
