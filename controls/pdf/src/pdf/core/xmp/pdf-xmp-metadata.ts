import { _XmlWriter } from '../import-export/xml-writer';
import { _PdfStream } from '../../core/base-stream';
import { PdfBasicSchema } from './pdf-basic-schema';
import { PdfDublinCoreSchema } from './pdf-dublin-core-schema';
import { PdfSchema } from './pdf-schema';
import { PdfPagedTextSchema } from './pdf-paged-text-schema';
import { PdfBasicJobTicketSchema } from './pdf-basic-job-ticket-schema';
import { PdfRightsManagementSchema } from './pdf-rights-management-schema';
import { PdfCustomSchema } from './pdf-custom-schema';
import { PdfXmpSchema } from './pdf-xmp-schema';
import { _bytesToString, _stringToBytes } from '../utils';
/**
 * Represents the container for all XMP metadata in a PDF document.
 * ```typescript
 * // Load an existing PDF document
 * let document: PdfDocument = new PdfDocument(data, password);
 * // Create XMP metadata
 * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
 * // Gets XMP metadata
 * let xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
 * // Sets basic schema properties
 * xmp.basicSchema.creatorTool = 'MyApp 1.0';
 * xmp.basicSchema.createDate = new Date();
 * // Sets Dublin Core properties
 * xmp.dublinCoreSchema.title = {'en-US': 'My Document'};
 * xmp.dublinCoreSchema.creator = ['John Doe'];
 * // Save the document
 * document.save('output.pdf');
 * // Destroy the document
 * document.destroy();
 * ```
 */
