import { SubLine, SubboxPipeline, MessageProtocol, MessageKind } from "../subbox";
import { AsyncIterableLike, filter as filterIter } from "data-async-iterators";
import { ContextManager, StdContext } from "../index";

export type LinePredicate<S> = ( ( line : S, ctx : ContextManager ) => boolean | Promise<boolean> ) | ( string | RegExp )[];

export class FilterPipeline extends SubboxPipeline<AsyncIterableLike<MessageProtocol<SubLine>>, AsyncIterableIterator<MessageProtocol<SubLine>>> {
    predicate : LinePredicate<SubLine>;

    ignoreWhiteCharacters : boolean;

    constructor ( predicate : LinePredicate<SubLine>, ignoreWhiteCharacters : boolean = false ) {
        super();

        this.predicate = predicate;
        this.ignoreWhiteCharacters = ignoreWhiteCharacters;
    }

    run ( ctx : StdContext, input : AsyncIterableLike<MessageProtocol<SubLine>> ) : AsyncIterableIterator<MessageProtocol<SubLine>> {
        const predicate = this.predicate;
        if ( predicate instanceof Array ) {
            return filterIter( input, message => {
                if ( message.kind != MessageKind.Data ) {
                    return true;
                }

                const line = message.payload;
                
                const text = this.ignoreWhiteCharacters ? line.text.replace( /(\r)?\n/gi, ' ' ).replace( /( )+/gi, ' ' )
                                                        : line.text;

                return !predicate.some( blacklist => {
                    if ( typeof blacklist === 'string' ) {
                        return text.toLowerCase().includes( blacklist );
                    } else {
                        return blacklist.test( text );
                    }
                } );
            } );
        } else {
            return filterIter( input, message => message.kind != MessageKind.Data || predicate( message.payload, ctx ) )
        }
    }
}

export class FilterEmptyLinesPipeline extends FilterPipeline {
    constructor () {
        super( line => line.text.replace( /\s/g, '' ) != '' );
    }
}