"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { GeoJSONSource, LngLatBoundsLike, Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const PHOTON_URL = "https://photon.komoot.io/api";
const OSRM_URL = "https://router.project-osrm.org/route/v1";

export type RouteMapProps = {
  startLocation: string;
  endLocation: string;
  mode: string;
  className?: string;
};

type PhotonFeature = {
  geometry?: { type: string; coordinates?: number[] };
};

type RouteSummary = {
  bounds: LngLatBoundsLike | null;
  routeGeoJson: GeoJSON.Feature<GeoJSON.LineString> | null;
  durationHotspots: GeoJSON.FeatureCollection<GeoJSON.Point> | null;
};

const DEFAULT_CENTER: [number, number] = [77.5946, 12.9716];
const DEFAULT_ZOOM = 10;
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const MAX_HOTSPOTS = 7;

export default function RouteMap({ startLocation, endLocation, mode, className }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [summary, setSummary] = useState<RouteSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = useMemo(() => inferProfile(mode), [mode]);
  const coordsKey = useMemo(() => `${startLocation.trim()}|${endLocation.trim()}|${profile}`, [startLocation, endLocation, profile]);

  useEffect(() => {
    let aborted = false;
    const abortController = new AbortController();

    async function loadRoute() {
      const normalizedStart = startLocation.trim();
      const normalizedEnd = endLocation.trim();
      if (!normalizedStart.length || !normalizedEnd.length) {
        setSummary(null);
        setError("Provide both start and end locations to plot a route.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [startPoint, endPoint] = await Promise.all([
          geocode(normalizedStart, abortController.signal),
          geocode(normalizedEnd, abortController.signal),
        ]);
        if (!startPoint || !endPoint) {
          throw new Error("We couldn't pinpoint one of the locations.");
        }

        const routeData = await fetchRoute(profile, startPoint, endPoint, abortController.signal);
        if (!routeData) {
          throw new Error("No route found for this combination.");
        }

        if (aborted) {
          return;
        }

        setSummary(routeData);
      } catch (routeError) {
        if (!aborted) {
          setSummary(null);
          setError((routeError as Error).message || "Unable to load the route map.");
        }
      } finally {
        if (!aborted) {
          setIsLoading(false);
        }
      }
    }

    loadRoute();

    return () => {
      aborted = true;
      abortController.abort();
    };
  }, [coordsKey, profile, startLocation, endLocation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current || !summary?.routeGeoJson) {
      return;
    }

    const mapInstance = new maplibregl.Map({
      container,
      style: MAP_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapInstance.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    mapInstance.on("load", () => {
      mapInstance.addSource("route", {
        type: "geojson",
        data: summary.routeGeoJson as GeoJSON.Feature<GeoJSON.LineString>,
      });
      mapInstance.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        paint: {
          "line-color": "#2563eb",
          "line-width": 5,
          "line-opacity": 0.85,
        },
      });

      if (summary.durationHotspots) {
        mapInstance.addSource("hotspots", {
          type: "geojson",
          data: summary.durationHotspots,
        });
        mapInstance.addLayer({
          id: "hotspots-circle",
          type: "circle",
          source: "hotspots",
          paint: {
            "circle-radius": 8,
            "circle-color": "#ef4444",
            "circle-opacity": 0.8,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      if (summary.bounds) {
        mapInstance.fitBounds(summary.bounds, { padding: 48, maxZoom: 15 });
      }
    });

    mapRef.current = mapInstance;

    return () => {
      mapInstance.remove();
      mapRef.current = null;
    };
  }, [summary]);

  useEffect(() => {
    if (!mapRef.current || !summary?.routeGeoJson) {
      return;
    }

    const routeSource = mapRef.current.getSource("route") as GeoJSONSource | undefined;
    if (routeSource) {
      routeSource.setData(summary.routeGeoJson as GeoJSON.Feature<GeoJSON.LineString>);
    }

    const hotspotSource = mapRef.current.getSource("hotspots") as GeoJSONSource | undefined;
    if (hotspotSource) {
      if (summary.durationHotspots) {
        hotspotSource.setData(summary.durationHotspots);
      } else {
        hotspotSource.setData({ type: "FeatureCollection", features: [] });
      }
    } else if (summary.durationHotspots && mapRef.current.isStyleLoaded()) {
      mapRef.current.addSource("hotspots", {
        type: "geojson",
        data: summary.durationHotspots,
      });
      mapRef.current.addLayer({
        id: "hotspots-circle",
        type: "circle",
        source: "hotspots",
        paint: {
          "circle-radius": 8,
          "circle-color": "#ef4444",
          "circle-opacity": 0.8,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
        },
      });
    }

    if (summary.bounds) {
      mapRef.current.fitBounds(summary.bounds, { padding: 48, maxZoom: 15 });
    }
  }, [summary]);

  return (
    <div className={className}>
      <div ref={containerRef} className="h-72 w-full overflow-hidden rounded-2xl bg-black/10" />
      <div className="mt-2 text-xs text-[var(--text-secondary)]">
        {isLoading && <span>Loading route map…</span>}
        {!isLoading && error && <span>{error}</span>}
        {!isLoading && !error && summary && summary.durationHotspots && summary.durationHotspots.features.length > 0 && (
          <span>Red markers highlight slower segments reported by the routing service.</span>
        )}
        {!isLoading && !error && summary && (!summary.durationHotspots || summary.durationHotspots.features.length === 0) && (
          <span>Route plotted using open data; no specific slow segments detected for this snapshot.</span>
        )}
      </div>
    </div>
  );
}

async function geocode(query: string, signal: AbortSignal): Promise<[number, number] | null> {
  const url = new URL(PHOTON_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("lang", "en");

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const feature = payload?.features?.[0] as PhotonFeature | undefined;
  const coordinates = feature?.geometry?.coordinates;
  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  return [coordinates[0], coordinates[1]];
}

async function fetchRoute(
  profile: string,
  start: [number, number],
  end: [number, number],
  signal: AbortSignal
): Promise<RouteSummary | null> {
  const url = new URL(`${OSRM_URL}/${profile}/${start.join(",")};${end.join(",")}`);
  url.searchParams.set("overview", "full");
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("annotations", "duration");

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const firstRoute = payload?.routes?.[0];
  if (!firstRoute) {
    return null;
  }

  const geometry = firstRoute.geometry as GeoJSON.LineString | undefined;
  if (!geometry?.coordinates?.length) {
    return null;
  }

  const bounds = geometry.coordinates.reduce(
    (acc, coord) => {
      acc[0][0] = Math.min(acc[0][0], coord[0]);
      acc[0][1] = Math.min(acc[0][1], coord[1]);
      acc[1][0] = Math.max(acc[1][0], coord[0]);
      acc[1][1] = Math.max(acc[1][1], coord[1]);
      return acc;
    },
    [
      [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
      [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    ] as [[number, number], [number, number]]
  );

  const hotspotFeatures = createHotspots(payload?.routes?.[0]?.legs?.[0], geometry.coordinates);

  return {
    bounds,
    routeGeoJson: {
      type: "Feature",
      geometry,
      properties: {},
    },
    durationHotspots: hotspotFeatures,
  };
}

function createHotspots(
  leg: any,
  coordinates: number[][]
): GeoJSON.FeatureCollection<GeoJSON.Point> | null {
  const durations: number[] | undefined = leg?.annotation?.duration;
  if (!durations || durations.length === 0 || coordinates.length !== durations.length + 1) {
    return {
      type: "FeatureCollection",
      features: [],
    };
  }

  const threshold = computeDurationThreshold(durations);
  const rankedSegments = durations
    .map((duration, index) => ({ duration, index }))
    .filter((segment) => segment.duration >= threshold)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, MAX_HOTSPOTS);

  const hotspotFeatures: GeoJSON.Feature<GeoJSON.Point>[] = rankedSegments.map((segment) => {
    const midpoint = midpointOf(coordinates[segment.index], coordinates[segment.index + 1]);
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: midpoint,
      },
      properties: {
        duration: segment.duration,
      },
    };
  });

  if (hotspotFeatures.length === 0) {
    const fallback = durations
      .map((duration, index) => ({ duration, index }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, Math.min(MAX_HOTSPOTS, 3));

    fallback.forEach((segment) => {
      const midpoint = midpointOf(coordinates[segment.index], coordinates[segment.index + 1]);
      hotspotFeatures.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: midpoint,
        },
        properties: {
          duration: segment.duration,
        },
      });
    });
  }

  return {
    type: "FeatureCollection",
    features: hotspotFeatures,
  };
}

function computeDurationThreshold(durations: number[]): number {
  const sorted = [...durations].sort((a, b) => a - b);
  const percentileIndex = Math.max(0, Math.floor(sorted.length * 0.8) - 1);
  return sorted[percentileIndex] || sorted[sorted.length - 1];
}

function midpointOf(a: number[], b: number[]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function inferProfile(mode: string): string {
  const normalized = mode.toLowerCase();
  if (normalized === "walking") {
    return "walking";
  }
  if (normalized === "two-wheeler") {
    return "driving";
  }
  if (normalized === "public") {
    return "driving";
  }
  return "driving";
}
