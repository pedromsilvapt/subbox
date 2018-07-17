import { AsyncIterableLike, toArray, fromArray } from "data-async-iterators";
import { SubLine } from "../subbox";
import * as Subtitle from 'subtitle';
import { SubFormat } from "./format";

export class VttSubLine extends SubLine {
    styles : Map<string, string> = new Map();
}

export class VttFormat extends SubFormat<VttSubLine> {
    name : string = 'vtt';
    
    async * parse ( source : AsyncIterableLike<string> ) : AsyncIterableIterator<VttSubLine> {
        const joined = ( await toArray( source ) ).join( '' );

        const rawLines : any[] = Subtitle.parse( joined );

        const lines : VttSubLine[] = rawLines.map( 
            line => new VttSubLine( Subtitle.toMS( line.start ), Subtitle.toMS( line.end ), line.text )
        );

        yield * fromArray( lines );
    }

    async * compile ( lines : AsyncIterableIterator<VttSubLine> ) : AsyncIterableIterator<string> {
        const array = await toArray( lines );

        yield Subtitle.stringifyVtt( array.map( line => ( {
            start: Subtitle.toVttTime( line.start ),
            end: Subtitle.toVttTime( line.end ),
            text: line.text,
            settings: line.styles ? Array.from( line.styles.entries() ).map( ( [ key, value ] ) => key + ':' + value ).join( ' ' ) : []
        } ) ) );
    }
}