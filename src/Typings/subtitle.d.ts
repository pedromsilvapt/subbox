declare module "subtitle" {    
    export interface SubTitleType {
        start: number | string;
        end: number | string;
        text: string;
        setting?: string | undefined;
    }

    export interface ParseOptions {
        skipInvalidCaptions?: boolean;
        skipContiguousErrors?: boolean;
    }

    export function parse(srtOrVtt: string, options?: ParseOptions): SubTitleType[];
    export function stringify(captions: ReadonlyArray<SubTitleType>): string;
    export function stringifyVtt(captions: ReadonlyArray<SubTitleType>): string;
    export function resync(captions: ReadonlyArray<SubTitleType>, time: number): SubTitleType[];
    export function toMS(timestamp: string): number;
    export function toSrtTime(timestamp: number): string;
    export function toVttTime(timestamp: number): string;
}