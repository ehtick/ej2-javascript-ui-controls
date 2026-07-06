import { PdfXmpSchema } from './pdf-xmp-schema';
import { PdfXmpSchemaType } from '../enumerator';
import { PdfXmpMetadata } from './pdf-xmp-metadata';
/**
 * Represents the base schema for PDF document metadata properties.
 * ```typescript
 * // Load an existing PDF document
 * let document: PdfDocument = new PdfDocument(data, password);
 * // Create XMP metadata
 * let xmp: PdfXmpMetadata = new PdfXmpMetadata();
 * // Sets PDF keywords
 * xmp.pdfSchema.keywords = 'sample, pdf, metadata';
 * // Save the document
 * document.save('output.pdf');
 * // Destroy the document
 * document.destroy();
 * ```
 */
export class PdfSchema extends PdfXmpSchema {
    private _keywords: string;
    private _pdfVersion: string;
    private _producer: string;
    /**
     * Initializes a new `PdfSchema` instance.
     *
     * @private
     * @param {PdfXmpMetadata} xmp Optional parent PdfXmpMetadata reference.
     */
    constructor(xmp?: PdfXmpMetadata) {
        super(xmp);
        this._prefix = 'pdf';
        this._name = 'PDF';
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
     * // Gets the PDF Schema from the XMP metadata
     * let pdfSchema: PdfSchema = xmpMetadata.pdfSchema;
     * // Gets the schema type
     * let schemaType: PdfXmpSchemaType = pdfSchema.schemaType;
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get schemaType(): PdfXmpSchemaType {
        return PdfXmpSchemaType.pdf;
    }
    /**
     * Gets the PDF keywords.
     *
     * @returns {string} The PDF keywords.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmpMetadata = documentProperties.xmpMetadata;
     * // Access keywords from PDF schema
     * let keywords: string = xmpMetadata.pdfSchema.keywords;
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get keywords(): string {
        if (!this._keywords) {
            this._keywords = (this._getProperty('pdf:Keywords') as string);
        }
        return this._keywords;
    }
    /**
     * Sets the PDF keywords.
     *
     * @param {string} value The PDF keywords to set.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmp = documentProperties.xmpMetadata;
     * // Sets keywords
     * xmp.pdfSchema.keywords = 'sample, pdf, metadata';
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    set keywords(value: string) {
        this._keywords = value;
        this._setProperty('pdf:Keywords', value);
    }
    /**
     * Gets the PDF version.
     *
     * @returns {string} The PDF version.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmpMetadata = documentProperties.xmpMetadata;
     * // Access PDF version from PDF schema
     * let pdfVersion: string = xmpMetadata.pdfSchema.pdfVersion;
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get pdfVersion(): string {
        if (!this._pdfVersion) {
            this._pdfVersion = (this._getProperty('pdf:PDFVersion') as string);
        }
        return this._pdfVersion;
    }
    /**
     * Sets the PDF version.
     *
     * @param {string} value The PDF version to set.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmp = documentProperties.xmpMetadata;
     * // Sets PDF version
     * xmp.pdfSchema.pdfVersion = '1.7';
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    set pdfVersion(value: string) {
        this._pdfVersion = value;
        this._setProperty('pdf:PDFVersion', value);
    }
    /**
     * Gets the PDF producer.
     *
     * @returns {string} The PDF producer.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmpMetadata = documentProperties.xmpMetadata;
     * // Access producer from PDF schema
     * let producer: string = xmpMetadata.pdfSchema.producer;
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get producer(): string {
        if (!this._producer) {
            this._producer = (this._getProperty('pdf:Producer') as string);
        }
        return this._producer;
    }
    /**
     * Sets the PDF producer.
     *
     * @param {string} value The PDF producer to set.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets the xmp metadata
     * let xmp = documentProperties.xmpMetadata;
     * // Sets producer
     * xmp.pdfSchema.producer = 'Syncfusion EJ2 PDF';
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    set producer(value: string) {
        this._producer = value;
        this._setProperty('pdf:Producer', value);
    }
}
