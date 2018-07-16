import { SubboxPipeline, MessageProtocol, MessageKind, MessageFactory } from "../subbox";
import { AsyncIterableLike, cancellable, CancelToken, takeUntil, filter, map } from "data-async-iterators";
import { SubLine, StdContext } from "../index";

export function partial<T> ( iter : AsyncIterator<T> ) : AsyncIterableIterator<T> {
    let returned : boolean = false;

    return {
        [ Symbol.asyncIterator ] () {
            return this;
        },

        next ( value : any ) : Promise<IteratorResult<T>> {
            if ( returned ) {
                return Promise.resolve( { done: true, value: void 0 } );
            }

            return iter.next( value );
        },

        return ( value : any ) : Promise<IteratorResult<T>> {
            returned = true;

            return Promise.resolve( { done: true, value: value } );
        },

        throw ( err : any ) : Promise<IteratorResult<T>> {
            if ( iter.throw ) {
                return iter.throw( err );
            } else {
                return Promise.resolve( err );
            }
        }
    }
}

export class ParserPipeline extends SubboxPipeline<AsyncIterableLike<MessageProtocol<string>>, AsyncIterableIterator<MessageProtocol<SubLine>>> {
    format : string = null;

    async * run ( ctx : StdContext, input : AsyncIterableLike<MessageProtocol<string>> ) : AsyncIterableIterator<MessageProtocol<SubLine>> {
        const cancel = new CancelToken();
        
        const controller = cancellable( input, cancel );

        const iterator = controller[ Symbol.asyncIterator ]();
        
        const mainMessages = partial( iterator );

        for await ( let message of mainMessages ) {
            while ( message.kind != MessageKind.Start ) continue;

            const format = this.format ? ctx.formats.get( this.format ) : message.payload.format;

            if ( !format ) {
                if ( this.format ) {
                    throw new Error( `Could not find a subtitles format for ${ this.format }` );
                } else {
                    throw new Error( `Subtitles start provides no format to parser.` );
                }
            }

            yield MessageFactory.start( format, message.payload.encoding );

            const data = filter( takeUntil( partial( iterator ), m => m.kind === MessageKind.End ), m => m.kind === MessageKind.Data );

            yield * map( format.parse( map( data, m => m.payload as any as string ) ), line => MessageFactory.data( line ) );

            yield MessageFactory.end();
        }
    }
}


export class CompilerPipeline extends SubboxPipeline<AsyncIterableLike<MessageProtocol<SubLine>>, AsyncIterableIterator<MessageProtocol<string>>> {
    format : string = null;

    constructor ( format : string = null ) {
        super();

        this.format = format;
    }

    async * run ( ctx : StdContext, input : AsyncIterableLike<MessageProtocol<SubLine>> ) : AsyncIterableIterator<MessageProtocol<string>> {
        const cancel = new CancelToken();
        
        const controller = cancellable( input, cancel );

        const iterator = controller[ Symbol.asyncIterator ]();
        
        const mainMessages = partial( iterator );

        for await ( let message of mainMessages ) {
            while ( message.kind != MessageKind.Start ) continue;

            const format = this.format ? ctx.formats.get( this.format ) : message.payload.format;

            if ( !format ) {
                if ( this.format ) {
                    throw new Error( `Could not find a subtitles format for ${ this.format }` );
                } else {
                    throw new Error( `Subtitles start provides no format to parser.` );
                }
            }

            yield MessageFactory.start( format, message.payload.encoding );

            const data = filter( takeUntil( partial( iterator ), m => m.kind === MessageKind.End ), m => m.kind === MessageKind.Data );

            yield * map( format.compile( map( data, m => m.payload as any as SubLine ) ), line => MessageFactory.data( line ) );

            yield MessageFactory.end();
        }
    }
}