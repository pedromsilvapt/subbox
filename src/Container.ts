
export class Container<K, T> {
    items : Map<K, T> = new Map();

    set ( name : K, context : any ) : this {
        this.items.set( name, context );

        return this;
    }

    has ( name : K ) : boolean {
        return this.items.has( name );
    }

    get<T2 extends T = T> ( name : K ) : T2 {
        return this.items.get( name ) as T2;
    }

    [ Symbol.iterator ] () {
        return this.items[ Symbol.iterator ]();
    }

    entries () {
        return this.items.entries();
    }

    values () {
        return this.items.values();
    }

    clone () {
        return new ( this.constructor as any )().merge( this );
    }

    merge ( ...managers : Container<K, T>[] ) : this {
        for ( let manager of managers ) {
            for ( let [ key, value ] of manager ) {
                this.items.set( key, value );
            }
        }

        return this;
    }
}