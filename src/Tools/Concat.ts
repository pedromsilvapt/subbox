import { SubLine, SubboxPipeline, MessageProtocol, Message, MessagePayloadStart, MessageKind, MessageFactory } from "../subbox";
import { AsyncIterableLike, from } from "data-async-iterators";
import { StdContext } from "../index";

export class ConcatPipeline extends SubboxPipeline<AsyncIterableLike<AsyncIterableLike<MessageProtocol<SubLine>>>, AsyncIterableIterator<MessageProtocol<SubLine>>> {
    async * run ( ctx : StdContext, sources : AsyncIterableLike<AsyncIterableLike<MessageProtocol<SubLine>>> ) : AsyncIterableIterator<MessageProtocol<SubLine>> {
        let startMessage : Message<MessageKind.Start, MessagePayloadStart>;

        for await ( let source of from( sources ) ) {
            for await ( let message of from( source ) ) {
                if ( message.kind === MessageKind.Start ) {
                    if ( !startMessage ) {
                        startMessage = message;

                        yield message;
                    }
                } else if ( message.kind !== MessageKind.End ) {
                    yield message;
                }
            }
        }

        yield MessageFactory.end();
    }
}