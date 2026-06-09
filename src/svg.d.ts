// SVGR exports the SVG file as a React component (default export). The
// `?url` suffix returns the asset URL when needed.
declare module "*.svg" {
  import * as React from "react";

  const Component: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  export default Component;
}

declare module "*.svg?url" {
  const src: string;
  export default src;
}
