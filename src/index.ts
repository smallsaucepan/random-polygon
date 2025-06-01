import { Delaunay } from "d3-delaunay";
import {
  generateBiasedPointsInCircle,
  generatePointsInBbox,
  getBoundaryEdges,
  getEdgeKey,
  getEdgeMap,
  reorderBoundary,
} from "./util.js";

function randomPolygon(
  numSides: number,
  radius: number,
  options?: object,
): [number, number][] | null;

function randomPolygon(
  numSides: number,
  bbox: [number, number, number, number],
  options?: object,
): [number, number][] | null;

function randomPolygon(
  numSides: number,
  bboxOrRadius: number | [number, number, number, number],
  options: object = {},
): [number, number][] | null {
  if (numSides < 3) return null;

  // Random points we base the polygon on. Can be generated in a circular shape or within a bounding box.
  let points: [number, number][] = [];

  // Generate a few more points than sides required to give us something to work with. The extra allowance can be configured to influence the shape of the resulting polygon.
  const fudge = Math.ceil(numSides * 0.1);
  const numPoints = numSides + fudge;

  // Generate random points depending on arguments.
  if (Array.isArray(bboxOrRadius)) {
    // bbox
    if (bboxOrRadius.length !== 4) {
      throw new Error(
        `bbox only ${bboxOrRadius.length} elements long. should be 4`,
      );
    }

    points = generatePointsInBbox(numPoints, bboxOrRadius);
  } else {
    // circular
    if (isNaN(bboxOrRadius)) {
      throw new Error(`radius not a number: ${bboxOrRadius}`);
    }
    points = generateBiasedPointsInCircle(numPoints, bboxOrRadius, 0.05);
  }

  let triangles: [number, number, number][] = [];
  const delaunay = Delaunay.from(points);

  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    triangles.push([
      delaunay.triangles[i],
      delaunay.triangles[i + 1],
      delaunay.triangles[i + 2],
    ]);
  }

  let edges = getBoundaryEdges(triangles);

  // We might run out of options before we exactly match the required number of sides. This flag serves as an escape hatch.
  let stuck = false;

  // Loop until we get what the user asked for, or until we get stuck.
  while (edges.length != numSides && !stuck) {
    let couldntDecrease = false;
    let couldntIncrease = false;

    // If we have more sides than required, find a triangle that forms a "point" on the working boundary polygon, and delete it.
    if (edges.length > numSides) {
      // Total up how many times each point is used across all triangles.
      const pointCount = new Map<number, number>();
      for (const tri of triangles) {
        for (const key of tri) {
          pointCount.set(key, (pointCount.get(key) || 0) + 1);
        }
      }

      // Any points contributing to only one triangle can be removed.
      const removeablePoints: number[] = [];
      for (const entry of pointCount.entries()) {
        if (entry[1] === 1) {
          removeablePoints.push(entry[0]);
        }
      }

      // Remove one of those points at random.
      if (removeablePoints.length > 0) {
        const randomIdx =
          Math.ceil(Math.random() * removeablePoints.length) - 1;
        const randomPointToRemove = removeablePoints[randomIdx];

        triangles = triangles.filter(
          (tri) => !tri.includes(randomPointToRemove),
        );

        // Recalculate the boundary edges.
        edges = getBoundaryEdges(triangles);
      } else {
        couldntDecrease = true;
      }
    }

    // If we have too few edges remove a triangle that forms a "wedge" from the polygon. We lose one segment of the boundary but gain two.
    // Alternatively, if we were trying to decrease the number of edges above but couldn't, try increasing first and loop around again to try decreasing on the revised polygon now that it has some extra bumps.
    if (edges.length < numSides || couldntDecrease) {
      // Gather a set of all the points on the boundary for determining eligible triangles to remove.
      const edgePoints = new Set<number>();
      for (const edge of edges) {
        edgePoints.add(edge[0]);
        edgePoints.add(edge[1]);
      }

      // Gather a map of all the edges that make up the boundary.
      const edgeMap = getEdgeMap(triangles);

      // Identify the indices of triangles we could remove. Eligible triangles have exactly one edge on the boundary.
      // They also cannot have all three points on the boundary. This protects us from accidentally splitting the boundary into two.
      const removeableTriangleIdxs: number[] = triangles
        .map((tri, idx) => {
          let singles = 0;
          const [a, b, c] = tri;
          for (const [u, v] of [
            [a, b],
            [b, c],
            [c, a],
          ] as [number, number][]) {
            const key = getEdgeKey(u, v);
            const count = edgeMap.get(key);
            if (count === 1) {
              singles++;
            }
          }

          return singles === 1 &&
            !(edgePoints.has(a) && edgePoints.has(b) && edgePoints.has(c))
            ? idx
            : undefined;
        })
        .filter((idx) => idx) as number[];

      if (removeableTriangleIdxs.length > 0) {
        const randomIdx =
          Math.ceil(Math.random() * removeableTriangleIdxs.length) - 1;

        triangles = triangles.filter(
          (_, idx) => idx !== removeableTriangleIdxs[randomIdx],
        );

        edges = getBoundaryEdges(triangles);
      } else {
        couldntIncrease = true;
      }
    }

    // If we could neither increase or decrease, OR don't have enough edges and
    // can't increase ...
    // bail with what we have so far after logging a warning message.
    if (
      (couldntDecrease && couldntIncrease) ||
      (couldntIncrease && edges.length < numSides)
    ) {
      console.warn("Unable to proceed, returning best effort");
      stuck = true;
    }
  }

  // Output the edges in order, and return.
  return reorderBoundary(points, edges);
}

export { randomPolygon };
