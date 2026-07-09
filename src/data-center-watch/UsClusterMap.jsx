import { useEffect, useRef, useState } from "react";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onHoverRef.current = onHoverChange;
  }, [onHoverChange]);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    setLoading(true);
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

    let loadTimer = null;
    const finishLoading = () => setLoading(false);

    map.on("load", () => {
      map.resize();
      if (map.getLayer("cluster-glow")) {
        map.setPaintProperty("cluster-glow", "circle-color", markerColor);
      }
      if (map.getLayer("cluster-core")) {
        map.setPaintProperty("cluster-core", "circle-color", markerColor);
      }
      // Style is ready; hide pop once first tiles settle (or shortly after)
      map.once("idle", finishLoading);
      loadTimer = window.setTimeout(finishLoading, 4500);
    });
    map.on("mousemove", onMove);
    map.on("mouseleave", onLeave);
    map.on("click", onClick);

    mapRef.current = map;

    return () => {
      if (loadTimer) window.clearTimeout(loadTimer);
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
      className="dcw-map-wrap"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        borderRadius: "1.25rem",
        overflow: "hidden",
      }}
    >
      <style>{`
        .dcw-map-loader {
          position: absolute;
          inset: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          background:
            radial-gradient(circle at 30% 25%, rgba(242,198,194,0.55) 0%, transparent 45%),
            radial-gradient(circle at 75% 70%, rgba(143,168,118,0.35) 0%, transparent 42%),
            rgba(250, 246, 240, 0.82);
          transition: opacity 0.45s ease, visibility 0.45s ease;
          opacity: 1;
          visibility: visible;
        }
        .dcw-map-loader.is-done {
          opacity: 0;
          visibility: hidden;
        }
        .dcw-map-loader-pop {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          padding: 1.1rem 1.45rem;
          border-radius: 1.5rem;
          background: linear-gradient(180deg, #FFF8F4 0%, #F2C6C2 100%);
          border: 2px solid #E8A8A3;
          box-shadow: 0 14px 28px rgba(242, 198, 194, 0.45);
          animation: dcw-loader-pop 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) both,
            dcw-loader-bob 1.4s ease-in-out 0.7s infinite;
          font-family: 'Fredoka', 'Nunito', sans-serif;
          color: #7A3B36;
          text-align: center;
        }
        .dcw-map-loader-emoji {
          font-size: 1.85rem;
          line-height: 1;
          letter-spacing: 0.15em;
        }
        .dcw-map-loader-text {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .dcw-map-loader-dots span {
          animation: dcw-loader-dot 1.2s ease-in-out infinite;
          opacity: 0.35;
        }
        .dcw-map-loader-dots span:nth-child(2) { animation-delay: 0.2s; }
        .dcw-map-loader-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dcw-loader-pop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes dcw-loader-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes dcw-loader-dot {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dcw-map-loader-pop,
          .dcw-map-loader-dots span { animation: none; }
        }
      `}</style>

      <div
        className={`dcw-map-loader${loading ? "" : " is-done"}`}
        role="status"
        aria-live="polite"
        aria-busy={loading}
      >
        <div className="dcw-map-loader-pop">
          <div className="dcw-map-loader-emoji" aria-hidden="true">
            🐻 💕
          </div>
          <div className="dcw-map-loader-text">
            Loading the map
            <span className="dcw-map-loader-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        </div>
      </div>

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
        }}
      />
    </div>
  );
}
