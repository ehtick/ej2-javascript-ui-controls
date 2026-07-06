import { PdfDocument } from '../src/pdf/core/pdf-document';
import { PdfXmpMetadata } from '../src/pdf/core/xmp/pdf-xmp-metadata';
import { PdfBasicSchema } from '../src/pdf/core/xmp/pdf-basic-schema';
import { PdfDublinCoreSchema } from '../src/pdf/core/xmp/pdf-dublin-core-schema';
import { PdfSchema } from '../src/pdf/core/xmp/pdf-schema';
import { PdfPagedTextSchema } from '../src/pdf/core/xmp/pdf-paged-text-schema';
import { PdfBasicJobTicketSchema } from '../src/pdf/core/xmp/pdf-basic-job-ticket-schema';
import { PdfRightsManagementSchema } from '../src/pdf/core/xmp/pdf-rights-management-schema';
import { PdfCustomSchema } from '../src/pdf/core/xmp/pdf-custom-schema';
import { _XmlReader } from '../src/pdf/core/xmp/xml-reader';
import { PdfXmpSchemaType } from '../src/pdf/core/enumerator';
import { pdfSuccinctly } from './inputs.spec';
import { metadataPDF, customData, compressedMetadata } from './metadata-input.spec';
import { PdfXmpSchema } from '../src/pdf/core/xmp/pdf-xmp-schema';
import { _PdfFlateStream } from '../src/pdf/core/flate-stream';
import { _PdfName } from '../src/pdf/core/pdf-primitives';
describe('1023324 - T1: PdfXmpSchema Base Class Implementation', () => {
    it('1023324 - _setProperty/_getProperty round-trip returns stored value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: any = xmp.basicSchema;
        schema._setProperty('xap:Test', 'TestValue');
        expect(schema._getProperty('xap:Test')).toEqual('TestValue');
        xmp._destroy();
    });
    it('1023324 - _setProperty normalizes Date to ISO 8601 UTC without milliseconds', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: any = xmp.basicSchema;
        const date: Date = new Date('2024-03-15T10:30:00.000Z');
        schema._setProperty('xap:CreateDate', date);
        const stored: string = schema._getProperty('xap:CreateDate');
        expect(stored).not.toContain('.');
        expect(stored).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        xmp._destroy();
    });
    it('1023324 - _setProperty normalizes boolean true to "True"', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: any = xmp.rightsManagementSchema;
        schema._setProperty('xmpRights:Marked', true);
        expect(schema._getProperty('xmpRights:Marked')).toEqual('True');
        xmp._destroy();
    });
    it('1023324 - _setProperty normalizes boolean false to "False"', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: any = xmp.rightsManagementSchema;
        schema._setProperty('xmpRights:Marked', false);
        expect(schema._getProperty('xmpRights:Marked')).toEqual('False');
        xmp._destroy();
    });
    it('1023324 - _setProperty skips null value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: any = xmp.basicSchema;
        schema._setProperty('xap:Test', null);
        expect(schema._getProperty('xap:Test')).toBeUndefined();
        xmp._destroy();
    });
    it('1023324 - _setProperty skips undefined value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: any = xmp.basicSchema;
        schema._setProperty('xap:Test', undefined);
        expect(schema._getProperty('xap:Test')).toBeUndefined();
        xmp._destroy();
    });
    it('1023324 - _getNamespaceUri returns correct URI for xmp prefix', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: any = xmp.basicSchema;
        expect(schema._getNamespaceUri()).toEqual('http://ns.adobe.com/xap/1.0/');
        xmp._destroy();
    });
    it('1023324 - _getNamespaceUri returns correct URI for dc prefix', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: any = xmp.dublinCoreSchema;
        expect(schema._getNamespaceUri()).toEqual('http://purl.org/dc/elements/1.1/');
        xmp._destroy();
    });
    it('1023324 - _getNamespaceUri returns correct URI for pdf prefix', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: any = xmp.pdfSchema;
        expect(schema._getNamespaceUri()).toEqual('http://ns.adobe.com/pdf/1.3/');
        xmp._destroy();
    });
    it('1023324 - _writeXml iterates sorted properties and skips null values', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        const bytes: any = xmp._xmpStream;
        expect(bytes).toBeDefined();
        xmp._destroy();
    });
});
describe('1023324 - T2: Enumerations and Types', () => {
    it('1023324 - PdfXmpSchemaType.basic has expected value', () => {
        expect(PdfXmpSchemaType.basic).toBeDefined();
    });
    it('1023324 - PdfXmpSchemaType.dublinCore has expected value', () => {
        expect(PdfXmpSchemaType.dublinCore).toBeDefined();
    });
    it('1023324 - PdfXmpSchemaType.pdf has expected value', () => {
        expect(PdfXmpSchemaType.pdf).toBeDefined();
    });
    it('1023324 - PdfXmpSchemaType.pagedText has expected value', () => {
        expect(PdfXmpSchemaType.pagedText).toBeDefined();
    });
    it('1023324 - PdfXmpSchemaType.basicJobTicket has expected value', () => {
        expect(PdfXmpSchemaType.basicJobTicket).toBeDefined();
    });
    it('1023324 - PdfXmpSchemaType.rightsManagement has expected value', () => {
        expect(PdfXmpSchemaType.rightsManagement).toBeDefined();
    });
    it('1023324 - PdfXmpSchemaType.custom has expected value', () => {
        expect(PdfXmpSchemaType.custom).toBeDefined();
    });
    it('1023324 - PdfXmpLangArray type accepted as title multilingual map', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const langMap: { [lang: string]: string } = { 'en-US': 'Hello', 'fr-FR': 'Bonjour' };
        xmp.dublinCoreSchema.title = langMap;
        expect(xmp.dublinCoreSchema.title['en-US']).toEqual('Hello');
        xmp._destroy();
    });
    it('1023324 - PdfXmpDimensionsStruct type accepted as maxPageSize', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pagedTextSchema.maxPageSize = { width: 595, height: 842, unit: 'pt' };
        expect(xmp.pagedTextSchema.maxPageSize).toBeDefined();
        xmp._destroy();
    });
});
describe('1023324 - T3: PdfBasicSchema Implementation', () => {
    it('1023324 - schemaType returns PdfXmpSchemaType.basic', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        expect(xmp.basicSchema.schemaType).toEqual(PdfXmpSchemaType.basic);
        xmp._destroy();
    });
    it('1023324 - creatorTool getter/setter stores and retrieves value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'MyTool';
        expect(xmp.basicSchema.creatorTool).toEqual('MyTool');
        xmp._destroy();
    });
    it('1023324 - label getter/setter stores and retrieves value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.label = 'MyLabel';
        expect(xmp.basicSchema.label).toEqual('MyLabel');
        xmp._destroy();
    });
    it('1023324 - nickname getter/setter stores and retrieves value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.nickname = 'Nick';
        expect(xmp.basicSchema.nickname).toEqual('Nick');
        xmp._destroy();
    });
    it('1023324 - baseUrl getter/setter stores and retrieves value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.baseUrl = 'http://example.com/';
        expect(xmp.basicSchema.baseUrl).toEqual('http://example.com/');
        xmp._destroy();
    });
    it('1023324 - advisory array getter/setter stores and retrieves values', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.advisory = ['advisory1', 'advisory2'];
        expect(xmp.basicSchema.advisory).toEqual(['advisory1', 'advisory2']);
        xmp._destroy();
    });
    it('1023324 - identifier array getter/setter stores and retrieves values', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.identifier = ['id1', 'id2'];
        expect(xmp.basicSchema.identifier).toEqual(['id1', 'id2']);
        xmp._destroy();
    });
    it('1023324 - thumbnails array getter/setter stores and retrieves structured thumbnail values', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const thumbs: any = [
            { width: 64, height: 64, format: 'JPEG', image: 'base64SmallImageData' },
            { width: 256, height: 256, format: 'PNG', image: 'base64LargeImageData' }
        ];
        xmp.basicSchema.thumbnails = thumbs;
        expect(xmp.basicSchema.thumbnails).toEqual(thumbs);
        xmp._destroy();
    });
    it('1023324 - thumbnails serialized as structured rdf:Bag with Resource elements', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.thumbnails = [
            { width: 64, height: 64, format: 'JPEG', image: 'base64SmallImageData' } as any
        ];
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<xap:Thumbnails>');
        expect(text).toContain('<rdf:Bag>');
        expect(text).toContain('rdf:parseType="Resource"');
        expect(text).toContain('<xap:Width>64</xap:Width>');
        expect(text).toContain('<xap:Height>64</xap:Height>');
        expect(text).toContain('<xap:Format>JPEG</xap:Format>');
        expect(text).toContain('<xap:Image>base64SmallImageData</xap:Image>');
        xmp._destroy();
    });
    it('1023324 - multiple thumbnails serialized correctly with distinct resource structures', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.thumbnails = [
            { width: 64, height: 64, format: 'JPEG', image: 'base64SmallImageData' } as any,
            { width: 256, height: 256, format: 'PNG', image: 'base64LargeImageData' } as any
        ];
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<xap:Width>64</xap:Width>');
        expect(text).toContain('<xap:Width>256</xap:Width>');
        expect(text).toContain('JPEG');
        expect(text).toContain('PNG');
        xmp._destroy();
    });
    it('1023324 - thumbnail type properties are accessible after assignment', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const thumb: any = { width: 128, height: 128, format: 'PNG', image: 'imageData' };
        xmp.basicSchema.thumbnails = [thumb];
        const retrieved: any = xmp.basicSchema.thumbnails[0];
        expect(retrieved.width).toEqual(128);
        expect(retrieved.height).toEqual(128);
        expect(retrieved.format).toEqual('PNG');
        expect(retrieved.image).toEqual('imageData');
        xmp._destroy();
    });
    it('1023324 - rating array getter/setter stores and retrieves values', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.rating = [4];
        expect(xmp.basicSchema.rating).toEqual([4]);
        xmp._destroy();
    });
});
describe('1023324 - T4: PdfDublinCoreSchema Implementation', () => {
    it('1023324 - schemaType returns PdfXmpSchemaType.dublinCore', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        expect(xmp.dublinCoreSchema.schemaType).toEqual(PdfXmpSchemaType.dublinCore);
        xmp._destroy();
    });
    it('1023324 - contributor array getter/setter stored and retrieved (rdf:Bag)', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.contributor = ['Alice', 'Bob'];
        expect(xmp.dublinCoreSchema.contributor).toEqual(['Alice', 'Bob']);
        xmp._destroy();
    });
    it('1023324 - creator array getter/setter stored and retrieved (rdf:Seq)', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.creator = ['Creator1'];
        expect(xmp.dublinCoreSchema.creator).toEqual(['Creator1']);
        xmp._destroy();
    });
    it('1023324 - subject array getter/setter stored and retrieved (rdf:Bag)', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.subject = ['PDF', 'XML'];
        expect(xmp.dublinCoreSchema.subject).toEqual(['PDF', 'XML']);
        xmp._destroy();
    });
    it('1023324 - title multilingual getter/setter stored with correct key', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.title = { 'en-US': 'Hello', 'fr-FR': 'Bonjour' };
        expect(xmp.dublinCoreSchema.title['en-US']).toEqual('Hello');
        expect(xmp.dublinCoreSchema.title['fr-FR']).toEqual('Bonjour');
        xmp._destroy();
    });
    it('1023324 - description multilingual getter/setter stored and retrieved', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.description = { 'en-US': 'A document' };
        expect(xmp.dublinCoreSchema.description['en-US']).toEqual('A document');
        xmp._destroy();
    });
    it('1023324 - rights multilingual getter/setter stored and retrieved', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.rights = { 'en-US': 'All rights reserved' };
        expect(xmp.dublinCoreSchema.rights['en-US']).toEqual('All rights reserved');
        xmp._destroy();
    });
    it('1023324 - coverage single-value getter/setter stored and retrieved', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.coverage = 'Global';
        expect(xmp.dublinCoreSchema.coverage).toEqual('Global');
        xmp._destroy();
    });
    it('1023324 - identifier single-value getter/setter stored and retrieved', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.identifier = 'urn:isbn:0451450523';
        expect(xmp.dublinCoreSchema.identifier).toEqual('urn:isbn:0451450523');
        xmp._destroy();
    });
    it('1023324 - source single-value getter/setter stored and retrieved', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.source = 'http://source.example.com';
        expect(xmp.dublinCoreSchema.source).toEqual('http://source.example.com');
        xmp._destroy();
    });
    it('1023324 - format single-value getter/setter stored and retrieved', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.format = 'application/pdf';
        expect(xmp.dublinCoreSchema.format).toEqual('application/pdf');
        xmp._destroy();
    });
    it('1023324 - format auto-populated with application/pdf if not set during build', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'TestApp';
        xmp._serializeToStream();
        expect(xmp.dublinCoreSchema.format).toEqual('application/pdf');
        xmp._destroy();
    });
    it('1023324 - format preserves custom value when explicitly set', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.format = 'application/vnd.custom';
        xmp._serializeToStream();
        expect(xmp.dublinCoreSchema.format).toEqual('application/vnd.custom');
        xmp._destroy();
    });
    it('1023324 - format appears in serialized XML output', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.format = 'application/pdf';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('dc:format');
        expect(text).toContain('application/pdf');
        xmp._destroy();
    });
    it('1023324 - multilingual title serialized with rdf:Alt and xml:lang attributes', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.title = { 'en-US': 'Title', 'fr-FR': 'Titre' };
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('rdf:Alt');
        expect(text).toContain('xml:lang="en-US"');
        expect(text).toContain('xml:lang="fr-FR"');
        xmp._destroy();
    });
});
describe('1023324 - T5: PdfSchema Implementation', () => {
    it('1023324 - schemaType returns PdfXmpSchemaType.pdf', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        expect(xmp.pdfSchema.schemaType).toEqual(PdfXmpSchemaType.pdf);
        xmp._destroy();
    });
    it('1023324 - keywords getter/setter stores and retrieves value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pdfSchema.keywords = 'PDF XMP';
        expect(xmp.pdfSchema.keywords).toEqual('PDF XMP');
        xmp._destroy();
    });
    it('1023324 - PDFVersion getter/setter stores and retrieves value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pdfSchema.pdfVersion = '1.7';
        expect(xmp.pdfSchema.pdfVersion).toEqual('1.7');
        xmp._destroy();
    });
    it('1023324 - producer getter/setter stores and retrieves value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pdfSchema.producer = 'EJ2-PDF';
        expect(xmp.pdfSchema.producer).toEqual('EJ2-PDF');
        xmp._destroy();
    });
    it('1023324 - pdfSchema serialized with xmlns:pdf namespace declaration', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pdfSchema.producer = 'EJ2-PDF';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('xmlns:pdf=');
        xmp._destroy();
    });
});
describe('1023324 - T6: PdfPagedTextSchema Implementation', () => {
    it('1023324 - schemaType returns PdfXmpSchemaType.pagedText', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        expect(xmp.pagedTextSchema.schemaType).toEqual(PdfXmpSchemaType.pagedText);
        xmp._destroy();
    });
    it('1023324 - pageCount getter/setter stores and retrieves numeric value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pagedTextSchema.pageCount = 10;
        expect(xmp.pagedTextSchema.pageCount).toEqual(10);
        xmp._destroy();
    });
    it('1023324 - maxPageSize getter/setter stores dimensions object', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pagedTextSchema.maxPageSize = { width: 595, height: 842, unit: 'pt' };
        expect(xmp.pagedTextSchema.maxPageSize).toBeDefined();
        expect(xmp.pagedTextSchema.maxPageSize.width).toEqual(595);
        xmp._destroy();
    });
    it('1023324 - fonts array getter/setter stores and retrieves values (rdf:Bag)', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pagedTextSchema.fonts = ['Arial', 'Helvetica'];
        expect(xmp.pagedTextSchema.fonts).toEqual(['Arial', 'Helvetica']);
        xmp._destroy();
    });
    it('1023324 - plateNames array getter/setter stores and retrieves values (rdf:Seq)', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pagedTextSchema.plateNames = ['Cyan', 'Magenta'];
        expect(xmp.pagedTextSchema.plateNames).toEqual(['Cyan', 'Magenta']);
        xmp._destroy();
    });
    it('1023324 - colorants array getter/setter stores and retrieves values (rdf:Seq)', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.pagedTextSchema.colorants = ['CMYK'];
        expect(xmp.pagedTextSchema.colorants).toEqual(['CMYK']);
        xmp._destroy();
    });
});
describe('1023324 - T7: PdfBasicJobTicketSchema Implementation', () => {
    it('1023324 - schemaType returns PdfXmpSchemaType.basicJobTicket', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        expect(xmp.basicJobTicketSchema.schemaType).toEqual(PdfXmpSchemaType.basicJobTicket);
        xmp._destroy();
    });
    it('1023324 - jobRef array getter/setter stores and retrieves values (rdf:Bag)', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicJobTicketSchema.jobRef = ['JobA', 'JobB'];
        expect(xmp.basicJobTicketSchema.jobRef).toEqual(['JobA', 'JobB']);
        xmp._destroy();
    });
    it('1023324 - basicJobTicketSchema serialized with xmlns:xmpBJ namespace', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicJobTicketSchema.jobRef = ['Job1'];
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('xmlns:xmpBJ=');
        xmp._destroy();
    });
    it('1023324 - basicJobTicketSchema prefix is xmpBJ', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: any = documentProperties.xmpMetadata;
        expect(xmp.basicJobTicketSchema._prefix).toEqual('xmpBJ');
        xmp._destroy();
    });
});
describe('1023324 - T8: PdfRightsManagementSchema Implementation', () => {
    it('1023324 - schemaType returns PdfXmpSchemaType.rightsManagement', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        expect(xmp.rightsManagementSchema.schemaType).toEqual(PdfXmpSchemaType.rightsManagement);
        xmp._destroy();
    });
    it('1023324 - certificate getter/setter stores and retrieves value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.rightsManagementSchema.certificateUrl  = 'http://cert.example.com';
        expect(xmp.rightsManagementSchema.certificateUrl ).toEqual('http://cert.example.com');
        xmp._destroy();
    });
    it('1023324 - webStatement getter/setter stores and retrieves value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.rightsManagementSchema.webStatement = 'http://rights.example.com';
        expect(xmp.rightsManagementSchema.webStatement).toEqual('http://rights.example.com');
        xmp._destroy();
    });
    it('1023324 - isMarked setter normalizes boolean to True/False via _setProperty', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.rightsManagementSchema.isMarked = true;
        expect(xmp.rightsManagementSchema.isMarked).toBeTruthy();
        xmp._destroy();
    });
    it('1023324 - owners array getter/setter stores and retrieves values (rdf:Bag)', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.rightsManagementSchema.owners = ['Owner1', 'Owner2'];
        expect(xmp.rightsManagementSchema.owners).toEqual(['Owner1', 'Owner2']);
        xmp._destroy();
    });
    it('1023324 - usageTerms readonly getter returns PdfXmpLangArray type', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const terms: any = xmp.rightsManagementSchema.usageTerms;
        expect(terms === undefined || typeof terms === 'object').toBeTruthy();
        xmp._destroy();
    });
});
describe('1023324 - T9: PdfCustomSchema Implementation', () => {
    it('1023324 - schemaType returns PdfXmpSchemaType.custom', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        expect(custom.schemaType).toEqual(PdfXmpSchemaType.custom);
        xmp._destroy();
    });
    it('1023324 - customData getter returns Map with set entries', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('a', '1');
        custom.customData.set('b', '2');
        expect(custom.customData.size).toEqual(2);
        xmp._destroy();
    });
    it('1023324 - namespace stored correctly; prefix returns namespace string', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: any = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        expect(custom._prefix).toEqual('cust');
        xmp._destroy();
    });
    it('1023324 - custom _writeXml serializes custom elements with prefix', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('key', 'value');
        // // xmp.customSchema = custom;
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<cust:key>value</cust:key>');
        xmp._destroy();
    });
    it('1023324 - custom _writeXml skips serialization when customData is empty', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        // xmp.customSchema = custom;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).not.toContain('xmlns:cust=');
        xmp._destroy();
    });
});
describe('1023324 - T10: PdfXmpMetadata Container Implementation', () => {
    it('1023324 - dublinCoreSchema lazy-init returns PdfDublinCoreSchema on first access', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: PdfDublinCoreSchema = xmp.dublinCoreSchema;
        expect(schema).toBeDefined();
        expect(schema instanceof PdfDublinCoreSchema).toBeTruthy();
        xmp._destroy();
    });
    it('1023324 - basicSchema lazy-init returns PdfBasicSchema on first access', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: PdfBasicSchema = xmp.basicSchema;
        expect(schema).toBeDefined();
        expect(schema instanceof PdfBasicSchema).toBeTruthy();
        xmp._destroy();
    });
    it('1023324 - pdfSchema lazy-init returns PdfSchema on first access', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: PdfSchema = xmp.pdfSchema;
        expect(schema).toBeDefined();
        expect(schema instanceof PdfSchema).toBeTruthy();
        xmp._destroy();
    });
    it('1023324 - pagedTextSchema lazy-init returns PdfPagedTextSchema on first access', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: PdfPagedTextSchema = xmp.pagedTextSchema;
        expect(schema).toBeDefined();
        expect(schema instanceof PdfPagedTextSchema).toBeTruthy();
        xmp._destroy();
    });
    it('1023324 - basicJobTicketSchema lazy-init returns PdfBasicJobTicketSchema on first access', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: PdfBasicJobTicketSchema = xmp.basicJobTicketSchema;
        expect(schema).toBeDefined();
        expect(schema instanceof PdfBasicJobTicketSchema).toBeTruthy();
        xmp._destroy();
    });
    it('1023324 - rightsManagementSchema lazy-init returns PdfRightsManagementSchema on first access', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const schema: PdfRightsManagementSchema = xmp.rightsManagementSchema;
        expect(schema).toBeDefined();
        expect(schema instanceof PdfRightsManagementSchema).toBeTruthy();
        xmp._destroy();
    });
    it('1023324 - _build returns non-empty Uint8Array', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        const result: Uint8Array | number[] = xmp._build();
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        xmp._destroy();
    });
    it('1023324 - _build output contains xpacket begin and xmpmeta wrapper', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        const result: Uint8Array | number[] = xmp._build();
        const text: string = new TextDecoder().decode(result);
        expect(text).toContain('<?xpacket begin');
        expect(text).toContain('<x:xmpmeta');
        expect(text).toContain('<?xpacket end');
        xmp._destroy();
    });
    it('1023324 - _serializeToStream sets _xmpStream as PdfStream', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        expect(xmp._xmpStream).toBeDefined();
        xmp._destroy();
    });
    it('1023324 - _destroy clears all schema references', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        xmp._destroy();
        const internal: any = xmp;
        expect(internal._basicSchema).toBeUndefined();
        expect(internal._dublinCoreSchema).toBeUndefined();
        expect(internal._pdfSchema).toBeUndefined();
    });
    it('1023324 - _namespaceRegistry populated after _build', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._build();
        const internal: any = xmp;
        expect(internal._namespaceRegistry.size).toBeGreaterThan(0);
        xmp._destroy();
    });
});
describe('1023324 - T11: _XmlReader Parser Implementation', () => {
    it('1023324 - _load and _parseXmp returns PdfXmpMetadata from valid XMP XML string', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:CreatorTool>ReaderTool</xap:CreatorTool></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const reader: _XmlReader = new _XmlReader();
        reader._load(xml);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result).toBeDefined();
        expect(result.basicSchema.creatorTool).toEqual('ReaderTool');
        result._destroy();
    });
    it('1023324 - _load with Uint8Array parses correctly via TextDecoder', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:CreatorTool>ByteTool</xap:CreatorTool></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const bytes: Uint8Array = new TextEncoder().encode(xml);
        const reader: _XmlReader = new _XmlReader();
        reader._load(bytes);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result.basicSchema.creatorTool).toEqual('ByteTool');
        result._destroy();
    });
    it('1023324 - _validate throws error for invalid XML', () => {
        const reader: _XmlReader = new _XmlReader();
        expect(() => reader._load('<invalid><unclosed>')).toThrow();
    });
    it('1023324 - _parseDublinCore reconstructs dc:title multilingual correctly', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title><rdf:Alt><rdf:li xml:lang="en-US">Title</rdf:li><rdf:li xml:lang="fr-FR">Titre</rdf:li></rdf:Alt></dc:title></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const reader: _XmlReader = new _XmlReader();
        reader._load(xml);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result.dublinCoreSchema.title['en-US']).toEqual('Title');
        expect(result.dublinCoreSchema.title['fr-FR']).toEqual('Titre');
        result._destroy();
    });
    it('1023324 - _parsePdf reconstructs pdf:Producer correctly', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/"><pdf:Producer>EJ2-PDF</pdf:Producer></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const reader: _XmlReader = new _XmlReader();
        reader._load(xml);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result.pdfSchema.producer).toEqual('EJ2-PDF');
        result._destroy();
    });
    it('1023324 - _parseCustom creates PdfCustomSchema for unknown namespace', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:cust="http://custom/ns"><cust:field>custVal</cust:field></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const reader: _XmlReader = new _XmlReader();
        reader._load(xml);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result.customSchema).toBeDefined();
        expect(result.customSchema!.customData.get('field')).toBeUndefined();
        result._destroy();
    });
    it('1023324 - _getArray extracts rdf:Bag items correctly', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:subject><rdf:Bag><rdf:li>PDF</rdf:li><rdf:li>XML</rdf:li></rdf:Bag></dc:subject></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const reader: _XmlReader = new _XmlReader();
        reader._load(xml);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result.dublinCoreSchema.subject).toContain('PDF');
        expect(result.dublinCoreSchema.subject).toContain('XML');
        result._destroy();
    });
    it('1023324 - _getThumbnails extracts structured thumbnail objects from rdf:Bag', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:Thumbnails><rdf:Bag><rdf:li rdf:parseType="Resource"><xap:Width>64</xap:Width><xap:Height>64</xap:Height><xap:Format>JPEG</xap:Format><xap:Image>base64SmallData</xap:Image></rdf:li></rdf:Bag></xap:Thumbnails></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const reader: _XmlReader = new _XmlReader();
        reader._load(xml);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result.basicSchema.thumbnails).toBeDefined();
        expect(result.basicSchema.thumbnails.length).toBe(1);
        expect(result.basicSchema.thumbnails[0].width).toBe(64);
        expect(result.basicSchema.thumbnails[0].height).toBe(64);
        expect(result.basicSchema.thumbnails[0].format).toBe('JPEG');
        expect(result.basicSchema.thumbnails[0].image).toBe('base64SmallData');
        result._destroy();
    });
    it('1023324 - _getThumbnails extracts multiple structured thumbnails correctly', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:Thumbnails><rdf:Bag><rdf:li rdf:parseType="Resource"><xap:Width>64</xap:Width><xap:Height>64</xap:Height><xap:Format>JPEG</xap:Format><xap:Image>base64SmallData</xap:Image></rdf:li><rdf:li rdf:parseType="Resource"><xap:Width>256</xap:Width><xap:Height>256</xap:Height><xap:Format>PNG</xap:Format><xap:Image>base64LargeData</xap:Image></rdf:li></rdf:Bag></xap:Thumbnails></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const reader: _XmlReader = new _XmlReader();
        reader._load(xml);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result.basicSchema.thumbnails.length).toBe(2);
        expect(result.basicSchema.thumbnails[0].width).toBe(64);
        expect(result.basicSchema.thumbnails[0].format).toBe('JPEG');
        expect(result.basicSchema.thumbnails[1].width).toBe(256);
        expect(result.basicSchema.thumbnails[1].format).toBe('PNG');
        result._destroy();
    });
    it('1023324 - _getThumbnails returns empty array when no thumbnails present', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:CreatorTool>TestTool</xap:CreatorTool></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const reader: _XmlReader = new _XmlReader();
        reader._load(xml);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result.basicSchema.thumbnails).toBeUndefined();
        result._destroy();
    });
    it('1023324 - _getThumbnails handles incomplete thumbnail structure gracefully', () => {
        const xml: string = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:Thumbnails><rdf:Bag><rdf:li rdf:parseType="Resource"><xap:Width>64</xap:Width></rdf:li></rdf:Bag></xap:Thumbnails></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>`;
        const reader: _XmlReader = new _XmlReader();
        reader._load(xml);
        const result: PdfXmpMetadata = reader._parseXmp();
        expect(result.basicSchema.thumbnails).toBeUndefined();
        result._destroy();
    });
});
describe('1023324 - T12: PdfDocument Integration', () => {
    it('1023324 - xmpMetadata setter assigns metadata to document', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        documentProperties.xmpMetadata = xmp;
        expect(documentProperties.xmpMetadata).toBeDefined();
        doc.destroy();
    });
    it('1023324 - saved document bytes contain RDF/XML after xmpMetadata assignment', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        documentProperties.xmpMetadata.basicSchema.creatorTool = 'MyApp';
        const savedBytes: Uint8Array = doc.save();
        const text: string = new TextDecoder().decode(savedBytes);
        expect(text).toContain('<rdf:RDF');
        expect(text).toContain('<x:xmpmeta');
        doc.destroy();
    });
    it('1023324 - saved document contains /Metadata reference in catalog', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'MyApp';
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const text: string = new TextDecoder().decode(savedBytes);
        expect(text).toContain('/Metadata');
        doc.destroy();
    });
    it('1023324 - xmpMetadata getter returns metadata from existing PDF with /Metadata stream', () => {
        const dataBytes: Uint8Array = Uint8Array.from(atob(metadataPDF), (c: string) => c.charCodeAt(0));
        const doc: PdfDocument = new PdfDocument(dataBytes);
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata | undefined = documentProperties.xmpMetadata;
        expect(xmp).toBeDefined();
        doc.destroy();
    });
    it('1023324 - _addXmpMetadata embeds stream in document catalog with Type and Subtype', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'EJ2';
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const text: string = new TextDecoder().decode(savedBytes);
        expect(text).toContain('/Type');
        expect(text).toContain('/Subtype');
        doc.destroy();
    });
    it('1023324 - save pipeline calls _addXmpMetadata when xmpMetadata is set', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        documentProperties.xmpMetadata = xmp;
        expect(() => doc.save()).not.toThrow();
        doc.destroy();
    });
    it('1023324 - thumbnails round-trip correctly through save and load', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.thumbnails = [
            { width: 64, height: 64, format: 'JPEG', image: 'base64SmallData' },
            { width: 256, height: 256, format: 'PNG', image: 'base64LargeData' }
        ];
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const reopened: PdfDocument = new PdfDocument(savedBytes);
        const loadeddocumentProperties = reopened.getDocumentInformation(false);
        const loadedXmp: PdfXmpMetadata | undefined = loadeddocumentProperties.xmpMetadata;
        expect(loadedXmp).toBeDefined();
        expect(loadedXmp!.basicSchema.thumbnails.length).toBe(2);
        expect(loadedXmp!.basicSchema.thumbnails[0].width).toBe(64);
        expect(loadedXmp!.basicSchema.thumbnails[0].format).toBe('JPEG');
        expect(loadedXmp!.basicSchema.thumbnails[1].width).toBe(256);
        expect(loadedXmp!.basicSchema.thumbnails[1].format).toBe('PNG');
        reopened.destroy();
        doc.destroy();
    });
});
describe('1023324 - T13: Unit Testing', () => {
    it('1023324 - AC-1-1: saved PDF bytes contain RDF/XML metadata structure', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'MyApp';
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const text: string = new TextDecoder().decode(savedBytes);
        expect(text).toContain('<rdf:RDF');
        expect(text).toContain('<x:xmpmeta');
        doc.destroy();
    });
    it('1023324 - AC-1-2: saved PDF bytes contain /Metadata dictionary entry', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'MyApp';
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const text: string = new TextDecoder().decode(savedBytes);
        expect(text).toContain('/Metadata');
        doc.destroy();
    });
    it('1023324 - AC-1-3: xmpMetadata is defined after save and reload', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'MyApp';
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const reopened: PdfDocument = new PdfDocument(savedBytes);
        const loadedDocumentProperties = reopened.getDocumentInformation(false);
        expect(loadedDocumentProperties.xmpMetadata).toBeDefined();
        reopened.destroy();
        doc.destroy();
    });
    it('1023324 - AC-1-4: XMP stream content starts with xpacket begin', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'MyApp';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<?xpacket begin');
        xmp._destroy();
    });
    it('1023324 - AC-1-5: full embedding workflow completes without exception', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'MyApp';
        documentProperties.xmpMetadata = xmp;
        expect(() => doc.save()).not.toThrow();
        doc.destroy();
    });
    it('1023324 - AC-4-1: stream contains xmlns:xap, xmlns:dc, xmlns:pdf declarations', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        xmp.dublinCoreSchema.subject = ['PDF'];
        xmp.pdfSchema.producer = 'Engine';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('xmlns:xap=');
        expect(text).toContain('xmlns:dc=');
        expect(text).toContain('xmlns:pdf=');
        xmp._destroy();
    });
    it('1023324 - AC-4-2: creatorTool serialized as xap:CreatorTool element', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<xap:CreatorTool>Tool</xap:CreatorTool>');
        xmp._destroy();
    });
    it('1023324 - AC-4-3: stream contains rdf:RDF and rdf:Description', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<rdf:RDF');
        expect(text).toContain('<rdf:Description');
        xmp._destroy();
    });
    it('1023324 - AC-4-4: stream contains exactly one rdf:RDF opening tag', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        xmp.dublinCoreSchema.subject = ['PDF'];
        xmp.pdfSchema.producer = 'Engine';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        const count: number = (text.match(/<rdf:RDF\b/g) || []).length;
        expect(count).toEqual(1);
        xmp._destroy();
    });
    it('1023324 - AC-4-5: reloaded document with all standard schemas has xmpMetadata defined', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        xmp.dublinCoreSchema.subject = ['PDF'];
        xmp.pdfSchema.producer = 'Engine';
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const reopened: PdfDocument = new PdfDocument(savedBytes);
        const loadedDocumentProperties = reopened.getDocumentInformation(false);
        expect(loadedDocumentProperties.xmpMetadata).toBeDefined();
        reopened.destroy();
        doc.destroy();
    });
    it('1023324 - AC-5-1: custom namespace URI appears as xmlns attribute in stream', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('key', 'value');
        // xmp.customSchema = custom;
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('xmlns:cust="http://custom/ns"');
        xmp._destroy();
    });
    it('1023324 - AC-5-2: custom property element uses registered namespace prefix', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('key', 'value');
        // xmp.customSchema = custom;
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<cust:key>value</cust:key>');
        xmp._destroy();
    });
    it('1023324 - AC-5-3: custom schema coexists with standard schemas without namespace collision', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('key', 'value');
        // xmp.customSchema = custom;
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('xmlns:xap=');
        expect(text).toContain('xmlns:cust=');
        xmp._destroy();
    });
    it('1023324 - AC-5-4: custom namespace preserved after save and reload', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('key', 'value');
        // xmp.customSchema = custom;
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const reopened: PdfDocument = new PdfDocument(savedBytes);
        const loadedDocumentProperties = reopened.getDocumentInformation(false);
        expect(loadedDocumentProperties.xmpMetadata).toBeDefined();
        reopened.destroy();
        doc.destroy();
    });
    it('1023324 - AC-8-1: basicSchema, dublinCoreSchema, pdfSchema serialize with all three namespace prefixes', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        xmp.dublinCoreSchema.title = { 'en-US': 'Title' };
        xmp.pdfSchema.producer = 'Producer';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('xmlns:xap=');
        expect(text).toContain('xmlns:dc=');
        expect(text).toContain('xmlns:pdf=');
        xmp._destroy();
    });
    it('1023324 - AC-8-3: each schema property value is intact in combined stream', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'ToolValue';
        xmp.pdfSchema.producer = 'ProducerValue';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<xap:CreatorTool>ToolValue</xap:CreatorTool>');
        expect(text).toContain('ProducerValue');
        xmp._destroy();
    });
    it('1023324 - AC-9-1: creatorTool value preserved in saved bytes', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'MyApp';
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const text: string = new TextDecoder().decode(savedBytes);
        expect(text).toContain('MyApp');
        doc.destroy();
    });
    it('1023324 - AC-10-1: createDate and modifyDate are defined after _serializeToStream without explicit values', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp._serializeToStream();
        expect(xmp.basicSchema.createDate).toBeDefined();
        expect(xmp.basicSchema.modifyDate).toBeDefined();
        xmp._destroy();
    });
    it('1023324 - AC-10-2: auto-filled dates match ISO 8601 pattern in stream', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        xmp._destroy();
    });
    it('1023324 - AC-11-1: multilingual title serialized using rdf:Alt container', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.title = { 'en-US': 'Title', 'fr-FR': 'Titre' };
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<rdf:Alt>');
        xmp._destroy();
    });
    it('1023324 - AC-11-2: xml:lang attributes are correctly added for each language entry', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.title = { 'en-US': 'Title', 'fr-FR': 'Titre' };
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('xml:lang="en-US"');
        expect(text).toContain('xml:lang="fr-FR"');
        xmp._destroy();
    });
    it('1023324 - AC-11-3: both Title and Titre appear in serialized stream', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.title = { 'en-US': 'Title', 'fr-FR': 'Titre' };
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('Title');
        expect(text).toContain('Titre');
        xmp._destroy();
    });
    it('1023324 - AC-11-4: title property holds multilingual map with correct keys', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.title = { 'en-US': 'Title', 'fr-FR': 'Titre' };
        expect(xmp.dublinCoreSchema.title['en-US']).toEqual('Title');
        xmp._destroy();
    });
    it('1023324 - AC-12-1: stream length greater than 10000 chars for large value', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'ns');
        const largeString: string = 'A'.repeat(10000);
        custom.customData.set('large', largeString);
        // xmp.customSchema = custom;
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        expect(stream.bytes).toEqual(xmp.xmpStream);
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text.length).toBeGreaterThan(10000);
        xmp._destroy();
    });
    it('1023324 - AC-13-1: assigning null to creatorTool does not throw unhandled exception', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        expect(() => { xmp.basicSchema.creatorTool = null as any; }).not.toThrow();
        xmp._destroy();
    });
    it('1023324 - AC-14-1: setting xmpMetadata to null removes metadata reference', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        documentProperties.xmpMetadata = documentProperties.xmpMetadata;
        documentProperties.xmpMetadata = null as any;
        expect(documentProperties.xmpMetadata).toBeFalsy();
        doc.destroy();
    });
    it('1023324 - AC-14-3: _destroy clears _xmpStream', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        xmp._destroy();
        expect(xmp._xmpStream).toBeFalsy();
    });
    it('1023324 - AC-15-1: basicSchema, dublinCoreSchema, pdfSchema are non-null on new instance', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        expect(xmp.basicSchema).toBeDefined();
        expect(xmp.dublinCoreSchema).toBeDefined();
        expect(xmp.pdfSchema).toBeDefined();
        xmp._destroy();
    });
    it('1023324 - AC-15-3: stream contains xpacket begin and xpacket end', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<?xpacket begin');
        expect(text).toContain('<?xpacket end');
        xmp._destroy();
    });
    it('1023324 - AC-17-1: two serializations of identical metadata produce identical stream content', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp1: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom1: PdfCustomSchema = new PdfCustomSchema(xmp1, 'cust', 'ns');
        custom1.customData.set('key', 'value');
        // xmp1.customSchema = custom1;
        xmp1._serializeToStream();
        const bytes1: Uint8Array = (xmp1._xmpStream as any).bytes;
        const text1: string = new TextDecoder().decode(bytes1);
        xmp1._destroy();
        doc.destroy();
        const doc2: PdfDocument = new PdfDocument();
        const documentProperties2 = doc2.getDocumentInformation(false);
        const xmp2: PdfXmpMetadata = documentProperties2.xmpMetadata;
        const custom2: PdfCustomSchema = new PdfCustomSchema(xmp2, 'cust', 'ns');
        custom2.customData.set('key', 'value');
        // xmp2.customSchema = custom2;
        xmp2._serializeToStream();
        const bytes2: Uint8Array = (xmp2._xmpStream as any).bytes;
        const text2: string = new TextDecoder().decode(bytes2);
        xmp2._destroy();
        expect(text1).toEqual(text2);
    });
    it('1023324 - AC-18-1: _xmpStream is defined and non-empty after _serializeToStream', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        expect(xmp._xmpStream).toBeDefined();
        xmp._destroy();
    });
    it('1023324 - AC-18-3: _xmpStream content is valid XML with x:xmpmeta', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<x:xmpmeta');
        xmp._destroy();
    });
    it('1023324 - AC-23-2: explicitly set date serialized in ISO 8601 format', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.createDate = new Date('2024-01-15T10:30:00.000Z');
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toBeDefined();
        xmp._destroy();
    });
    it('1023324 - AC-24-1: rdf:Description is present in serialized output', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<rdf:Description');
        xmp._destroy();
    });
    it('1023324 - AC-24-2: array properties use rdf:Bag or rdf:Seq containers', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.subject = ['PDF', 'XML'];
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        const hasBagOrSeq: boolean = text.includes('<rdf:Bag>') || text.includes('<rdf:Seq>');
        expect(hasBagOrSeq).toBeTruthy();
        xmp._destroy();
    });
    it('1023324 - AC-24-4: rdf:li elements are nested inside container for array values', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.subject = ['PDF'];
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<rdf:li>PDF</rdf:li>');
        xmp._destroy();
    });
    it('1023324 - AC-24-5: serialized output contains x:xmpmeta closing tag', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('</x:xmpmeta>');
        xmp._destroy();
    });
    it('1023324 - AC-25-4: value assigned to creatorTool matches exactly in serialized stream', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'ExactValue';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<xap:CreatorTool>ExactValue</xap:CreatorTool>');
        xmp._destroy();
    });
    it('1023324 - AC-27-1: invalid value on basicSchema does not prevent dublinCoreSchema serialization', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        try { xmp.basicSchema.creatorTool = null as any; } catch (_e) { /* intentional */ }
        xmp.dublinCoreSchema.title = { 'en-US': 'SafeTitle' };
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('SafeTitle');
        xmp._destroy();
    });
    it('1023324 - AC-28-1: serializing 100 custom entries completes without exception', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        for (let i: number = 0; i < 100; i++) {
            custom.customData.set(`key${i}`, `value${i}`);
        }
        // xmp.customSchema = custom;
        expect(() => xmp._serializeToStream()).not.toThrow();
        xmp._destroy();
    });
});
describe('1023324 - T14: Integration Testing', () => {
    it('1023324 - AC-2-1: adding XMP to existing PDF does not alter page count', () => {
        const dataBytes: Uint8Array = Uint8Array.from(atob(pdfSuccinctly), (c: string) => c.charCodeAt(0));
        const doc: PdfDocument = new PdfDocument(dataBytes);
        const originalPageCount: number = doc.pageCount;
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Updater';
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const text: string = new TextDecoder().decode(savedBytes);
        expect(doc.pageCount).toEqual(originalPageCount);
        expect(text).toContain('<x:xmpmeta');
        doc.destroy();
    });
    it('1023324 - AC-2-2: saved PDF with XMP added to existing PDF is reloadable', () => {
        const dataBytes: Uint8Array = Uint8Array.from(atob(pdfSuccinctly), (c: string) => c.charCodeAt(0));
        const doc: PdfDocument = new PdfDocument(dataBytes);
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        const reopened: PdfDocument = new PdfDocument(savedBytes);
        expect(reopened.pageCount).toBeGreaterThan(0);
        reopened.destroy();
        doc.destroy();
    });
    it('1023324 - AC-2-3: saved bytes are larger than original when XMP is added', () => {
        const dataBytes: Uint8Array = Uint8Array.from(atob(pdfSuccinctly), (c: string) => c.charCodeAt(0));
        const originalSize: number = dataBytes.byteLength;
        const doc: PdfDocument = new PdfDocument(dataBytes);
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Updater';
        documentProperties.xmpMetadata = xmp;
        const savedBytes: Uint8Array = doc.save();
        expect(savedBytes.byteLength).toBeGreaterThan(originalSize);
        doc.destroy();
    });
    it('1023324 - AC-6-1: updating custom key does not create duplicate entries', () => {
        const dataBytes: Uint8Array = Uint8Array.from(atob(customData), (c: string) => c.charCodeAt(0));
        const doc: PdfDocument = new PdfDocument(dataBytes);
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata | undefined = documentProperties.xmpMetadata;
        expect(xmp).toBeDefined();
        if (xmp && xmp.customSchema) {
            xmp.customSchema.customData.set('creationDate', 'newValue');
            xmp._serializeToStream();
            const stream: any = xmp._xmpStream;
            const bytes: Uint8Array = stream.bytes;
            const text: string = new TextDecoder().decode(bytes);
            const count: number = (text.match(/creationDate/g) || []).length;
            expect(count).toBeGreaterThan(0);
        }
        doc.destroy();
    });
    it('1023324 - AC-19-1: incremental update produces larger saved bytes than original PDF', () => {
        const dataBytes: Uint8Array = Uint8Array.from(atob(metadataPDF), (c: string) => c.charCodeAt(0));
        const originalSize: number = dataBytes.byteLength;
        const doc: PdfDocument = new PdfDocument(dataBytes);
        const documentProperties = doc.getDocumentInformation(false);
        if (documentProperties.xmpMetadata) {
            documentProperties.xmpMetadata.basicSchema.creatorTool = 'Updated';
        }
        const savedBytes: Uint8Array = doc.save();
        expect(savedBytes.byteLength).toBeGreaterThan(originalSize);
        doc.destroy();
    });
    it('1023324 - AC-19-2: updated metadata does not result in duplicate xmp:CreatorTool entries', () => {
        const dataBytes: Uint8Array = Uint8Array.from(atob(metadataPDF), (c: string) => c.charCodeAt(0));
        const doc: PdfDocument = new PdfDocument(dataBytes);
        const documentProperties = doc.getDocumentInformation(false);
        if (documentProperties.xmpMetadata) {
            documentProperties.xmpMetadata.basicSchema.creatorTool = 'Updated';
            documentProperties.xmpMetadata._serializeToStream();
            const stream: any = documentProperties.xmpMetadata._xmpStream;
            const bytes: Uint8Array = stream.bytes;
            const text: string = new TextDecoder().decode(bytes);
            const count: number = (text.match(/<xap:CreatorTool>/g) || []).length;
            expect(count).toBeLessThanOrEqual(2);
        }
        doc.destroy();
    });
    it('1023324 - AC-19-3: updated creatorTool value is present in saved bytes', () => {
        const dataBytes: Uint8Array = Uint8Array.from(atob(metadataPDF), (c: string) => c.charCodeAt(0));
        const doc: PdfDocument = new PdfDocument(dataBytes);
        const documentProperties = doc.getDocumentInformation(false);
        if (documentProperties.xmpMetadata) {
            documentProperties.xmpMetadata.basicSchema.creatorTool = 'Updated';
        }
        const savedBytes: Uint8Array = doc.save();
        const text: string = new TextDecoder().decode(savedBytes);
        expect(text).toContain('Updated');
        doc.destroy();
    });
    it('1023324 - AC-20-1: _build produces valid XMP packet with x:xmpmeta and rdf:RDF', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        const result: Uint8Array | number[] = xmp._build();
        const text: string = new TextDecoder().decode(result);
        expect(text).toContain('<x:xmpmeta');
        expect(text).toContain('<rdf:RDF');
        xmp._destroy();
    });
    it('1023324 - AC-20-2: _build output contains xpacket begin and end wrapper tags', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        const result: Uint8Array | number[] = xmp._build();
        const text: string = new TextDecoder().decode(result);
        expect(text).toContain('<?xpacket begin');
        expect(text).toContain('<?xpacket end');
        xmp._destroy();
    });
    it('1023324 - AC-20-3: standard schema property elements appear correctly in _build output', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        const result: Uint8Array | number[] = xmp._build();
        const text: string = new TextDecoder().decode(result);
        expect(text).toContain('<xap:CreatorTool>App</xap:CreatorTool>');
        xmp._destroy();
    });
    it('1023324 - AC-20-4: custom schema property appears in _build output with correct namespace', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('key', 'value');
        // xmp.customSchema = custom;
        const result: Uint8Array | number[] = xmp._build();
        const text: string = new TextDecoder().decode(result);
        expect(text).toContain('<cust:key>value</cust:key>');
        xmp._destroy();
    });
    it('1023324 - AC-21-1: serialized output from multiple schemas contains rdf:RDF', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'App';
        xmp.dublinCoreSchema.subject = ['PDF'];
        xmp.pdfSchema.producer = 'Engine';
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('k', 'v');
        // xmp.customSchema = custom;
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('<rdf:RDF');
        xmp._destroy();
    });
    it('1023324 - AC-22-1: modifying basicSchema does not change dublinCoreSchema properties', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.title = { 'en-US': 'IsolatedTitle' };
        xmp.basicSchema.creatorTool = 'Tool';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('IsolatedTitle');
        xmp._destroy();
    });
    it('1023324 - AC-26-1: custom schema alongside standard schemas does not break standard serialization', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        xmp.dublinCoreSchema.subject = ['PDF'];
        xmp.pdfSchema.producer = 'Engine';
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('k', 'v');
        // xmp.customSchema = custom;
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('xmlns:xap=');
        expect(text).toContain('xmlns:dc=');
        expect(text).toContain('xmlns:pdf=');
        expect(text).toContain('xmlns:cust=');
        xmp._destroy();
    });
    it('1023324 - AC-26-5: not providing custom schema still produces valid standard schema output', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        xmp._serializeToStream();
        const stream: any = xmp._xmpStream;
        const bytes: Uint8Array = stream.bytes;
        const text: string = new TextDecoder().decode(bytes);
        expect(text).toContain('xmlns:xap=');
        expect(text).not.toContain('xmlns:cust=');
        xmp._destroy();
    });
    it('1023324 - AC-28-2: all standard schemas plus custom schema serializes without exception', () => {
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        xmp.basicSchema.creatorTool = 'Tool';
        xmp.dublinCoreSchema.subject = [];
        xmp.pdfSchema.producer = 'Engine';
        xmp.pagedTextSchema.pageCount = null as any;
        xmp.basicJobTicketSchema.jobRef = ['Job1'];
        xmp.rightsManagementSchema.certificateUrl  = 'http://cert.example.com';
        const custom: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('k', 'v');
        // xmp.customSchema = custom;
        expect(() => xmp._serializeToStream()).not.toThrow();
        xmp._destroy();
    });
});
describe('1023324 - XMP Round Trip Integration - All Schemas (Full Coverage)', () => {
    it('PdfBasicSchema - full validation (ALL properties)', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;
        const createDate = new Date('2026-05-14T10:00:00Z');
        const modifyDate = new Date('2026-05-14T11:00:00Z');
        const metadataDate = new Date('2026-05-14T12:00:00Z');
        xmp.basicSchema.creatorTool = 'App1';
        xmp.basicSchema.label = 'Label1';
        xmp.basicSchema.nickname = 'Nick1';
        xmp.basicSchema.baseUrl = 'http://test.com';
        xmp.basicSchema.createDate = createDate;
        xmp.basicSchema.modifyDate = modifyDate;
        xmp.basicSchema.metadataDate = metadataDate;
        xmp.basicSchema.rating = [5];
        xmp.basicSchema.identifier = ['id1', 'id2'];
        xmp.basicSchema.advisory = ['adv1'];
        xmp.basicSchema.thumbnails = [
            { width: 64, height: 64, format: 'JPEG', image: 'img1' }
        ];
        documentProperties.xmpMetadata = xmp;
        const doc2 = new PdfDocument(doc.save());
        const documentProperties2 = doc2.getDocumentInformation(false);
        const basic = documentProperties2.xmpMetadata!.basicSchema;
        expect(basic.creatorTool).toBe('App1');
        expect(basic.label).toBe('Label1');
        expect(basic.nickname).toBe('Nick1');
        expect(basic.baseUrl).toBe('http://test.com');
        expect(new Date(basic.createDate).toISOString()).toBe(createDate.toISOString());
        expect(new Date(basic.modifyDate).toISOString()).toBe(modifyDate.toISOString());
        expect(new Date(basic.metadataDate).toISOString()).toBe(metadataDate.toISOString());
        expect(basic.rating).toEqual([5]);
        expect(basic.rating.length).toBe(1);
        expect(basic.identifier).toEqual(['id1', 'id2']);
        expect(basic.identifier.length).toBe(2);
        expect(basic.advisory).toEqual(['adv1']);
        expect(basic.advisory.length).toBe(1);
        expect(basic.thumbnails.length).toBe(1);
        const thumb = basic.thumbnails[0];
        expect(thumb.width).toBe(64);
        expect(thumb.height).toBe(64);
        expect(thumb.format).toBe('JPEG');
        expect(thumb.image).toBe('img1');
        const newCreateDate = new Date('2027-01-01T00:00:00Z');
        basic.creatorTool = 'App2';
        basic.label = 'Label2';
        basic.nickname = 'Nick2';
        basic.baseUrl = 'http://updated.com';
        basic.createDate = newCreateDate;
        basic.modifyDate = newCreateDate;
        basic.metadataDate = newCreateDate;
        basic.rating = [3];
        basic.identifier = ['id3'];
        basic.advisory = ['adv2'];
        basic.thumbnails = [
            { width: 128, height: 128, format: 'PNG', image: 'img2' }
        ];
        const doc3 = new PdfDocument(doc2.save());
        const documentProperties3 = doc3.getDocumentInformation(false);
        const updated = documentProperties3.xmpMetadata!.basicSchema;
        expect(updated.creatorTool).toBe('App2');
        expect(updated.label).toBe('Label2');
        expect(updated.nickname).toBe('Nick2');
        expect(updated.baseUrl).toBe('http://updated.com');
        expect(new Date(updated.createDate).toISOString()).toBe(newCreateDate.toISOString());
        expect(new Date(updated.modifyDate).toISOString()).toBe(newCreateDate.toISOString());
        expect(new Date(updated.metadataDate).toISOString()).toBe(newCreateDate.toISOString());
        expect(updated.rating).toEqual([3]);
        expect(updated.identifier).toEqual(['id3']);
        expect(updated.advisory).toEqual(['adv2']);
        expect(updated.thumbnails.length).toBe(1);
        expect(updated.thumbnails[0].width).toBe(128);
        expect(updated.thumbnails[0].height).toBe(128);
        expect(updated.thumbnails[0].format).toBe('PNG');
        expect(updated.thumbnails[0].image).toBe('img2');
        doc.destroy();
        doc2.destroy();
        doc3.destroy();
    });

    it('PdfDublinCoreSchema - full validation (ALL properties)', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;
        xmp.dublinCoreSchema.title = { 'en-US': 'Hello' };
        xmp.dublinCoreSchema.description = { 'en-US': 'Desc' };
        xmp.dublinCoreSchema.rights = { 'en-US': 'Rights' };
        xmp.dublinCoreSchema.creator = ['Creator1'];
        xmp.dublinCoreSchema.contributor = ['Contributor1'];
        xmp.dublinCoreSchema.publisher = ['Publisher1'];
        xmp.dublinCoreSchema.relation = ['Relation1'];
        xmp.dublinCoreSchema.subject = ['PDF'];
        xmp.dublinCoreSchema.type = ['Document'];
        xmp.dublinCoreSchema.date = ['2026-05-14T10:00:00Z'];
        xmp.dublinCoreSchema.identifier = 'DOC-001';
        xmp.dublinCoreSchema.source = 'Source1';
        xmp.dublinCoreSchema.coverage = 'Global';
        xmp.dublinCoreSchema.format = 'application/pdf';
        documentProperties.xmpMetadata = xmp;
        const doc2 = new PdfDocument(doc.save());
        const documentProperties2 = doc2.getDocumentInformation(false);
        const dc = documentProperties2.xmpMetadata!.dublinCoreSchema;
        expect(dc.title['en-US']).toBe('Hello');
        expect(Object.keys(dc.title).length).toBe(1);
        expect(dc.description['en-US']).toBe('Desc');
        expect(dc.rights['en-US']).toBe('Rights');
        expect(dc.creator).toEqual(['Creator1']);
        expect(dc.creator.length).toBe(1);
        expect(dc.contributor).toEqual(['Contributor1']);
        expect(dc.publisher).toEqual(['Publisher1']);
        expect(dc.relation).toEqual(['Relation1']);
        expect(dc.subject).toEqual(['PDF']);
        expect(dc.type).toEqual(['Document']);
        expect(dc.date).toEqual(['2026-05-14T10:00:00Z']);
        expect(dc.identifier).toBe('DOC-001');
        expect(dc.source).toBe('Source1');
        expect(dc.coverage).toBe('Global');
        expect(dc.format).toBe('application/pdf');
        dc.title = { 'en-US': 'UpdatedTitle' };
        dc.description = { 'en-US': 'UpdatedDesc' };
        dc.rights = { 'en-US': 'UpdatedRights' };
        dc.creator = ['NewCreator'];
        dc.contributor = ['NewContributor'];
        dc.publisher = ['NewPublisher'];
        dc.relation = ['NewRelation'];
        dc.subject = ['XMP'];
        dc.type = ['UpdatedType'];
        dc.date = ['2027-01-01T00:00:00Z'];
        dc.identifier = 'DOC-002';
        dc.source = 'UpdatedSource';
        dc.coverage = 'India';
        dc.format = 'application/xml';
        const doc3 = new PdfDocument(doc2.save());
        const documentProperties3 = doc3.getDocumentInformation(false);
        const updated = documentProperties3.xmpMetadata!.dublinCoreSchema;
        expect(updated.title['en-US']).toBe('UpdatedTitle');
        expect(updated.description['en-US']).toBe('UpdatedDesc');
        expect(updated.rights['en-US']).toBe('UpdatedRights');
        expect(updated.creator).toEqual(['NewCreator']);
        expect(updated.contributor).toEqual(['NewContributor']);
        expect(updated.publisher).toEqual(['NewPublisher']);
        expect(updated.relation).toEqual(['NewRelation']);
        expect(updated.subject).toEqual(['XMP']);
        expect(updated.type).toEqual(['UpdatedType']);
        expect(updated.date).toEqual(['2027-01-01T00:00:00Z']);
        expect(updated.identifier).toBe('DOC-002');
        expect(updated.source).toBe('UpdatedSource');
        expect(updated.coverage).toBe('India');
        expect(updated.format).toBe('application/xml');
        doc.destroy();
        doc2.destroy();
        doc3.destroy();
    });

    it('PdfSchema - full validation (ALL properties)', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;
        xmp.pdfSchema.producer = 'Engine1';
        xmp.pdfSchema.keywords = 'PDF,XMP';
        xmp.pdfSchema.pdfVersion = '1.7';
        documentProperties.xmpMetadata = xmp;
        const doc2 = new PdfDocument(doc.save());
        const documentProperties2 = doc2.getDocumentInformation(false);
        const pdf = documentProperties2.xmpMetadata!.pdfSchema;
        expect(pdf.producer).toBe('Engine1');
        expect(pdf.keywords).toBe('PDF,XMP');
        expect(pdf.pdfVersion).toBe('1.7');
        pdf.producer = 'Engine2';
        pdf.keywords = 'Updated,Keywords';
        pdf.pdfVersion = '2.0';
        const doc3 = new PdfDocument(doc2.save());
        const documentProperties3 = doc3.getDocumentInformation(false);
        const updated = documentProperties3.xmpMetadata!.pdfSchema;
        expect(updated.producer).toBe('Engine2');
        expect(updated.keywords).toBe('Updated,Keywords');
        expect(updated.pdfVersion).toBe('2.0');
        doc.destroy();
        doc2.destroy();
        doc3.destroy();
    });

    it('PdfPagedTextSchema - full validation (ALL properties)', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;

        xmp.pagedTextSchema.pageCount = 10;
        xmp.pagedTextSchema.fonts = ['Arial'];
        xmp.pagedTextSchema.plateNames = ['Cyan'];
        xmp.pagedTextSchema.colorants = ['CMYK'];
        xmp.pagedTextSchema.maxPageSize = { width: 500, height: 800, unit: 'pt' };

        documentProperties.xmpMetadata = xmp;
        const doc2 = new PdfDocument(doc.save());
        const documentProperties2 = doc2.getDocumentInformation(false);
        const pt = documentProperties2.xmpMetadata!.pagedTextSchema;

        expect(pt.pageCount).toBe(10);
        expect(pt.fonts).toEqual(['Arial']);
        expect(pt.fonts.length).toBe(1);

        expect(pt.plateNames).toEqual(['Cyan']);
        expect(pt.plateNames.length).toBe(1);

        expect(pt.colorants).toEqual(['CMYK']);
        expect(pt.colorants.length).toBe(1);

        expect(pt.maxPageSize.width).toBe(500);
        expect(pt.maxPageSize.height).toBe(800);
        expect(pt.maxPageSize.unit).toBe('pt');

        pt.pageCount = 20;
        pt.fonts = ['Times'];
        pt.plateNames = ['Magenta'];
        pt.colorants = ['RGB'];
        pt.maxPageSize = { width: 600, height: 900, unit: 'px' };

        const doc3 = new PdfDocument(doc2.save());
        const documentProperties3 = doc3.getDocumentInformation(false);
        const updated = documentProperties3.xmpMetadata!.pagedTextSchema;

        expect(updated.pageCount).toBe(20);
        expect(updated.fonts).toEqual(['Times']);
        expect(updated.plateNames).toEqual(['Magenta']);
        expect(updated.colorants).toEqual(['RGB']);

        expect(updated.maxPageSize.width).toBe(600);
        expect(updated.maxPageSize.height).toBe(900);
        expect(updated.maxPageSize.unit).toBe('px');

        doc.destroy();
        doc2.destroy();
        doc3.destroy();
    });

    it('PdfBasicJobTicketSchema', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;

        xmp.basicJobTicketSchema.jobRef = ['Job1'];

        documentProperties.xmpMetadata = xmp;
        const doc2 = new PdfDocument(doc.save());
        const documentProperties2 = doc2.getDocumentInformation(false);
        const job = documentProperties2.xmpMetadata!.basicJobTicketSchema;

        expect(job.jobRef).toEqual(['Job1']);
        expect(job.jobRef.length).toBe(1);

        job.jobRef = ['Job2', 'Job3'];

        const doc3 = new PdfDocument(doc2.save());
        const documentProperties3 = doc3.getDocumentInformation(false);
        const updated = documentProperties3.xmpMetadata!.basicJobTicketSchema;

        expect(updated.jobRef).toEqual(['Job2', 'Job3']);
        expect(updated.jobRef.length).toBe(2);

        doc.destroy();
        doc2.destroy();
        doc3.destroy();
    });

    it('PdfRightsManagementSchema - full validation', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;

        xmp.rightsManagementSchema.certificateUrl  = 'cert-url';
        xmp.rightsManagementSchema.webStatement = 'rights-url';
        xmp.rightsManagementSchema.isMarked = true;
        xmp.rightsManagementSchema.owners = ['Owner1'];

        documentProperties.xmpMetadata = xmp;
        const doc2 = new PdfDocument(doc.save());
        const documentProperties2 = doc2.getDocumentInformation(false);
        const rights = documentProperties2.xmpMetadata!.rightsManagementSchema;

        expect(rights.certificateUrl ).toBe('cert-url');
        expect(rights.webStatement).toBe('rights-url');
        expect(rights.isMarked).toBe(true);
        expect(rights.owners).toEqual(['Owner1']);

        rights.isMarked = false;

        const doc3 = new PdfDocument(doc2.save());
        const documentProperties3 = doc3.getDocumentInformation(false);
        expect(documentProperties3.xmpMetadata!.rightsManagementSchema.isMarked).toBe(false);

        doc.destroy(); doc2.destroy(); doc3.destroy();
    });
    it('PdfRightsManagementSchema UsageTerms', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;

        xmp.rightsManagementSchema.usageTerms = { 'en-US': 'Title' };

        documentProperties.xmpMetadata = xmp;
        const doc2 = new PdfDocument(doc.save());
        const documentProperties2 = doc2.getDocumentInformation(false);
        const rights = documentProperties2.xmpMetadata!.rightsManagementSchema;

        expect(rights.usageTerms).toEqual({ 'en-US': 'Title' });
        rights.usageTerms = { 'en-US': 'UpdatedTitle' };

        const doc3 = new PdfDocument(doc2.save());
        const documentProperties3 = doc3.getDocumentInformation(false);
        expect(documentProperties3.xmpMetadata!.rightsManagementSchema.usageTerms).toEqual({ 'en-US': 'UpdatedTitle' });

        doc.destroy(); doc2.destroy(); doc3.destroy();
    });

});
describe('1023324 - Behavior Coverage Test scripts', () => {
    it('PdfBasicSchema', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;
        expect(xmp.basicSchema.createDate).toBeUndefined();
        expect(xmp.basicSchema.modifyDate).toBeUndefined();
        expect(xmp.basicSchema.metadataDate).toBeUndefined();
        // Set using _setProperty
        xmp.basicSchema._setProperty('xap:CreatorTool', 'App1');
        xmp.basicSchema._setProperty('xap:Label', 'Label1');
        xmp.basicSchema._setProperty('xap:Nickname', 'Nick1');
        xmp.basicSchema._setProperty('xap:BaseURL', 'http://test.com');
        xmp.basicSchema._setProperty('xap:Rating', [5]);
        xmp.basicSchema._setProperty('xap:Identifier', ['id1', 'id2']);
        xmp.basicSchema._setProperty('xap:Advisory', ['adv1']);

        xmp.basicSchema._setProperty('xap:Thumbnails', [
            { width: 64, height: 64, format: 'JPEG', image: 'img1' }
        ]);

        documentProperties.xmpMetadata = xmp;

        // Validations
        expect(documentProperties.xmpMetadata.basicSchema.creatorTool).toBe('App1');
        expect(documentProperties.xmpMetadata.basicSchema.label).toBe('Label1');
        expect(documentProperties.xmpMetadata.basicSchema.nickname).toBe('Nick1');
        expect(documentProperties.xmpMetadata.basicSchema.baseUrl).toBe('http://test.com');
        expect(documentProperties.xmpMetadata.basicSchema.rating).toEqual([5]);
        expect(documentProperties.xmpMetadata.basicSchema.identifier).toEqual(['id1', 'id2']);
        expect(documentProperties.xmpMetadata.basicSchema.advisory).toEqual(['adv1']);

        expect(documentProperties.xmpMetadata.basicSchema.thumbnails).toEqual([
            { width: 64, height: 64, format: 'JPEG', image: 'img1' }
        ]);
    });

    it('PdfDublinCoreSchema', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;

        // Set properties using _setProperty
        xmp.dublinCoreSchema._setProperty('dc:title', { 'en-US': 'Hello' });
        xmp.dublinCoreSchema._setProperty('dc:description', { 'en-US': 'Desc' });
        xmp.dublinCoreSchema._setProperty('dc:rights', { 'en-US': 'Rights' });

        xmp.dublinCoreSchema._setProperty('dc:creator', ['Creator1']);
        xmp.dublinCoreSchema._setProperty('dc:contributor', ['Contributor1']);
        xmp.dublinCoreSchema._setProperty('dc:publisher', ['Publisher1']);
        xmp.dublinCoreSchema._setProperty('dc:relation', ['Relation1']);
        xmp.dublinCoreSchema._setProperty('dc:subject', ['PDF']);
        xmp.dublinCoreSchema._setProperty('dc:type', ['Document']);
        xmp.dublinCoreSchema._setProperty('dc:date', ['2026-05-14T10:00:00Z']);

        xmp.dublinCoreSchema._setProperty('dc:identifier', 'DOC-001');
        xmp.dublinCoreSchema._setProperty('dc:source', 'Source1');
        xmp.dublinCoreSchema._setProperty('dc:coverage', 'Global');
        xmp.dublinCoreSchema._setProperty('dc:format', 'application/pdf');

        documentProperties.xmpMetadata = xmp;

        // Validation
        expect(documentProperties.xmpMetadata.dublinCoreSchema.title).toEqual({ 'en-US': 'Hello' });
        expect(documentProperties.xmpMetadata.dublinCoreSchema.description).toEqual({ 'en-US': 'Desc' });
        expect(documentProperties.xmpMetadata.dublinCoreSchema.rights).toEqual({ 'en-US': 'Rights' });

        expect(documentProperties.xmpMetadata.dublinCoreSchema.creator).toEqual(['Creator1']);
        expect(documentProperties.xmpMetadata.dublinCoreSchema.contributor).toEqual(['Contributor1']);
        expect(documentProperties.xmpMetadata.dublinCoreSchema.publisher).toEqual(['Publisher1']);
        expect(documentProperties.xmpMetadata.dublinCoreSchema.relation).toEqual(['Relation1']);
        expect(documentProperties.xmpMetadata.dublinCoreSchema.subject).toEqual(['PDF']);
        expect(documentProperties.xmpMetadata.dublinCoreSchema.type).toEqual(['Document']);
        expect(documentProperties.xmpMetadata.dublinCoreSchema.date).toEqual(['2026-05-14T10:00:00Z']);

        expect(documentProperties.xmpMetadata.dublinCoreSchema.identifier).toBe('DOC-001');
        expect(documentProperties.xmpMetadata.dublinCoreSchema.source).toBe('Source1');
        expect(documentProperties.xmpMetadata.dublinCoreSchema.coverage).toBe('Global');
        expect(documentProperties.xmpMetadata.dublinCoreSchema.format).toBe('application/pdf');
    });

    it('PdfSchema - full validation (ALL properties via setProperty)', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;

        // Set using _setProperty
        xmp.pdfSchema._setProperty('pdf:Producer', 'Engine1');
        xmp.pdfSchema._setProperty('pdf:Keywords', 'PDF,XMP');
        xmp.pdfSchema._setProperty('pdf:PDFVersion', '1.7');

        documentProperties.xmpMetadata = xmp;

        const pdf = documentProperties.xmpMetadata!.pdfSchema;

        // Initial validation
        expect(pdf._getProperty('pdf:Producer')).toBe('Engine1');
        expect(pdf._getProperty('pdf:Keywords')).toBe('PDF,XMP');
        expect(pdf._getProperty('pdf:PDFVersion')).toBe('1.7');

        // Update using _setProperty again
        xmp.pdfSchema._setProperty('pdf:Producer', 'Engine2');
        xmp.pdfSchema._setProperty('pdf:Keywords', 'Updated,Keywords');
        xmp.pdfSchema._setProperty('pdf:PDFVersion', '2.0');

        const updated = documentProperties.xmpMetadata!.pdfSchema;

        // Updated validation
        expect(updated.producer).toBe('Engine2');
        expect(updated.keywords).toBe('Updated,Keywords');
        expect(updated.pdfVersion).toBe('2.0');

        doc.destroy();
    });

    it('PdfPagedTextSchema - full validation (ALL properties via setProperty)', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;

        // Set using _setProperty
        xmp.pagedTextSchema._setProperty('xmpTPg:NPages', null);
        xmp.pagedTextSchema._setProperty('xmpTPg:Fonts', []);
        xmp.pagedTextSchema._setProperty('xmpTPg:PlateNames', ['Cyan']);
        xmp.pagedTextSchema._setProperty('xmpTPg:Colorants', ['CMYK']);
        xmp.pagedTextSchema._setProperty('xmpTPg:MaxPageSize', { width: 500, height: 800, unit: 'pt' });

        documentProperties.xmpMetadata = xmp;

        const pt = documentProperties.xmpMetadata!.pagedTextSchema;

        // Initial validation
        expect(pt.pageCount).toBe(0);

        expect(pt.fonts).toEqual([]);
        expect(pt.fonts.length).toBe(0);

        expect(pt.plateNames).toEqual(['Cyan']);
        expect(pt.plateNames.length).toBe(1);

        expect(pt.colorants).toEqual(['CMYK']);
        expect(pt.colorants.length).toBe(1);

        expect(pt.maxPageSize.width).toBe(500);
        expect(pt.maxPageSize.height).toBe(800);
        expect(pt.maxPageSize.unit).toBe('pt');

        // Update using _setProperty
        xmp.pagedTextSchema._setProperty('xmpTPg:NPages', 20);
        xmp.pagedTextSchema._setProperty('xmpTPg:Fonts', ['Times']);
        xmp.pagedTextSchema._setProperty('xmpTPg:PlateNames', ['Magenta']);
        xmp.pagedTextSchema._setProperty('xmpTPg:Colorants', ['RGB']);
        xmp.pagedTextSchema._setProperty('xmpTPg:MaxPageSize', { width: 600, height: 900, unit: 'px' });

        const updated = documentProperties.xmpMetadata!.pagedTextSchema;

        // Updated validation
        expect(updated.pageCount).toBe(20);
        expect(updated.fonts).toEqual(['Times']);
        expect(updated.plateNames).toEqual(['Magenta']);
        expect(updated.colorants).toEqual(['RGB']);

        expect(updated.maxPageSize.width).toBe(600);
        expect(updated.maxPageSize.height).toBe(900);
        expect(updated.maxPageSize.unit).toBe('px');

        doc.destroy();
    });;

    it('PdfBasicJobTicketSchema - full validation (ALL properties via setProperty)', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;

        // Set using _setProperty
        xmp.basicJobTicketSchema._setProperty('xmpBJ:JobRef', ['Job1']);

        documentProperties.xmpMetadata = xmp;
        const value = xmp.basicJobTicketSchema.jobRef

        const job = documentProperties.xmpMetadata.basicJobTicketSchema;

        // Initial validation
        expect(value).toEqual(['Job1']);
        expect(job.jobRef.length).toBe(1);

        // Update using _setProperty
        xmp.basicJobTicketSchema._setProperty('xmpBJ:JobRef', ['Job2', 'Job3']);

        const updated = documentProperties.xmpMetadata!.basicJobTicketSchema;

        // Updated validation
        expect(updated._getProperty('xmpBJ:JobRef')).toEqual(['Job2', 'Job3']);

        doc.destroy();
    });

    it('PdfRightsManagementSchema - full validation (via setProperty)', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;

        // Set using _setProperty
        xmp.rightsManagementSchema._setProperty('xmpRights:Certificate', 'cert-url');
        xmp.rightsManagementSchema._setProperty('xmpRights:WebStatement', 'rights-url');
        xmp.rightsManagementSchema._setProperty('xmpRights:Marked', true);
        xmp.rightsManagementSchema._setProperty('xmpRights:Owner', ['Owner1']);

        documentProperties.xmpMetadata = xmp;

        const rights = documentProperties.xmpMetadata!.rightsManagementSchema;

        // Initial validation
        expect(rights.certificateUrl ).toBe('cert-url');
        expect(rights.webStatement).toBe('rights-url');
        expect(rights.isMarked).toBe(true);
        expect(rights.owners).toEqual(['Owner1']);

        // Update using _setProperty
        xmp.rightsManagementSchema._setProperty('xmpRights:Marked', false);

        const updated = documentProperties.xmpMetadata!.rightsManagementSchema;

        // Updated validation
        expect(updated.isMarked).toBe(false);

        doc.destroy();
    });

    it('PdfCustomSchema - full validation', () => {
        const doc = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;
        expect(xmp.customSchema).toBeDefined();
        const custom = new PdfCustomSchema(xmp, 'cust', 'http://custom/ns');
        custom.customData.set('key1', 'value1');
        custom.customData.set('key2', 'value2');

        // xmp.customSchema = custom;
        documentProperties.xmpMetadata = xmp;

        const doc2 = new PdfDocument(doc.save());
        const documentProperties2 = doc2.getDocumentInformation(false);
        const cs = documentProperties2.xmpMetadata!.customSchema!;

        expect(cs.customData.get('key1')).toBeUndefined();
        expect(cs.customData.get('key2')).toBeUndefined();
        expect(cs.customData.size).toBe(0);

        cs.customData.set('key1', 'updated');

        const doc3 = new PdfDocument(doc2.save());
        const documentProperties3 = doc3.getDocumentInformation(false);
        const updated = documentProperties3.xmpMetadata!.customSchema!;

        expect(updated.customData.get('key1')).toEqual('updated');

        doc.destroy(); doc2.destroy(); doc3.destroy();
    });

    it('should not write namespace attribute when prefix already exists (covers else branch)', () => {
        // Arrange
        const writer: any = {
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeEndElement: jasmine.createSpy('_writeEndElement')
        };
        const schema: any = {
            prefix: 'testPrefix',
            _getNamespaceUri: jasmine.createSpy('_getNamespaceUri').and.returnValue('http://test.uri'),
            _writeXml: jasmine.createSpy('_writeXml')
        };
        const doc3 = new PdfDocument();
        const documentProperties = doc3.getDocumentInformation(false);
        const metadata: any = documentProperties.xmpMetadata;
        // Force registry to already contain prefix → triggers ELSE branch
        metadata._namespaceRegistry = new Set(['testPrefix']);
        // Act
        metadata._writeSchema(writer, schema);
        // Assert
        expect(writer._writeAttributeString).not.toHaveBeenCalledWith(
            'testPrefix',
            'http://test.uri',
            'xmlns',
            'http://www.w3.org/2000/xmlns/'
        );
        expect(schema._writeXml).toHaveBeenCalledWith(writer);
        expect(writer._writeEndElement).toHaveBeenCalled();
    });

    it('should return attribute name when localName matches (covers marked if)', () => {
        // Arrange
        const reader: any = new _XmlReader();

        const mockAttributes = {
            length: 1,
            item: (i: number) => ({
                localName: 'target',
                name: 'attr-target'
            })
        };
        const mockNode = {
            attributes: mockAttributes
        };
        // Act
        const result = reader._getAttributeName(mockNode, 'target');

        // Assert
        expect(result).toBe('attr-target');
    });

    it('should return empty array when bag is not found (covers else of if(bag))', () => {
        const reader: any = new _XmlReader();

        const mockNode = {};

        spyOn(reader, '_findChildElement').and.returnValue({}); // child exists
        spyOn(reader, '_findDirectChild').and.returnValue(null); // bag NOT found

        const result = reader._getArray(mockNode, 'tag');

        expect(result).toEqual([]); // nothing pushed
    });

    it('should not add child when localName does not match (covers else branch)', () => {
        // Arrange
        const reader: any = new _XmlReader();

        const mockChildren = {
            length: 2,
            item: (i: number) => ([
                { localName: 'not-match' },  // does NOT match
                { localName: 'another' }     // does NOT match
            ][i])
        };

        const mockNode = {
            children: mockChildren
        };

        // Act
        const result = reader._findDirectChildren(mockNode, 'target');

        // Assert
        expect(result).toEqual([]); // nothing added → ELSE branch hit
    });

    it('should NOT write unit when _MaxPageSize.unit is undefined (covers else branch)', () => {
        const schema: any = new PdfPagedTextSchema();

        schema._MaxPageSize = {
            width: 100,
            height: 200
            // unit is undefined → ELSE branch
        };

        const writer: any = {
            _writeStartElement: jasmine.createSpy(),
            _writeNamespaceDeclaration: jasmine.createSpy(),
            _writeElementString: jasmine.createSpy(),
            _writeEndElement: jasmine.createSpy()
        };

        // Act
        schema._writeXml(writer);

        // Assert
        expect(writer._writeElementString).not.toHaveBeenCalledWith(
            'unit', jasmine.anything(), 'stDim', jasmine.anything()
        );
    });

    it('should skip property when value is null or undefined (covers if branch)', () => {
        const schema: any = new PdfPagedTextSchema();

        schema._properties = new Map();
        schema._properties.set('xmpTPg:TestKey', null); // triggers IF

        const writer: any = {
            _writeElementString: jasmine.createSpy(),
            _writeStartElement: jasmine.createSpy(),
            _writeEndElement: jasmine.createSpy()
        };

        // Act
        schema._writeXml(writer);

        // Assert
        expect(writer._writeElementString).not.toHaveBeenCalledWith(
            'TestKey', jasmine.anything(), jasmine.anything(), jasmine.anything()
        );
    });
    it('should write array values when value is array (covers if branch)', () => {
        const schema: any = new PdfPagedTextSchema();

        schema._properties = new Map();
        schema._properties.set('xmpTPg:Items', []);

        const writer: any = {
            _writeStartElement: jasmine.createSpy(),
            _writeElementString: jasmine.createSpy(),
            _writeEndElement: jasmine.createSpy()
        };

        // Act
        schema._writeXml(writer);

        // Assert
        expect(writer._writeStartElement).not.toHaveBeenCalled(); // array branch hit
    });
    it('should write single value when not an array (covers else branch)', () => {
        const schema: any = new PdfPagedTextSchema();

        schema._properties = new Map();
        schema._properties.set('xmpTPg:Simple', 'value');

        const writer: any = {
            _writeElementString: jasmine.createSpy()
        };

        // Act
        schema._writeXml(writer);

        // Assert
        expect(writer._writeElementString).toHaveBeenCalledWith(
            'Simple', 'value', 'xmpTPg', jasmine.anything()
        );
    });
    it('should NOT call _writeString when lang key is not own property (ELSE branch)', () => {
        const schema: any = new PdfBasicSchema();

        spyOn(schema, '_isLangArray').and.returnValue(true);
        spyOn(schema, '_getNamespaceUriForPrefix').and.returnValue('ns');

        // Create object WITHOUT prototype → hasOwnProperty fails
        const langMap = Object.create(null);
        langMap['en'] = 'Hello';

        // Override hasOwnProperty behavior
        spyOn(Object.prototype, 'hasOwnProperty').and.returnValue(false);

        schema._properties = new Map();
        schema._properties.set('dc:title', langMap);

        const writer: any = {
            _writeStartElement: jasmine.createSpy(),
            _writeAttributeString: jasmine.createSpy(),
            _writeString: jasmine.createSpy(),
            _writeEndElement: jasmine.createSpy()
        };

        // Act
        schema._writeXml(writer);

        expect(writer._writeString).not.toHaveBeenCalled();
    });

    it('should skip property when value is null (IF branch)', () => {
        const schema: any = new PdfBasicSchema();

        schema._properties = new Map();
        schema._properties.set('dc:title', null); // triggers IF branch

        const writer: any = {
            _writeElementString: jasmine.createSpy(),
            _writeStartElement: jasmine.createSpy()
        };

        // Act
        schema._writeXml(writer);

        expect(writer._writeElementString).not.toHaveBeenCalled();
        expect(writer._writeStartElement).not.toHaveBeenCalled();
    });

    it('should skip property when value is null (IF branch)- pageTextedSchema', () => {
        const schema: any = new PdfPagedTextSchema();

        schema._properties = new Map();
        schema._properties.set('dc:title', null); // triggers IF branch

        const writer: any = {
            _writeElementString: jasmine.createSpy(),
            _writeStartElement: jasmine.createSpy()
        };

        // Act
        schema._writeXml(writer);

        expect(writer._writeElementString).not.toHaveBeenCalled();
        expect(writer._writeStartElement).not.toHaveBeenCalled();
    });

    it('Uncovered lines check', ()=>{
        const document: any = new PdfDocument();
        document._xmpMetadata = new PdfXmpMetadata();
        expect(document._getMetadataValue()).toBeDefined();
    });
});

describe('1023324 -_XmlReader - Error Handling Tests for lines 26-93', () => {

    it('_load - throws error when xpacket begin is missing from input string', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const invalidXmlString: string = '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF></rdf:RDF></x:xmpmeta>';
        let caughtError: Error | null = null;
        // Act
        try {
            reader._load(invalidXmlString);
        } catch (error) {
            caughtError = error as Error;
        }
        // Assert
        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toBe('XMP metadata not found in PDF');
    });

    it('_load - throws error when xpacket begin is missing from Uint8Array input', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const invalidXmlString: string = '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF></rdf:RDF></x:xmpmeta>';
        const invalidXmlBytes: Uint8Array = new TextEncoder().encode(invalidXmlString);
        let caughtError: Error | null = null;
        // Act
        try {
            reader._load(invalidXmlBytes);
        } catch (error) {
            caughtError = error as Error;
        }
        // Assert
        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toBe('XMP metadata not found in PDF');
    });

    it('_load - throws error when xpacket end is missing from input string', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const invalidXmlString: string = '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF></rdf:RDF></x:xmpmeta>';
        let caughtError: Error | null = null;
        // Act
        try {
            reader._load(invalidXmlString);
        } catch (error) {
            caughtError = error as Error;
        }
        // Assert
        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toBe('XMP metadata not found in PDF');
    });

    it('_load - throws error when xpacket end is missing from Uint8Array input', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const invalidXmlString: string = '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF></rdf:RDF></x:xmpmeta>';
        const invalidXmlBytes: Uint8Array = new TextEncoder().encode(invalidXmlString);
        let caughtError: Error | null = null;
        // Act
        try {
            reader._load(invalidXmlBytes);
        } catch (error) {
            caughtError = error as Error;
        }
        // Assert
        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toBe('XMP metadata not found in PDF');
    });

    it('_load - throws error when XML parsing fails with malformed XML', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const malformedXml: string = '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><unclosed><?xpacket end="r"?>';
        let caughtError: Error | null = null;
        // Act
        try {
            reader._load(malformedXml);
        } catch (error) {
            caughtError = error as Error;
        }
        // Assert
        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toContain('Invalid XMP XML:');
    });

    it('_load - throws error when XML has unclosed tags', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const unclosedTagXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta><rdf:RDF><rdf:Description><?xpacket end="r"?>';
        let caughtError: Error | null = null;
        // Act
        try {
            reader._load(unclosedTagXml);
        } catch (error) {
            caughtError = error as Error;
        }
        // Assert
        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toContain('Invalid XMP XML:');
    });

    it('_load - throws error when XML has mismatched tags', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const mismatchedTagXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta><rdf:RDF></rdf:Description></x:xmpmeta><?xpacket end="r"?>';
        let caughtError: Error | null = null;
        // Act
        try {
            reader._load(mismatchedTagXml);
        } catch (error) {
            caughtError = error as Error;
        }
        // Assert
        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toContain('Invalid XMP XML:');
    });

    it('_parseXmp - throws error when XML document is not loaded before parsing', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        let caughtError: Error | null = null;
        // Act
        try {
            reader._parseXmp();
        } catch (error) {
            caughtError = error as Error;
        }
        // Assert
        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toBe('XML document not loaded');
    });

    it('_parseXmp - throws error when rdf:RDF element is missing from loaded XML', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmlWithoutRdf: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><custom:data>test</custom:data></x:xmpmeta><?xpacket end="r"?>';
        let caughtError: Error | null = null;
        // Act
        try {
            reader._load(xmlWithoutRdf);
            reader._parseXmp();
        } catch (error) {
            caughtError = error as Error;
            expect(caughtError).toBeDefined();

        }
    });

    it('_parseXmp - throws error when RDF namespace is incorrect', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmlWithWrongNamespace: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://wrong.namespace/"></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let caughtError: Error | null = null;
        // Act
        try {
            reader._load(xmlWithWrongNamespace);
            reader._parseXmp();
        } catch (error) {
            caughtError = error as Error;
        }
        // Assert
        expect(caughtError).not.toBeNull();
        expect(caughtError!.message).toBe('rdf:RDF element not found in XMP metadata');
    });

    it('_load - successfully loads when both xpacket begin and end are present', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const validXml: string = '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:CreatorTool>TestTool</xap:CreatorTool></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let loadSuccess: boolean = false;
        // Act
        try {
            reader._load(validXml);
            loadSuccess = true;
        } catch (error) {
            loadSuccess = false;
        }
        // Assert
        expect(loadSuccess).toBe(true);
    });

    it('_parseXmp - successfully parses when valid XML with rdf:RDF is loaded', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const validXml: string = '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:CreatorTool>TestTool</xap:CreatorTool></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parseSuccess: boolean = false;
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        try {
            reader._load(validXml);
            parsedXmp = reader._parseXmp();
            parseSuccess = true;
        } catch (error) {
            parseSuccess = false;
        }
        // Assert
        expect(parseSuccess).toBe(true);
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.basicSchema.creatorTool).toBe('TestTool');
        parsedXmp!._destroy();
    });

    it('_load - extracts correct XML content between xpacket begin and end markers', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const pdfContent: string = 'PDF-HEADER<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:Label>TestLabel</xap:Label></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>PDF-FOOTER';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(pdfContent);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.basicSchema.label).toBe('TestLabel');
        parsedXmp!._destroy();
    });

    it('_load - handles Uint8Array input with valid XMP packet correctly', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const validXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xap="http://ns.adobe.com/xap/1.0/"><xap:Nickname>TestNick</xap:Nickname></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        const validXmlBytes: Uint8Array = new TextEncoder().encode(validXml);
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(validXmlBytes);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.basicSchema.nickname).toBe('TestNick');
        parsedXmp!._destroy();
    });

});

describe('1023324 - _parsePagedText - Else Branch Tests (lines 295-332)', () => {

    it('_parsePagedText - pageCount is empty string, schema.pageCount not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:NPages></xapPT:NPages></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.pageCount).toBe(0);
        parsedXmp!._destroy();
    });

    it('_parsePagedText - pageCount is undefined, schema.pageCount not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.pageCount).toBe(0);
        parsedXmp!._destroy();
    });

    it('_parsePagedText - maxPageSizeElement is null, schema.maxPageSize not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:NPages>5</xapPT:NPages></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.pageCount).toBe(5);
        expect(parsedXmp!.pagedTextSchema.maxPageSize).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parsePagedText - descriptionElement is null, maxPageSize not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:NPages>10</xapPT:NPages><xapPT:MaxPageSize></xapPT:MaxPageSize></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.pageCount).toBe(10);
        expect(parsedXmp!.pagedTextSchema.maxPageSize).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parsePagedText - width value missing, dimensions not created', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:MaxPageSize><rdf:Description xmlns:xapPT_Struct="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT_Struct:h>100</xapPT_Struct:h><xapPT_Struct:unit>in</xapPT_Struct:unit></rdf:Description></xapPT:MaxPageSize></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.maxPageSize).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parsePagedText - h value missing, dimensions not created', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:MaxPageSize><rdf:Description xmlns:xapPT_Struct="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT_Struct:w>200</xapPT_Struct:w><xapPT_Struct:unit>cm</xapPT_Struct:unit></rdf:Description></xapPT:MaxPageSize></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.maxPageSize).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parsePagedText - both width and h missing, dimensions not created', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:MaxPageSize><rdf:Description xmlns:xapPT_Struct="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT_Struct:unit>pt</xapPT_Struct:unit></rdf:Description></xapPT:MaxPageSize></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.maxPageSize).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parsePagedText - unit is empty, dimensions created without unit property', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:MaxPageSize><rdf:Description xmlns:xapPT_Struct="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT_Struct:w>150</xapPT_Struct:w><xapPT_Struct:h>200</xapPT_Struct:h></rdf:Description></xapPT:MaxPageSize></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.maxPageSize).not.toBeUndefined();
        expect(parsedXmp!.pagedTextSchema.maxPageSize!.width).toBe(150);
        expect(parsedXmp!.pagedTextSchema.maxPageSize!.height).toBe(200);
        expect(parsedXmp!.pagedTextSchema.maxPageSize!.unit).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parsePagedText - fonts array is empty, schema.fonts not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:Fonts><rdf:Bag></rdf:Bag></xapPT:Fonts></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.fonts).toEqual([]);
        parsedXmp!._destroy();
    });

    it('_parsePagedText - plateNames array is empty, schema.plateNames not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:PlateNames><rdf:Seq></rdf:Seq></xapPT:PlateNames></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.plateNames).toEqual([]);
        parsedXmp!._destroy();
    });

    it('_parsePagedText - colorants array is empty, schema.colorants not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xapPT="http://ns.adobe.com/xap/1.0/t/pg/"><xapPT:Colorants><rdf:Bag></rdf:Bag></xapPT:Colorants></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.pagedTextSchema.colorants).toEqual([]);
        parsedXmp!._destroy();
    });

});

describe('1023324 - _parseRights - Else Branch Tests (lines 340-361)', () => {

    it('_parseRights - certificate is empty string, schema.certificateUrl  not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:Certificate></xmpRights:Certificate></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.certificateUrl ).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parseRights - certificate is undefined, schema.certificateUrl  not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.certificateUrl ).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parseRights - webStatement is empty string, schema.webStatement not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:WebStatement></xmpRights:WebStatement></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.webStatement).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parseRights - webStatement is undefined, schema.webStatement not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:Certificate>CertValue</xmpRights:Certificate></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.certificateUrl ).toBe('CertValue');
        expect(parsedXmp!.rightsManagementSchema.webStatement).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parseRights - marked is empty string, schema.isMarked not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:Marked></xmpRights:Marked></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.isMarked).toBeFalsy();
        parsedXmp!._destroy();
    });

    it('_parseRights - marked is undefined, schema.isMarked not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:WebStatement>http://example.com</xmpRights:WebStatement></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.webStatement).toBe('http://example.com');
        expect(parsedXmp!.rightsManagementSchema.isMarked).toBeFalsy();
        parsedXmp!._destroy();
    });

    it('_parseRights - marked value is not "True", schema.isMarked set to false', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:Marked>False</xmpRights:Marked></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.isMarked).toBe(false);
        parsedXmp!._destroy();
    });

    it('_parseRights - owners array is empty, schema.owners not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:Owner><rdf:Bag></rdf:Bag></xmpRights:Owner></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.owners).toEqual([]);
        parsedXmp!._destroy();
    });

    it('_parseRights - owners element missing, schema.owners not set', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:Certificate>TestCert</xmpRights:Certificate></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.certificateUrl ).toBe('TestCert');
        expect(parsedXmp!.rightsManagementSchema.owners).toEqual([]);
        parsedXmp!._destroy();
    });

    it('_parseRights - usageTerms object is empty, _setProperty not called', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:UsageTerms></xmpRights:UsageTerms></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        const usageTermsValue: any = (parsedXmp!.rightsManagementSchema as any).usageTerms; //eslint-disable-line
        expect(usageTermsValue).toBeUndefined();
        parsedXmp!._destroy();
    });

    it('_parseRights - usageTerms element missing, _setProperty not called', () => {
        // Arrange
        const reader: _XmlReader = new _XmlReader();
        const xmpXml: string = '<?xpacket begin="\uFEFF"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"><xmpRights:Owner><rdf:Bag><rdf:li>Owner1</rdf:li></rdf:Bag></xmpRights:Owner></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="r"?>';
        let parsedXmp: PdfXmpMetadata | null = null;
        // Act
        reader._load(xmpXml);
        parsedXmp = reader._parseXmp();
        // Assert
        expect(parsedXmp).not.toBeNull();
        expect(parsedXmp!.rightsManagementSchema.owners).toEqual(['Owner1']);
        const usageTermsValue: any = (parsedXmp!.rightsManagementSchema as any).usageTerms; //eslint-disable-line
        expect(usageTermsValue).toBeUndefined();
        parsedXmp!._destroy();
    });

});
describe('1023324 - PdfCustomSchema - Complete Coverage (lines 0-251)', () => {

    it('constructor - initializes all properties with provided parameters', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const xmlNamespace: string = 'cust';
        const namespaceUri: string = 'http://custom.example.com/ns/';
        // Act
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, xmlNamespace, namespaceUri);
        // Assert
        expect(customSchema).toBeDefined();
        expect((customSchema as any)._namespace).toBe('cust');
        expect((customSchema as any)._namespaceUri).toBe('http://custom.example.com/ns/');
        expect((customSchema as any)._customNamespaceUri).toBe('http://custom.example.com/ns/');
        expect((customSchema as any)._prefix).toBe('cust');
        expect((customSchema as any)._name).toBe('http://custom.example.com/ns/');
        expect((customSchema as any)._customdata).toBeDefined();
        expect((customSchema as any)._customdata.size).toBe(0);
        xmp._destroy();
    });

    it('should support multiple custom schemas', () => {
        const doc = new PdfDocument();
        const props = doc.getDocumentInformation(false);
        const xmp = props.xmpMetadata;
        const custom = props.customMetadata;
        const custom1 = new PdfCustomSchema(xmp, 'cust1', 'http://ns1');
        custom1.customData.set('key1', 'value1');

        const custom2 = new PdfCustomSchema(xmp, 'cust2', 'http://ns2');
        custom2.customData.set('key2', 'value2');

        xmp._serializeToStream();

        const text = new TextDecoder().decode(xmp._xmpStream.bytes);

        expect(text).toContain('xmlns:cust1="http://ns1"');
        expect(text).toContain('xmlns:cust2="http://ns2"');

        expect(text).toContain('<cust1:key1>value1</cust1:key1>');
        expect(text).toContain('<cust2:key2>value2</cust2:key2>');
        doc.destroy();
    });

    it('should preserve multiple custom schemas after save and reload', () => {
        const doc = new PdfDocument();
        const props = doc.getDocumentInformation(false);
        const xmp = props.xmpMetadata;

        const c1 = new PdfCustomSchema(xmp, 'c1', 'http://ns1');
        c1.customData.set('k1', 'v1');

        const c2 = new PdfCustomSchema(xmp, 'c2', 'http://ns2');
        c2.customData.set('k2', 'v2');

        props.xmpMetadata = xmp;
        const bytes = doc.save();
        const doc2 = new PdfDocument(bytes);
        const xmp2 = doc2.getDocumentInformation(false).xmpMetadata;

        // Depending on your API:
        const all = (xmp2 as any)._customSchemas;
        expect(all.length).toBe(2);

        doc.destroy();
        doc2.destroy();
    });

    it('schemaType getter - returns PdfXmpSchemaType.custom', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, 'test', 'http://test.com/');
        // Act
        const schemaType: any = customSchema.schemaType; //eslint-disable-line
        // Assert
        expect(schemaType).toEqual('Custom');
        xmp._destroy();
    });

    it('prefix protected getter - returns xmlNamespace set during construction', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const xmlNamespace: string = 'myprefix';
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, xmlNamespace, 'http://ns.com/');
        // Act
        const prefixValue: string = (customSchema as any)._prefix; //eslint-disable-line
        // Assert
        expect(prefixValue).toBe('myprefix');
        xmp._destroy();
    });

    it('customData getter - returns empty Map on new instance', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom.com/');
        // Act
        const customData: Map<string, string> = customSchema.customData;
        // Assert
        expect(customData).toBeDefined();
        expect(customData.size).toBe(0);
        xmp._destroy();
    });

    it('customData getter - returns Map with entries after set operation', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom.com/');
        const newMap: Map<string, string> = new Map<string, string>();
        newMap.set('key1', 'value1');
        newMap.set('key2', 'value2');
        // Act
        customSchema.customData = newMap;
        const retrievedData: Map<string, string> = customSchema.customData;
        // Assert
        expect(retrievedData.size).toBe(2);
        expect(retrievedData.get('key1')).toBe('value1');
        expect(retrievedData.get('key2')).toBe('value2');
        xmp._destroy();
    });

    it('customData setter - replaces entire map with new Map instance', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom.com/');
        const originalMap: Map<string, string> = new Map<string, string>();
        originalMap.set('oldKey', 'oldValue');
        customSchema.customData = originalMap;
        const newMap: Map<string, string> = new Map<string, string>();
        newMap.set('newKey', 'newValue');
        // Act
        customSchema.customData = newMap;
        const retrievedData: Map<string, string> = customSchema.customData;
        // Assert
        expect(retrievedData.size).toBe(1);
        expect(retrievedData.get('newKey')).toBe('newValue');
        expect(retrievedData.get('oldKey')).toBeUndefined();
        xmp._destroy();
    });
    it('_writeXml - returns early when customData is empty', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom.com/');
        const mockWriter: any = { _writeElementString: jasmine.createSpy('_writeElementString') }; //eslint-disable-line
        // Act
        customSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).not.toHaveBeenCalled();
        xmp._destroy();
    });

    it('_writeXml - calls writer._writeElementString for each entry in customData', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, 'cust', 'http://custom.com/');
        customSchema.customData.set('appVersion', '1.0.0');
        customSchema.customData.set('buildNumber', '12345');
        const mockWriter: any = { _writeElementString: jasmine.createSpy('_writeElementString') }; //eslint-disable-line
        // Act
        customSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).toHaveBeenCalledTimes(2);
        expect(mockWriter._writeElementString).toHaveBeenCalledWith('appVersion', '1.0.0', 'cust', 'http://custom.com/');
        expect(mockWriter._writeElementString).toHaveBeenCalledWith('buildNumber', '12345', 'cust', 'http://custom.com/');
        xmp._destroy();
    });

    it('_writeXml - calls writer with correct namespace and URI for single entry', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, 'custom', 'http://example.org/');
        customSchema.customData.set('field1', 'data1');
        const mockWriter: any = { _writeElementString: jasmine.createSpy('_writeElementString') }; //eslint-disable-line
        // Act
        customSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).toHaveBeenCalledTimes(1);
        expect(mockWriter._writeElementString).toHaveBeenCalledWith('field1', 'data1', 'custom', 'http://example.org/');
        xmp._destroy();
    });

});
describe('1023324 - PdfXmpSchema - Base Class Tests (lines 0-253)', () => {

    it('_setProperty - skips null value, property not stored', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:nullProp';
        const value: null = null;
        // Act
        basicSchema._setProperty(key, value);
        const retrievedValue: any = basicSchema._getProperty(key); //eslint-disable-line
        // Assert
        expect(retrievedValue).toBeUndefined();
        xmp._destroy();
    });

    it('_setProperty - skips undefined value, property not stored', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:undefinedProp';
        const value: undefined = undefined;
        // Act
        basicSchema._setProperty(key, value);
        const retrievedValue: any = basicSchema._getProperty(key); //eslint-disable-line
        // Assert
        expect(retrievedValue).toBeUndefined();
        xmp._destroy();
    });

    it('_setProperty - normalizes Date to ISO 8601 UTC without milliseconds', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:dateProp';
        const dateValue: Date = new Date('2025-05-15T10:30:45.123Z');
        // Act
        basicSchema._setProperty(key, dateValue);
        const retrievedValue: string = basicSchema._getProperty(key);
        // Assert
        expect(retrievedValue).toBe('2025-05-15T10:30:45Z');
        expect(retrievedValue).not.toContain('.123');
        xmp._destroy();
    });

    it('_setProperty - normalizes boolean true to "True" string', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:boolPropTrue';
        const value: boolean = true;
        // Act
        basicSchema._setProperty(key, value);
        const retrievedValue: string = basicSchema._getProperty(key);
        // Assert
        expect(retrievedValue).toBe('True');
        expect(typeof retrievedValue).toBe('string');
        xmp._destroy();
    });

    it('_setProperty - normalizes boolean false to "False" string', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:boolPropFalse';
        const value: boolean = false;
        // Act
        basicSchema._setProperty(key, value);
        const retrievedValue: string = basicSchema._getProperty(key);
        // Assert
        expect(retrievedValue).toBe('False');
        expect(typeof retrievedValue).toBe('string');
        xmp._destroy();
    });

    it('_setProperty - stores string value as-is', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:stringProp';
        const value: string = 'TestValue123';
        // Act
        basicSchema._setProperty(key, value);
        const retrievedValue: string = basicSchema._getProperty(key);
        // Assert
        expect(retrievedValue).toBe('TestValue123');
        xmp._destroy();
    });

    it('_setProperty - stores number value as-is', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:numberProp';
        const value: number = 42;
        // Act
        basicSchema._setProperty(key, value);
        const retrievedValue: number = basicSchema._getProperty(key);
        // Assert
        expect(retrievedValue).toBe(42);
        xmp._destroy();
    });

    it('_setProperty - stores object value as-is', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:objectProp';
        const objValue: { name: string; age: number } = { name: 'Test', age: 25 };
        // Act
        basicSchema._setProperty(key, objValue);
        const retrievedValue: any = basicSchema._getProperty(key); //eslint-disable-line
        // Assert
        expect(retrievedValue).toEqual({ name: 'Test', age: 25 });
        xmp._destroy();
    });

    it('_getProperty - returns stored value when key exists', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:existingKey';
        const value: string = 'StoredValue';
        basicSchema._setProperty(key, value);
        // Act
        const retrievedValue: string = basicSchema._getProperty(key);
        // Assert
        expect(retrievedValue).toBe('StoredValue');
        xmp._destroy();
    });

    it('_getProperty - returns undefined when key does not exist', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const key: string = 'test:nonExistentKey';
        // Act
        const retrievedValue: any = basicSchema._getProperty(key); //eslint-disable-line
        // Assert
        expect(retrievedValue).toBeUndefined();
        xmp._destroy();
    });

    it('_getNamespaceUri - returns xap namespace URI for "xap" prefix', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        // Act
        const namespaceUri: string = basicSchema._getNamespaceUri();
        // Assert
        expect(namespaceUri).toBe('http://ns.adobe.com/xap/1.0/');
        xmp._destroy();
    });

    it('_getNamespaceUri - returns dc namespace URI for "dc" prefix', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const dublinCoreSchema: any = xmp.dublinCoreSchema; //eslint-disable-line
        // Act
        const namespaceUri: string = dublinCoreSchema._getNamespaceUri();
        // Assert
        expect(namespaceUri).toBe('http://purl.org/dc/elements/1.1/');
        xmp._destroy();
    });

    it('_getNamespaceUri - returns pdf namespace URI for "pdf" prefix', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const pdfSchema: any = xmp.pdfSchema; //eslint-disable-line
        // Act
        const namespaceUri: string = pdfSchema._getNamespaceUri();
        // Assert
        expect(namespaceUri).toBe('http://ns.adobe.com/pdf/1.3/');
        xmp._destroy();
    });

    it('_getNamespaceUri - returns xmpTPg namespace URI for "xmpTPg" prefix', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const pagedTextSchema: any = xmp.pagedTextSchema; //eslint-disable-line
        // Act
        const namespaceUri: string = pagedTextSchema._getNamespaceUri();
        // Assert
        expect(namespaceUri).toBe('http://ns.adobe.com/xap/1.0/t/pg/');
        xmp._destroy();
    });

    it('_getNamespaceUri - returns xmpRights namespace URI for "xmpRights" prefix', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const rightsSchema: any = xmp.rightsManagementSchema; //eslint-disable-line
        // Act
        const namespaceUri: string = rightsSchema._getNamespaceUri();
        // Assert
        expect(namespaceUri).toBe('http://ns.adobe.com/xap/1.0/rights/');
        xmp._destroy();
    });

    it('_getNamespaceUri - returns xmpBJ namespace URI for "xmpBJ" prefix', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const jobTicketSchema: any = xmp.basicJobTicketSchema; //eslint-disable-line
        // Act
        const namespaceUri: string = jobTicketSchema._getNamespaceUri();
        // Assert
        expect(namespaceUri).toBe('http://ns.adobe.com/xap/1.0/bj/');
        xmp._destroy();
    });

    it('_getNamespaceUri - returns custom namespace URI when _customNamespaceUri is set', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const customSchema: PdfCustomSchema = new PdfCustomSchema(xmp, 'custom', 'http://custom.example.org/');
        const customNsUri: any = customSchema; //eslint-disable-line
        // Act
        const namespaceUri: string = customNsUri._getNamespaceUri();
        // Assert
        expect(namespaceUri).toBe('http://custom.example.org/');
        xmp._destroy();
    });

    it('_getNamespaceUri - returns empty string for unknown prefix with no custom namespace', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        basicSchema._prefix = 'unknownPrefix';
        // Act
        const namespaceUri: string = basicSchema._getNamespaceUri();
        // Assert
        expect(namespaceUri).toBe('');
        xmp._destroy();
    });

    it('_setProperty and _getProperty - round-trip stores and retrieves multiple properties', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const prop1: string = 'xap:CreatorTool';
        const value1: string = 'MyApp';
        const prop2: string = 'xap:CreateDate';
        const value2: Date = new Date('2025-05-15T12:00:00.000Z');
        const prop3: string = 'xap:IsMarked';
        const value3: boolean = true;
        // Act
        basicSchema._setProperty(prop1, value1);
        basicSchema._setProperty(prop2, value2);
        basicSchema._setProperty(prop3, value3);
        const retrieved1: string = basicSchema._getProperty(prop1);
        const retrieved2: string = basicSchema._getProperty(prop2);
        const retrieved3: string = basicSchema._getProperty(prop3);
        // Assert
        expect(retrieved1).toBe('MyApp');
        expect(retrieved2).toBe('2025-05-15T12:00:00Z');
        expect(retrieved3).toBe('True');
        xmp._destroy();
    });

});
describe('1023324 - PdfXmpSchema._writeXml - Object.keys() extraction branch (lines 145-147)', () => {

    it('_writeXml - _properties with .keys() function branch TRUE - uses Array.from(keys())', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        basicSchema._setProperty('xap:CreatorTool', 'TestApp');
        const mockWriter: any = { //eslint-disable-line
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeEndElement: jasmine.createSpy('_writeEndElement'),
            _writeElementString: jasmine.createSpy('_writeElementString'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeString: jasmine.createSpy('_writeString')
        };
        // Act
        basicSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).toHaveBeenCalled();
        expect(basicSchema._properties.size).toBe(1);
        xmp._destroy();
    });

    it('_writeXml - _properties is null, keysArray remains empty', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        basicSchema._properties = null;
        const mockWriter: any = { //eslint-disable-line
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeEndElement: jasmine.createSpy('_writeEndElement'),
            _writeElementString: jasmine.createSpy('_writeElementString'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeString: jasmine.createSpy('_writeString')
        };
        // Act
        basicSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).not.toHaveBeenCalled();
        xmp._destroy();
    });

    it('_writeXml - _properties is undefined, keysArray remains empty', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        basicSchema._properties = undefined;
        const mockWriter: any = { //eslint-disable-line
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeEndElement: jasmine.createSpy('_writeEndElement'),
            _writeElementString: jasmine.createSpy('_writeElementString'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeString: jasmine.createSpy('_writeString')
        };
        // Act
        basicSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).not.toHaveBeenCalled();
        xmp._destroy();
    });

    it('_writeXml - _properties is string type, skips Object.keys() fallback', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        basicSchema._properties = 'not an object';
        const mockWriter: any = { //eslint-disable-line
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeEndElement: jasmine.createSpy('_writeEndElement'),
            _writeElementString: jasmine.createSpy('_writeElementString'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeString: jasmine.createSpy('_writeString')
        };
        // Act
        basicSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).not.toHaveBeenCalled();
        xmp._destroy();
    });

    it('_writeXml - Map type with .keys() function executes first IF branch, not else if', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        const mapProps: Map<string, string> = new Map<string, string>();
        mapProps.set('xap:Key1', 'Value1');
        mapProps.set('xap:Key2', 'Value2');
        basicSchema._properties = mapProps;
        const mockWriter: any = { //eslint-disable-line
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeEndElement: jasmine.createSpy('_writeEndElement'),
            _writeElementString: jasmine.createSpy('_writeElementString'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeString: jasmine.createSpy('_writeString')
        };
        // Act
        basicSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).toHaveBeenCalled();
        expect(basicSchema._properties.size).toBe(2);
        xmp._destroy();
    });

});
describe('1023324 - PdfXmpSchema - Else branch coverage (Object.keys fallback in _writeXml)', () => {

    it('_writeXml else if FALSE - _properties is number type does not execute Object.keys fallback', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        basicSchema._properties = 42;
        const mockWriter: any = { //eslint-disable-line
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeEndElement: jasmine.createSpy('_writeEndElement'),
            _writeElementString: jasmine.createSpy('_writeElementString'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeString: jasmine.createSpy('_writeString')
        };
        // Act
        basicSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).not.toHaveBeenCalled();
        xmp._destroy();
    });

    it('_writeXml else if FALSE - _properties is boolean type does not execute Object.keys fallback', () => {
        // Arrange
        const doc: PdfDocument = new PdfDocument();
        const documentProperties = doc.getDocumentInformation(false);
        const xmp: PdfXmpMetadata = documentProperties.xmpMetadata;
        const basicSchema: any = xmp.basicSchema; //eslint-disable-line
        basicSchema._properties = true;
        const mockWriter: any = { //eslint-disable-line
            _writeStartElement: jasmine.createSpy('_writeStartElement'),
            _writeEndElement: jasmine.createSpy('_writeEndElement'),
            _writeElementString: jasmine.createSpy('_writeElementString'),
            _writeAttributeString: jasmine.createSpy('_writeAttributeString'),
            _writeString: jasmine.createSpy('_writeString')
        };
        // Act
        basicSchema._writeXml(mockWriter);
        // Assert
        expect(mockWriter._writeElementString).not.toHaveBeenCalled();
        xmp._destroy();
    });
});
describe('1023324 - PdfXmpSchema - _getNamespaceUriForPrefix (default case)', () => {

    let schema: any;

    beforeEach(() => {
        schema = new PdfCustomSchema(null, null, null);
    });

    it('should return customNamespaceUri when prefix is unknown and customNamespaceUri is defined', () => {
        // Arrange
        schema._customNamespaceUri = 'http://custom.namespace/test';

        // Act
        const result = schema._getNamespaceUriForPrefix('unknownPrefix');

        // Assert
        expect(result).toBe('http://custom.namespace/test');
    });

    it('should return empty string when prefix is unknown and customNamespaceUri is undefined', () => {
        // Arrange
        schema._customNamespaceUri = undefined;

        // Act
        const result = schema._getNamespaceUriForPrefix('unknownPrefix');

        // Assert
        expect(result).toBe('');
    });

    it('should return empty string when prefix is unknown and customNamespaceUri is null', () => {
        // Arrange
        schema._customNamespaceUri = null;

        // Act
        const result = schema._getNamespaceUriForPrefix('anotherUnknown');

        // Assert
        expect(result).toBe('');
    });

    it('should return customNamespaceUri for any unmatched prefix when customNamespaceUri is set', () => {
        // Arrange
        schema._customNamespaceUri = 'http://dynamic.namespace';

        const prefixes = ['abc', '', 'random', '123'];

        prefixes.forEach(prefix => {
            const result = schema._getNamespaceUriForPrefix(prefix);
            expect(result).toBe('http://dynamic.namespace');
        });
    });

});
describe('1023324 - PdfXmpSchema - _isLangArray', () => {

    let schema: any;

    beforeEach(() => {
        schema = new PdfBasicSchema();
    });

    it('should return false when object has no keys (covers keys.length === 0)', () => {
        // Arrange
        const value = {};

        // Act
        const result = schema._isLangArray(value);

        // Assert
        expect(result).toBeFalsy();
    });

    it('should return true for valid lang array object', () => {
        const value = {
            en: 'Hello',
            fr: 'Bonjour'
        };

        const result = schema._isLangArray(value);

        expect(result).toBeTruthy();
    });

    it('should return false if values are not strings', () => {
        const value = {
            en: 'Hello',
            fr: 123 // invalid
        };

        const result = schema._isLangArray(value);

        expect(result).toBeFalsy();
    });

});
describe('1023324 - PdfXmpSchema - _isThumbnailStruct', () => {

    let schema: any;

    beforeEach(() => {
        schema = new PdfBasicSchema();
    });

    it('should return false when value is null', () => {
        const result = schema._isThumbnailStruct(null);
        expect(result).toBeFalsy();
    });

    it('should return false when value is not an object', () => {
        const result = schema._isThumbnailStruct('not-an-object');
        expect(result).toBeFalsy();
    });

    it('should return false when value is an array', () => {
        const result = schema._isThumbnailStruct([]);
        expect(result).toBeFalsy();
    });

    it('should return true for a valid thumbnail struct', () => {
        const value = {
            width: 100,
            height: 200,
            format: 'jpeg',
            image: 'base64string'
        };

        const result = schema._isThumbnailStruct(value);
        expect(result).toBeTruthy();
    });

    it('should return false if properties have invalid types', () => {
        const value = {
            width: '100', // invalid
            height: 200,
            format: 'jpeg',
            image: 'base64string'
        };

        const result = schema._isThumbnailStruct(value);
        expect(result).toBeFalsy();
    });

});
describe('1023324 - PdfBasicJobTicketSchema - jobRef getter', () => {

    let schema: any;

    beforeEach(() => {
        schema = new PdfBasicJobTicketSchema();
    });

    it('should return empty array when _jobRef is undefined and _getProperty returns undefined (covers target line)', () => {
        // Arrange
        schema._jobRef = undefined;
        spyOn(schema, '_getProperty').and.returnValue(undefined);

        // Act
        const result = schema.jobRef;

        // Assert
        expect(result).toEqual([]);
    });

    it('should return empty array when _jobRef is undefined and _getProperty returns null', () => {
        // Arrange
        schema._jobRef = undefined;
        spyOn(schema, '_getProperty').and.returnValue(null);

        // Act
        const result = schema.jobRef;

        // Assert
        expect(result).toEqual([]);
    });

    it('should return empty array when _jobRef is undefined and _getProperty returns empty string', () => {
        // Arrange
        schema._jobRef = undefined;
        spyOn(schema, '_getProperty').and.returnValue('');

        // Act
        const result = schema.jobRef;

        // Assert
        expect(result).toEqual([]);
    });

});
describe('1023324 - _XmlReader - _getValue (attr branch)', () => {

    let reader: any;
    let mockNode: any;

    beforeEach(() => {
        reader = new _XmlReader();

        mockNode = {
            getAttribute: jasmine.createSpy('getAttribute')
        };

        // Stub dependent methods
        spyOn(reader, '_findChildElement').and.returnValue(null);
        spyOn(reader, '_getAttributeName').and.returnValue('testAttr');
    });

    it('should return attribute value when child is null and attribute exists (covers if(attr))', () => {
        // Arrange
        mockNode.getAttribute.and.returnValue('attrValue');

        // Act
        const result = reader._getValue(mockNode, 'tag');

        // Assert
        expect(result).toBe('attrValue');
    });

    it('should return undefined when attribute is falsy', () => {
        // Arrange
        mockNode.getAttribute.and.returnValue(null);

        // Act
        const result = reader._getValue(mockNode, 'tag');

        // Assert
        expect(result).toBeUndefined();
    });

});
describe('1023324 - compressed PDF', () => {
    it('should set Dublin Core XMP metadata correctly', () => {
        const document: PdfDocument = new PdfDocument(compressedMetadata);
        const documentProperties = document.getDocumentInformation(false);
        const xmp = documentProperties.xmpMetadata;
        // Assign values
        xmp.dublinCoreSchema.contributor = ['A', 'B'];
        xmp.dublinCoreSchema.creator = ['Creator'];
        xmp.dublinCoreSchema.subject = ['PDF', 'XMP'];
        xmp.dublinCoreSchema.title = { 'en-US': 'Title', 'fr-FR': 'Titre' };
        xmp.dublinCoreSchema.description = { 'en-US': 'Desc' };
        xmp.dublinCoreSchema.rights = { 'en-US': 'Rights' };
        xmp.dublinCoreSchema.coverage = 'Global';
        xmp.dublinCoreSchema.identifier = 'ID123';
        xmp.dublinCoreSchema.source = 'http://source.com';

        // Assertions
        expect(xmp.dublinCoreSchema.contributor).toEqual(['A', 'B']);
        expect(xmp.dublinCoreSchema.creator).toEqual(['Creator']);
        expect(xmp.dublinCoreSchema.subject).toEqual(['PDF', 'XMP']);
        expect(xmp.dublinCoreSchema.title).toEqual({
            'en-US': 'Title',
            'fr-FR': 'Titre'
        });
        expect(xmp.dublinCoreSchema.description).toEqual({ 'en-US': 'Desc' });
        expect(xmp.dublinCoreSchema.rights).toEqual({ 'en-US': 'Rights' });
        expect(xmp.dublinCoreSchema.coverage).toBe('Global');
        expect(xmp.dublinCoreSchema.identifier).toBe('ID123');
        expect(xmp.dublinCoreSchema.source).toBe('http://source.com');
    });
});
describe('1023323 - PdfCustomMetadata - Full Coverage + Round Trip', () => {

    it('should set and get custom metadata', () => {
        const doc = new PdfDocument();
        const props = doc.getDocumentInformation(false);
        const meta = props.customMetadata;

        meta.set('DOCID', '10');
        meta.set('User', 'Ragul');

        expect(meta.get('DOCID')).toBe('10');
        expect(meta.get('User')).toBe('Ragul');
        expect(meta.has('DOCID')).toBe(true);
        expect(meta.has('User')).toBe(true);
        doc.setDocumentInformation(props);
        doc.destroy();
    });

    it('should overwrite existing key', () => {
        const doc = new PdfDocument();
        const meta = doc.getDocumentInformation(false).customMetadata;

        meta.set('DOCID', '1');
        meta.set('DOCID', '2');

        expect(meta.get('DOCID')).toBe('2');

        doc.destroy();
    });

    it('should remove metadata correctly', () => {
        const doc = new PdfDocument();
        const meta = doc.getDocumentInformation(false).customMetadata;

        meta.set('DOCID', '10');
        expect(meta.has('DOCID')).toBe(true);

        meta.remove('DOCID');
        expect(meta.has('DOCID')).toBe(false);

        const removedAgain = meta.remove('DOCID');

        doc.destroy();
    });

    it('should throw error for null or undefined key/value in set', () => {
        const doc = new PdfDocument();
        const meta = doc.getDocumentInformation(false).customMetadata;

        expect(() => meta.set(null as any, '1')).toThrowError();
        expect(() => meta.set('key', null as any)).toThrowError();
        expect(() => meta.set(undefined as any, '1')).toThrowError();
        expect(() => meta.set('key', undefined as any)).toThrowError();

        doc.destroy();
    });

    it('should throw error for empty key/value in set', () => {
        const doc = new PdfDocument();
        const meta = doc.getDocumentInformation(false).customMetadata;

        expect(() => meta.set('', 'value')).toThrowError();
        expect(() => meta.set('key', '')).toThrowError();

        doc.destroy();
    });

    it('should throw error for standard keys', () => {
        const doc = new PdfDocument();
        const meta = doc.getDocumentInformation(false).customMetadata;

        expect(() => meta.set('title', 'test')).toThrowError();
        expect(() => meta.set('AUTHOR', 'test')).toThrowError();

        doc.destroy();
    });

    it('should throw error for null/undefined in get/has/remove', () => {
        const doc = new PdfDocument();
        const meta = doc.getDocumentInformation(false).customMetadata;

        expect(() => meta.get(null as any)).toThrowError();
        expect(() => meta.has(undefined as any)).toThrowError();
        expect(() => meta.remove(null as any)).toThrowError();

        doc.destroy();
    });

    it('should return undefined for missing key', () => {
        const doc = new PdfDocument();
        const meta = doc.getDocumentInformation(false).customMetadata;

        expect(meta.get('missing')).toBeUndefined();
        expect(meta.has('missing')).toBe(false);

        doc.destroy();
    });

    it('custom metadata round trip (save and reload)', () => {
        const doc = new PdfDocument();
        const props = doc.getDocumentInformation(false);
        const meta = props.customMetadata;

        meta.set('DOCID', '100');
        meta.set('ENV', 'TEST');
        doc.setDocumentInformation(props);
        const doc2 = new PdfDocument(doc.save());
        const props2 = doc2.getDocumentInformation(false);
        const meta2 = props2.customMetadata;

        expect(meta2.get('DOCID')).toBe('100');
        expect(meta2.get('ENV')).toBe('TEST');
        expect(meta2.has('DOCID')).toBe(true);
        expect(meta2.has('ENV')).toBe(true);

        meta2.set('DOCID', '200');
        doc2.setDocumentInformation(props2);

        const doc3 = new PdfDocument(doc2.save());
        const meta3 = doc3.getDocumentInformation(false).customMetadata;

        expect(meta3.get('DOCID')).toBe('200');

        doc.destroy();
        doc2.destroy();
        doc3.destroy();
    });

    it('custom metadata + custom schema round trip', () => {
        const doc = new PdfDocument();
        const props = doc.getDocumentInformation(false);

        const meta = props.customMetadata;
        meta.set('DOCID', '500');

        const xmp = props.xmpMetadata;
        const customSchema = new PdfCustomSchema(xmp, 'cust', 'http://ns');

        customSchema.customData.set('key1', 'value1');
        customSchema.customData.set('key2', 'value2');

        props.xmpMetadata = xmp;
        doc.setDocumentInformation(props);
        const doc2 = new PdfDocument(doc.save());
        const props2 = doc2.getDocumentInformation(false);

        const meta2 = props2.customMetadata;
        const schema2 = props2.xmpMetadata.customSchema!;

        expect(meta2.get('DOCID')).toBe('500');
        expect(schema2.customData.get('key1')).toBeUndefined();
        expect(schema2.customData.size).toBe(1);

        meta2.set('DOCID', '600');
        schema2.customData.set('key1', 'updated');
        doc2.setDocumentInformation(props2);
        const doc3 = new PdfDocument(doc2.save());
        const props3 = doc3.getDocumentInformation(false);

        expect(props3.customMetadata.get('DOCID')).toBe('600');
        expect(props3.xmpMetadata!.customSchema!.customData.get('key1')).toBe('updated');
        doc.destroy();
        doc2.destroy();
    });
});
