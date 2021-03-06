import { ContextManager, SubLine, SubRange } from "./subbox";
import { FormatContext, SubFormat } from "./Formats/Format";
import { SrtFormat } from "./Formats/SrtFormat";
import { VttFormat, VttSubLine } from "./Formats/VttFormat";

export class StdContext extends ContextManager {
    constructor () {
        super();

        this.formats.set( 'srt', new SrtFormat() );
        this.formats.set( 'vtt', new VttFormat() );
    }
}

export { ContextManager, FormatContext, VttFormat, VttSubLine, SrtFormat, SubLine, SubRange, SubFormat };
export { MessageProtocol, Message, MessageFactory, MessageKind, SubsMessageProtocol, MessagePayloadStart } from './subbox';
export { SubboxPipeline, SubsPipeline } from './subbox';
export { Pipeline, IPipeline, BridgePipeline } from './Pipeline';
export { Container } from './Container';

export { FileReader, FileWriter } from './Sources/Files';
export { StreamReader, StreamWriter, StreamDuplex } from './Sources/Stream';
export { ConcatPipeline } from './Tools/Concat';
export { ConstantPipeline } from './Tools/Constant';
export { EditPipeline, EditFormattingPipeline, LinePredicate, TagsRegEx } from './Tools/Edit';
export { EncoderPipeline, DecoderPipeline, DecodeOptions } from './Tools/Encoding';
export { FilterEmptyLinesPipeline, FilterPipeline } from './Tools/Filter';
export { LazyPipeline } from './Tools/Lazy';
export { OffsetPipeline } from './Tools/Offset';
export { ParserPipeline, CompilerPipeline } from './Tools/Parsing';
export { TrimPipeline } from './Tools/Trim';