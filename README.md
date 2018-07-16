# Subbox

> Composable subtitle parsing and transformations (including encoding/decoding) written in TypeScript

# Installation
```shell
npm install --save data-future
```

# Usage
```typescript
import { StdContext, Pipeline, FileReader, DecoderPipeline, EncoderPipeline, FileWriter } from 'subbox';
import { ParserPipeline, OffsetPipeline, CompilerPipeline } from 'subbox';

const transformer = Pipeline.create(
    new FileReader(),
    new DecoderPipeline(),
    new ParserPipeline(),
    new OffsetPipeline( 2000 ) // Delay subtitles by 2 seconds
    // Convert the lines to text using the vtt format. If the format is omitted, the original one will be used
    new CompilerPipeline( 'vtt' ),
    new EncoderPipeline( 'utf8' )
);

const files = [ /** input file paths **/ ];

for ( let file of files ) {
    // Subbox Pipelines can be piped (similarly to NodeJS streams)
    // and return a new Pipeline that represents the composition
    const writer = transformer.pipe( new FileWriter( changeExtTo( file, '.vtt' ) ) );

    // We create a context (that holds the available formats, for example) and the input of the pipeline
    // The input of the pipeline is always the input of the first task in the pipeline,
    // which in this case for a FileReader is a string containing the file path to read from
    await writer.run( new StdContext(), file );
}
```
