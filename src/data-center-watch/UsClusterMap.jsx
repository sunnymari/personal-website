import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const SIZE_RADIUS = {
  largest: 11,
  large: 9,
  medium: 7,
};

function clustersToGeoJSON(clusters) {
  return {
    type: "FeatureCollection",
    features: clusters.map((c) => ({
      type: "Feature",
      properties: {
        name: c.name,
        note: c.note,
        size: c.size,
        radius: SIZE_RADIUS[c.size] ?? 7,
      },
      geometry: {
        type: "Point",
        coordinates: [c.lng, c.lat],
      },
    })),
  };
}

export default function UsClusterMap({
  clusters,
  markerColor = "#8FA876",
  hovered = null,
  onHoverChange,
  visible = true,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onHoverRef = useRef(onHoverChange);
  const hoveredRef = useRef(hovered);

  useEffect(() => {
    onHoverRef.current = onHoverChange;
  }, [onHoverChange]);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
            maxzoom: 19,
          },
          labels: {
            type: "raster",
            tiles: [
              "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "Labels &copy; Esri",
            maxzoom: 19,
          },
          clusters: {
            type: "geojson",
            data: clustersToGeoJSON(clusters),
          },
        },
        layers: [
          {
            id: "satellite",
            type: "raster",
            source: "satellite",
            minzoom: 0,
            maxzoom: 22,
          },
          {
            id: "labels",
            type: "raster",
            source: "labels",
            minzoom: 0,
            maxzoom: 22,
          },
          {
            id: "cluster-glow",
            type: "circle",
            source: "clusters",
            paint: {
              "circle-radius": ["+", ["get", "radius"], 8],
              "circle-color": markerColor,
              "circle-opacity": 0.28,
              "circle-blur": 0.6,
            },
          },
          {
            id: "cluster-core",
            type: "circle",
            source: "clusters",
            paint: {
              "circle-radius": ["get", "radius"],
              "circle-color": markerColor,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#FAF6F0",
              "circle-opacity": 0.95,
            },
          },
        ],
      },
      center: [-98.35, 39.5],
      zoom: 3.35,
      pitch: 48,
      bearing: -12,
      maxBounds: [
        [-130, 22],
        [-65, 52],
      ],
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.dragRotate.enable();
    map.touchZoomRotate.enableRotation();

    const setHover = (name) => {
      if (hoveredRef.current === name) return;
      onHoverRef.current?.(name);
    };

    const onMove = (e) => {
      const feats = map.queryRenderedFeatures(e.point, {
        layers: ["cluster-core", "cluster-glow"],
      });
      if (feats.length) {
        map.getCanvas().style.cursor = "pointer";
        setHover(feats[0].properties.name);
      } else {
        map.getCanvas().style.cursor = "";
        setHover(null);
      }
    };

    const onLeave = () => {
      map.getCanvas().style.cursor = "";
      setHover(null);
    };

    const onClick = (e) => {
      const feats = map.queryRenderedFeatures(e.point, {
        layers: ["cluster-core", "cluster-glow"],
      });
      if (!feats.length) return;
      const f = feats[0];
      const [lng, lat] = f.geometry.coordinates;
      setHover(f.properties.name);
      map.flyTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), 6.2),
        pitch: 55,
        essential: true,
      });
    };

    map.on("load", () => {
      map.resize();
      if (map.getLayer("cluster-glow")) {
        map.setPaintProperty("cluster-glow", "circle-color", markerColor);
      }
      if (map.getLayer("cluster-core")) {
        map.setPaintProperty("cluster-core", "circle-color", markerColor);
      }
    });
    map.on("mousemove", onMove);
    map.on("mouseleave", onLeave);
    map.on("click", onClick);

    mapRef.current = map;

    return () => {
      map.off("mousemove", onMove);
      map.off("mouseleave", onLeave);
      map.off("click", onClick);
      map.remove();
      mapRef.current = null;
    };
    // Mount once; clusters/color updates handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const source = map.getSource("clusters");
      if (source) source.setData(clustersToGeoJSON(clusters));
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [clusters]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (map.getLayer("cluster-glow")) {
        map.setPaintProperty("cluster-glow", "circle-color", markerColor);
      }
      if (map.getLayer("cluster-core")) {
        map.setPaintProperty("cluster-core", "circle-color", markerColor);
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [markerColor]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (!map.getLayer("cluster-core")) return;
      const highlight = hovered
        ? ["case", ["==", ["get", "name"], hovered], 1.45, 1]
        : 1;
      map.setPaintProperty("cluster-core", "circle-radius", [
        "*",
        ["get", "radius"],
        highlight,
      ]);
      map.setPaintProperty("cluster-glow", "circle-opacity", hovered ? 0.4 : 0.28);
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [hovered]);

  useEffect(() => {
    if (!visible) return;
    const map = mapRef.current;
    if (!map) return;
    // MapLibre needs resize after the container was display:none
    requestAnimationFrame(() => {
      map.resize();
    });
  }, [visible]);

  return (
    <div
      ref={containerRef}
      className="dcw-map"
      role="application"
      aria-label="Interactive 3D satellite map of major U.S. data center clusters"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        borderRadius: "1.25rem",
        overflow: "hidden",
      }}
    />
  );
}
