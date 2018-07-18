import { AsyncIterableLike, toArray, fromArray } from "data-async-iterators";
import { SubLine } from "../subbox";
import * as Subtitle from 'subtitle';
import { SubFormat } from "./format";

export class SrtFormat extends SubFormat<SubLine> {
    name : string = 'srt';
    
    async * parse ( source : AsyncIterableLike<string> ) : AsyncIterableIterator<SubLine> {
        const joined = ( await toArray( source ) ).join( '' );

        const rawLines : any[] = Subtitle.parse( joined, {
            skipInvalidCaptions: true,
            skipContiguousErrors: true
        } );

        const lines : SubLine[] = rawLines.map( 
            line => new SubLine( line.start, line.end, line.text )
        );

        yield * fromArray( lines );
    }

    async * compile ( lines : AsyncIterableIterator<SubLine> ) : AsyncIterableIterator<string> {
        const array = await toArray( lines );

        yield Subtitle.stringify( array.map( line => ( {
            start: Math.round( line.start ),
            end: Math.round( line.end ),
            text: line.text
        } ) ) );
    }
}