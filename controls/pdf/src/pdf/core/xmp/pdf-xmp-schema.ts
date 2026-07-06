import { _XmlWriter } from '../import-export/xml-writer';
import { PdfXmpSchemaType } from '../enumerator';
import { PdfXmpMetadata } from './pdf-xmp-metadata';
/**
 * Represents core XMP metadata properties for a PDF document.
 * ```typescript
 * // Load an existing PDF document
 * let document: PdfDocument = new PdfDocument(data, password);
 * // Access the document properties
 * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
 * // Gets XMP metadata
 * let xmpMetadata: PdfXmpMetadata = documentProperties.xmpMetadata;
 * // Sets creator tool
 * xmp.basicSchema.creatorTool = 'MyApp 1.0';
 * // Save the document
 * document.save('output.pdf');
 * // Destroy the document
 * document.destroy();
 * ```
 */
export abstract class PdfXmpSchema {
    /**
     * Parent PdfXmpMetadata reference.
     *
     * @private
     */
    _xmp: PdfXmpMetadata;
    /**
     * Map storing all properties for this schema.
     *
     * @private
     */
    _properties: Map<string, any>; // eslint-disable-line
    /**
     * Custom namespace URI for custom schemas.
     *
     * @private
     */
    _customNamespaceUri?: string;
    /**
     * Namespace prefix for this schema.
     *
     * @private
     */
    _prefix: string;
    /**
     * Schema name identifier.
     *
     * @private
     */
    _name: string;
    /**
     * Initializes a new `PdfXmpSchema` instance.
     *
     * @private
     * @param {PdfXmpMetadata} xmp Optional parent PdfXmpMetadata reference.
     */
    constructor(xmp?: PdfXmpMetadata) {
        this._xmp = xmp;
        this._properties = new Map<string, any>(); // eslint-disable-line
    }
    /**
     * Gets the schema type.
     *
     * @returns {PdfXmpSchemaType} The schema type.
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the dublincore schema from the XMP metadata
     * let basic: PdfBasicSchema = documentProperties.xmpMetadata.basicSchema;
     * // Gets the schema type
     * let schemaType: PdfXmpSchemaType = basic.schemaType;
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    abstract get schemaType(): PdfXmpSchemaType;
    /**
     * Stores a property value in the schema map.
     * Skips null/undefined values. Normalizes Date to ISO 8601 UTC (no ms). Normalizes boolean to "True"/"False".
     *
     * @private
     * @param {string} key The property key.
     * @param {any} value The property value.
     * @returns {void}
     */
    _setProperty(key: string, value: any): void { // eslint-disable-line
        if (value === null || typeof value === 'undefined') {
            return;
        }
        if (value instanceof Date) {
            const iso: string = value.toISOString();
            const normalized: string = iso.replace(/\.\d{3}Z$/, 'Z');
            this._properties.set(key, normalized);
        } else if (typeof value === 'boolean') {
            this._properties.set(key, value ? 'True' : 'False');
        } else {
            this._properties.set(key, value);
        }
    }
    /**
     * Retrieves a property value from the schema map.
     *
     * @private
     * @param {string} key The property key.
     * @returns {any} The stored value, or undefined if not set.
     */
    _getProperty(key: string): any { // eslint-disable-line
        return this._properties.get(key);
    }
    /**
     * Returns the namespace URI for this schema based on its prefix.
     *
     * @private
     * @returns {string} The namespace URI.
     */
    _getNamespaceUri(): string {
        switch (this._prefix) {
        case 'xap': return 'http://ns.adobe.com/xap/1.0/';
        case 'dc': return 'http://purl.org/dc/elements/1.1/';
        case 'pdf': return 'http://ns.adobe.com/pdf/1.3/';
        case 'xmpTPg': return 'http://ns.adobe.com/xap/1.0/t/pg/';
        case 'xmpRights': return 'http://ns.adobe.com/xap/1.0/rights/';
        case 'xmpBJ': return 'http://ns.adobe.com/xap/1.0/bj/';
        default: return (typeof this._customNamespaceUri !== 'undefined' && this._customNamespaceUri !== null) ? this._customNamespaceUri : '';
        }
    }
    /**
     * Serializes all schema properties to RDF/XML using the provided writer.
     * Iterates sorted property keys; dispatches each to the appropriate value writer.
     *
     * @private
     * @param {_XmlWriter} writer The XML writer to serialize into.
     * @returns {void}
     */
    _writeXml(writer: _XmlWriter): void {
        const rdfNs: string = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
        const xmlNs: string = 'http://www.w3.org/XML/1998/namespace';
        let keysArray: string[] = [];
        if (this._properties && typeof (this._properties as any).keys === 'function') { // eslint-disable-line
            keysArray = Array.from((this._properties as any).keys()); // eslint-disable-line
        }
        const sortedKeys: string[] = keysArray.sort();
        let isFirstElement: boolean = true;
        for (const key of sortedKeys) {
            const value: any = this._properties.get(key); // eslint-disable-line
            if (value === null || typeof value === 'undefined') {
                continue;
            }
            const colonIdx: number = key.indexOf(':');
            const localName: string = colonIdx >= 0 ? key.substring(colonIdx + 1) : key;
            const elemPrefix: string = colonIdx >= 0 ? key.substring(0, colonIdx) : '';
            const nsUri: string = isFirstElement && elemPrefix ? this._getNamespaceUriForPrefix(elemPrefix) : undefined;
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    continue;
                }
                writer._writeStartElement(localName, elemPrefix, nsUri);
                const arrayType: string = this._getArrayType(key);
                writer._writeStartElement(arrayType, 'rdf', rdfNs);
                for (const item of value) {
                    if (key === 'xap:Thumbnails' && this._isThumbnailStruct(item)) {
                        writer._writeStartElement('li', 'rdf', rdfNs);
                        writer._writeAttributeString('parseType', 'Resource', 'rdf', rdfNs);
                        writer._writeElementString('Width', String(item.width), 'xap', 'http://ns.adobe.com/xap/1.0/');
                        writer._writeElementString('Height', String(item.height), 'xap', 'http://ns.adobe.com/xap/1.0/');
                        writer._writeElementString('Format', String(item.format), 'xap', 'http://ns.adobe.com/xap/1.0/');
                        writer._writeElementString('Image', String(item.image), 'xap', 'http://ns.adobe.com/xap/1.0/');
                        writer._writeEndElement();
                    } else {
                        writer._writeElementString('li', String(item), 'rdf', rdfNs);
                    }
                }
                writer._writeEndElement();
                writer._writeEndElement();
                isFirstElement = false;
            } else if (this._isLangArray(value)) {
                writer._writeStartElement(localName, elemPrefix, nsUri);
                writer._writeStartElement('Alt', 'rdf', rdfNs);
                const langMap: { [lang: string]: string } = value as { [lang: string]: string };
                const langs: string[] = Object.keys(langMap);
                for (const lang of langs) {
                    writer._writeStartElement('li', 'rdf', rdfNs);
                    writer._writeAttributeString('lang', lang, 'xml', xmlNs);
                    if (Object.prototype.hasOwnProperty.call(langMap, lang)) {
                        // eslint-disable-next-line security/detect-object-injection
                        writer._writeString(langMap[lang]);
                    }
                    writer._writeEndElement();
                }
                writer._writeEndElement();
                writer._writeEndElement();
                isFirstElement = false;
            } else {
                writer._writeElementString(localName, String(value), elemPrefix, nsUri);
                isFirstElement = false;
            }
        }
    }
    /**
     * Check the value is the langArray value or not.
     *
     * @private
     * @param {any} value is need to check.
     * @returns {boolean} boolean value of is langArray or not
     */
    private _isLangArray(value: any): boolean { // eslint-disable-line
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
            return false;
        }
        const keys: string[] = Object.keys(value);
        if (keys.length === 0) {
            return false;
        }
        // eslint-disable-next-line security/detect-object-injection
        return keys.every((k: string) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(value, k) && typeof value[k] === 'string');
    }
    /**
     * Check the value is the thumbnail structure value or not.
     *
     * @private
     * @param {any} value is need to check.
     * @returns {boolean} boolean value of is ThumbnailStruct or not
     */
    private _isThumbnailStruct(value: any): boolean { // eslint-disable-line
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
            return false;
        }
        return (
            typeof value.width === 'number' &&
            typeof value.height === 'number' &&
            typeof value.format === 'string' &&
            typeof value.image === 'string'
        );
    }
    /**
     * Gets the array type of the value.
     *
     * @private
     * @param {string} key to get the array type.
     * @returns {string} the array type of the element.
     */
    private _getArrayType(key: string): string {
        const bagKeys: string[] = [
            'dc:contributor', 'dc:publisher', 'dc:relation', 'dc:subject', 'dc:type',
            'xmpRights:Owner', 'xmpBJ:JobRef', 'xmpTPg:Fonts', 'xap:Thumbnails'
        ];
        const seqKeys: string[] = [
            'dc:creator', 'dc:date', 'xmpTPg:PlateNames', 'xmpTPg:Colorants'
        ];
        if (bagKeys.indexOf(key) >= 0) {
            return 'Bag';
        }
        if (seqKeys.indexOf(key) >= 0) {
            return 'Seq';
        }
        return 'Bag';
    }
    /**
     * Gets the Namesapce URI for the given prefix.
     *
     * @private
     * @param {string} pfx value to get the namespace URI.
     * @returns {string} the URI value for the given prefix.
     */
    private _getNamespaceUriForPrefix(pfx: string): string {
        switch (pfx) {
        case 'xap': return 'http://ns.adobe.com/xap/1.0/';
        case 'dc': return 'http://purl.org/dc/elements/1.1/';
        case 'pdf': return 'http://ns.adobe.com/pdf/1.3/';
        case 'xmpRights': return 'http://ns.adobe.com/xap/1.0/rights/';
        case 'xmpBJ': return 'http://ns.adobe.com/xap/1.0/bj/';
        default: return (typeof this._customNamespaceUri !== 'undefined' && this._customNamespaceUri !== null) ? this._customNamespaceUri : '';
        }
    }
}
