import { SubLine, SubboxPipeline, MessageProtocol, MessageKind, MessageFactory } from "../subbox";
import { AsyncIterableLike, map } from "data-async-iterators";
import { ContextManager, StdContext } from "../index";

export type LinePredicate = ( line : string, ctx : ContextManager ) => string;

export class EditPipeline extends SubboxPipeline<AsyncIterableLike<MessageProtocol<SubLine>>, AsyncIterableIterator<MessageProtocol<SubLine>>> {
    editor : LinePredicate;

    constructor ( editor : LinePredicate ) {
        super();

        this.editor = editor;
    }

    run ( ctx : StdContext, input : AsyncIterableLike<MessageProtocol<SubLine>> ) : AsyncIterableIterator<MessageProtocol<SubLine>> {
        return map( input, message => {
            if ( message.kind == MessageKind.Data ) {
                const cloned = message.payload.clone();

                cloned.text = this.editor( message.payload.text, ctx );

                return MessageFactory.data( cloned );
            } else {
                return message;
            }
        } );
    }
}


export var TagsRegEx = [
    /<([A-Z][A-Z0-9]*)\b[^>]*>([^\/\1]*?)<\/\1>/gi,
    /\{([A-Z0-9\\\(\),\.]*)\b[^}]*}/gi,
    /<(\/?)([A-Z][A-Z0-9]*)\b[^>]*>/gi
];

export class EditFormattingPipeline extends EditPipeline {
    constructor () {
        super( text => text.replace( TagsRegEx[ 0 ], '$2' ).replace( TagsRegEx[ 1 ], '' ).replace(exports.TagsRegEx[2], '') );
    }
}