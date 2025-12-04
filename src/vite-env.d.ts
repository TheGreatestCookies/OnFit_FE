/// <reference types="vite/client" />
/* eslint-disable @typescript-eslint/no-explicit-any */


declare global {
  interface Window {
    naver?: typeof naver;
  }
}

declare namespace naver.maps {
  class Map {
    constructor(element: HTMLElement, options?: any);
    getCenter(): LatLng;
    morph(coord: LatLng, zoom?: number): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class Marker {
    constructor(options: any);
    setMap(map: Map | null): void;
  }

  class InfoWindow {
    constructor(options: any);
    close(): void;
    open(map: Map, marker: Marker): void;
    getMap(): Map | null;
  }

  const Event: {
    addListener: (instance: any, eventName: string, handler: (e: any) => void) => any;
    removeListener: (listener: any) => void;
    trigger: (instance: any, eventName: string) => void;
  };

  const Service: {
    geocode: (options: any, callback: (status: any, response: any) => void) => void;
    reverseGeocode: (options: any, callback: (status: any, response: any) => void) => void;
    Status: {
      OK: any;
    };
    OrderType: {
      ADDR: any;
      ROAD_ADDR: any;
    };
  };
}
