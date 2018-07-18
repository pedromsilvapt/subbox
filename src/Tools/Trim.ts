import { SubLine, SubRange, SubboxPipeline, MessageProtocol, MessageKind, MessageFactory } from "../subbox";
import { AsyncIterableLike, dropWhile, map, takeWhile } from 'data-async-iterators';
import { StdContext } from "../index";

export class TrimPipeline extends SubboxPipeline<AsyncIterableLike<MessageProtocol<SubLine>>, AsyncIterableIterator<MessageProtocol<SubLine>>> {
    retime : boolean;
    range : SubRange;

    constructor ( range : SubRange, retime : boolean = false ) {
        super();

        this.retime = retime;
        this.range = range;
    }

    run ( ctx : StdContext, input : AsyncIterableLike<MessageProtocol<SubLine>> ) : AsyncIterableIterator<MessageProtocol<SubLine>> {
        const range = this.range;
        const retime = this.retime;

        const dataFilter = <M>( predicate : ( data : M ) => boolean ) => {
            return ( message : MessageProtocol<M> ) => {
                if ( message.kind != MessageKind.Data ) {
                    return true;
                }
    
                return predicate( message.payload );
            };
        }

        const after = dropWhile( input, dataFilter( line => line.end < range.start ) );
        const middle = takeWhile( after, dataFilter( line => line.start < range.end ) );

        return map( middle, message => {
            if ( message.kind != MessageKind.Data ) {
                return message;
            }

            let line = message.payload;

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

            return MessageFactory.data( line );
        } );
    }
}