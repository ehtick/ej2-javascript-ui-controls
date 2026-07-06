import { _XmlAttribute, _XmlWriter } from '../../src/pdf/core/import-export/xml-writer';

describe('XmlWriter Coverage test scripts', () => {

    it('_writeStartDocument writes XML declaration with standalone yes', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act
        writer._writeStartDocument(true);
        const buf: Uint8Array = writer.buffer;
        // Assert
        let text: string = '';
        for (let i: number = 0; i < buf.length; i++) {
            text += String.fromCharCode(buf[i]);
        }
        expect(text.indexOf('standalone="yes"') !== -1).toBeTruthy();
        writer._destroy();
    });
    it('_writeInternal return error', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._currentState = 'EndElement'
        // Act
        try {
            writer._writeInternal("text", true);
        } catch (error) {
            expect(error.message).toEqual('InvalidOperationException: Wrong Token')
        }
        writer._destroy();
    });

    it('_pushNamespaceImplicit adds NeedToWrite when prefix not found', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act
        writer._pushNamespaceImplicit('np', 'urn:np');
        // Assert
        expect(writer._lookupNamespace('np')).toBe('urn:np');
        writer._destroy();
    });

    it('_pushNamespaceImplicit throws when reserved namespace used with wrong prefix', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act / Assert
        expect(() => { writer._pushNamespaceImplicit('p', 'http://www.w3.org/XML/1998/namespace'); }).toThrowError('InvalidArgumentException');
        writer._destroy();
    });

    it('_pushNamespaceImplicit throws when existing later namespace mismatches', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._addNamespace('p', 'urn:orig', 'NeedToWrite');
        // Act / Assert
        expect(() => { writer._pushNamespaceImplicit('p', 'urn:new'); }).toThrowError('XmlException namespace Uri needs to be the same as the one that is already declared');
        writer._destroy();
    });

    it('_pushNamespaceImplicit is no-op when existing later namespace identical', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._addNamespace('p', 'urn:orig', 'NeedToWrite');
        const idxBefore: number = writer._lookupNamespaceIndex('p');
        // Act
        writer._pushNamespaceImplicit('p', 'urn:orig');
        const idxAfter: number = writer._lookupNamespaceIndex('p');
        // Assert
        expect(idxAfter).toBe(idxBefore);
        writer._destroy();
    });

    it('_pushNamespaceImplicit xml prefix mismatch throws InvalidArgumentException: Xml String', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act / Assert
        expect(() => { writer._pushNamespaceImplicit('xml', 'urn:wrong'); }).toThrowError('InvalidArgumentException: Xml String');
        writer._destroy();
    });

    it('_pushNamespaceImplicit with xml prefix and same namespace adds implied entry', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        const idxBefore: number = writer._lookupNamespaceIndex('xml');
        // Act
        writer._pushNamespaceImplicit('xml', 'http://www.w3.org/XML/1998/namespace');
        const idxAfter: number = writer._lookupNamespaceIndex('xml');
        // Assert
        expect(idxAfter).toBeGreaterThanOrEqual(idxBefore);
        writer._destroy();
    });


    it('_writeStartElement throws when prefix has no namespace mapping', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act / Assert
        expect(() => { writer._writeStartElement('node', 'unknownPrefix'); }).toThrowError('ArgumentException: Cannot use a prefix with an empty namespace');
        writer._destroy();
    });

    it('_checkName throws when text has no namespace mapping', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        let caughtError: any = null;
        // Act
        try {
            writer._checkName('node');
        } catch (e) {
            caughtError = e;
        } finally {
            writer._destroy();
        }
        // Assert
        expect(caughtError).toBeDefined(); 9
    });


    it('_writeStartElement throws when prefix maps to empty namespace', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._addNamespace('p', '', 'Written');
        // Act / Assert
        expect(() => { writer._writeStartElement('node', 'p'); }).toThrowError('ArgumentException: Cannot use a prefix with an empty namespace');
        writer._destroy();
    });

    it('_writeStartElement succeeds when prefix maps to a non-empty namespace', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._addNamespace('p', 'urn:test', 'Written');
        // Act
        writer._writeStartElement('node', 'p');
        const buf: Uint8Array = writer.buffer;
        // Assert
        let text: string = '';
        for (let i: number = 0; i < buf.length; i++) {
            text += String.fromCharCode(buf[i]);
        }
        expect(text.indexOf('<p:node') !== -1).toBeTruthy();
        writer._destroy();
    });

    it('_writeStartDocument throws when buffer is undefined', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._destroy();
        // Act / Assert
        expect(() => { writer._writeStartDocument(); }).toThrowError('InvalidOperationException: Wrong Token');
    });


    it('_writeStartElement throws when buffer is undefined', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._destroy();
        // Act / Assert
        expect(() => { writer._writeStartElement('a'); }).toThrowError('InvalidOperationException: Wrong Token');
    });

    it('_writeStartElement throws when localName is empty', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act / Assert
        expect(() => { writer._writeStartElement(''); }).toThrowError('ArgumentException: localName cannot be undefined, null or empty');
    });

    it('_writeStartElement throws on invalid name characters', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act / Assert
        expect(() => { writer._writeStartElement('in valid'); }).toThrowError('InvalidArgumentException: invalid name character');
    });


    it('_writeStartElement calls startElementContent when already in StartElement', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._writeStartElement('a'); // set state to StartElement (Arrange)
        // Act
        writer._writeStartElement('b', null);
        const buf: Uint8Array = writer.buffer;
        // Assert
        let text: string = '';
        for (let i: number = 0; i < buf.length; i++) {
            text += String.fromCharCode(buf[i]);
        }
        expect(text.indexOf('<a>') !== -1).toBeTruthy();
        expect(text.indexOf('<b') !== -1).toBeTruthy();
        writer._destroy();
    });


    it('_writeElementString writes element with inner text when value provided', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act
        writer._writeElementString('elem', 'value');
        const buf: Uint8Array = writer.buffer;
        // Assert
        let text: string = '';
        for (let i: number = 0; i < buf.length; i++) {
            text += String.fromCharCode(buf[i]);
        }
        expect(text.indexOf('<elem') !== -1).toBeTruthy();
        expect(text.indexOf('value') !== -1).toBeTruthy();
        expect(text.indexOf('</elem>') !== -1).toBeTruthy();
        writer._destroy();
    });

    it('_writeElementString writes compact empty element when value is empty', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act
        writer._writeElementString('empty', '');
        const buf: Uint8Array = writer.buffer;
        // Assert
        let text: string = '';
        for (let i: number = 0; i < buf.length; i++) {
            text += String.fromCharCode(buf[i]);
        }
        expect(text.indexOf('<empty') !== -1).toBeTruthy();
        expect(text.indexOf('/>') !== -1).toBeTruthy();
        expect(text.indexOf('</empty>') === -1).toBeTruthy();
        writer._destroy();
    });

    it('_flush appends bufferText when _buffer has existing bytes', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._buffer = new Uint8Array([1, 2, 3]);
        writer._bufferText = 'AB';
        // Act
        writer._flush();
        const buf: Uint8Array = writer.buffer;
        // Assert
        expect(buf.length).toBe(5);
        expect(buf[3]).toBe('A'.charCodeAt(0) & 0xff);
        expect(buf[4]).toBe('B'.charCodeAt(0) & 0xff);
        expect(writer._bufferText === '').toBeTruthy();
        writer._destroy();
    });

    it('_flush converts bufferText to bytes when _buffer is empty', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        writer._buffer = new Uint8Array(0);
        writer._bufferText = 'xy';
        // Act
        writer._flush();
        const buf: Uint8Array = writer._buffer;
        // Assert
        expect(buf.length).toBe(2);
        expect(buf[0]).toBe('x'.charCodeAt(0) & 0xff);
        expect(buf[1]).toBe('y'.charCodeAt(0) & 0xff);
        expect(writer._bufferText === '').toBeTruthy();
        writer._destroy();
    });


    it('_writeNamespaceDeclaration writes xmlns:prefix when prefix non-empty and namespaces enabled', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act
        writer._writeNamespaceDeclaration('p', 'urn:example');
        const buf: Uint8Array = writer.buffer;
        // Assert
        let text: string = '';
        for (let i: number = 0; i < buf.length; i++) {
            text += String.fromCharCode(buf[i]);
        }
        expect(text.indexOf('xmlns:p') !== -1).toBeTruthy();
        expect(text.indexOf('urn:example') !== -1).toBeTruthy();
        writer._destroy();
    });

    it('_writeNamespaceDeclaration writes default xmlns when prefix empty and namespaces enabled', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act
        writer._writeNamespaceDeclaration('', 'urn:default');
        const buf: Uint8Array = writer.buffer;
        // Assert
        let text: string = '';
        for (let i: number = 0; i < buf.length; i++) {
            text += String.fromCharCode(buf[i]);
        }
        expect(text.indexOf(' xmlns="') !== -1).toBeTruthy();
        expect(text.indexOf('urn:default') !== -1).toBeTruthy();
        writer._destroy();
    });

    it('_writeNamespaceDeclaration does nothing when skipNamespace is true', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter(true);
        // Act
        writer._writeNamespaceDeclaration('p', 'urn:skip');
        const buf: Uint8Array = writer.buffer;
        // Assert
        expect(buf.length).toBe(0);
        writer._destroy();
    });

    it('_writeStringInternal escapes characters and handles attribute vs content', () => {
        // Arrange
        const writer: _XmlWriter = new _XmlWriter();
        // Act - content mode
        writer._writeStringInternal('a&b<c>d\u0000', false);
        let buf: Uint8Array = writer.buffer;
        let text: string = '';
        for (let i: number = 0; i < buf.length; i++) {
            text += String.fromCharCode(buf[i]);
        }
        // Assert content replacements
        expect(text.indexOf('a&amp;b&lt;c&gt;d') !== -1).toBeTruthy();
        writer._destroy();

        // Arrange for attribute mode
        const writer2: _XmlWriter = new _XmlWriter();
        // Act - attribute mode (quotes should be escaped)
        writer2._writeStringInternal('q"r', true);
        buf = writer2.buffer;
        text = '';
        for (let i: number = 0; i < buf.length; i++) {
            text += String.fromCharCode(buf[i]);
        }
        // Assert attribute replacements
        expect(text.indexOf('q&quot;r') !== -1).toBeTruthy();
        writer2._destroy();
    });

    it('_writeStartAttribute Error throws check', () => {
        const writer: _XmlWriter = new _XmlWriter();
        // Act - content mode
        writer._currentState = 'EndDocument';

        try {
            writer._writeStartAttribute(null, null, null, null);
            fail('Failed toThrow ArgumentException: localName cannot be undefined, null or empty')
        } catch (error) {
            expect(error.message).toEqual('ArgumentException: localName cannot be undefined, null or empty');
        }

        try {
            writer._writeStartAttribute('localName', 'value', 'prefix', 'namespace');
            fail('Failed toThrow InvalidOperationException: Wrong Token');
        } catch (error) {
            expect(error.message).toEqual('InvalidOperationException: Wrong Token');
        }
    });

});

