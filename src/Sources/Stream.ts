import { SubboxPipeline, ContextManager, MessageFactory, MessageProtocol, MessageKind } from "../subbox";
import { StdContext } from "..";
import { map, fromStream, toStream, filter } from "data-async-iterators";

export class StreamReader extends SubboxPipeline<NodeJS.ReadableStream, AsyncIterableIterator<MessageProtocol<Buffer>>> {
    public format : string;

    public encoding : string;

    constructor ( format : string, encoding : string = null ) {
        super();

        this.format = format;
        this.encoding = encoding;
    }

    async * run ( env : StdContext, input ?: NodeJS.ReadableStream ) : AsyncIterableIterator<MessageProtocol<Buffer>> {
        const format = env.formats.get( this.format );

        if ( !format ) {
            throw new Error( `Could not find a format type ${ this.format } for subtitles.` );
        }

        yield MessageFactory.start( format, this.encoding );
        
        yield * map( fromStream<Buffer>( input ), data => MessageFactory.data( data ) );

        yield MessageFactory.end();
    }
}

export class StreamWriter extends SubboxPipeline<AsyncIterableIterator<MessageProtocol<Buffer>>, Promise<void>> {
    writable : NodeJS.WritableStream;

    constructor ( writable : NodeJS.WritableStream ) {
        super();

        this.writable = writable;
    }

    async run ( env : ContextManager, input : AsyncIterableIterator<MessageProtocol<Buffer>> ) : Promise<void> {
        return new Promise<void>( ( resolve, reject ) => {
            const buffers = map( filter( input, message => message.kind != MessageKind.Data ), message => message.payload as Buffer );

            toStream( buffers ).pipe( this.writable )
                .on( 'error', reject )
                .on( 'finish', resolve );
        } );
    }
}

export class StreamDuplex extends SubboxPipeline<AsyncIterableIterator<MessageProtocol<Buffer>>, NodeJS.ReadableStream> {
    constructor () {
        super();
    }

    run ( env : ContextManager, input : AsyncIterableIterator<MessageProtocol<Buffer>> ) : NodeJS.ReadableStream {
        const buffers = map( filter( input, message => message.kind != MessageKind.Data ), message => message.payload as Buffer );

        return toStream( buffers );
    }
}