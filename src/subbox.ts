import { AsyncIterableLike } from 'data-async-iterators';
import { Pipeline } from './Pipeline';
import { SubFormat } from '.';
import { FormatContext } from './Formats/Format';
import { Container } from './Container';

export class ContextManager extends Container<string, any> {
    constructor () {
        super();
        
        this.set( 'formats', new FormatContext() );
    }
    
    get formats () : FormatContext {
        return this.get( 'formats' );
    }
}

export interface SubRange {
    start : number;
    end : number;
}

export class SubLine {
    start : number;
    end : number;
    text : string;

    constructor ( start : number, end : number, text : string ) {
        this.start = start;
        this.end = end;
        this.text = text || '';
    }

    clone () : SubLine {
        return new SubLine( this.start, this.end, this.text );
    }
}

export abstract class SubboxPipeline<I, O> extends Pipeline<I, O, ContextManager> { }

export type Message<K, P> = { kind: K, payload : P };

export enum MessageKind {
    Start = 0,
    Data = 1,
    End = 2
}

export interface MessagePayloadStart {
    format : SubFormat<SubLine>;
    encoding ?: string;
}

export class MessageFactory {
    static start ( format : SubFormat<SubLine>, encoding : string = null ) : Message<MessageKind.Start, MessagePayloadStart> {
        return { kind: MessageKind.Start, payload: { format, encoding } };
    }

    static data <T> ( payload : T ) : Message<MessageKind.Data, T> {
        return { kind: MessageKind.Data, payload };
    }

    static end () : Message<MessageKind.End, void> {
        return { kind: MessageKind.End, payload: void 0 };
    }
}

export type MessageProtocol<T> = Message<MessageKind.Start, MessagePayloadStart>
                               | Message<MessageKind.Data, T>
                               | Message<MessageKind.End, void>;
                            //    | Message<any, any>;

export type SubsMessageProtocol = MessageProtocol<SubLine>;

export type SubsPipeline = SubboxPipeline<void, AsyncIterable<SubsMessageProtocol>>;