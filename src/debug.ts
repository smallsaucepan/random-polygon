/*
  {
    const polygonCoords = reorderBoundary(points, edges);

    console.log(
      JSON.stringify({
        type: "FeatureCollection",
        features: [
          ...pointFeatures,
          {
            type: "Feature",
            properties: { stroke: "red", "stroke-width": 4 },
            geometry: {
              type: "Polygon",
              coordinates: [polygonCoords.concat([polygonCoords[0]])], // Close the loop
            },
          },
          ...edgesToGeoJSON(points, edges),
        ],
      }),
    );
  }
  */

/*
  const pointFeatures = [];

  points.map((pt, idx) => {
    pointFeatures.push({
      type: "Feature",
      properties: {
        id: idx,
      },
      geometry: {
        type: "Point",
        coordinates: points[idx],
      },
    });
  });
  */

function edgesToGeoJSON(points: [number, number][], edges: [number, number][]) {
  const features: any[] = [];

  for (const edge of edges) {
    features.push({
      type: "Feature",
      properties: {
        stroke: "yellow",
        "stroke-width": 3,
      },
      geometry: {
        type: "LineString",
        coordinates: [points[edge[0]], points[edge[1]]],
      },
    });
  }
  return features;
}
