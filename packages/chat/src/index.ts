// The "." entry: headless only. Never re-export ./ui from here - it would pull
// Mantine into consumers of the headless half and defeat Chat.tsx's ssr:false isolation.
export * from "./core";
