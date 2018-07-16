import { SubboxPipeline, ContextManager, MessageFactory, MessageProtocol } from "../subbox";
import { StdContext } from "..";
import { map, fromStream, toStream } from "data-async-iterators";

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

export class StreamWriter extends SubboxPipeline<AsyncIterableIterator<Buffer>, Promise<void>> {
    writable : NodeJS.WritableStream;

    constructor ( writable : NodeJS.WritableStream ) {
        super();

        this.writable = writable;
    }

    async run ( env : ContextManager, input : AsyncIterableIterator<Buffer> ) : Promise<void> {
        return new Promise<void>( ( resolve, reject ) => {
            toStream( input ).pipe( this.writable )
                .on( 'finish', resolve )
                .on( 'error', reject );
        } );
    }
}