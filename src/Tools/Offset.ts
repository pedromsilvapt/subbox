import { SubLine, SubboxPipeline, MessageProtocol, MessageKind, MessageFactory } from "../subbox";
import { map, AsyncIterableLike } from "data-async-iterators";
import { StdContext } from "../index";

export class OffsetPipeline extends SubboxPipeline<AsyncIterableLike<MessageProtocol<SubLine>>, AsyncIterableIterator<MessageProtocol<SubLine>>> {
    offset : number;

    constructor ( offset : number ) {
        super();

        this.offset = offset;
    }

    run ( ctx : StdContext, input : AsyncIterableLike<MessageProtocol<SubLine>> ) : AsyncIterableIterator<MessageProtocol<SubLine>> {
        return map( input, message => {
            if ( message.kind != MessageKind.Data ) {
                return message;
            }

            const line = message.payload.clone();
            
            line.start += this.offset;
            line.end += this.offset;

            return MessageFactory.data( line );
        } );
    }
}