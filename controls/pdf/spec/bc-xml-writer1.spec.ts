
import { _XmlWriter } from '../src/pdf/core/import-export/xml-writer'; // <-- adjust path if needed

describe('_XmlWriter coverage branches', () => {

    function _bytesToString(bytes: Uint8Array): string {
        return Array.from(bytes).map((value: number) => String.fromCharCode(value)).join('');
    }

    it('should write standalone="no" and resolve xml prefix when start element is created with namespace only', () => {
        const writer: _XmlWriter = new _XmlWriter();

        writer._writeStartDocument(false); // covers standalone ? 'yes' : 'no' => 'no'
        writer._writeStartElement('langNode', undefined, 'http://www.w3.org/XML/1998/namespace'); // covers _lookupPrefix(namespace)
        writer._writeString('value');
        writer._writeEndElement();

        const xml: string = _bytesToString(writer._save());

        expect(xml).toContain('standalone="no"');
        expect(xml).toContain('<xml:langNode');
        expect(xml).toContain('</xml:langNode>');
    });

    it('should resolve namespace from prefix when prefix is provided and namespace is omitted', () => {
        const writer: _XmlWriter = new _XmlWriter();

        // covers: namespace = this._lookupNamespace(prefix);
        writer._writeStartElement('node', 'xml');
        writer._writeString('content');
        writer._writeEndElement();

        const xml: string = _bytesToString(writer._save());

        expect(xml).toContain('<xml:node');
        expect(xml).toContain('</xml:node>');
    });

    it('should throw when a prefix is used with an empty namespace in _writeStartElement', () => {
        const writer: _XmlWriter = new _XmlWriter();

        expect((): void => {
            writer._writeStartElement('invalidNode', 'p', '');
        }).toThrowError('ArgumentException: Cannot use a prefix with an empty namespace');
    });

    it('should resolve attribute prefix from namespace and also cover empty-prefix namespace lookup branch', () => {
        const writer: _XmlWriter = new _XmlWriter();

        writer._writeStartElement('root');

        // Covers _writeStartAttributePrefixAndNameSpace -> prefix = _lookupPrefix(namespace)
        // and then _writeStartAttributeSpecialAttribute -> pushNamespaceImplicit(prefix, namespace)
        writer._writeAttributeString('id', '123', undefined, 'http://www.w3.org/XML/1998/namespace');

        // Covers _writeStartAttributeSpecialAttribute when prefix length === 0 and namespace.length > 0
        // then prefix = _lookupPrefix(namespace) returns undefined and attribute is still written safely.
        writer._writeAttributeString('plainAttr', 'plainValue', undefined, 'urn:unknown-attribute-ns');

        writer._writeString('text');
        writer._writeEndElement();

        const xml: string = _bytesToString(writer._save());

        expect(xml).toContain('xml:id="123"');
        expect(xml).toContain('plainAttr="plainValue"');
        expect(xml).toContain('>text</root>');
    });

    it('should cover xml:lang special attribute branch without throwing', () => {
        const writer: _XmlWriter = new _XmlWriter();

        writer._writeStartElement('root');

        // Covers:
        // if (prefix === 'xml') {
        //   if (localName === 'space' || localName === 'lang') { ... return; }
        // }
        writer._writeAttributeString('lang', 'en-US', 'xml', 'http://www.w3.org/XML/1998/namespace');

        writer._writeString('body');
        writer._writeEndElement();

        const xml: string = _bytesToString(writer._save());

        expect(xml).toContain('xml:lang="en-US"');
        expect(xml).toContain('body');
    });

    it('should write a prefixed non-self-closing end element and cover the prefix branch in _writeEndElementInternal', () => {
        const writer: _XmlWriter = new _XmlWriter();

        writer._writeStartElement('book', 'p', 'urn:books');
        writer._writeString('Syncfusion');
        writer._writeEndElement();

        const xml: string = _bytesToString(writer._save());

        // Covers:
        // this._rawText(prefix);
        // this._bufferText += ':';
        expect(xml).toContain('<p:book');
        expect(xml).toContain('</p:book>');
    });

    it('should set empty string when _writeStringInternal receives null', () => {
        const writer: _XmlWriter = new _XmlWriter();

        // Direct private access through "as any" is safe here for branch coverage
        (writer as any)._writeStringInternal(null, false);

        expect((writer as any)._bufferText).toBe('');
        expect((writer as any)._position).toBe(0);
    });

    it('should return the matching prefix and undefined from _lookupPrefix', () => {
        const writer: _XmlWriter = new _XmlWriter();

        const existingPrefix: string = (writer as any)._lookupPrefix('http://www.w3.org/XML/1998/namespace');
        const missingPrefix: string = (writer as any)._lookupPrefix('urn:not-found');

        expect(existingPrefix).toBe('xml');
        expect(missingPrefix).toBeUndefined();
    });

    it('should throw duplicate attribute error from _addAttribute through public flow', () => {
        const writer: _XmlWriter = new _XmlWriter();

        writer._writeStartElement('root');
        writer._writeAttributeString('id', '1');

        // Covers:
        // throw new Error('XmlException: duplicate attribute name');
        expect((): void => {
            writer._writeAttributeString('id', '2');
        }).toThrowError('XmlException: duplicate attribute name');
    });

    it('should throw reserved xmlns prefix error from _pushNamespaceImplicit', () => {
        const writer: _XmlWriter = new _XmlWriter();

        // Direct call avoids unrelated state noise and safely covers the exact throw line.
        expect((): void => {
            (writer as any)._pushNamespaceImplicit('xmlns', 'urn:not-allowed');
        }).toThrowError('InvalidArgumentException: Prefix "xmlns" is reserved for use by XML.');
    });

});
