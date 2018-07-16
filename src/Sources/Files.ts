import { SubboxPipeline, ContextManager, MessageFactory, MessageProtocol } from "../subbox";
import { StdContext } from "..";
import * as path from 'path';
import { map, from, toStream, fromStream } from "data-async-iterators";
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

export class FileWriter extends SubboxPipeline<AsyncIterableIterator<Buffer>, Promise<void>> {
    file : string;

    constructor ( file : string ) {
        super();

        this.file = file;
    }

    async run ( env : ContextManager, input ?: AsyncIterableIterator<Buffer> ) : Promise<void> {
        await new Promise( ( resolve, reject ) => {
            toStream( input ).pipe( fs.createWriteStream( this.file ) )
                .on( 'error', reject )
                .on( 'finish', resolve );
        } );
    }
}