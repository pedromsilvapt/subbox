import { SubLine, Component } from "../subbox";
import { AsyncIterableLike } from "data-async-iterators";
import { Container } from "../Container";

export abstract class SubFormat<L extends SubLine> {
    abstract name : string;

    abstract parse ( source : AsyncIterableLike<string> ) : AsyncIterableIterator<L>;

    abstract compile ( lines : AsyncIterableIterator<SubLine> ) : AsyncIterableIterator<string>;
}

export class FormatContext extends Container<string, SubFormat<SubLine>> { }