import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
  }
}

declare module "*.png" {
  const pngSrc: string;
  export default pngSrc;
}
