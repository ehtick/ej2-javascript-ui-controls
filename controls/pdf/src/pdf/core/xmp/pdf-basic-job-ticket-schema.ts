import { PdfXmpSchema } from './pdf-xmp-schema';
import { PdfXmpSchemaType } from '../enumerator';
import { PdfXmpMetadata } from './pdf-xmp-metadata';
/**
 * Represents metadata for print job and production instructions.
 *
 * ```typescript
 * // Load an existing PDF document
 * let document: PdfDocument = new PdfDocument(data, password);
 * // Access the document properties
 * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
 * // Gets XMP metadata
 * let xmpMetadata: PdfXmpMetadata = documentProperties.xmpMetadata;
 * // Sets job references
 * xmpMetadata.basicJobTicketSchema.jobRef = ['JobA', 'JobB'];
 * // Save the document
 * document.save('output.pdf');
 * // Destroy the document
 * document.destroy();
 * ```
 */
export class PdfBasicJobTicketSchema extends PdfXmpSchema {
    private _jobRef: string[];
    /**
     * Initializes a new `PdfBasicJobTicketSchema` instance.
     *
     * @private
     * @param {PdfXmpMetadata} xmp Optional parent PdfXmpMetadata reference.
     */
    constructor(xmp?: PdfXmpMetadata) {
        super(xmp);
        this._prefix = 'xmpBJ';
        this._name = 'BasicJobTicket';
    }
    /**
     * Gets the schema type.
     *
     * @returns {PdfXmpSchemaType} The schema type.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets XMP metadata
     * let xmpMetadata: PdfXmpMetadata = documentProperties.xmpMetadata;
     * // Access schema type from basic job ticket schema
     * let type: PdfXmpSchemaType = xmpMetadata.basicJobTicketSchema.schemaType;
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get schemaType(): PdfXmpSchemaType {
        return PdfXmpSchemaType.basicJobTicket;
    }
    /**
     * Gets the list of job references (rdf:Bag).
     *
     * @returns {string[]} The job references.
     *
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets XMP metadata
     * let xmpMetadata: PdfXmpMetadata = documentProperties.xmpMetadata;
     * // Access job references from basic job ticket schema
     * let jobRef: string[] = xmpMetadata.basicJobTicketSchema.jobRef;
     * // Destroy the document
     * document.destroy();
     * ```
     */
    get jobRef(): string[] {
        if (typeof this._jobRef !== 'undefined' && this._jobRef !== null) {
            return this._jobRef;
        }
        this._jobRef = this._getProperty('xmpBJ:JobRef') as string[];
        if (this._jobRef) {
            return this._jobRef;
        }
        return [];
    }
    /**
     * Sets the list of job references (rdf:Bag).
     *
     * @param {string[]} value The job references to set.
     * ```typescript
     * // Load an existing PDF document
     * let document: PdfDocument = new PdfDocument(data, password);
     * // Access the document properties
     * let documentProperties: PdfDocumentInformation = document.getDocumentInformation(false);
     * // Gets XMP metadata
     * let xmpMetadata: PdfXmpMetadata = documentProperties.xmpMetadata;
     * // Sets job references
     * xmpMetadata.basicJobTicketSchema.jobRef = ['JobA', 'JobB'];
     * // Save the document
     * document.save('output.pdf');
     * // Destroy the document
     * document.destroy();
     * ```
     */
    set jobRef(value: string[]) {
        this._jobRef = value;
        this._setProperty('xmpBJ:JobRef', value);
    }
}
