function generateBiasedPointsInCircle(
  numPoints: number,
  radius: number,
  biasFactor: number = 1,
): [number, number][] {
  const points: [number, number][] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = 2 * Math.PI * Math.random();
    const r = radius * Math.pow(Math.random(), biasFactor); // biasFactor < 1 means more toward edge
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    points.push([x, y]);
  }

  return points;
}

function generatePointsInBbox(
  numPoints: number,
  bbox: [number, number, number, number],
): [number, number][] {
  return Array.from({ length: numPoints }, () => [
    Math.random(),
    Math.random(),
  ]);
}

function getBoundaryEdges(triangles: number[][]): [number, number][] {
  const edgeMap = getEdgeMap(triangles);

  const boundaryEdges: [number, number][] = [];
  for (const [key, count] of edgeMap.entries()) {
    if (count === 1) {
      const [a, b] = key.split("-").map(Number);
      boundaryEdges.push([a, b]);
    }
  }
  return boundaryEdges;
}

// Generate a key for this edge we can use to add to a map. Always put the smaller index first.
const getEdgeKey = (a: number, b: number) =>
  a < b ? `${a}-${b}` : `${b}-${a}`;

function getEdgeMap(triangles: number[][]): Map<string, number> {
  const edgeMap = new Map<string, number>();

  for (const [a, b, c] of triangles) {
    for (const [u, v] of [
      [a, b],
      [b, c],
      [c, a],
    ] as [number, number][]) {
      const key = getEdgeKey(u, v);
      edgeMap.set(key, (edgeMap.get(key) || 0) + 1);
    }
  }
  return edgeMap;
}

function reorderBoundary(
  points: [number, number][],
  edges: [number, number][],
): [number, number][] {
  const adjacency = new Map<number, number[]>();
  for (const [a, b] of edges) {
    if (!adjacency.has(a)) adjacency.set(a, []);
    if (!adjacency.has(b)) adjacency.set(b, []);
    adjacency.get(a)!.push(b);
    adjacency.get(b)!.push(a);
  }

  const start = edges[0][0];
  const path = [start];
  const visited = new Set<number>([start]);

  let current = start;
  while (true) {
    const neighbors = adjacency.get(current) || [];
    const next = neighbors.find((n) => !visited.has(n));
    if (next === undefined) break;
    path.push(next);
    visited.add(next);
    current = next;
  }

  return path.map((i) => points[i]);
}

export {
  generateBiasedPointsInCircle,
  generatePointsInBbox,
  getBoundaryEdges,
  getEdgeKey,
  getEdgeMap,
  reorderBoundary,
};
