import { Pipeline } from "../Pipeline";

export class LazyPipeline<I, O, C> extends Pipeline<I, O, C> {
    factory : ( ctx : C, input : I ) => O;
    
    constructor ( factory : ( ctx : C, input : I ) => O ) {
        super();

        this.factory = factory;
    }

    run ( ctx : any, input : any ) : O {
        return this.factory( ctx, input );
    }
}