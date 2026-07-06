import { PdfLineAnnotation, PdfPopupAnnotation, PdfRectangleAnnotation } from "../src/pdf/core/annotations/annotation";
import { DataFormat, PdfAnnotationState, PdfLineEndingStyle } from "../src/pdf/core/enumerator";
import { PdfDocument } from "../src/pdf/core/pdf-document";
import { PdfPage } from "../src/pdf/core/pdf-page";
import { _bytesToString } from "../src/pdf/core/utils";
import { crossReferenceTable } from "./inputs.spec";
describe('1023791 - Code Coverage - _export, _exportAsXfdf, _exportAsJson methods', () => {
    it('1023791 - _export - throws error when _page is missing', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'Test annotation' }
        );
        page.annotations.add(annotation);
        annotation._page = undefined as any;
        expect(() => annotation._export(DataFormat.xfdf))
            .toThrowError(/Annotation must be added to a page before export\./);
        document.destroy();
    });
    it('1023791 - _export - throws error when _dictionary is missing', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'Test annotation' }
        );
        page.annotations.add(annotation);
        annotation._dictionary = null as any;
        expect(() => annotation._export(DataFormat.xfdf))
            .toThrowError(/Annotation must be added to a page before export\./);
        document.destroy();
    });
    it('1023791 - _export - throws error for unsupported format', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'Test annotation' }
        );
        page.annotations.add(annotation);
        const invalidFormat: DataFormat = 999 as DataFormat;
        expect(() => annotation._export(invalidFormat))
            .toThrowError(/Unsupported export format\. Use DataFormat\.xfdf or DataFormat\.json\./);

        document.destroy();
    });
    it('1023791 - _export - successfully exports to xfdf when dictionary has P key', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'Test with P key' }
        );
        annotation.author = 'Test Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const savedData: Uint8Array = document.save();
        const reloadedDoc: PdfDocument = new PdfDocument(savedData);
        const reloadedPage: PdfPage = reloadedDoc.getPage(0);
        const reloadedAnnotation: PdfRectangleAnnotation = reloadedPage.annotations.at(0) as PdfRectangleAnnotation;
        const xfdfData: Uint8Array = reloadedAnnotation._export(DataFormat.xfdf);
        const xfdfString: string = _bytesToString(xfdfData);
        expect(xfdfData).toBeDefined();
        expect(xfdfData.length).toBeGreaterThan(0);
        expect(xfdfString).toContain('<?xml');
        expect(xfdfString).toContain('<xfdf');
        expect(xfdfString).toContain('<annots>');
        expect(xfdfString).toContain('<square');
        expect(xfdfString).toContain('</annots>');
        expect(xfdfString).toContain('</xfdf>');
        document.destroy();
        reloadedDoc.destroy();
    });
    it('1023791 - _export - successfully exports to xfdf when dictionary has no P key', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 50, y: 50, width: 150, height: 80 },
            { text: 'Test without P key' }
        );
        annotation.subject = 'Test Subject';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const xfdfData: Uint8Array = annotation._export(DataFormat.xfdf);
        const xfdfString: string = _bytesToString(xfdfData);
        expect(xfdfData).toBeDefined();
        expect(xfdfData.length).toBeGreaterThan(0);
        expect(xfdfString).toContain('<?xml');
        expect(xfdfString).toContain('<xfdf');
        expect(xfdfString).toContain('<annots>');
        expect(xfdfString).toContain('<square');
        expect(xfdfString).toContain('page="0"');
        expect(xfdfString).toContain('</annots>');
        expect(xfdfString).toContain('</xfdf>');
        document.destroy();
    });
    it('1023791 - _export - successfully exports to json format', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'Test JSON export' }
        );
        annotation.author = 'JSON Author';
        annotation.subject = 'JSON Subject';
        annotation.color = { r: 255, g: 0, b: 0 };
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const jsonData: Uint8Array = annotation._export(DataFormat.json);
        const jsonString: string = _bytesToString(jsonData);
        const jsonObj: any = JSON.parse(jsonString);
        expect(jsonData).toBeDefined();
        expect(jsonData.length).toBeGreaterThan(0);
        expect(jsonObj).toBeDefined();
        expect(jsonObj.pdfAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0]).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation.length).toBeGreaterThan(0);
        const annotData: any = jsonObj.pdfAnnotation[0].shapeAnnotation[0];
        expect(annotData.type).toBe('Square');
        expect(annotData.page).toBe('0');
        expect(annotData.title).toBe('JSON Author');
        expect(annotData.subject).toBe('JSON Subject');
        expect(annotData.contents).toBe('Test JSON export');
        document.destroy();
    });
    it('1023791 - _exportAsXfdf - exports annotation with no reviewHistory and no comments', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'Simple annotation' }
        );
        annotation.author = 'Simple Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const xfdfData: Uint8Array = annotation._export(DataFormat.xfdf);
        const xfdfString: string = _bytesToString(xfdfData);
        expect(xfdfString).toContain('<?xml');
        expect(xfdfString).toContain('<xfdf');
        expect(xfdfString).toContain('<annots>');
        expect(xfdfString).toContain('<square');
        expect(xfdfString).toContain('title="Simple Author"');
        expect(xfdfString).toContain('<contents>Simple annotation</contents>');
        expect(xfdfString).toContain('</square>');
        expect(xfdfString).toContain('</annots>');
        expect(xfdfString).toContain('<f href=');
        expect(xfdfString).toContain('</xfdf>');
        document.destroy();
    });
    it('1023791 - _exportAsXfdf - exports annotation with reviewHistory but no comments', () => {
        const document: PdfDocument = new PdfDocument(crossReferenceTable);
        const page: PdfPage = document.getPage(0);
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 50, y: 50, width: 150, height: 80 },
            { text: 'Annotation with review' }
        );
        annotation.author = 'Main Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const review: PdfPopupAnnotation = new PdfPopupAnnotation();
        review.text = 'Review comment';
        review.author = 'Reviewer';
        review.state = PdfAnnotationState.accepted;
        annotation.reviewHistory.add(review);
        const xfdfData: Uint8Array = annotation._export(DataFormat.xfdf);
        const xfdfString: string = _bytesToString(xfdfData);
        expect(xfdfString).toContain('<?xml');
        expect(xfdfString).toContain('<annots>');
        expect(xfdfString).toContain('<square');
        expect(xfdfString).toContain('title="Main Author"');
        expect(xfdfString).toContain('<contents>Annotation with review</contents>');
        expect(xfdfString).toContain('</annots>');
        expect(xfdfString).toContain('</xfdf>');
        document.destroy();
    });
    it('1023791 - _exportAsXfdf - exports annotation with comments but no reviewHistory', () => {
        const document: PdfDocument = new PdfDocument(crossReferenceTable);
        const page: PdfPage = document.getPage(0);
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 75, y: 75, width: 125, height: 100 },
            { text: 'Annotation with comments' }
        );
        annotation.author = 'Original Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const comment: PdfPopupAnnotation = new PdfPopupAnnotation();
        comment.text = 'This is a comment';
        comment.author = 'Commenter';
        annotation.comments.add(comment);
        const xfdfData: Uint8Array = annotation._export(DataFormat.xfdf);
        const xfdfString: string = _bytesToString(xfdfData);
        expect(xfdfString).toContain('<?xml');
        expect(xfdfString).toContain('<annots>');
        expect(xfdfString).toContain('<square');
        expect(xfdfString).toContain('title="Original Author"');
        expect(xfdfString).toContain('<contents>Annotation with comments</contents>');
        expect(xfdfString).toContain('</annots>');
        expect(xfdfString).toContain('</xfdf>');
        document.destroy();
    });
    it('1023791 - _exportAsXfdf - exports annotation with both reviewHistory and comments', () => {
        const document: PdfDocument = new PdfDocument(crossReferenceTable);
        const page: PdfPage = document.getPage(0);
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'Full annotation' }
        );
        annotation.author = 'Full Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const review: PdfPopupAnnotation = new PdfPopupAnnotation();
        review.text = 'Review text';
        review.author = 'Reviewer';
        review.state = PdfAnnotationState.completed;
        annotation.reviewHistory.add(review);
        const comment: PdfPopupAnnotation = new PdfPopupAnnotation();
        comment.text = 'Comment text';
        comment.author = 'Commenter';
        annotation.comments.add(comment);
        const xfdfData: Uint8Array = annotation._export(DataFormat.xfdf);
        const xfdfString: string = _bytesToString(xfdfData);
        expect(xfdfString).toContain('<?xml');
        expect(xfdfString).toContain('<annots>');
        expect(xfdfString).toContain('<square');
        expect(xfdfString).toContain('title="Full Author"');
        expect(xfdfString).toContain('<contents>Full annotation</contents>');
        expect(xfdfString).toContain('</annots>');
        expect(xfdfString).toContain('</xfdf>');
        document.destroy();
    });
    it('1023791 - _exportAsXfdf - exports comments with nested reviewHistory', () => {
        const document: PdfDocument = new PdfDocument(crossReferenceTable);
        const page: PdfPage = document.getPage(0);
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 150, y: 150, width: 180, height: 90 },
            { text: 'Nested structure' }
        );
        annotation.author = 'Nested Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const comment: PdfPopupAnnotation = new PdfPopupAnnotation();
        comment.text = 'Parent comment';
        comment.author = 'Parent Commenter';
        annotation.comments.add(comment);
        const nestedReview: PdfPopupAnnotation = new PdfPopupAnnotation();
        nestedReview.text = 'Nested review';
        nestedReview.author = 'Nested Reviewer';
        nestedReview.state = PdfAnnotationState.rejected;
        comment.reviewHistory.add(nestedReview);
        const xfdfData: Uint8Array = annotation._export(DataFormat.xfdf);
        const xfdfString: string = _bytesToString(xfdfData);
        expect(xfdfString).toContain('<?xml');
        expect(xfdfString).toContain('<annots>');
        expect(xfdfString).toContain('<square');
        expect(xfdfString).toContain('title="Nested Author"');
        expect(xfdfString).toContain('<contents>Nested structure</contents>');
        expect(xfdfString).toContain('</annots>');
        expect(xfdfString).toContain('</xfdf>');
        document.destroy();
    });
    it('1023791 - _exportAsJson - exports annotation with no reviewHistory and no comments', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'Simple JSON annotation' }
        );
        annotation.author = 'JSON Simple Author';
        annotation.subject = 'JSON Simple Subject';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const jsonData: Uint8Array = annotation._export(DataFormat.json);
        const jsonString: string = _bytesToString(jsonData);
        const jsonObj: any = JSON.parse(jsonString);
        expect(jsonObj).toBeDefined();
        expect(jsonObj.pdfAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0]).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation.length).toBe(1);
        const annotData: any = jsonObj.pdfAnnotation[0].shapeAnnotation[0];
        expect(annotData.type).toBe('Square');
        expect(annotData.page).toBe('0');
        expect(annotData.title).toBe('JSON Simple Author');
        expect(annotData.subject).toBe('JSON Simple Subject');
        expect(annotData.contents).toBe('Simple JSON annotation');
        document.destroy();
    });
    it('1023791 - _exportAsJson - exports annotation with reviewHistory but no comments', () => {
        const document: PdfDocument = new PdfDocument(crossReferenceTable);
        const page: PdfPage = document.getPage(0);
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 50, y: 50, width: 150, height: 80 },
            { text: 'JSON with review' }
        );
        annotation.author = 'JSON Review Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const review: PdfPopupAnnotation = new PdfPopupAnnotation();
        review.text = 'JSON review comment';
        review.author = 'JSON Reviewer';
        review.state = PdfAnnotationState.accepted;
        annotation.reviewHistory.add(review);
        const jsonData: Uint8Array = annotation._export(DataFormat.json);
        const jsonString: string = _bytesToString(jsonData);
        const jsonObj: any = JSON.parse(jsonString);
        expect(jsonObj).toBeDefined();
        expect(jsonObj.pdfAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0]).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation.length).toBeGreaterThan(1);
        const mainAnnot: any = jsonObj.pdfAnnotation[0].shapeAnnotation[0];
        expect(mainAnnot.type).toBe('Square');
        expect(mainAnnot.title).toBe('JSON Review Author');
        expect(mainAnnot.contents).toBe('JSON with review');
        document.destroy();
    });
    it('1023791 - _exportAsJson - exports annotation with comments but no reviewHistory', () => {
        const document: PdfDocument = new PdfDocument(crossReferenceTable);
        const page: PdfPage = document.getPage(0);
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 75, y: 75, width: 125, height: 100 },
            { text: 'JSON with comments' }
        );
        annotation.author = 'JSON Comment Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const comment: PdfPopupAnnotation = new PdfPopupAnnotation();
        comment.text = 'JSON comment text';
        comment.author = 'JSON Commenter';
        annotation.comments.add(comment);
        const jsonData: Uint8Array = annotation._export(DataFormat.json);
        const jsonString: string = _bytesToString(jsonData);
        const jsonObj: any = JSON.parse(jsonString);
        expect(jsonObj).toBeDefined();
        expect(jsonObj.pdfAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0]).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation.length).toBeGreaterThan(1);
        const mainAnnot: any = jsonObj.pdfAnnotation[0].shapeAnnotation[0];
        expect(mainAnnot.type).toBe('Square');
        expect(mainAnnot.title).toBe('JSON Comment Author');
        expect(mainAnnot.contents).toBe('JSON with comments');
        document.destroy();
    });
    it('1023791 - _exportAsJson - exports annotation with both reviewHistory and comments', () => {
        const document: PdfDocument = new PdfDocument(crossReferenceTable);
        const page: PdfPage = document.getPage(0);
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'JSON full annotation' }
        );
        annotation.author = 'JSON Full Author';
        annotation.subject = 'JSON Full Subject';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const review: PdfPopupAnnotation = new PdfPopupAnnotation();
        review.text = 'JSON review text';
        review.author = 'JSON Reviewer';
        review.state = PdfAnnotationState.completed;
        annotation.reviewHistory.add(review);
        const comment: PdfPopupAnnotation = new PdfPopupAnnotation();
        comment.text = 'JSON comment text';
        comment.author = 'JSON Commenter';
        annotation.comments.add(comment);
        const jsonData: Uint8Array = annotation._export(DataFormat.json);
        const jsonString: string = _bytesToString(jsonData);
        const jsonObj: any = JSON.parse(jsonString);
        expect(jsonObj).toBeDefined();
        expect(jsonObj.pdfAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0]).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation.length).toBeGreaterThan(2);
        const mainAnnot: any = jsonObj.pdfAnnotation[0].shapeAnnotation[0];
        expect(mainAnnot.type).toBe('Square');
        expect(mainAnnot.title).toBe('JSON Full Author');
        expect(mainAnnot.subject).toBe('JSON Full Subject');
        expect(mainAnnot.contents).toBe('JSON full annotation');
        document.destroy();
    });
    it('1023791 - _exportAsJson - exports comments with nested reviewHistory', () => {
        const document: PdfDocument = new PdfDocument(crossReferenceTable);
        const page: PdfPage = document.getPage(0);
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 150, y: 150, width: 180, height: 90 },
            { text: 'JSON nested structure' }
        );
        annotation.author = 'JSON Nested Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const comment: PdfPopupAnnotation = new PdfPopupAnnotation();
        comment.text = 'JSON parent comment';
        comment.author = 'JSON Parent Commenter';
        annotation.comments.add(comment);
        const nestedReview: PdfPopupAnnotation = new PdfPopupAnnotation();
        nestedReview.text = 'JSON nested review';
        nestedReview.author = 'JSON Nested Reviewer';
        nestedReview.state = PdfAnnotationState.rejected;
        comment.reviewHistory.add(nestedReview);
        const jsonData: Uint8Array = annotation._export(DataFormat.json);
        const jsonString: string = _bytesToString(jsonData);
        const jsonObj: any = JSON.parse(jsonString);
        expect(jsonObj).toBeDefined();
        expect(jsonObj.pdfAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0]).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation.length).toBeGreaterThan(2);
        const mainAnnot: any = jsonObj.pdfAnnotation[0].shapeAnnotation[0];
        expect(mainAnnot.type).toBe('Square');
        expect(mainAnnot.title).toBe('JSON Nested Author');
        expect(mainAnnot.contents).toBe('JSON nested structure');
        document.destroy();
    });
    it('1023791 - _exportAsXfdf - writes f element when asPerSpecification is false', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfRectangleAnnotation = new PdfRectangleAnnotation(
            { x: 100, y: 100, width: 200, height: 100 },
            { text: 'Test f element' }
        );
        annotation.author = 'F Element Author';
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const xfdfData: Uint8Array = annotation._export(DataFormat.xfdf);
        const xfdfString: string = _bytesToString(xfdfData);
        expect(xfdfString).toContain('<?xml');
        expect(xfdfString).toContain('<xfdf');
        expect(xfdfString).toContain('<annots>');
        expect(xfdfString).toContain('</annots>');
        expect(xfdfString).toContain('<f href=');
        expect(xfdfString).toContain('</xfdf>');
        document.destroy();
    });
    it('1023791 - _exportAsJson - verifies JSON structure and serialization', () => {
        const document: PdfDocument = new PdfDocument();
        const page: PdfPage = document.addPage();
        const annotation: PdfLineAnnotation = new PdfLineAnnotation(
            { x: 50, y: 50 }, { x: 200, y: 150 }
        );
        annotation.text = 'Line annotation JSON test';
        annotation.author = 'Line Author';
        annotation.color = { r: 0, g: 0, b: 255 };
        annotation.lineEndingStyle.begin = PdfLineEndingStyle.openArrow;
        annotation.lineEndingStyle.end = PdfLineEndingStyle.closedArrow;
        annotation.setAppearance(true);
        page.annotations.add(annotation);
        const jsonData: Uint8Array = annotation._export(DataFormat.json);
        const jsonString: string = _bytesToString(jsonData);
        const jsonObj: any = JSON.parse(jsonString);
        expect(jsonData).toBeDefined();
        expect(jsonData instanceof Uint8Array).toBe(true);
        expect(jsonString).toBeDefined();
        expect(typeof jsonString).toBe('string');
        expect(jsonObj).toBeDefined();
        expect(jsonObj.pdfAnnotation).toBeDefined();
        expect(jsonObj.pdfAnnotation[0]).toBeDefined();
        expect(jsonObj.pdfAnnotation[0].shapeAnnotation).toBeDefined();
        const annotData: any = jsonObj.pdfAnnotation[0].shapeAnnotation[0];
        expect(annotData.type).toBe('Line');
        expect(annotData.title).toBe('Line Author');
        expect(annotData.contents).toBe('Line annotation JSON test');
        expect(annotData.head).toBe('OpenArrow');
        expect(annotData.tail).toBe('ClosedArrow');
        document.destroy();
    });
});