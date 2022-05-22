declare module "jschardet" {
    export interface DetectOptions {
        minimumThreshold?: number;
        detectEncodings?: string[];
    }

    export interface DetectResults {
        encoding: string;
        confidence: number;
    }

    export function detect(buffer : Buffer | string, options?: DetectOptions) : DetectResults;

    export function detectAll(buffer: Buffer | string, options?: DetectOptions) : DetectResults[];

    export function enableDebug() : void;
}