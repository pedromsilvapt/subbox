import { SubboxPipeline, ContextManager, MessageFactory, MessageProtocol, MessageKind } from "../subbox";
import { StdContext } from "..";
import * as path from 'path';
import { map, toStream, fromStream, filter } from "data-async-iterators";
import * as fs from 'mz/fs';

export class FileReader extends SubboxPipeline<string, AsyncIterableIterator<MessageProtocol<Buffer>>> {
    public encoding : string = null;

    constructor ( encoding : string = null ) {
        super();

        this.encoding = encoding;
    }

    async * run ( env : StdContext, input ?: string ) : AsyncIterableIterator<MessageProtocol<Buffer>> {
        const extension = path.extname( input );

        if ( !extension ) {
            throw new Error( `Missing format from subtitles file name.` );
        }

        const format = env.formats.get( extension.slice( 1 ).toLocaleLowerCase() );

        if ( !format ) {
            throw new Error( `Could not find a format type ${ extension.slice( 1 ) } for subtitles.` );
        }

        yield MessageFactory.start( format, this.encoding );

        const reader = fromStream<Buffer>( fs.createReadStream( input ) );

        yield * map( reader, data => MessageFactory.data( data ) );

        yield MessageFactory.end();
    }
}

export class FileWriter extends SubboxPipeline<AsyncIterableIterator<MessageProtocol<Buffer>>, Promise<void>> {
    file : string;

    constructor ( file : string ) {
        super();

        this.file = file;
    }

    async run ( env : ContextManager, input ?: AsyncIterableIterator<MessageProtocol<Buffer>> ) : Promise<void> {
        await new Promise( ( resolve, reject ) => {
            const buffers = map( filter( input, message => message.kind == MessageKind.Data ), message => message.payload as Buffer );

            const writer = fs.createWriteStream( this.file );

            toStream( buffers ).pipe( writer )
                .on( 'error', reject )
                .on( 'finish', resolve );
        } );
    }
}