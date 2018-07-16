import { Pipeline } from "../Pipeline";

export class ConstantPipeline<O, I = void> extends Pipeline<I, O> {
    output : O;
    
    constructor ( output : O ) {
        super();

        this.output = output;
    }

    run ( ctx : any, input : any ) : O {
        return this.output;
    }
}