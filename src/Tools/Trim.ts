import { SubLine, SubRange, SubboxPipeline } from "../subbox";
import { AsyncIterableLike, dropWhile, map, takeWhile } from 'data-async-iterators';
import { StdContext } from "../index";

export class TrimPipeline extends SubboxPipeline<AsyncIterableLike<SubLine>, AsyncIterableIterator<SubLine>> {
    retime : boolean;
    range : SubRange;

    constructor ( range : SubRange, retime : boolean = false ) {
        super();

        this.retime = retime;
        this.range = range;
    }

    run ( ctx : StdContext, input : AsyncIterableLike<SubLine> ) : AsyncIterableIterator<SubLine> {
        const range = this.range;
        const retime = this.retime;

        const after = dropWhile( input, line => line.end < range.start );
        const middle = takeWhile( after, line => line.start < range.end );

        return map( middle, line => {
            if ( line.start < range.start || line.end > range.end ) {
                line = line.clone();

                line.start = Math.max( line.start, range.start );
                line.end = Math.min( line.end, range.end );
            }

            if ( retime ) {
                line = line.clone();

                line.start -= range.start;
                line.end -= range.start;
            }

            return line;
        } );
    }
}