import { _XmlWriter } from '../import-export/xml-writer';
import { PdfXmpSchema } from './pdf-xmp-schema';
import { PdfXmpSchemaType } from '../enumerator';
import { PdfXmpMetadata } from './pdf-xmp-metadata';
/**
 * Represents a user-defined metadata schema with custom properties.
 * ```typescript
 * // Load an existing PDF document
 * let document: PdfDocument = new PdfDocument(data, password);
 * // Access the document properties
 * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
 * // Gets XMP metadata
 * let xmpMetadata: PdfXmpMetadata = documentProperties.xmpMetadata;
 * // Create a custom schema
 * let custom: PdfCustomSchema = new PdfCustomSchema(xmpMetadata, 'cust', 'http://custom.example.com/ns/');
 * custom.customData.set('appVersion', '1.0.0');
 * // Save the document
 * document.save('output.pdf');
 * // Destroy the document
 * document.destroy();
 * ```
 */
export class PdfCustomSchema extends PdfXmpSchema {
    private _namespace: string;
    _namespaceUri: string;
    private _customdata: Map<string, string>;
    /**
     * Initializes a new `PdfCustomSchema` instance.
     *
     * @param {PdfXmpMetadata} xmp Parent PdfXmpMetadata reference.
     * @param {string} namespacePrefix The XML namespace prefix.
     * @param {string} namespaceUri The namespace URI.
     */
    constructor(xmp: PdfXmpMetadata, namespacePrefix: string, namespaceUri: string) {
        super(xmp);
        this._namespace = namespacePrefix;
        this._namespaceUri = namespaceUri;
        this._customNamespaceUri = namespaceUri;
        this._prefix = namespacePrefix;
        this._name = namespaceUri;
        this._customdata = new Map<string, string>();
        if (this._xmp) {
            this._xmp._customSchemas.push(this);
        }
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
     * // Create a custom schema
     * let custom: PdfCustomSchema = new PdfCustomSchema(documentProperties.xmpMetadata, 'cust', 'http://custom.example.com/ns/');
     * let schemaType: PdfXmpSchemaType = custom.schemaType;
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get schemaType(): PdfXmpSchemaType {
        return PdfXmpSchemaType.custom;
    }
    /**
     * Gets the custom data map.
     *
     * @returns {Map<string, string>} The custom data.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets XMP metadata
     * let xmpMetadata: PdfXmpMetadata = documentProperties.xmpMetadata;
     * // Create a custom schema
     * let custom: PdfCustomSchema = new PdfCustomSchema(documentProperties.xmpMetadata, 'cust', 'http://custom.example.com/ns/');
     * // Gets the customData values
     * let customData: Map<string, string> = customSchema.customData;
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get customData(): Map<string, string> {
        return this._customdata;
    }
    /**
     * Sets the custom data map.
     *
     * @param {Map<string, string>} value The custom data to set.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets XMP metadata
     * let xmpMetadata: PdfXmpMetadata = documentProperties.xmpMetadata;
     * // Create a custom schema
     * let custom: PdfCustomSchema = new PdfCustomSchema(documentProperties.xmpMetadata, 'cust', 'http://custom.example.com/ns/');
     * // Sets custom data map
     * let dataMap: Map<string, string> = new Map<string, string>();
     * dataMap.set('appVersion', '1.0.0');
     * dataMap.set('buildNumber', '12345');
     * custom.customData = dataMap;
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    set customData(value: Map<string, string>) {
        this._customdata = value;
    }
    /**
     * Serializes custom data entries to RDF/XML using the provided writer.
     * Skips serialization when customData is empty.
     *
     * @private
     * @param {_XmlWriter} writer The XML writer to serialize into.
     * @returns {void}
     */
    _writeXml(writer: _XmlWriter): void {
        if (this._customdata.size === 0) {
            return;
        }
        this._customdata.forEach((value: string, key: string) => {
            writer._writeElementString(key, value, this._namespace, this._namespaceUri);
        });
    }
}
