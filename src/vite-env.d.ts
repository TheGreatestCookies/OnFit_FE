/// <reference types="vite/client" />

declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (element: HTMLElement, options?: any) => any;
        LatLng: new (lat: number, lng: number) => any;
      };
    };
  }
}