export class PdfXmpMetadata {
    private _xmlWriter: _XmlWriter;
    private _buffer: Uint8Array | number [];
    /**
     * Registry of namespace prefixes to avoid duplicate declarations.
     *
     * @private
     */
    _namespaceRegistry: Set<string>;
    /**
     * Custom schemas instance on the XMP metadata.
     *
     * @private
     */
    _customSchemas: PdfCustomSchema[] = [];
    /**
     * Internal custom schemas instance on the XMP metadata.
     *
     * @private
     */
    _customSchema: PdfCustomSchema;
    private _dublinCoreSchema: PdfDublinCoreSchema;
    private _basicSchema: PdfBasicSchema;
    private _pdfSchema: PdfSchema;
    private _pagedTextSchema: PdfPagedTextSchema;
    private _basicJobTicketSchema: PdfBasicJobTicketSchema;
    private _rightsManagementSchema: PdfRightsManagementSchema;
    /**
     * Internal flag checks the metadata is updated or not.
     *
     * @private
     */
    _isUpdated: boolean = false;
    /**
     * The stream contains the serialized XMP metadata packet
     *
     * @private
     */
    _xmpStream: _PdfStream;
    /**
     * The stream contains the serialized XMP metadata packet.
     *```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Create XMP metadata
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets XMP metadata
     * let xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
     * // Access the xmp stream data
     * let stream = xmp.xmpStream;
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    xmpStream: Uint8Array;
    /**
     * Initializes a new `PdfXmpMetadata` instance.
     *
     * @private
     */
    constructor() {
        this._namespaceRegistry = new Set<string>();
    }
    /**
     * Gets or creates the Dublin Core metadata schema.
     *
     * @public
     * @returns {PdfDublinCoreSchema} The Dublin Core schema.
     *
     * ```typescript
     // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmp = documentProperties.xmpMetadata;
     * // Access Dublin Core schema
     * xmp.dublinCoreSchema.creator = ['John Doe'];
     * ```
     */
    get dublinCoreSchema(): PdfDublinCoreSchema {
        if (!this._dublinCoreSchema) {
            this._dublinCoreSchema = new PdfDublinCoreSchema(this);
        }
        return this._dublinCoreSchema;
    }
    /**
     * Gets or creates the Basic XMP schema.
     *
     * @public
     * @returns {PdfBasicSchema} The Basic schema.
     *
     * ```typescript
     // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmp = documentProperties.xmpMetadata;
     * // Access Basic schema
     * xmp.basicSchema.creatorTool = 'MyApp 1.0';
     * ```
     */
    get basicSchema(): PdfBasicSchema {
        if (!this._basicSchema) {
            this._basicSchema = new PdfBasicSchema(this);
        }
        return this._basicSchema;
    }
    /**
     * Gets or creates the PDF-specific metadata schema.
     *
     * @public
     * @returns {PdfSchema} The PDF schema.
     *
     * ```typescript
     // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmp = documentProperties.xmpMetadata;
     * // Access PDF schema
     * xmp.pdfSchema.keywords = 'test, document';
     * ```
     */
    get pdfSchema(): PdfSchema {
        if (!this._pdfSchema) {
            this._pdfSchema = new PdfSchema(this);
        }
        return this._pdfSchema;
    }
    /**
     * Gets or creates the Paged-Text metadata schema.
     *
     * @public
     * @returns {PdfPagedTextSchema} The Paged-Text schema.
     *
     * ```typescript
     // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmp = documentProperties.xmpMetadata;
     * // Access Paged-Text schema
     * xmp.pagedTextSchema.pageCount  = 10;
     * ```
     */
    get pagedTextSchema(): PdfPagedTextSchema {
        if (!this._pagedTextSchema) {
            this._pagedTextSchema = new PdfPagedTextSchema(this);
        }
        return this._pagedTextSchema;
    }
    /**
     * Gets or creates the Basic Job Ticket schema.
     *
     * @public
     * @returns {PdfBasicJobTicketSchema} The Basic Job Ticket schema.
     *
     * ```typescript
     // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmp = documentProperties.xmpMetadata;
     * // Access Basic Job Ticket schema
     * xmp.basicJobTicketSchema.jobRef = ['Job001'];
     * ```
     */
    get basicJobTicketSchema(): PdfBasicJobTicketSchema {
        if (!this._basicJobTicketSchema) {
            this._basicJobTicketSchema = new PdfBasicJobTicketSchema(this);
        }
        return this._basicJobTicketSchema;
    }
    /**
     * Gets or creates the Rights Management schema.
     *
     * @public
     * @returns {PdfRightsManagementSchema} The Rights Management schema.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmp = documentProperties.xmpMetadata;
     * // Access Rights Management schema
     * xmp.rightsManagementSchema.isMarked = true;
     * ```
     */
    get rightsManagementSchema(): PdfRightsManagementSchema {
        if (!this._rightsManagementSchema) {
            this._rightsManagementSchema = new PdfRightsManagementSchema(this);
        }
        return this._rightsManagementSchema;
    }
    /**
     * Gets the internal custom schema.
     *
     * @private
     * @returns {PdfCustomSchema} The internal custom schema.
     */
    get customSchema(): PdfCustomSchema {
        if (!this._customSchema) {
            this._customSchema = new PdfCustomSchema(this, 'pdfx', 'http://ns.adobe.com/pdfx/1.3/');
        }
        return this._customSchema;
    }
    /**
     * Builds the complete XMP packet as a byte array.
     * Generates the XML structure with all active schemas and returns the serialized bytes.
     *
     * @private
     * @returns {Uint8Array} The XMP packet bytes.
     */
    _build(): Uint8Array {
        // Auto-fill createDate and modifyDate if not already set
        const now: Date = new Date();
        if (!this._basicSchema || this._basicSchema._getProperty('xap:CreateDate') === undefined) {
            this.basicSchema.createDate = now;
        }
        if (!this._basicSchema || this._basicSchema._getProperty('xap:ModifyDate') === undefined) {
            this.basicSchema.modifyDate = now;
        }
        // Auto-fill format if not already set
        if (!this._dublinCoreSchema || this._dublinCoreSchema._getProperty('dc:format') === undefined) {
            this.dublinCoreSchema.format = 'application/pdf';
        }
        this._xmlWriter = new _XmlWriter();
        this._namespaceRegistry.clear();
        this._xmlWriter._writeStartElement('xmpmeta', 'x', 'adobe:ns:meta/');
        this._xmlWriter._writeStartElement('RDF', 'rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
        this._writeSchemas(this._xmlWriter);
        this._xmlWriter._writeEndElement();
        this._xmlWriter._writeEndElement();
        const xmlBytes: Uint8Array = this._xmlWriter._save();
        let xmlContent: string = _bytesToString(xmlBytes);
        // Remove XML declaration if present (to add it at top)
        xmlContent = xmlContent.replace(/^<\?xml\s+version\s*=\s*["']1\.0["']\s+encoding\s*=\s*["']utf-8["']\s*\?>/, '');
        const xmlDeclaration: string = '<?xml version="1.0" encoding="utf-8"?>';
        const prefix: string = '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>';
        const suffix: string = '<?xpacket end="r"?>';
        const xmlString: string =
            xmlDeclaration +
            prefix +
            xmlContent +
            suffix;
        this._buffer = _stringToBytes(xmlString.replace(/(>)(<)(\/*)/g, '$1\n$2$3')) as Uint8Array;
        return this._buffer;
    }
    /**
     * Writes all active schemas to the XML writer.
     * Iterates schemas in deterministic order and delegates to _writeSchema.
     *
     * @private
     * @param {_XmlWriter} writer The XML writer instance.
     * @returns {void}
     */
    private _writeSchemas(writer: _XmlWriter): void {
        const schemas: PdfXmpSchema[] = [];
        if (this._basicSchema && this._basicSchema._properties.size > 0) {
            schemas.push(this._basicSchema);
        }
        if (this._dublinCoreSchema && this._dublinCoreSchema._properties.size > 0) {
            schemas.push(this._dublinCoreSchema);
        }
        if (this._pdfSchema && this._pdfSchema._properties.size > 0) {
            schemas.push(this._pdfSchema);
        }
        if (this._pagedTextSchema && this._pagedTextSchema._properties.size > 0) {
            schemas.push(this._pagedTextSchema);
        }
        if (this._basicJobTicketSchema && this._basicJobTicketSchema._properties.size > 0) {
            schemas.push(this._basicJobTicketSchema);
        }
        if (this._rightsManagementSchema && this._rightsManagementSchema._properties.size > 0) {
            schemas.push(this._rightsManagementSchema);
        }
        if (this._customSchemas && this._customSchemas.length > 0) {
            for (const custom of this._customSchemas) {
                const customHasData: boolean = (custom as any).customData instanceof Map // eslint-disable-line
                    ? ((custom as any).customData.size > 0) // eslint-disable-line
                    : ((custom as any)._properties && (custom as any)._properties.size > 0); // eslint-disable-line
                if (customHasData) {
                    schemas.push(custom);
                }
            }
        }
        for (const schema of schemas) {
            this._writeSchema(writer, schema);
        }
    }
    /**
     * Writes a single schema's RDF Description block.
     * Handles namespace registration and delegates property serialization to the schema.
     *
     * @private
     * @param {_XmlWriter} writer The XML writer instance.
     * @param {PdfXmpSchema} schema The schema to write.
     * @returns {void}
     */
    private _writeSchema(writer: _XmlWriter, schema: PdfXmpSchema): void {
        writer._writeStartElement('Description', 'rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
        writer._writeAttributeString('about', '', 'rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#');
        const prefix: string = (schema as any)._prefix; // eslint-disable-line
        const namespaceUri: string = (schema as any)._getNamespaceUri(); // eslint-disable-line
        if (!this._namespaceRegistry.has(prefix)) {
            writer._writeAttributeString(prefix, namespaceUri, 'xmlns', 'http://www.w3.org/2000/xmlns/');
            this._namespaceRegistry.add(prefix);
        }
        (schema as any)._writeXml(writer); // eslint-disable-line
        writer._writeEndElement();
    }
    /**
     * Serializes the XMP metadata to a PDF stream object.
     * Calls _build() and creates an uncompressed PdfStream with appropriate dictionary entries.
     *
     * @private
     * @returns {void}
     */
    _serializeToStream(): void {
        const bytes: Uint8Array = this._build();
        this._xmpStream = new _PdfStream(bytes);
        this.xmpStream = this._xmpStream.bytes;
    }
    /**
     * Destroys the metadata object and releases all resources.
     * Clears all schema references, registry, and buffers.
     *
     * @private
     * @returns {void}
     */
    _destroy(): void {
        this._xmlWriter = undefined;
        this._buffer = undefined;
        this._namespaceRegistry.clear();
        this._dublinCoreSchema = undefined;
        this._basicSchema = undefined;
        this._pdfSchema = undefined;
        this._pagedTextSchema = undefined;
        this._basicJobTicketSchema = undefined;
        this._rightsManagementSchema = undefined;
        this._customSchema = undefined;
        this._xmpStream = undefined;
    }
}
