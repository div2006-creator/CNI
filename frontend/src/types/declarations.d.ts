declare module 'cytoscape-cose-bilkent' {
  const coseBilkent: cytoscape.ExtensionFunction;
  export default coseBilkent;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
