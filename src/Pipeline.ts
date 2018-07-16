import { fromArray, map, log, drain, delay } from "data-async-iterators";

export interface IPipeline<I, O, E = any> {
    run ( env : E, input ?: I ) : O;

    pipe<U> ( target : IPipeline<O, U, E> ) : IPipeline<I, U, E>;
    pipe<U1, U2> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E> ) : IPipeline<I, U2, E>;
    pipe<U1, U2, U3> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E> ) : IPipeline<I, U3, E>;
    pipe<U1, U2, U3, U4> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E> ) : IPipeline<I, U4, E>;
    pipe<U1, U2, U3, U4, U5> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E> ) : IPipeline<I, U5, E>;
    pipe<U1, U2, U3, U4, U5, U6> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E> ) : IPipeline<I, U6, E>;
    pipe<U1, U2, U3, U4, U5, U6, U7> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E> ) : IPipeline<I, U7, E>;
    pipe<U1, U2, U3, U4, U5, U6, U7, U8> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E>, target8 : IPipeline<U7, U8, E> ) : IPipeline<I, U8, E>;
    pipe<U1, U2, U3, U4, U5, U6, U7, U8, U9> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E>, target8 : IPipeline<U7, U8, E>, target9 : IPipeline<U8, U9, E> ) : IPipeline<I, U9, E>;
    pipe<U1, U2, U3, U4, U5, U6, U7, U8, U9, U10> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E>, target8 : IPipeline<U7, U8, E>, target9 : IPipeline<U8, U9, E>, target10 : IPipeline<U9, U10, E> ) : IPipeline<I, U10, E>;
    pipe<U> ( target1 : IPipeline<O, any, E>, ...targets : IPipeline<any, any, E>[] ) : IPipeline<I, U, E>;
}


export abstract class Pipeline<I, O, E = any> implements IPipeline<I, O, E> {
    static create<O, U, E = any> ( target : IPipeline<O, U, E> ) : IPipeline<O, U, E>;
    static create<O, U1, U2, E = any> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E> ) : IPipeline<O, U2, E>;
    static create<O, U1, U2, U3, E = any> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E> ) : IPipeline<O, U3, E>;
    static create<O, U1, U2, U3, U4, E = any> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E> ) : IPipeline<O, U4, E>;
    static create<O, U1, U2, U3, U4, U5, E = any> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E> ) : IPipeline<O, U5, E>;
    static create<O, U1, U2, U3, U4, U5, U6, E = any> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E> ) : IPipeline<O, U6, E>;
    static create<O, U1, U2, U3, U4, U5, U6, U7, E = any> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E> ) : IPipeline<O, U7, E>;
    static create<O, U1, U2, U3, U4, U5, U6, U7, U8, E = any> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E>, target8 : IPipeline<U7, U8, E> ) : IPipeline<O, U8, E>;
    static create<O, U1, U2, U3, U4, U5, U6, U7, U8, U9, E = any> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E>, target8 : IPipeline<U7, U8, E>, target9 : IPipeline<U8, U9, E> ) : IPipeline<O, U9, E>;
    static create<O, U1, U2, U3, U4, U5, U6, U7, U8, U9, U10, E = any> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E>, target8 : IPipeline<U7, U8, E>, target9 : IPipeline<U8, U9, E>, target10 : IPipeline<U9, U10, E> ) : IPipeline<O, U10, E>;
    static create<O, U, E = any> ( target1 : IPipeline<O, any, E>, ...targets : IPipeline<any, any, E>[] ) : IPipeline<O, U, E>;
    static create<O, U, E = any> ( target1 : IPipeline<O, any, E>, ...targets : IPipeline<any, any, E>[] ) : IPipeline<O, U, E> {
        if ( targets.length == 0 ) {
            return target1;
        }

        if ( targets.length == 1 ) {
            return target1.pipe( targets[ 0 ] );
        }

        return target1.pipe( targets[ 0 ], ...targets.slice( 1 ) );
    }

    abstract run ( env : E, input ?: I ) : O;

    pipe<U> ( target : IPipeline<O, U, E> ) : IPipeline<I, U, E>;
    pipe<U1, U2> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E> ) : IPipeline<I, U2, E>;
    pipe<U1, U2, U3> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E> ) : IPipeline<I, U3, E>;
    pipe<U1, U2, U3, U4> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E> ) : IPipeline<I, U4, E>;
    pipe<U1, U2, U3, U4, U5> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E> ) : IPipeline<I, U5, E>;
    pipe<U1, U2, U3, U4, U5, U6> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E> ) : IPipeline<I, U6, E>;
    pipe<U1, U2, U3, U4, U5, U6, U7> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E> ) : IPipeline<I, U7, E>;
    pipe<U1, U2, U3, U4, U5, U6, U7, U8> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E>, target8 : IPipeline<U7, U8, E> ) : IPipeline<I, U8, E>;
    pipe<U1, U2, U3, U4, U5, U6, U7, U8, U9> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E>, target8 : IPipeline<U7, U8, E>, target9 : IPipeline<U8, U9, E> ) : IPipeline<I, U9, E>;
    pipe<U1, U2, U3, U4, U5, U6, U7, U8, U9, U10> ( target1 : IPipeline<O, U1, E>, target2 : IPipeline<U1, U2, E>, target3 : IPipeline<U2, U3, E>, target4 : IPipeline<U3, U4, E>, target5 : IPipeline<U4, U5, E>, target6 : IPipeline<U5, U6, E>, target7 : IPipeline<U6, U7, E>, target8 : IPipeline<U7, U8, E>, target9 : IPipeline<U8, U9, E>, target10 : IPipeline<U9, U10, E> ) : IPipeline<I, U10, E>;
    pipe<U> ( target1 : IPipeline<O, any, E>, ...targets : IPipeline<any, any, E>[] ) : IPipeline<I, U, E>;
    pipe<U> ( target1 : IPipeline<O, any, E>, ...targets : IPipeline<any, any, E>[] ) : IPipeline<I, U, E> {
        let bridge : IPipeline<I, any, E> = new BridgePipeline( this, target1 );

        for ( let target of targets ) {
            bridge = bridge.pipe( target );
        }

        return bridge;
    }
}

export class BridgePipeline<I, O, U, E = any> extends Pipeline<I, U, E> {
    head : Pipeline<I, O>;
    tail : Pipeline<O, U>;

    constructor ( pipeline1 : Pipeline<I, O>, pipeline2 : Pipeline<O, U> ) {
        super();

        this.head = pipeline1;
        this.tail = pipeline2;
    }

    run ( env : E, input : I ) : U {
        return this.tail.run( env, this.head.run( env, input ) );
    }
}