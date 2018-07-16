import { SubboxPipeline, MessageKind, MessageProtocol, MessageFactory } from "../subbox";
import { StdContext, SubFormat, SubLine } from "../index";
import * as chardet from 'jschardet';
import * as iconv from 'iconv-lite';

export enum EncodingCharset {
    Big5 = 'Big5', GB2312 = 'GB2312', GB18030 = 'GB18030', EUC_TW = 'EUC-TW', HZ_GB_2312 = 'HZ-GB-2312', ISO_2022_CN = 'ISO-2022-CN',
    EUC_JP = 'EUC-JP', SHIFT_JIS = 'SHIFT_JIS', ISO_2022_JP = 'ISO-2022-JP',
    EUC_KR = 'EUC-KR', ISO_2022_KR = 'ISO-2022-KR',
    KOI8_R = 'KOI8-R', MacCyrillic = 'MacCyrillic', IBM855 = 'IBM855', IBM866 = 'IBM866', ISO_8859_5 = 'ISO-8859-5', windows_1251 = 'windows-1251',
    ISO_8859_2 = 'ISO-8859-2', windows_1250 = 'windows-1250',
    windows_1252 = 'windows-1252',
    ISO_8859_7 = 'ISO-8859-7', windows_1253 = 'windows-1253', // (Greek)
    ISO_8859_8 = 'ISO-8859-8', windows_1255 = 'windows-1255', // (Visual and Logical Hebrew)
    TIS_620 = 'TIS-620', // (Thai)
    UTF_32BE = 'UTF-32BE', UTF_32LE = 'UTF-32LE', ISO_3412 = 'X-ISO-10646-UCS-4-3412', ISO_2143 = 'X-ISO-10646-UCS-4-2143', // (with a BOM)
    UTF_16BE = 'UTF-16BE', UTF_16LE = 'UTF-16LE', // (with a BOM)
    UTF_8 = 'UTF-8', // (with or without a BOM)
    ASCII = 'ascii'
}

export interface DecodeOptions {
    fallbackEncoding : string;
    detectionBufferMinSize : number;
}

export class DecoderPipeline extends SubboxPipeline<AsyncIterable<MessageProtocol<Buffer>>, AsyncIterable<MessageProtocol<string>>> {
    encoding : string;

    fallbackEncoding : string;

    detectionBufferMinSize : number;

    constructor ( encoding : string = null, { fallbackEncoding, detectionBufferMinSize } : Partial<DecodeOptions> = {} ) {
        super();

        this.encoding = encoding;
        this.detectionBufferMinSize = detectionBufferMinSize || 1024 * 1024;
        this.fallbackEncoding = fallbackEncoding || 'utf8';
    }

    detect ( buffer : Buffer ) : string {
        const match = chardet.detect( buffer );

        if ( match ) {
            return match.encoding;
        }

        return null;
    }

    async * run ( env: StdContext, input ?: AsyncIterable<MessageProtocol<Buffer>> ) : AsyncIterable<MessageProtocol<string>> {
        let format : SubFormat<SubLine> = null;
        let encoding : string = null;
        let detectionBufferMinSize : number = this.detectionBufferMinSize;
        let detectionQueue : MessageProtocol<Buffer>[] = [];
        let detectionBuffer : Buffer[] = [];
        let detectionBufferSize : number = 0;
        let detectionNeedsFlush : boolean = false;

        for await ( let message of input ) {
            if ( message.kind == MessageKind.Start ) {
                encoding = this.encoding || message.payload.encoding;

                if ( encoding ) {
                    yield message;
                } else {
                    format = message.payload.format;
                }
            } else if ( message.kind == MessageKind.Data ) {
                // When no encoding was manually provided, we need to create a buffer with minimum size
                // to then try and guess the encoding
                if ( !encoding ) {
                    detectionBuffer.push( message.payload );
                    detectionBufferSize += message.payload.length;

                    detectionQueue.push( message );
                } else {
                    yield MessageFactory.data( iconv.decode( message.payload, encoding ) );
                }
            } else if ( message.kind == MessageKind.End ) {
                if ( !encoding ) {
                    detectionNeedsFlush = true;

                    detectionQueue.push( message );
                } else {
                    yield message;
                }
            } else {
                if ( !encoding ) {
                    detectionQueue.push( message );
                } else {
                    yield message;
                }
            }

            if ( !encoding ) {
                if ( detectionBufferSize >= detectionBufferMinSize || detectionNeedsFlush ) {
                    const buffer = Buffer.concat( detectionBuffer );

                    
                    encoding = this.detect( buffer );

                    if ( !encoding && detectionNeedsFlush ) {
                        encoding = this.fallbackEncoding;
                    } else if ( !encoding ) {
                        detectionBufferMinSize *= 2;
                    }
                }

                if ( encoding ) {
                    if ( !iconv.encodingExists( encoding ) ) {
                        throw new Error( `Invalid encoding ${ encoding }` );
                    }

                    yield MessageFactory.start( format, encoding );
                    
                    for ( let message of detectionQueue ) {
                        if ( message.kind === MessageKind.Data ) {
                            yield MessageFactory.data( iconv.decode( message.payload, encoding ) );
                        } else {
                            yield message;
                        }
                    }
                }
                
                if ( encoding || detectionNeedsFlush ) {
                    format = null;
                    detectionBuffer = [];
                    detectionBufferSize = 0;
                    detectionBufferMinSize = this.detectionBufferMinSize;
                    detectionQueue = [];
                    detectionNeedsFlush = false;
                }
            }
        }
    }
}


export class EncoderPipeline extends SubboxPipeline<AsyncIterable<MessageProtocol<string>>, AsyncIterable<MessageProtocol<Buffer>>> {
    encoding : string;

    constructor ( encoding : string = null ) {
        super();

        this.encoding = encoding;
    }

    async * run ( env: StdContext, input ?: AsyncIterable<MessageProtocol<string>> ) : AsyncIterable<MessageProtocol<Buffer>> {
        for await ( let message of input ) {
            if ( message.kind == MessageKind.Data ) {
                yield MessageFactory.data( iconv.encode( message.payload, this.encoding ) );
            } else {
                yield message;
            }
        }
    }
}