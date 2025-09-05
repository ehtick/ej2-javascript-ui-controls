import { Browser, isNullOrUndefined } from '@syncfusion/ej2-base';
import { Rect, Size } from '@syncfusion/ej2-drawings';
import { PdfAnnotationBorder, PdfDocument, PdfPage, PdfRotationAngle, PdfSquareAnnotation, PdfAnnotationFlag, _PdfDictionary, _PdfName, PdfBorderEffectStyle, PdfBorderEffect, PdfAnnotationState, PdfAnnotationStateModel, PdfCircleAnnotation, PdfPopupAnnotation, PdfLineAnnotation, PdfLineEndingStyle, PdfFont, PdfFontStyle, PdfFontFamily, PdfStandardFont, PdfStringFormat, PdfTextAlignment, PdfRubberStampAnnotation, PdfPen, PdfBrush, PdfGraphics, PdfVerticalAlignment, PdfGraphicsState, PdfPath, PdfRubberStampAnnotationIcon, PdfBitmap, PdfImage, PdfPolyLineAnnotation, PdfCircleMeasurementType, PdfPopupIcon, PdfFreeTextAnnotation, PdfBorderStyle, PdfAnnotationCollection, PdfRectangleAnnotation, PdfPolygonAnnotation, PdfEllipseAnnotation, PdfTextMarkupAnnotation, PdfAnnotation, PdfInkAnnotation, PdfLineIntent, PdfAppearance, PdfTemplate, PdfTextMarkupAnnotationType, PdfLineCaptionType, PdfMeasurementUnit, PdfAnnotationIntent, PdfTrueTypeFont, _decode, _PdfBaseStream, _annotationFlagsToString, _RtlRenderer, _UnicodeLine, _TrueTypeReader, _UnicodeTrueTypeFont, _TrueTypeGlyph} from '@syncfusion/ej2-pdf';
import { PdfViewer, PdfViewerBase, SizeBase, PageRenderer, getArialFontData } from '../index';
import { PdfViewerUtils } from '../base/pdfviewer-utlis';

/**
 * AnnotationRenderer
 *
 * @hidden
 */
export class AnnotationRenderer {

    private formats: string[] = ['M/d/yyyy h:mm:ss tt', 'M/d/yyyy, h:mm:ss tt', 'M/d/yyyy h:mm tt',
        'MM/dd/yyyy hh:mm:ss', 'M/d/yyyy h:mm:ss',
        'M/d/yyyy hh:mm tt', 'M/d/yyyy hh tt',
        'M/d/yyyy h:mm', 'M/d/yyyy h:mm',
        'MM/dd/yyyy hh:mm', 'M/dd/yyyy hh:mm', 'dd/M/yyyy h:mm:ss tt', 'dd/M/yyyy, h:mm:ss tt',
        'M/d/yy, h:mm:ss tt', 'yyyy/MM/dd, h:mm:ss tt', 'dd/MMM/yy, h:mm:ss tt',
        'yyyy-MM-dd, h:mm:ss tt', 'dd-MMM-yy, h:mm:ss tt', 'MM-dd-yy, h:mm:ss tt', 'YYYY-MM-DDTHH:mm:ss.sssZ', '±YYYYYY-MM-DDTHH:mm:ss.sssZ', 'yyyy-MM-ddTHH:mm:ss.fffZ'];

    private pdfViewer: PdfViewer;
    private pdfViewerBase: PdfViewerBase;
    private defaultWidth: number;
    private defaultHeight: number;
    // eslint-disable-next-line
    public m_renderer: PageRenderer;

    /**
     * @param {PdfViewer} pdfViewer - The PdfViewer.
     * @param {PdfViewerBase} pdfViewerBase - The PdfViewerBase.
     * @private
     */
    constructor(pdfViewer: PdfViewer, pdfViewerBase: PdfViewerBase) {
        this.pdfViewer = pdfViewer;
        this.pdfViewerBase = pdfViewerBase;
    }

    /**
     * @param {any} details - details
     * @param {PdfPage} page - page
     * @private
     * @returns {void}
     */
    public addShape(details: any, page: PdfPage): void {
        const shapeAnnotation: any = details;
        const isLock: boolean = this.checkAnnotationLock(shapeAnnotation);
        if (!isNullOrUndefined(shapeAnnotation.shapeAnnotationType) && shapeAnnotation.shapeAnnotationType === 'Line') {
            const points: any = JSON.parse(shapeAnnotation.vertexPoints);
            const linePoints: number[] = this.getSaveVertexPoints(points, page);
            const lineAnnotation: PdfLineAnnotation = new PdfLineAnnotation(linePoints);
            if (!isNullOrUndefined(shapeAnnotation.note)) {
                lineAnnotation.text = shapeAnnotation.note.toString();
            }
            lineAnnotation.author = !isNullOrUndefined(shapeAnnotation.author) && shapeAnnotation.author.toString() !== '' ? shapeAnnotation.author.toString() : 'Guest';
            lineAnnotation._dictionary.set('NM', shapeAnnotation.annotName.toString());
            if (!isNullOrUndefined(shapeAnnotation.subject)) {
                lineAnnotation.subject = shapeAnnotation.subject.toString();
            }
            if (!isNullOrUndefined(shapeAnnotation.strokeColor)) {
                const strokeColor: any = JSON.parse(shapeAnnotation.strokeColor);
                const color: number[] = [strokeColor.r, strokeColor.g, strokeColor.b];
                lineAnnotation.color = color;
            }
            if (!isNullOrUndefined(shapeAnnotation.fillColor)) {
                const fillColor: any = JSON.parse(shapeAnnotation.fillColor);
                if (!isNullOrUndefined(fillColor.r) && !isNullOrUndefined(fillColor.g) && !isNullOrUndefined(fillColor.b) &&
                    !isNullOrUndefined(fillColor.a) && fillColor.a > 0) {
                    const innerColor: number[] = [fillColor.r, fillColor.g, fillColor.b];
                    lineAnnotation.innerColor = innerColor;
                }
            }
            if (!isNullOrUndefined(shapeAnnotation.opacity)) {
                lineAnnotation.opacity = shapeAnnotation.opacity;
            }
            const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
            lineBorder.width = shapeAnnotation.thickness;
            lineBorder.style = shapeAnnotation.borderStyle;
            lineBorder.dash = shapeAnnotation.borderDashArray;
            lineAnnotation.border = lineBorder;
            lineAnnotation.rotationAngle = this.getRotateAngle(shapeAnnotation.rotateAngle);
            lineAnnotation.lineEndingStyle.begin = this.getLineEndingStyle(shapeAnnotation.lineHeadStart);
            lineAnnotation.lineEndingStyle.end = this.getLineEndingStyle(shapeAnnotation.lineHeadEnd);
            let dateValue: Date;
            if (!isNullOrUndefined(shapeAnnotation.modifiedDate) && !isNaN(Date.parse(shapeAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(shapeAnnotation.modifiedDate));
                lineAnnotation.modifiedDate = dateValue;
            }
            const commentsDetails: any = shapeAnnotation.comments;
            const bounds: any = JSON.parse(shapeAnnotation.bounds);
            lineAnnotation.bounds = bounds;
            lineAnnotation.bounds.x = bounds.left;
            lineAnnotation.bounds.y = bounds.top;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    lineAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                           lineAnnotation.bounds));
                }
            }
            const reviewDetails: any = shapeAnnotation.review;
            lineAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, lineAnnotation.bounds));
            this.preserveIsLockProperty(shapeAnnotation, lineAnnotation);
            if (!isNullOrUndefined(shapeAnnotation.customData)) {
                lineAnnotation.setValues('CustomData', JSON.stringify(shapeAnnotation.customData));
            }
            if (shapeAnnotation.allowedInteractions && shapeAnnotation['allowedInteractions'] != null){
                lineAnnotation.setValues('AllowedInteractions', JSON.stringify(shapeAnnotation['allowedInteractions']));
            }
            lineAnnotation.setAppearance(true);
            page.annotations.add(lineAnnotation);
        }
        else if (!isNullOrUndefined(shapeAnnotation.shapeAnnotationType) && shapeAnnotation.shapeAnnotationType === 'Square') {
            const bounds: Rect = JSON.parse(shapeAnnotation.bounds);
            if (isNullOrUndefined(bounds.left)) {
                shapeAnnotation.bounds.left = 0;
            }
            if (isNullOrUndefined(bounds.top)) {
                shapeAnnotation.bounds.top = 0;
            }
            const cropValues : PointBase = this.getCropBoxValue(page, false);
            const left: number = this.convertPixelToPoint(bounds.left);
            const top: number = this.convertPixelToPoint(bounds.top);
            const width: number = this.convertPixelToPoint(bounds.width);
            const height: number = this.convertPixelToPoint(bounds.height);
            let cropX : number = 0;
            let cropY : number = 0;
            if (cropValues.x !== 0 && cropValues.y !== 0 && cropValues.x === left) {
                cropX = cropValues.x;
                cropY = cropValues.y;
            }

            else if (cropValues.x === 0 && page.cropBox[2] === page.size[0] && cropValues.y === page.size[1]) {
                cropX = cropValues.x;
                cropY = cropValues.y;
            }
            const squareAnnotation: PdfSquareAnnotation = new PdfSquareAnnotation(cropX + left, cropY + top, width, height);
            if (!isNullOrUndefined(shapeAnnotation.note)) {
                squareAnnotation.text = shapeAnnotation.note.toString();
            }
            squareAnnotation.author = !isNullOrUndefined(shapeAnnotation.author) && shapeAnnotation.author.toString() !== '' ? shapeAnnotation.author.toString() : 'Guest';
            squareAnnotation._dictionary.set('NM', shapeAnnotation.annotName.toString());
            if (!isNullOrUndefined(shapeAnnotation.subject)) {
                squareAnnotation.subject = shapeAnnotation.subject.toString();
            }
            if (!isNullOrUndefined(shapeAnnotation.strokeColor)) {
                const strokeColor: any = JSON.parse(shapeAnnotation.strokeColor);
                const color: number[] = [strokeColor.r, strokeColor.g, strokeColor.b];
                squareAnnotation.color = color;
            }
            if (!isNullOrUndefined(shapeAnnotation.fillColor)) {
                const fillColor: any = JSON.parse(shapeAnnotation.fillColor);
                if (!this.isTransparentColor(fillColor)){
                    const innerColor: number[] = [fillColor.r, fillColor.g, fillColor.b];
                    squareAnnotation.innerColor = innerColor;
                }
                if (fillColor.a < 1 && fillColor.a > 0) {
                    squareAnnotation._dictionary.update('FillOpacity', fillColor.a);
                    fillColor.a = 1;
                }
                else {
                    squareAnnotation._dictionary.update('FillOpacity', fillColor.a);
                }
            }
            if (!isNullOrUndefined(shapeAnnotation.opacity)) {
                squareAnnotation.opacity = shapeAnnotation.opacity;
            }
            const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
            lineBorder.width = shapeAnnotation.thickness;
            lineBorder.style = shapeAnnotation.borderStyle;
            lineBorder.dash = shapeAnnotation.borderDashArray;
            squareAnnotation.border = lineBorder;
            squareAnnotation.rotationAngle = this.getRotateAngle(shapeAnnotation.rotateAngle);
            let dateValue: Date;
            if (!isNullOrUndefined(shapeAnnotation.modifiedDate) && !isNaN(Date.parse(shapeAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(shapeAnnotation.modifiedDate));
                squareAnnotation.modifiedDate = dateValue;
            }
            const commentsDetails: any = shapeAnnotation.comments;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    squareAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                             squareAnnotation.bounds));
                }
            }
            const reviewDetails: any = shapeAnnotation.review;
            squareAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, squareAnnotation.bounds));
            if (!isNullOrUndefined(shapeAnnotation.isCloudShape) && shapeAnnotation.isCloudShape) {
                const borderEffect: PdfBorderEffect = new PdfBorderEffect();
                borderEffect.style = PdfBorderEffectStyle.cloudy;
                borderEffect.intensity = shapeAnnotation.cloudIntensity;
                squareAnnotation.borderEffect = borderEffect;
                const rectDifferences: string[] = JSON.parse(shapeAnnotation.rectangleDifference);
                if (rectDifferences.length > 0) {
                    const rd: number[] = this.getRDValues(rectDifferences);
                    squareAnnotation._dictionary.update('RD', rd);
                }
            }
            this.preserveIsLockProperty(shapeAnnotation, squareAnnotation);
            if (!isNullOrUndefined(shapeAnnotation.customData)) {
                squareAnnotation.setValues('CustomData', JSON.stringify(shapeAnnotation.customData));
            }
            if (shapeAnnotation.allowedInteractions && shapeAnnotation['allowedInteractions'] != null){
                squareAnnotation.setValues('AllowedInteractions', JSON.stringify(shapeAnnotation['allowedInteractions']));
            }
            squareAnnotation.setAppearance(true);
            page.annotations.add(squareAnnotation);
        }
        else if (!isNullOrUndefined(shapeAnnotation.shapeAnnotationType) && shapeAnnotation.shapeAnnotationType === 'Circle') {
            const bounds: Rect = JSON.parse(shapeAnnotation.bounds);
            const left: number = !isNullOrUndefined(bounds.left) ? this.convertPixelToPoint(bounds.left) : 0;
            const top: number = !isNullOrUndefined(bounds.top) ? this.convertPixelToPoint(bounds.top) : 0;
            const width: number = !isNullOrUndefined(bounds.width) ? this.convertPixelToPoint(bounds.width) : 0;
            const height: number = !isNullOrUndefined(bounds.height) ? this.convertPixelToPoint(bounds.height) : 0;
            const cropValues : PointBase = this.getCropBoxValue(page, false);
            let cropX : number = 0;
            let cropY : number = 0;
            if (cropValues.x !== 0 && cropValues.y !== 0 && cropValues.x === left) {
                cropX = cropValues.x;
                cropY = cropValues.y;
            }
            else if (cropValues.x === 0 && page.cropBox[2] === page.size[0] && cropValues.y === page.size[1]) {
                cropX = cropValues.x;
                cropY = cropValues.y;
            }
            const circleAnnotation: PdfCircleAnnotation = new PdfCircleAnnotation(cropX + left, cropY + top, width, height);
            if (!isNullOrUndefined(shapeAnnotation.note)) {
                circleAnnotation.text = shapeAnnotation.note.toString();
            }
            circleAnnotation.author = !isNullOrUndefined(shapeAnnotation.author) && shapeAnnotation.author.toString() !== '' ? shapeAnnotation.author.toString() : 'Guest';
            circleAnnotation._dictionary.set('NM', shapeAnnotation.annotName.toString());
            if (!isNullOrUndefined(shapeAnnotation.subject)) {
                circleAnnotation.subject = shapeAnnotation.subject.toString();
            }
            if (!isNullOrUndefined(shapeAnnotation.strokeColor)) {
                const strokeColor: any = JSON.parse(shapeAnnotation.strokeColor);
                const color: number[] = [strokeColor.r, strokeColor.g, strokeColor.b];
                circleAnnotation.color = color;
            }
            if (!isNullOrUndefined(shapeAnnotation.fillColor)) {
                const fillColor: any = JSON.parse(shapeAnnotation.fillColor);
                if (!this.isTransparentColor(fillColor)){
                    const innerColor: number[] = [fillColor.r, fillColor.g, fillColor.b];
                    circleAnnotation.innerColor = innerColor;
                }
                if (fillColor.a < 1 && fillColor.a > 0) {
                    circleAnnotation._dictionary.update('FillOpacity', fillColor.a);
                    fillColor.a = 1;
                }
                else {
                    circleAnnotation._dictionary.update('FillOpacity', fillColor.a);
                }
            }
            if (!isNullOrUndefined(shapeAnnotation.opacity)) {
                circleAnnotation.opacity = shapeAnnotation.opacity;
            }
            const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
            lineBorder.width = shapeAnnotation.thickness;
            lineBorder.style = shapeAnnotation.borderStyle;
            lineBorder.dash = shapeAnnotation.borderDashArray;
            circleAnnotation.border = lineBorder;
            circleAnnotation.rotationAngle = this.getRotateAngle(shapeAnnotation.rotateAngle);
            let dateValue: Date;
            if (!isNullOrUndefined(shapeAnnotation.modifiedDate) && !isNaN(Date.parse(shapeAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(shapeAnnotation.modifiedDate));
                circleAnnotation.modifiedDate = dateValue;
            }
            const commentsDetails: any = shapeAnnotation.comments;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    circleAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                             circleAnnotation.bounds));
                }
            }
            const reviewDetails: any = shapeAnnotation.review;
            circleAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, circleAnnotation.bounds));
            if (!isNullOrUndefined(shapeAnnotation.isCloudShape) && shapeAnnotation.isCloudShape) {
                const borderEffect: PdfBorderEffect = new PdfBorderEffect();
                borderEffect.style = PdfBorderEffectStyle.cloudy;
                borderEffect.intensity = shapeAnnotation.cloudIntensity;
                circleAnnotation._borderEffect = borderEffect;
                const rectDifferences: string[] = JSON.parse(shapeAnnotation.rectangleDifference);
                if (rectDifferences.length > 0) {
                    const rd: number[] = this.getRDValues(rectDifferences);
                    circleAnnotation._dictionary.update('RD', rd);
                }
            }
            this.preserveIsLockProperty(shapeAnnotation, circleAnnotation);
            if (!isNullOrUndefined(shapeAnnotation.customData)) {
                circleAnnotation.setValues('CustomData', JSON.stringify(shapeAnnotation.customData));
            }
            if (shapeAnnotation.allowedInteractions && shapeAnnotation['allowedInteractions'] != null){
                circleAnnotation.setValues('AllowedInteractions', JSON.stringify(shapeAnnotation['allowedInteractions']));
            }
            circleAnnotation.setAppearance(true);
            page.annotations.add(circleAnnotation);
        }
        else if (!isNullOrUndefined(shapeAnnotation.shapeAnnotationType) && shapeAnnotation.shapeAnnotationType === 'Polygon') {
            const points: any = JSON.parse(shapeAnnotation.vertexPoints);
            const linePoints: number[] = this.getSaveVertexPoints(points, page);
            const bounds: Rect = JSON.parse(shapeAnnotation.bounds);
            if (isNullOrUndefined(bounds.left)) {
                shapeAnnotation.bounds.left = 0;
            }
            if (isNullOrUndefined(bounds.top)) {
                shapeAnnotation.bounds.top = 0;
            }
            const left: number = this.convertPixelToPoint(bounds.left);
            const top: number = this.convertPixelToPoint(bounds.top);
            const width: number = this.convertPixelToPoint(bounds.width);
            const height: number = this.convertPixelToPoint(bounds.height);
            const polygonAnnotation: PdfPolygonAnnotation = new PdfPolygonAnnotation(linePoints);
            polygonAnnotation.bounds = new Rect(left, top, width, height);
            if (!isNullOrUndefined(shapeAnnotation.note)) {
                polygonAnnotation.text = shapeAnnotation.note.toString();
            }
            polygonAnnotation.author = !isNullOrUndefined(shapeAnnotation.author) && shapeAnnotation.author.toString() !== '' ? shapeAnnotation.author.toString() : 'Guest';
            if (!isNullOrUndefined(shapeAnnotation.subject)) {
                polygonAnnotation.subject = shapeAnnotation.subject.toString();
            }
            polygonAnnotation._dictionary.set('NM', shapeAnnotation.annotName.toString());
            if (!isNullOrUndefined(shapeAnnotation.strokeColor)) {
                const strokeColor: any = JSON.parse(shapeAnnotation.strokeColor);
                const color: number[] = [strokeColor.r, strokeColor.g, strokeColor.b];
                polygonAnnotation.color = color;
            }
            if (!isNullOrUndefined(shapeAnnotation.fillColor)) {
                const fillColor: any = JSON.parse(shapeAnnotation.fillColor);
                if (!this.isTransparentColor(fillColor)){
                    const innerColor: number[] = [fillColor.r, fillColor.g, fillColor.b];
                    polygonAnnotation.innerColor = innerColor;
                }
                if (fillColor.a < 1 && fillColor.a > 0) {
                    polygonAnnotation._dictionary.update('FillOpacity', fillColor.a);
                    fillColor.a = 1;
                }
                else {
                    polygonAnnotation._dictionary.update('FillOpacity', fillColor.a);
                }
            }
            if (!isNullOrUndefined(shapeAnnotation.opacity)) {
                polygonAnnotation.opacity = shapeAnnotation.opacity;
            }
            const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
            lineBorder.width = shapeAnnotation.thickness;
            lineBorder.style = shapeAnnotation.borderStyle;
            lineBorder.dash = shapeAnnotation.borderDashArray;
            polygonAnnotation.border = lineBorder;
            polygonAnnotation.rotationAngle = this.getRotateAngle(shapeAnnotation.rotateAngle);
            let dateValue: Date;
            if (!isNullOrUndefined(shapeAnnotation.modifiedDate) && !isNaN(Date.parse(shapeAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(shapeAnnotation.modifiedDate));
                polygonAnnotation.modifiedDate = dateValue;
            }
            const commentsDetails: any = shapeAnnotation.comments;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    polygonAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                              polygonAnnotation.bounds));
                }
            }
            const reviewDetails: any = shapeAnnotation.review;
            polygonAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, polygonAnnotation.bounds));
            if (!isNullOrUndefined(shapeAnnotation.isCloudShape) && shapeAnnotation.isCloudShape) {
                const borderEffect: PdfBorderEffect = new PdfBorderEffect();
                borderEffect.style = PdfBorderEffectStyle.cloudy;
                borderEffect.intensity = shapeAnnotation.cloudIntensity;
                polygonAnnotation.borderEffect = borderEffect;
                const rectDifferences: string[] = JSON.parse(shapeAnnotation.rectangleDifference);
                if (rectDifferences.length > 0) {
                    const rd: number[] = this.getRDValues(rectDifferences);
                    polygonAnnotation._dictionary.update('RD', rd);
                }
            }
            this.preserveIsLockProperty(shapeAnnotation, polygonAnnotation);
            if (!isNullOrUndefined(shapeAnnotation.customData)) {
                polygonAnnotation.setValues('CustomData', JSON.stringify(shapeAnnotation.customData));
            }
            if (!isNullOrUndefined(shapeAnnotation.allowedInteractions)) {
                polygonAnnotation.setValues('AllowedInteractions', JSON.stringify(shapeAnnotation.allowedInteractions));
            }
            polygonAnnotation.setAppearance(true);
            page.annotations.add(polygonAnnotation);
        }
        else if (!isNullOrUndefined(shapeAnnotation.shapeAnnotationType) && shapeAnnotation.shapeAnnotationType === 'Polyline') {
            const points: any = JSON.parse(shapeAnnotation.vertexPoints);
            const linePoints: number[] = this.getSaveVertexPoints(points, page);
            const bounds: Rect = JSON.parse(shapeAnnotation.bounds);
            const polylineAnnotation: PdfPolyLineAnnotation = new PdfPolyLineAnnotation(linePoints);
            polylineAnnotation.bounds = new Rect(
                this.convertPixelToPoint(bounds.left ? bounds.left : 0),
                this.convertPixelToPoint(bounds.top ? bounds.top : 0),
                this.convertPixelToPoint(bounds.width ? bounds.width : 0),
                this.convertPixelToPoint(bounds.height ? bounds.height : 0)
            );
            if (!isNullOrUndefined(shapeAnnotation.note)) {
                polylineAnnotation.text = shapeAnnotation.note.toString();
            }
            polylineAnnotation.author = !isNullOrUndefined(shapeAnnotation.author) && shapeAnnotation.author.toString() !== '' ? shapeAnnotation.author.toString() : 'Guest';
            if (!isNullOrUndefined(shapeAnnotation.subject)) {
                polylineAnnotation.subject = shapeAnnotation.subject.toString();
            }
            polylineAnnotation._dictionary.set('NM', shapeAnnotation.annotName.toString());
            if (!isNullOrUndefined(shapeAnnotation.strokeColor)) {
                const strokeColor: any = JSON.parse(shapeAnnotation.strokeColor);
                const color: number[] = [strokeColor.r, strokeColor.g, strokeColor.b];
                polylineAnnotation.color = color;
            }
            if (!isNullOrUndefined(shapeAnnotation.fillColor)) {
                const fillColor: any = JSON.parse(shapeAnnotation.fillColor);
                if (!this.isTransparentColor(fillColor)){
                    const innerColor: number[] = [fillColor.r, fillColor.g, fillColor.b];
                    polylineAnnotation.innerColor = innerColor;
                }
                if (fillColor.a < 1 && fillColor.a > 0) {
                    polylineAnnotation._dictionary.update('FillOpacity', fillColor.a);
                    fillColor.a = 1;
                }
                else {
                    polylineAnnotation._dictionary.update('FillOpacity', fillColor.a);
                }
            }
            if (!isNullOrUndefined(shapeAnnotation.opacity)) {
                polylineAnnotation.opacity = shapeAnnotation.opacity;
            }
            const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
            lineBorder.width = shapeAnnotation.thickness;
            lineBorder.style = shapeAnnotation.borderStyle;
            lineBorder.dash = shapeAnnotation.borderDashArray;
            polylineAnnotation.border = lineBorder;
            polylineAnnotation.rotationAngle = this.getRotateAngle(shapeAnnotation.rotateAngle);
            polylineAnnotation.beginLineStyle = this.getLineEndingStyle(shapeAnnotation.lineHeadStart);
            polylineAnnotation.endLineStyle = this.getLineEndingStyle(shapeAnnotation.lineHeadEnd);
            let dateValue: Date;
            if (!isNullOrUndefined(shapeAnnotation.modifiedDate) && !isNaN(Date.parse(shapeAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(shapeAnnotation.modifiedDate));
                polylineAnnotation.modifiedDate = dateValue;
            }
            const commentsDetails: any = shapeAnnotation.comments;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    polylineAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                               polylineAnnotation.bounds));
                }
            }
            const reviewDetails: any = shapeAnnotation.review;
            polylineAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, polylineAnnotation.bounds));
            if (!isNullOrUndefined(shapeAnnotation.isCloudShape) && shapeAnnotation.isCloudShape) {
                const dictionary: _PdfDictionary = new _PdfDictionary(page._crossReference);
                dictionary.update('S', _PdfName.get('C'));
                dictionary.update('I', shapeAnnotation.cloudIntensity);
                polylineAnnotation._dictionary.update('BE', dictionary);
                const rectDifferences: string[] = JSON.parse(shapeAnnotation.rectangleDifference);
                if (rectDifferences.length > 0) {
                    const rd: number[] = this.getRDValues(rectDifferences);
                    polylineAnnotation._dictionary.update('RD', rd);
                }
            }
            this.preserveIsLockProperty(shapeAnnotation, polylineAnnotation);
            polylineAnnotation.setAppearance(true);
            if (!isNullOrUndefined(shapeAnnotation.customData)) {
                polylineAnnotation.setValues('CustomData', JSON.stringify(shapeAnnotation.customData));
            }
            if (!isNullOrUndefined(shapeAnnotation.allowedInteractions)) {
                polylineAnnotation.setValues('AllowedInteractions', JSON.stringify(shapeAnnotation.allowedInteractions));
            }
            page.annotations.add(polylineAnnotation);
        }
        if (!isNullOrUndefined(shapeAnnotation.enableShapeLabel)  && shapeAnnotation.enableShapeLabel ) {
            const labelBounds: { [Key: string]: number } = JSON.parse(shapeAnnotation.labelBounds.toString());
            const left: number = this.convertPixelToPoint(labelBounds.left);
            let top: number = this.convertPixelToPoint(labelBounds.top);
            if (shapeAnnotation.shapeAnnotationType === 'Line') {
                top = top - 5;
            }
            const labelWidth: number = this.convertPixelToPoint(labelBounds.width);
            const labelHeight: number = this.convertPixelToPoint(labelBounds.height);
            const annotation: PdfFreeTextAnnotation = new PdfFreeTextAnnotation(top, left, labelWidth, labelHeight);
            annotation.author = shapeAnnotation.author;
            let dateValue: Date;
            if (!isNullOrUndefined(shapeAnnotation.modifiedDate) && !isNaN(Date.parse(shapeAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(shapeAnnotation.modifiedDate));
                annotation.modifiedDate = dateValue;
            }
            annotation._dictionary.set('NM', shapeAnnotation.annotName.toString() + 'freeText');
            annotation.lineEndingStyle = PdfLineEndingStyle.openArrow;
            annotation.annotationIntent = PdfAnnotationIntent.freeTextTypeWriter;
            let fontSize: number = 0;
            if (!isNullOrUndefined(shapeAnnotation.fontSize)) {
                fontSize = parseFloat(shapeAnnotation.fontSize);
            }
            fontSize = !isNullOrUndefined(fontSize) && !isNaN(fontSize) && fontSize > 0 ? fontSize : 16;
            const fontFamily: PdfFontFamily = this.getFontFamily(shapeAnnotation.fontFamily);
            const fontJson: { [key: string]: boolean } = {};
            const fontStyle: PdfFontStyle = this.getFontStyle(fontJson);
            annotation.font = new PdfStandardFont(fontFamily, fontSize, fontStyle);
            annotation.subject = 'Text Box';
            annotation.text = '';
            if (!isNullOrUndefined(shapeAnnotation.labelContent)) {
                if (shapeAnnotation.labelContent.toString() !== null) {
                    annotation.text = shapeAnnotation.labelContent.toString();
                }
            }
            annotation.rotationAngle = this.getRotateAngle(shapeAnnotation.rotateAngle);
            annotation.border = new PdfAnnotationBorder();
            if (Object.prototype.hasOwnProperty.call(shapeAnnotation, 'thickness')) {
                if (!isNullOrUndefined(shapeAnnotation.thickness)) {
                    const thickness: number = parseInt(shapeAnnotation.thickness.toString(), 10);
                    annotation.border.width = thickness;
                }
            }
            annotation.opacity = 1.0;
            if (Object.prototype.hasOwnProperty.call(shapeAnnotation, 'opacity')) {
                if (!isNullOrUndefined(shapeAnnotation.opacity)) {
                    annotation.opacity = parseFloat(shapeAnnotation.opacity);
                }
            }
            const color: { [key: string]: number } = JSON.parse(shapeAnnotation.labelBorderColor);
            const color1: number[] = [color.r, color.g, color.b];
            annotation.borderColor = color1;
            const fillColor: { [key: string]: number } = JSON.parse(shapeAnnotation.labelFillColor);
            const color2: number[] = [fillColor.r, fillColor.g, fillColor.b];
            annotation.color = color2;
            const textMarkupColor: { [key: string]: number } = JSON.parse(shapeAnnotation.fontColor);
            const color3: number[] = [textMarkupColor.r, textMarkupColor.g, textMarkupColor.b];
            annotation.textMarkUpColor = color3;
            const commentsDetails: any = annotation.comments;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    annotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)], annotation.bounds));
                }
            }
            if (!isNullOrUndefined(shapeAnnotation.customData)) {
                annotation.setValues('CustomData', shapeAnnotation.customData);
            }
            page.annotations.add(annotation);
        }
    }

    /**
     * @private
     * @param {any} details - details
     * @param {PdfPage} page - page
     * @returns {void}
     */
    public saveInkSignature(details: any, page: PdfPage): PdfInkAnnotation {
        const inkSignatureAnnotation: any = details;
        const bounds: Rect = JSON.parse(inkSignatureAnnotation.bounds);
        const stampObjects: any = JSON.parse(inkSignatureAnnotation.data.toString());
        const rotationAngle: number = this.getInkRotateAngle(page.rotation.toString());
        const left: number = this.convertPixelToPoint(bounds.x);
        const top: number = this.convertPixelToPoint(bounds.y);
        const width: number = this.convertPixelToPoint(bounds.width);
        const height: number = this.convertPixelToPoint(bounds.height);
        const opacity: number = inkSignatureAnnotation.opacity;
        const thickness: number = parseInt(inkSignatureAnnotation.thickness.toString(), 10);
        if (!isNullOrUndefined(inkSignatureAnnotation.strokeColor)) {
            const strokeColor: any = JSON.parse(inkSignatureAnnotation.strokeColor);
            const color: number[] = [strokeColor.r, strokeColor.g, strokeColor.b];
            inkSignatureAnnotation.color = color;
        }
        let minimumX: number = -1;
        let minimumY: number = -1;
        let maximumX: number = -1;
        let maximumY: number = -1;
        const drawingPath: PdfPath = new PdfPath();
        for (let p: number = 0; p < stampObjects.length; p++) {
            const val: any = stampObjects[parseInt(p.toString(), 10)];
            drawingPath.addLine(val.x, val.y, 0, 0);
        }
        const rotatedPath: Path = this.getRotatedPathForMinMax(drawingPath._points, rotationAngle);
        for (let k: number = 0; k < rotatedPath.points.length; k += 2) {
            const value: number[] = rotatedPath.points[parseInt(k.toString(), 10)];
            if (minimumX === -1) {
                minimumX = value[0];
                minimumY = value[1];
                maximumX = value[0];
                maximumY = value[1];
            }
            else {
                const point1: number = value[0];
                const point2: number = value[1];
                if (minimumX >= point1) {
                    minimumX = point1;
                }
                if (minimumY >= point2) {
                    minimumY = point2;
                }
                if (maximumX <= point1) {
                    maximumX = point1;
                }
                if (maximumY <= point2) {
                    maximumY = point2;
                }
            }
        }
        let newDifferenceX: number = (maximumX - minimumX) / width;
        let newDifferenceY: number = (maximumY - minimumY) / height;
        if (newDifferenceX === 0) {
            newDifferenceX = 1;
        }
        else if (newDifferenceY === 0) {
            newDifferenceY = 1;
        }
        let linePoints: number[] = [];
        let isNewValues: number = 0;
        if (rotationAngle !== 0) {
            for (let j: number = 0; j < stampObjects.length; j++) {
                const val: any = stampObjects[parseInt(j.toString(), 10)];
                const path: string = val['command'].toString();
                if (path === 'M' && j !== isNewValues) {
                    isNewValues = j;
                    break;
                }
                linePoints.push((parseFloat(val['x'].toString())));
                linePoints.push((parseFloat(val['y'].toString())));
            }
            const rotatedPoints: PdfPath = this.getRotatedPath(linePoints, rotationAngle);
            linePoints = [];
            for (let z: number = 0; z < rotatedPoints._points.length; z += 2) {
                linePoints.push((rotatedPoints._points[parseInt(z.toString(), 10)][0] - minimumX) / newDifferenceX + left);
                linePoints.push(page.size[1] - (rotatedPoints._points[parseInt(z.toString(), 10)][1] - minimumY) / newDifferenceY - top);
            }
        }
        else {
            for (let j: number = 0; j < stampObjects.length; j++) {
                const val: any = stampObjects[parseInt(j.toString(), 10)];
                const path: string = val['command'].toString();
                if (path === 'M' && j !== isNewValues) {
                    isNewValues = j;
                    break;
                }
                linePoints.push(((val.x - minimumX) / newDifferenceX) + left);
                const newX: number = ((val.y - minimumY) / newDifferenceY);
                linePoints.push(page.size[1] - newX - top);
            }
        }
        const colors: number[] = [inkSignatureAnnotation.color[0], inkSignatureAnnotation.color[1], inkSignatureAnnotation.color[2]];
        const inkAnnotation: PdfInkAnnotation = new PdfInkAnnotation([left, top, width, height], linePoints);
        let bound: Rect = new Rect();
        bound = new Rect(inkAnnotation.bounds.x, (page.size[1] - (inkAnnotation.bounds.y + inkAnnotation.bounds.height)),
                         inkAnnotation.bounds.width, inkAnnotation.bounds.height);
        inkAnnotation.bounds = bound;
        inkAnnotation.color = colors;
        linePoints = [];
        if (isNewValues > 0) {
            if (rotationAngle !== 0) {
                const pathCollection: number[][] = [];
                for (let i: number = isNewValues; i < stampObjects.length; i++) {
                    const val: any = stampObjects[parseInt(i.toString(), 10)];
                    const path: string = val['command'].toString();
                    if (path === 'M' && i !== isNewValues) {
                        pathCollection.push(linePoints);
                        linePoints = [];
                    }
                    linePoints.push(val['x']);
                    linePoints.push(val['y']);
                }
                if (linePoints.length > 0) {
                    pathCollection.push(linePoints);
                }
                for (let g: number = 0; g < pathCollection.length; g++) {
                    let graphicsPoints: any = [];
                    const pointsCollections: number[] = pathCollection[parseInt(g.toString(), 10)];
                    if (pointsCollections.length > 0) {
                        const rotatedPoints: PdfPath = this.getRotatedPath(pointsCollections, rotationAngle);
                        for (let z: number = 0; z < rotatedPoints._points.length; z += 2) {
                            graphicsPoints.push((rotatedPoints._points[parseInt(z.toString(), 10)][0] - minimumX) / newDifferenceX + left);
                            graphicsPoints.push(page.size[1] - (rotatedPoints._points[parseInt(z.toString(), 10)][1]
                                               - minimumY) / newDifferenceY - top);
                        }
                        inkAnnotation.inkPointsCollection.push(graphicsPoints);
                    }
                    graphicsPoints = [];
                }
            }
            else {
                for (let i: number = isNewValues; i < stampObjects.length; i++) {
                    const val: any = stampObjects[parseInt(i.toString(), 10)];
                    const path: string = val['command'].toString();
                    if (path === 'M' && i !== isNewValues) {
                        inkAnnotation.inkPointsCollection.push(linePoints);
                        linePoints = [];
                    }
                    linePoints.push((val['x'] - minimumX) / newDifferenceX + left);
                    const newX: number = ((val['y'] - minimumY) / newDifferenceY);
                    linePoints.push(page.size[1] - newX - top);
                }
                if (linePoints.length > 0) {
                    inkAnnotation.inkPointsCollection.push(linePoints);
                }
            }
        }
        const isLock: boolean = this.checkAnnotationLock(inkSignatureAnnotation);
        if (isNullOrUndefined(inkSignatureAnnotation.author) || (isNullOrUndefined(inkSignatureAnnotation.author) && inkSignatureAnnotation.author === '')) {
            inkSignatureAnnotation.author = 'Guest';
        }
        else {
            inkAnnotation.author = !isNullOrUndefined(inkSignatureAnnotation.author) ? inkSignatureAnnotation.author.toString() !== '' ? inkSignatureAnnotation.author.toString() : 'Guest' : 'Guest';
        }
        if (!isNullOrUndefined(inkSignatureAnnotation.subject) && inkSignatureAnnotation.subject !== '') {
            inkAnnotation.subject = inkSignatureAnnotation.subject.toString();
        }
        if (!isNullOrUndefined(inkSignatureAnnotation.note)) {
            inkAnnotation.text = inkSignatureAnnotation.note.toString();
        }
        else if (!isNullOrUndefined(inkSignatureAnnotation.notes)) {
            inkAnnotation.text = inkSignatureAnnotation.notes.toString();
        }

        let dateValue: Date;
        if (!isNullOrUndefined(inkSignatureAnnotation.modifiedDate) && !isNaN(Date.parse(inkSignatureAnnotation.modifiedDate))) {
            dateValue = new Date(Date.parse(inkSignatureAnnotation.modifiedDate));
            inkAnnotation.modifiedDate = dateValue;
        }
        const reviewDetails: any = inkSignatureAnnotation.review;
        inkAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, inkAnnotation.bounds));
        const commentsDetails: any = inkSignatureAnnotation.comments;
        if (commentsDetails.length > 0) {
            for (let i: number = 0; i < commentsDetails.length; i++) {
                inkAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)], inkAnnotation.bounds));
            }
        }
        this.preserveIsLockProperty(inkSignatureAnnotation, inkAnnotation);
        inkAnnotation.border.width = thickness;
        inkAnnotation.opacity = opacity;
        inkAnnotation._isEnableControlPoints = false;
        inkAnnotation._dictionary.set('NM', inkSignatureAnnotation.annotName.toString());
        inkAnnotation.rotationAngle = this.getRotateAngle(inkSignatureAnnotation.rotationAngle);
        if (!isNullOrUndefined(inkSignatureAnnotation.customData)) {
            inkAnnotation.setValues('CustomData', JSON.stringify(inkSignatureAnnotation.customData));
        }
        inkAnnotation.setAppearance(true);
        page.annotations.add(inkAnnotation);
        return inkSignatureAnnotation;
    }

    /**
     * @private
     * @param {number[]} linePoints - points
     * @param {number} rotationAngle - rotateAngle
     * @returns {PdfPath} - graphicsPath
     */
    public getRotatedPath(linePoints: number[], rotationAngle: number): PdfPath {
        const docPath: Path = this.getRotatedPoints(linePoints, rotationAngle);
        const graphicsPath: PdfPath = new PdfPath();
        for (let j: number = 0; j < docPath.points.length; j += 2) {
            graphicsPath.addLine(docPath.points[parseInt(j.toString(), 10)][0], docPath.points[parseInt(j.toString(), 10)][1],
                                 docPath.points[parseInt((j + 1).toString(), 10)][0], docPath.points[j + 1][1]);
        }
        return graphicsPath;
    }

    private getRotationMatrix(angleInDegrees: number): [number, number, number][] {
        const angleInRadians: number = angleInDegrees * (Math.PI / 180);
        const cosTheta: number = Math.cos(angleInRadians);
        const sinTheta: number = Math.sin(angleInRadians);
        return [
            [cosTheta, -sinTheta, 0],
            [sinTheta, cosTheta, 0],
            [0, 0, 1]
        ];
    }

    private getRotatedPoints(pointsCollection: any, rotationAngle: any): Path {
        const graphicsPath: Path = new Path();
        for (let j: number = 0; j < pointsCollection.length; j += 2) {
            graphicsPath.moveTo(pointsCollection[parseInt(j.toString(), 10)], pointsCollection[parseInt((j + 1).toString(), 10)]);
            graphicsPath.lineTo(0, 0);
        }
        const rotationMatrix: [number, number, number][] = this.getRotationMatrix(rotationAngle);
        graphicsPath.transform(rotationMatrix);
        return graphicsPath;
    }

    /**
     * Rotates a path based on the provided points collection and rotation angle.
     * @param {number[]} pointsCollection - The collection of points to be rotated.
     * @param {number} rotationAngle - The angle to rotate the points, in degrees.
     * @returns {Path} - The rotated graphics path.
     * @private
     */
    public getRotatedPathForMinMax(pointsCollection: number[][], rotationAngle: number): Path {
        const graphicsPath: Path = new Path();
        for (let j: number = 0; j < pointsCollection.length; j += 2) {
            graphicsPath.moveTo(pointsCollection[parseInt(j.toString(), 10)][0], pointsCollection[parseInt(j.toString(), 10)][1]);
            graphicsPath.lineTo(pointsCollection[parseInt((j + 1).toString(), 10)][0],
                                pointsCollection[parseInt((j + 1).toString(), 10)][1]);
        }
        const rotationMatrix: [number, number, number][] = this.getRotationMatrix(rotationAngle);
        graphicsPath.transform(rotationMatrix);
        return graphicsPath;
    }

    /**
     * @param {any} details -details
     * @param {PdfDocument} loadedDocument - loadedDocument
     * @private
     * @returns {void}
     */
    public addTextMarkup(details: any, loadedDocument: PdfDocument): void{
        const markupAnnotation: any = details;
        const pageNo: number = parseInt(markupAnnotation['pageNumber'].toString(), 10);
        const page: PdfPage = loadedDocument.getPage(pageNo);
        const annotationtypes: PdfTextMarkupAnnotation = new PdfTextMarkupAnnotation();
        switch (markupAnnotation.textMarkupAnnotationType.toString()){
        case 'Highlight':
            annotationtypes.textMarkupType = PdfTextMarkupAnnotationType.highlight;
            break;
        case 'Strikethrough':
            annotationtypes.textMarkupType = PdfTextMarkupAnnotationType.strikeOut;
            break;
        case 'Underline':
            annotationtypes.textMarkupType = PdfTextMarkupAnnotationType.underline;
            break;
        case 'Squiggly':
            annotationtypes.textMarkupType = PdfTextMarkupAnnotationType.squiggly;
            break;
        }
        const bounds: {[key: string]: number}[] = JSON.parse(markupAnnotation.bounds);
        const boundsCollection: Rect[] = [];
        for (let i: number = 0; i < bounds.length; i++){
            const bound:  {[key: string]: number} = bounds[parseInt(i.toString(), 10)];
            const cropValues: PointBase = this.getCropBoxValue(page, true);
            if (!isNullOrUndefined(bound['left'])){
                boundsCollection.push(new Rect(cropValues.x + this.convertPixelToPoint(bound['left']), cropValues.y + this.convertPixelToPoint(bound['top']), Object.prototype.hasOwnProperty.call(bound, 'width') ? this.convertPixelToPoint(bound['width']) : 0, Object.prototype.hasOwnProperty.call(bound, 'height') ? this.convertPixelToPoint(bound['height']) : 0));
            }
        }
        const annotation: PdfTextMarkupAnnotation = new PdfTextMarkupAnnotation(null, 0, 0, 0, 0);
        if (boundsCollection.length > 0) {
            annotation.bounds = { x: boundsCollection[0].x, y: boundsCollection[0].y,
                width: boundsCollection[0].width, height: boundsCollection[0].height };
        }
        annotation.textMarkupType = annotationtypes.textMarkupType;
        const isLock: boolean = this.checkAnnotationLock(markupAnnotation);
        if (isNullOrUndefined(markupAnnotation.author) || (isNullOrUndefined(markupAnnotation.author) && markupAnnotation.author === '')) {
            markupAnnotation.author = 'Guest';
        }
        else {
            annotation.author = !isNullOrUndefined(markupAnnotation.author) ? markupAnnotation.author.toString() !== '' ? markupAnnotation.author.toString() : 'Guest' : 'Guest';
        }
        if (!isNullOrUndefined(markupAnnotation.subject) && markupAnnotation.subject !== '') {
            annotation.subject = markupAnnotation.subject.toString();
        }
        if (!isNullOrUndefined(markupAnnotation.note) ) {
            annotation.text = markupAnnotation.note.toString();
        }
        if (!isNullOrUndefined(markupAnnotation.annotationRotation)){
            (annotation as any).rotateAngle = this.getRotateAngle(markupAnnotation.annotationRotation);
        }
        let dateValue: Date;
        if (!isNullOrUndefined(markupAnnotation.modifiedDate) && !isNaN(Date.parse(markupAnnotation.modifiedDate))) {
            dateValue = new Date(Date.parse(markupAnnotation.modifiedDate));
            annotation.modifiedDate = dateValue;
        }
        annotation._dictionary.set('NM', markupAnnotation.annotName.toString());
        if (!isNullOrUndefined(markupAnnotation.color)) {
            const annotColor: any = JSON.parse(markupAnnotation.color);
            const color: number[] = [annotColor.r, annotColor.g, annotColor.b];
            annotation.color = color;
        }
        if (!isNullOrUndefined(markupAnnotation.opacity)) {
            annotation.opacity = markupAnnotation.opacity;
        }
        if (boundsCollection.length > 0){
            // Don't need to set bounds explicitly for text markup annotation
            const boundArrayCollection: number[][] = [];
            for (let i: number = 0; i < boundsCollection.length; i++) {
                const { x, y, width, height } = boundsCollection[parseInt(i.toString(), 10)];
                if (x !== 0 && y !== 0 && width !== 0 && height !== 0) {
                    boundArrayCollection.push([x, y, width, height]);
                }
            }
            annotation.boundsCollection = boundArrayCollection;
        }
        const commentsDetails: any = markupAnnotation.comments;
        if (commentsDetails.length > 0) {
            for (let i: number = 0; i < commentsDetails.length; i++) {
                annotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)], annotation.bounds));
            }
        }
        const reviewDetails: any = markupAnnotation.review;
        annotation.reviewHistory.add(this.addReviewCollections(reviewDetails, annotation.bounds));
        if (!isNullOrUndefined(markupAnnotation.color)) {
            const annotColor: any = JSON.parse(markupAnnotation.color);
            const color: number[] = [annotColor.r, annotColor.g, annotColor.b];
            annotation.textMarkUpColor = color;
        }
        this.preserveIsLockProperty(markupAnnotation, annotation);
        if (!isNullOrUndefined(markupAnnotation.customData)) {
            annotation.setValues('CustomData', JSON.stringify(markupAnnotation.customData));
        }
        if (!isNullOrUndefined(markupAnnotation.allowedInteractions)) {
            annotation.setValues('AllowedInteractions', JSON.stringify(markupAnnotation.allowedInteractions));
        }
        if (!isNullOrUndefined(markupAnnotation.textMarkupContent)) {
            annotation._dictionary.set('TextMarkupContent', markupAnnotation.textMarkupContent.toString());
        }
        annotation.setAppearance(true);
        page.annotations.add(annotation);
    }

    /**
     * @private
     * @param {PdfPage} page - page
     * @param {boolean} isPath - path
     * @returns {PointBase} - points
     */
    public getCropBoxValue( page: PdfPage, isPath: boolean): PointBase
    {
        let cropBoxX: number = 0;
        let cropBoxY: number = 0;
        if (page != null)
        {
            cropBoxX = !isPath ? page.cropBox[0] : 0;
            cropBoxY = !isPath ? page.cropBox[1] : 0;
        }
        return {x: cropBoxX, y: cropBoxY};
    }

    private getBothCropBoxValue(page: PdfPage): number[] {
        const cropBoxX: number = page.cropBox[0];
        const cropBoxY: number = page.cropBox[1];
        return [cropBoxX, cropBoxY];
    }

    private preserveIsLockProperty(annotation: any, annotPDF: any): void {
        let isLock: boolean = this.checkAnnotationLock(annotation);
        let isPrint: boolean = false;
        let isCommentLock: boolean = false;
        if (annotation.isCommentLock && annotation['isCommentLock'] !== null) {
            isCommentLock = Boolean(annotation['isCommentLock'].toString());
        }
        if (annotation.isPrint && annotation['isPrint'] !== null) {
            isPrint = Boolean(annotation['isPrint'].toString());
        }
        if ((!isNullOrUndefined(annotation.isLocked) && annotation.isLocked) || isLock) {
            isLock = true;
        }
        if (isLock && isCommentLock && isPrint) {
            annotPDF.flags = PdfAnnotationFlag.locked | PdfAnnotationFlag.print | PdfAnnotationFlag.readOnly;
        }
        else if (isLock && isCommentLock) {
            annotPDF.flags = PdfAnnotationFlag.locked | PdfAnnotationFlag.readOnly;
        }
        else if (isLock && isPrint) {
            annotPDF.flags = PdfAnnotationFlag.locked | PdfAnnotationFlag.print;
        }
        else if (isCommentLock && isPrint) {
            annotPDF.flags = PdfAnnotationFlag.print | PdfAnnotationFlag.readOnly;
        }
        else if (isLock) {
            annotPDF.flags = PdfAnnotationFlag.locked;
        }
        else if (isCommentLock) {
            annotPDF.flags = PdfAnnotationFlag.readOnly;
        }
        else {
            annotPDF.flags = PdfAnnotationFlag.print;
        }
    }

    /**
     * @private
     * @param {any} details - details
     * @param {PdfPage} page - page
     * @returns {void}
     */
    public addCustomStampAnnotation(details: any, page: PdfPage): void {
        const stampAnnotation: any = details;
        const bounds: Rect = JSON.parse(stampAnnotation.bounds);
        const pageNo: number = parseInt(stampAnnotation['pageNumber'].toString(), 10);
        const cropValues : PointBase = this.getCropBoxValue(page, false);
        let left: number = 0;
        let top: number = 0;
        const graphics: PdfGraphics = page.graphics;
        const isTemplate: boolean = (!isNullOrUndefined(stampAnnotation.template) && (stampAnnotation.template !== '')) ? true : false;
        if (Object.prototype.hasOwnProperty.call(stampAnnotation, 'wrapperBounds') && !isTemplate) {
            const wrapperBounds: any = stampAnnotation.wrapperBounds;
            const boundsXY: Rect = this.calculateBoundsXY(wrapperBounds, bounds, pageNo, page);
            left = boundsXY.x;
            top = boundsXY.y;
        }
        else {
            left = this.convertPixelToPoint(bounds.left);
            top = this.convertPixelToPoint(bounds.top);
        }
        let cropX : number = 0;
        let cropY : number = 0;
        if (cropValues.x !== 0 && cropValues.y !== 0 && cropValues.x === left) {
            cropX = cropValues.x;
            cropY = cropValues.y;
        }
        else if (cropValues.x === 0 && page.cropBox[2] === page.size[0] && cropValues.y === page.size[1]) {
            cropX = cropValues.x;
            cropY = cropValues.y;
        }
        left += cropX;
        top += cropY;
        let width: number = this.convertPixelToPoint(bounds.width);
        let height: number = this.convertPixelToPoint(bounds.height);
        if (!isNullOrUndefined(stampAnnotation.stampAnnotationType) && (stampAnnotation.stampAnnotationType === 'image') && (stampAnnotation.stampAnnotationPath !== ' ') && !isTemplate) {
            if (page.rotation === PdfRotationAngle.angle90 || page.rotation === PdfRotationAngle.angle270) {
                width = this.convertPixelToPoint((bounds.height));
                height = this.convertPixelToPoint((bounds.width));
            }
        }
        const opacity: number = stampAnnotation.opacity;
        const rotateAngle: number = stampAnnotation.rotateAngle;
        let isLock: boolean = false;
        if (Object.prototype.hasOwnProperty.call(stampAnnotation, 'annotationSettings') && !isNullOrUndefined(stampAnnotation.annotationSettings)) {
            const annotationSettings: any = stampAnnotation.annotationSettings;
            if (!isNullOrUndefined(annotationSettings.isLock)) {
                isLock = annotationSettings.isLock;
            }
        }
        if (!isNullOrUndefined(stampAnnotation.stampAnnotationType) && (stampAnnotation.stampAnnotationType === 'image') && (stampAnnotation.stampAnnotationPath !== ' ') || isTemplate) {
            const rubberStampAnnotation: PdfRubberStampAnnotation = new PdfRubberStampAnnotation(left, top, width, height);
            page.annotations.add(rubberStampAnnotation);
            if (isTemplate) {
                const appearance: PdfTemplate = rubberStampAnnotation.appearance.normal;
                const dictionary: _PdfDictionary = new _PdfDictionary(page._crossReference);
                const state: PdfGraphicsState = appearance.graphics.save();
                appearance.graphics.setTransparency(opacity);
                const template: PdfTemplate = new PdfTemplate(stampAnnotation.template, dictionary._crossReference);
                template._isExported = true;
                template._appearance = stampAnnotation.template;
                template._crossReference = dictionary._crossReference;
                template._size = [stampAnnotation.templateSize[0], stampAnnotation.templateSize[1]];
                const bounds: any = {x: 0, y: 0, width: width, height: height };
                appearance.graphics.drawTemplate(template, bounds);
                appearance.graphics.restore(state);
            }
            else {
                if (stampAnnotation && stampAnnotation['stampAnnotationPath'] && stampAnnotation['stampAnnotationPath'].toString() !== '') {
                    const imageUrl: string = (stampAnnotation['stampAnnotationPath'].toString()).split(',')[1];
                    const bytes: Uint8Array = _decode(imageUrl, false) as Uint8Array;
                    let bitmap: PdfImage;
                    if (bytes && bytes.length > 2 && ((bytes[0] === 255 && bytes[1] === 216) || (bytes[0] === 137 && bytes[1] === 80 &&
                        bytes[2] === 78 && bytes[3] === 71 && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10))) {
                        bitmap = new PdfBitmap(bytes);
                        const appearance: PdfTemplate = rubberStampAnnotation.appearance.normal;
                        const state: PdfGraphicsState = appearance.graphics.save();
                        appearance.graphics.setTransparency(opacity);
                        appearance.graphics.drawImage(bitmap, 0, 0, width, height);
                        appearance.graphics.restore(state);
                    }
                    else {
                        const appearance: PdfAppearance = rubberStampAnnotation.appearance;
                        const filterAnnot: any =
                            this.pdfViewerBase.pngData.filter((nameStamp: any) => nameStamp.name === stampAnnotation.annotName);
                        const dictionary: _PdfDictionary = filterAnnot[0]._dictionary.get('AP');
                        const pngDictionary: _PdfBaseStream = dictionary.get('N');
                        appearance.normal = new PdfTemplate(pngDictionary, page._crossReference);
                    }
                    rubberStampAnnotation.rotationAngle = 0;
                    this.setRotateAngle(this.getRubberStampRotateAngle(page.rotation, rotateAngle), rubberStampAnnotation);
                }
            }
            rubberStampAnnotation.opacity = opacity;
            if (!isNullOrUndefined(stampAnnotation.note)) {
                rubberStampAnnotation.text = stampAnnotation.note.toString();
            }
            rubberStampAnnotation._dictionary.set('NM', stampAnnotation.annotName.toString());
            let dateValue: Date;
            if (!isNullOrUndefined(stampAnnotation.modifiedDate) && !isNaN(Date.parse(stampAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(stampAnnotation.modifiedDate));
                rubberStampAnnotation.modifiedDate = dateValue;
            }
            const commentsDetails: any = stampAnnotation.comments;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    rubberStampAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                                  rubberStampAnnotation.bounds));
                }
            }
            const reviewDetails: any = stampAnnotation.review;
            rubberStampAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, rubberStampAnnotation.bounds));
            if (!isNullOrUndefined(stampAnnotation.author) && stampAnnotation.author) {
                rubberStampAnnotation.author = stampAnnotation.author.toString();
            }
            if (!isNullOrUndefined(stampAnnotation.subject) && stampAnnotation.subject) {
                rubberStampAnnotation.subject = stampAnnotation.subject.toString();
            }
            this.preserveIsLockProperty(stampAnnotation, rubberStampAnnotation);
            if (!isNullOrUndefined(stampAnnotation.customData)) {
                rubberStampAnnotation.setValues('CustomData', JSON.stringify(stampAnnotation.customData));
            }
            if (!isNullOrUndefined(stampAnnotation.icon)){
                rubberStampAnnotation.setValues('iconName', stampAnnotation.icon);
            }
        }
        else {
            const icon: string = stampAnnotation.icon.toString();
            const stampColor: string = stampAnnotation.stampFillcolor.toString();
            const fillColor: string = !isNullOrUndefined(stampAnnotation.fillColor) ? stampAnnotation.fillColor.toString() : '#192760';
            const isDynamic: string = stampAnnotation.isDynamicStamp.toString();
            let textBrush: PdfBrush = new PdfBrush([0, 0, 0]);
            let colors: number[] = [];
            if (fillColor === '#192760') {
                colors = [25, 39, 96];
            }
            else if (fillColor === '#516c30') {
                colors = [81, 108, 48];
            }
            else if (fillColor === '#8a251a') {
                colors = [138, 37, 26];
            }
            textBrush = new PdfBrush(colors);
            let stampBrush: PdfBrush = new PdfBrush([0, 0, 0]);
            let stampcolors: number[] = [];
            if (stampColor === '#e6eddf') {
                stampcolors = [230, 237, 223];
            }
            else if (stampColor === '#f6dedd') {
                stampcolors = [246, 222, 221];
            }
            else if (stampColor === '#dce3ef') {
                stampcolors = [220, 227, 239];
            }
            textBrush = new PdfBrush(colors);
            stampBrush = new PdfBrush(stampcolors);
            const pens: PdfPen = new PdfPen(colors, 1);
            let rectangle: Rect = new Rect(left, top, width, height);
            if (page.rotation === PdfRotationAngle.angle90 || page.rotation === PdfRotationAngle.angle270) {
                rectangle = new Rect(left, top, height, width);
            }
            const rubberStampAnnotation: PdfRubberStampAnnotation = new PdfRubberStampAnnotation;
            rubberStampAnnotation.bounds = rectangle;
            if (!isNullOrUndefined(stampAnnotation.subject) && stampAnnotation.subject) {
                rubberStampAnnotation.subject = stampAnnotation.subject.toString();
            }
            if (!isNullOrUndefined(stampAnnotation.note)) {
                rubberStampAnnotation.text = stampAnnotation.note.toString();
            }
            rubberStampAnnotation._dictionary.set('NM', stampAnnotation.annotName.toString());
            let dateValue: Date;
            if (!isNullOrUndefined(stampAnnotation.modifiedDate) && !isNaN(Date.parse(stampAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(stampAnnotation.modifiedDate));
                rubberStampAnnotation.modifiedDate = dateValue;
            }
            const commentsDetails: any = stampAnnotation.comments;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    rubberStampAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                                  rubberStampAnnotation.bounds));
                }
            }
            const reviewDetails: any = stampAnnotation.review;
            rubberStampAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, rubberStampAnnotation.bounds));
            let isIconExists: boolean = false;
            if (isDynamic !== 'true') {
                isIconExists = this.getIconName(stampAnnotation, icon, rubberStampAnnotation);
            }
            let graphicsPath: PdfPath;
            if (icon.trim() === 'Accepted' || icon.trim() === 'Rejected') {
                graphicsPath = this.drawStampAsPath(stampAnnotation.stampAnnotationPath, rubberStampAnnotation, textBrush, stampBrush);
            }
            else if (isIconExists) {
                if (page.rotation === PdfRotationAngle.angle90 || page.rotation === PdfRotationAngle.angle270) {
                    rubberStampAnnotation.bounds = rectangle;
                }
                rubberStampAnnotation.rotationAngle = 0;
                this.setRotateAngle(this.getRubberStampRotateAngle(page.rotation, rotateAngle), rubberStampAnnotation);
            }
            if (!isNullOrUndefined(stampAnnotation.modifiedDate) && !isNaN(Date.parse(stampAnnotation.modifiedDate))) {
                let dateValue: Date;
                if (!isNullOrUndefined(stampAnnotation.modifiedDate) && !isNaN(Date.parse(stampAnnotation.modifiedDate))) {
                    dateValue = new Date(Date.parse(stampAnnotation.modifiedDate));
                    rubberStampAnnotation.modifiedDate = dateValue;
                }
            }
            rubberStampAnnotation.opacity = opacity;
            rubberStampAnnotation.author = !isNullOrUndefined(stampAnnotation.author) && stampAnnotation.author.toString() !== '' ? stampAnnotation.author.toString() : 'Guest';
            this.preserveIsLockProperty(stampAnnotation, rubberStampAnnotation);
            if (!isNullOrUndefined(stampAnnotation.customData)) {
                rubberStampAnnotation.setValues('CustomData', JSON.stringify(stampAnnotation.customData));
            }
            if (!isNullOrUndefined(stampAnnotation.rotateAngle)) {
                rubberStampAnnotation.setValues('rotateAngle', stampAnnotation.rotateAngle.toString());
            }
            if (!isNullOrUndefined(stampAnnotation.icon)){
                rubberStampAnnotation.setValues('iconName', stampAnnotation.icon.toString());
            }
            page.annotations.add(rubberStampAnnotation);
            if (!isIconExists) {
                const appearance: PdfTemplate = rubberStampAnnotation.appearance.normal;
                appearance.graphics.drawRoundedRectangle(0, 0, rectangle.width, rectangle.height, 10, pens, stampBrush);
                if (isDynamic === 'true') {
                    const text: string = stampAnnotation.dynamicText.toString();
                    const state: PdfGraphicsState = appearance.graphics.save();
                    appearance.graphics.setTransparency(opacity);
                    this.renderDynamicStamp(rubberStampAnnotation, icon, text, textBrush, rectangle, pens, page);
                    appearance.graphics.restore(state);
                    rubberStampAnnotation._dictionary.set('Name', _PdfName.get('#23D' + icon.split(' ').join('')));
                }
                else {
                    this.retriveDefaultWidth(icon.trim());
                    const state: PdfGraphicsState = appearance.graphics.save();
                    appearance.graphics.setTransparency(opacity);
                    this.renderSignHereStamp(rubberStampAnnotation, rectangle, icon, textBrush, page, pens, graphicsPath);
                    appearance.graphics.restore(state);
                }
                rubberStampAnnotation.rotationAngle = 0;
                this.setRotateAngle(this.getRubberStampRotateAngle(page.rotation, rotateAngle), rubberStampAnnotation);
            }
        }
    }

    private setRotateAngle(rotateAngle: number, annot: PdfRubberStampAnnotation): void {
        if (rotateAngle !== annot.rotate) {
            if (rotateAngle < 0) {
                rotateAngle = 360 + rotateAngle;
            }
            if (rotateAngle >= 360) {
                rotateAngle = 360 - rotateAngle;
            }
            annot._dictionary.update('Rotate', rotateAngle);
        }
    }

    /**
     * @param {any} details - details
     * @param {PdfPage} page - page
     * @private
     * @returns {void}
     */
    public addMeasure(details: any, page: PdfPage): void {
        const measureShapeAnnotation: any = details;
        if (!isNullOrUndefined(measureShapeAnnotation.shapeAnnotationType) && measureShapeAnnotation.shapeAnnotationType === 'Line') {
            const points: any = JSON.parse(measureShapeAnnotation.vertexPoints);
            const linePoints: number[] = this.getSaveVertexPoints(points, page);
            const lineAnnotation: PdfLineAnnotation = new PdfLineAnnotation(linePoints);
            if (!isNullOrUndefined(measureShapeAnnotation.note)) {
                lineAnnotation.text = measureShapeAnnotation.note.toString();
            }
            lineAnnotation.author = !isNullOrUndefined(measureShapeAnnotation.author) && measureShapeAnnotation.author.toString() !== '' ? measureShapeAnnotation.author.toString() : 'Guest';
            if (!isNullOrUndefined(measureShapeAnnotation.subject)) {
                lineAnnotation.subject = measureShapeAnnotation.subject.toString();
            }
            lineAnnotation.lineIntent = PdfLineIntent.lineDimension;
            if (!isNullOrUndefined(measureShapeAnnotation.annotName)) {
                lineAnnotation.name = measureShapeAnnotation.annotName.toString();
            }
            if (!isNullOrUndefined(measureShapeAnnotation.strokeColor)) {
                const strokeColor: any = JSON.parse(measureShapeAnnotation.strokeColor);
                lineAnnotation.color = [strokeColor.r, strokeColor.g, strokeColor.b];
            }
            if (!isNullOrUndefined(measureShapeAnnotation.fillColor)) {
                const fillColor: any = JSON.parse(measureShapeAnnotation.fillColor);
                if (!this.isTransparentColor(fillColor)){
                    const innerColor: number[] = [fillColor.r, fillColor.g, fillColor.b];
                    lineAnnotation.innerColor = innerColor;
                }
                if (fillColor.a < 1 && fillColor.a > 0) {
                    lineAnnotation._dictionary.update('FillOpacity', fillColor.a);
                    fillColor.a = 1;
                }
                else {
                    lineAnnotation._dictionary.update('FillOpacity', fillColor.a);
                }
            }
            if (!isNullOrUndefined(measureShapeAnnotation.opacity)) {
                lineAnnotation.opacity = measureShapeAnnotation.opacity;
            }
            const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
            lineBorder.width = measureShapeAnnotation.thickness;
            if (!isNullOrUndefined(measureShapeAnnotation.borderStyle) && measureShapeAnnotation.borderStyle !== '') {
                lineBorder.style = this.getBorderStyle(measureShapeAnnotation.borderStyle);
            }
            if (!isNullOrUndefined(measureShapeAnnotation.borderDashArray)) {
                lineBorder.dash = [measureShapeAnnotation.borderDashArray, measureShapeAnnotation.borderDashArray];
            }
            lineAnnotation.border = lineBorder;
            lineAnnotation.rotationAngle = this.getRotateAngle(measureShapeAnnotation.rotateAngle);
            lineAnnotation.lineEndingStyle.begin = this.getLineEndingStyle(measureShapeAnnotation.lineHeadStart);
            lineAnnotation.lineEndingStyle.end = this.getLineEndingStyle(measureShapeAnnotation.lineHeadEnd);
            let dateValue: Date;
            if (!isNullOrUndefined(measureShapeAnnotation.modifiedDate) && !isNaN(Date.parse(measureShapeAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(measureShapeAnnotation.modifiedDate));
                lineAnnotation.modifiedDate = dateValue;
            }
            lineAnnotation.caption.type = this.getCaptionType(measureShapeAnnotation.captionPosition);
            const hasUniCode: boolean = /[\u0600-\u06FF]/.test(lineAnnotation.text);
            lineAnnotation.caption.cap = !hasUniCode && measureShapeAnnotation.caption;
            lineAnnotation.leaderExt = measureShapeAnnotation.leaderLength;
            lineAnnotation.leaderLine = measureShapeAnnotation.leaderLineExtension;
            const commentsDetails: any = measureShapeAnnotation.comments;
            const bounds: any = JSON.parse(measureShapeAnnotation.bounds);
            lineAnnotation.bounds = bounds;
            lineAnnotation.bounds.x = bounds.left;
            lineAnnotation.bounds.y = bounds.top;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    lineAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                           lineAnnotation.bounds));
                }
            }
            const reviewDetails: any = measureShapeAnnotation.review;
            lineAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, lineAnnotation.bounds));
            lineAnnotation._dictionary.update('LLO', measureShapeAnnotation.leaderLineOffset);
            this.preserveIsLockProperty(measureShapeAnnotation, lineAnnotation);
            const measureDetail: any = JSON.parse(measureShapeAnnotation.calibrate);
            if (!isNullOrUndefined(measureDetail)) {
                lineAnnotation._dictionary.set('Measure', this.setMeasureDictionary(measureDetail));
            }
            if (!isNullOrUndefined(measureShapeAnnotation.customData)) {
                lineAnnotation.setValues('CustomData', JSON.stringify(measureShapeAnnotation.customData));
            }
            if (measureShapeAnnotation.allowedInteractions && measureShapeAnnotation['allowedInteractions'] != null){
                lineAnnotation.setValues('AllowedInteractions', JSON.stringify(measureShapeAnnotation['allowedInteractions']));
            }
            lineAnnotation.setAppearance(true);
            page.annotations.add(lineAnnotation);
        }
        else if (!isNullOrUndefined(measureShapeAnnotation.shapeAnnotationType) && measureShapeAnnotation.shapeAnnotationType === 'Polyline') {
            const points: any = JSON.parse(measureShapeAnnotation.vertexPoints);
            const linePoints: number[] = this.getSaveVertexPoints(points, page);
            const polylineAnnotation: PdfPolyLineAnnotation = new PdfPolyLineAnnotation(linePoints);
            polylineAnnotation.author = !isNullOrUndefined(measureShapeAnnotation.author) && measureShapeAnnotation.author.toString() !== '' ? measureShapeAnnotation.author.toString() : 'Guest';
            if (!isNullOrUndefined(measureShapeAnnotation.note)) {
                polylineAnnotation.text = measureShapeAnnotation.note.toString();
            }
            polylineAnnotation._dictionary.set('NM', measureShapeAnnotation.annotName.toString());
            if (!isNullOrUndefined(measureShapeAnnotation.subject)) {
                polylineAnnotation.subject = measureShapeAnnotation.subject.toString();
            }
            if (!isNullOrUndefined(measureShapeAnnotation.strokeColor)) {
                const strokeColor: any = JSON.parse(measureShapeAnnotation.strokeColor);
                const color: number[] = [strokeColor.r, strokeColor.g, strokeColor.b];
                polylineAnnotation.color = color;
            }
            if (!isNullOrUndefined(measureShapeAnnotation.fillColor)) {
                const fillColor: any = JSON.parse(measureShapeAnnotation.fillColor);
                if (!this.isTransparentColor(fillColor)){
                    const innerColor: number[] = [fillColor.r, fillColor.g, fillColor.b];
                    polylineAnnotation.innerColor = innerColor;
                }
                if (fillColor.a < 1 && fillColor.a > 0) {
                    polylineAnnotation._dictionary.update('FillOpacity', fillColor.a);
                    fillColor.a = 1;
                }
                else {
                    polylineAnnotation._dictionary.update('FillOpacity', fillColor.a);
                }
            }
            if (!isNullOrUndefined(measureShapeAnnotation.opacity)) {
                polylineAnnotation.opacity = measureShapeAnnotation.opacity;
            }
            const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
            lineBorder.width = measureShapeAnnotation.thickness;
            lineBorder.style = this.getBorderStyle(measureShapeAnnotation.borderStyle);
            lineBorder.dash = measureShapeAnnotation.borderDashArray;
            polylineAnnotation.border = lineBorder;
            polylineAnnotation.rotationAngle = this.getRotateAngle(measureShapeAnnotation.rotateAngle);
            polylineAnnotation.beginLineStyle = this.getLineEndingStyle(measureShapeAnnotation.lineHeadStart);
            polylineAnnotation.endLineStyle = this.getLineEndingStyle(measureShapeAnnotation.lineHeadEnd);
            let dateValue: Date;
            if (!isNullOrUndefined(measureShapeAnnotation.modifiedDate) && !isNaN(Date.parse(measureShapeAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(measureShapeAnnotation.modifiedDate));
                polylineAnnotation.modifiedDate = dateValue;
            }
            const commentsDetails: any = measureShapeAnnotation.comments;
            const bounds: any = JSON.parse(measureShapeAnnotation.bounds);
            polylineAnnotation.bounds = bounds;
            polylineAnnotation.bounds.x = bounds.left;
            polylineAnnotation.bounds.y = bounds.top;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    polylineAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                               polylineAnnotation.bounds));
                }
            }
            const reviewDetails: any = measureShapeAnnotation.review;
            polylineAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, polylineAnnotation.bounds));
            polylineAnnotation._dictionary.set('IT', _PdfName.get(measureShapeAnnotation.indent.toString()));
            if (!isNullOrUndefined(measureShapeAnnotation.isCloudShape) && measureShapeAnnotation.isCloudShape) {
                const dictionary: _PdfDictionary = new _PdfDictionary(page._crossReference);
                dictionary.update('S', _PdfName.get('C'));
                dictionary.update('I', measureShapeAnnotation.cloudIntensity);
                polylineAnnotation._dictionary.update('BE', dictionary);
                const rectDifferences: string[] = JSON.parse(measureShapeAnnotation.rectangleDifference);
                if (rectDifferences.length > 0) {
                    const rd: number[] = this.getRDValues(rectDifferences);
                    polylineAnnotation._dictionary.update('RD', rd);
                }
            }
            this.preserveIsLockProperty(measureShapeAnnotation, polylineAnnotation);
            const measureDetail: any = JSON.parse(measureShapeAnnotation.calibrate);
            if (!isNullOrUndefined(measureDetail)) {
                polylineAnnotation._dictionary.set('Measure', this.setMeasureDictionary(measureDetail));
            }
            if (!isNullOrUndefined(measureShapeAnnotation.customData)) {
                polylineAnnotation.setValues('CustomData', JSON.stringify(measureShapeAnnotation.customData));
            }
            if (measureShapeAnnotation.allowedInteractions && measureShapeAnnotation['allowedInteractions'] !== null){
                polylineAnnotation.setValues('AllowedInteractions', JSON.stringify(measureShapeAnnotation['allowedInteractions']));
            }
            polylineAnnotation.setAppearance(true);
            page.annotations.add(polylineAnnotation);

        }
        else if (!isNullOrUndefined(measureShapeAnnotation.shapeAnnotationType) && (measureShapeAnnotation.shapeAnnotationType === 'Polyline') && (measureShapeAnnotation.shapeAnnotationType === 'PolygonRadius') || (measureShapeAnnotation.shapeAnnotationType === 'Circle')) {
            const circleMeasurementAnnotation: PdfCircleAnnotation = this.addCircleMeasurementAnnotation(measureShapeAnnotation, page);
            page.annotations.add(circleMeasurementAnnotation);
        } else if (!isNullOrUndefined(measureShapeAnnotation.shapeAnnotationType) && (measureShapeAnnotation.shapeAnnotationType === 'Polygon') && measureShapeAnnotation.indent !== 'PolygonRadius') {
            const points: any = JSON.parse(measureShapeAnnotation.vertexPoints);
            const linePoints: number[] = this.getSaveVertexPoints(points, page);
            const polygonAnnotation: PdfPolygonAnnotation = new PdfPolygonAnnotation(linePoints);
            polygonAnnotation.author = !isNullOrUndefined(measureShapeAnnotation.author) && measureShapeAnnotation.author.toString() !== '' ? measureShapeAnnotation.author.toString() : 'Guest';
            if (!isNullOrUndefined(measureShapeAnnotation.note)) {
                polygonAnnotation.text = measureShapeAnnotation.note.toString();
            }
            if (!isNullOrUndefined(measureShapeAnnotation.annotName)) {
                polygonAnnotation.name = measureShapeAnnotation.annotName.toString();
            }
            if (!isNullOrUndefined(measureShapeAnnotation.subject)) {
                polygonAnnotation.subject = measureShapeAnnotation.subject.toString();
            }
            if (!isNullOrUndefined(measureShapeAnnotation.strokeColor)) {
                const strokeColor: any = JSON.parse(measureShapeAnnotation.strokeColor);
                polygonAnnotation.color = [strokeColor.r, strokeColor.g, strokeColor.b];
            }
            if (!isNullOrUndefined(measureShapeAnnotation.fillColor)) {
                const fillColor: any = JSON.parse(measureShapeAnnotation.fillColor);
                if (!this.isTransparentColor(fillColor)){
                    const innerColor: number[] = [fillColor.r, fillColor.g, fillColor.b];
                    polygonAnnotation.innerColor = innerColor;
                }
                if (fillColor.a < 1 && fillColor.a > 0) {
                    polygonAnnotation._dictionary.update('FillOpacity', fillColor.a);
                    fillColor.a = 1;
                }
                else {
                    polygonAnnotation._dictionary.update('FillOpacity', fillColor.a);
                }
            }
            if (!isNullOrUndefined(measureShapeAnnotation.opacity)) {
                polygonAnnotation.opacity = measureShapeAnnotation.opacity;
            }
            const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
            lineBorder.width = measureShapeAnnotation.thickness;
            lineBorder.style = measureShapeAnnotation.borderStyle;
            if (!isNullOrUndefined(measureShapeAnnotation.borderDashArray)) {
                lineBorder.dash = [measureShapeAnnotation.borderDashArray, measureShapeAnnotation.borderDashArray];
            }
            polygonAnnotation.border = lineBorder;
            polygonAnnotation._dictionary.update('IT', _PdfName.get(measureShapeAnnotation.indent.toString()));
            polygonAnnotation.rotationAngle = this.getRotateAngle(measureShapeAnnotation.rotateAngle);
            let dateValue: Date;
            if (!isNullOrUndefined(measureShapeAnnotation.modifiedDate) && !isNaN(Date.parse(measureShapeAnnotation.modifiedDate))) {
                dateValue = new Date(Date.parse(measureShapeAnnotation.modifiedDate));
                polygonAnnotation.modifiedDate = dateValue;
            }
            const commentsDetails: any = measureShapeAnnotation.comments;
            const bounds: any = JSON.parse(measureShapeAnnotation.bounds);
            polygonAnnotation.bounds = bounds;
            polygonAnnotation.bounds.x = bounds.left;
            polygonAnnotation.bounds.y = bounds.top;
            if (commentsDetails.length > 0) {
                for (let i: number = 0; i < commentsDetails.length; i++) {
                    polygonAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                              polygonAnnotation.bounds));
                }
            }
            const reviewDetails: any = measureShapeAnnotation.review;
            polygonAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, polygonAnnotation.bounds));
            if (!isNullOrUndefined(measureShapeAnnotation.isCloudShape) && Boolean(measureShapeAnnotation['isCloudShape'].toString())) {
                polygonAnnotation.borderEffect.style = PdfBorderEffectStyle.cloudy;
                polygonAnnotation.borderEffect.intensity = measureShapeAnnotation['cloudIntensity'];
                const rectDifferences: string[] = JSON.parse(measureShapeAnnotation.rectangleDifference);
                if (rectDifferences.length > 0) {
                    const rd: number[] = this.getRDValues(rectDifferences);
                    polygonAnnotation._dictionary.update('RD', rd);
                }
            }
            this.preserveIsLockProperty(measureShapeAnnotation, polygonAnnotation);
            const measureDetail: any = JSON.parse(measureShapeAnnotation.calibrate);
            if (!isNullOrUndefined(measureDetail)) {
                polygonAnnotation._dictionary.set('Measure', this.setMeasureDictionary(measureDetail));
                if (measureShapeAnnotation['indent'] === 'PolygonVolume' && Object.prototype.hasOwnProperty.call(measureDetail, 'depth')) {
                    polygonAnnotation._dictionary.update('Depth', measureDetail['depth']);
                }
            }
            if (!isNullOrUndefined(measureShapeAnnotation.customData)) {
                polygonAnnotation.setValues('CustomData', JSON.stringify(measureShapeAnnotation.customData));
            }
            if (measureShapeAnnotation.allowedInteractions && measureShapeAnnotation['allowedInteractions'] != null){
                polygonAnnotation.setValues('AllowedInteractions', JSON.stringify(measureShapeAnnotation['allowedInteractions']));
            }
            polygonAnnotation.setAppearance(true);
            page.annotations.add(polygonAnnotation);
        }
    }

    /**
     * @param {any} details - details
     * @param {PdfPage} page - page
     * @private
     * @returns {void}
     */
    public addStickyNotes(details: any, page: PdfPage): void {
        const popUpAnnotation: any = details;
        const bounds: Rect = JSON.parse(popUpAnnotation.bounds);
        const cropValues : PointBase = this.getCropBoxValue(page, false);
        const left: number = this.convertPixelToPoint(bounds.left);
        const top: number = this.convertPixelToPoint(bounds.top);
        const width: number = this.convertPixelToPoint(bounds.width);
        const height: number = this.convertPixelToPoint(bounds.height);
        let cropX : number = 0;
        let cropY : number = 0;
        if (cropValues.x !== 0 && cropValues.y !== 0 && cropValues.x === left) {
            cropX = cropValues.x;
            cropY = cropValues.y;
        }
        else if (cropValues.x === 0 && page.cropBox[2] === page.size[0] && cropValues.y === page.size[1]) {
            cropX = cropValues.x;
            cropY = cropValues.y;
        }
        const annotation: PdfPopupAnnotation = new PdfPopupAnnotation(null, cropX + left, cropY + top, width, height);
        if (popUpAnnotation['author'] === null) {
            popUpAnnotation['author'] = 'Guest';
        }
        if (popUpAnnotation['note'] != null) {
            annotation.text = popUpAnnotation['note'].toString();
        }
        annotation.author = popUpAnnotation['author'].toString();
        if (popUpAnnotation['subject'] != null) {
            annotation.subject = popUpAnnotation['subject'].toString();
        }
        annotation._dictionary.set('NM', popUpAnnotation.annotName.toString());
        let dateValue: Date;
        if (!isNullOrUndefined(popUpAnnotation.modifiedDate) && !isNaN(Date.parse(popUpAnnotation.modifiedDate))) {
            dateValue = new Date(Date.parse(popUpAnnotation.modifiedDate));
            annotation.modifiedDate = dateValue;
        }
        const commentsDetails: any = popUpAnnotation.comments;
        if (commentsDetails.length > 0) {
            for (let i: number = 0; i < commentsDetails.length; i++) {
                annotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)], annotation.bounds));
            }
        }
        const reviewDetails: any = popUpAnnotation.review;
        annotation.reviewHistory.add(this.addReviewCollections(reviewDetails, annotation.bounds));
        const color: number[] = [255, 255, 51];
        annotation.color = color;
        annotation.opacity = popUpAnnotation.opacity;
        annotation.icon = PdfPopupIcon.comment;
        this.preserveIsLockProperty(popUpAnnotation, annotation);
        if (!isNullOrUndefined(popUpAnnotation.customData)) {
            annotation.setValues('CustomData', JSON.stringify(popUpAnnotation.customData));
        }
        page.annotations.add(annotation);
    }

    private static hasDynamicText(freeTextAnnotation: any): boolean {
        return Object.prototype.hasOwnProperty.call(freeTextAnnotation, 'dynamicText') &&
               !isNullOrUndefined(freeTextAnnotation.dynamicText.toString());
    }

    private static setFontFromKeys(freeTextAnnotation: any, annotation: PdfFreeTextAnnotation,
                                   textFont: { [key: string]: any }, fontSize: number, fontStyle: PdfFontStyle): void {
        const font: PdfTrueTypeFont = PdfViewerUtils.tryGetFontFromKeys(textFont,
                                                                        freeTextAnnotation.dynamicText.toString(), fontSize, fontStyle);
        if (!isNullOrUndefined(font)) {
            annotation.font = font;
            annotation.setAppearance(true);
        }
        else {
            annotation.setAppearance(false);
        }
    }


    /**
     * @param {any} details - details
     * @param {PdfPage} page - page
     * @param {string} textFont - textFont
     * @private
     * @returns {void}
     */
    public addFreeText(details: any, page: PdfPage, textFont?: { [key: string]: any; }): void {
        const freeTextAnnotation: any = details;
        const bounds: Rect = JSON.parse(freeTextAnnotation.bounds);
        const cropValues : PointBase = this.getCropBoxValue(page, false);
        const left: number = this.convertPixelToPoint(bounds.left);
        const top: number = this.convertPixelToPoint(bounds.top);
        const width: number = this.convertPixelToPoint(bounds.width);
        const height: number = this.convertPixelToPoint(bounds.height);
        let cropX : number = 0;
        let cropY : number = 0;
        if (cropValues.x !== 0 && cropValues.y !== 0 && cropValues.x === left) {
            cropX = cropValues.x;
            cropY = cropValues.y;
        }
        else if (cropValues.x === 0 && page.cropBox[2] === page.size[0] && cropValues.y === page.size[1]) {
            cropX = cropValues.x;
            cropY = cropValues.y;
        }
        const annotation: PdfFreeTextAnnotation = new PdfFreeTextAnnotation(cropX + left, cropY + top, width, height);
        annotation.setAppearance(true);
        if (isNullOrUndefined(freeTextAnnotation['author'])) {
            freeTextAnnotation['author'] = 'Guest';
        }
        annotation.author = freeTextAnnotation['author'].toString();
        let dateValue: Date;
        if (!isNullOrUndefined(freeTextAnnotation.modifiedDate) && !isNaN(Date.parse(freeTextAnnotation.modifiedDate))) {
            dateValue = new Date(Date.parse(freeTextAnnotation.modifiedDate));
            annotation.modifiedDate = dateValue;
        }
        const reviewDetails: any = freeTextAnnotation.review;
        annotation.reviewHistory.add(this.addReviewCollections(reviewDetails, annotation.bounds));
        annotation._dictionary.set('NM', freeTextAnnotation.annotName.toString());
        annotation.lineEndingStyle = PdfLineEndingStyle.openArrow;
        annotation.annotationIntent = PdfAnnotationIntent.freeTextTypeWriter;
        let fontSize: number = 0;
        if (!isNullOrUndefined(freeTextAnnotation.fontSize)) {
            fontSize = parseFloat(freeTextAnnotation.fontSize);
        }
        fontSize = !isNullOrUndefined(fontSize) && !isNaN(fontSize) && fontSize > 0 ? fontSize : 16; //default 16px
        const fontFamily: PdfFontFamily = this.getFontFamily(freeTextAnnotation.fontFamily);
        let fontJson: {[key: string]: boolean} = {};
        if (Object.prototype.hasOwnProperty.call(freeTextAnnotation, 'font') && !isNullOrUndefined(freeTextAnnotation.font)) {
            fontJson = freeTextAnnotation.font;
        }
        const fontStyle: PdfFontStyle = this.getFontStyle(fontJson);
        annotation.font = new PdfStandardFont(fontFamily, this.convertPixelToPoint(fontSize), fontStyle);
        if (AnnotationRenderer.hasDynamicText(freeTextAnnotation)) {
            if (!isNullOrUndefined(textFont) && Object.keys(textFont).length > 0) {
                const fontKey: any = PdfViewerUtils.getFontKey(textFont, freeTextAnnotation.fontFamily.toLowerCase());
                if (!isNullOrUndefined(fontKey)) {
                    let fontStream: any = textFont[`${fontKey}`];
                    fontStream = PdfViewerUtils.processFontStream(fontStream);
                    const font: PdfTrueTypeFont = new PdfTrueTypeFont(fontStream, this.convertPixelToPoint(fontSize), fontStyle);
                    const glyphPresent: boolean = PdfViewerUtils.isSupportedFont(freeTextAnnotation.dynamicText.toString(), font);
                    annotation.setAppearance(glyphPresent);
                    if (glyphPresent) {
                        annotation.font = font;
                    } else {
                        AnnotationRenderer.setFontFromKeys(freeTextAnnotation, annotation, textFont, fontSize, fontStyle);
                    }
                } else {
                    AnnotationRenderer.setFontFromKeys(freeTextAnnotation, annotation, textFont, fontSize, fontStyle);
                }
            }
            else {
                try {
                    annotation.font.measureString(freeTextAnnotation.dynamicText.toString());
                }
                catch (e) {
                    annotation.setAppearance(false);
                }
            }
        }
        if (freeTextAnnotation['subject'] != null) {
            annotation.subject = freeTextAnnotation['subject'].toString();
        }
        // Markup Text
        annotation.text = '';
        if (Object.prototype.hasOwnProperty.call(freeTextAnnotation, 'dynamicText') && !isNullOrUndefined(freeTextAnnotation.dynamicText.toString())) {
            // Markup Text
            annotation.text = freeTextAnnotation.dynamicText.toString();
        }
        const rotateAngle: string = 'RotateAngle' + Math.abs(freeTextAnnotation.rotateAngle);
        annotation.rotationAngle = this.getRotateAngle(rotateAngle);
        const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
        lineBorder.width = !isNullOrUndefined(freeTextAnnotation.thickness) ? freeTextAnnotation.thickness : 1;
        annotation.border = lineBorder;
        annotation.border.width = lineBorder.width;
        if (Object.prototype.hasOwnProperty.call(freeTextAnnotation, 'padding') && !isNullOrUndefined(freeTextAnnotation.padding)){
            // let padding: PdfPaddings = new PdfPaddings(); // PdfPaddings not exist in ej2-pdf
            // annotation.setPaddings(padding);  // setPaddings not exist
        }
        annotation.opacity = !isNullOrUndefined(freeTextAnnotation.opacity) ? freeTextAnnotation.opacity : 1;
        if (!isNullOrUndefined(freeTextAnnotation.strokeColor)) {
            const strokeColor: any = JSON.parse(freeTextAnnotation.strokeColor);
            const color: number[] = [strokeColor.r, strokeColor.g, strokeColor.b];
            annotation.borderColor = color;
            // Modified Implementation for setting border width for transparent border
            if (!this.isTransparentColor(strokeColor)) {
                annotation.border.width = !isNullOrUndefined(freeTextAnnotation.thickness) ? freeTextAnnotation.thickness : 0;
            }
        }
        if (!isNullOrUndefined(freeTextAnnotation.fillColor)) {
            const fillColor: any = JSON.parse(freeTextAnnotation.fillColor);
            if (!this.isTransparentColor(fillColor)){
                const color: number[] = [fillColor.r, fillColor.g, fillColor.b];
                if (freeTextAnnotation.isTransparentSet) {
                    annotation.color = undefined;
                }
                else {
                    annotation.color = color;
                }
            }
            if (fillColor.a < 1 && fillColor.a > 0) {
                annotation._dictionary.update('FillOpacity', fillColor.a);
                fillColor.a = 1;
            }
            else {
                annotation._dictionary.update('FillOpacity', fillColor.a);
            }
        }
        if (!isNullOrUndefined(freeTextAnnotation.fontColor)) {
            const textMarkupColor: any = JSON.parse(freeTextAnnotation.fontColor);
            if (!this.isTransparentColor(textMarkupColor)){
                const fontColor: number[] = [textMarkupColor.r, textMarkupColor.g, textMarkupColor.b];
                annotation.textMarkUpColor = fontColor;
            }
        }
        const commentsDetails: any = freeTextAnnotation.comments;
        if (commentsDetails.length > 0) {
            for (let i: number = 0; i < commentsDetails.length; i++) {
                annotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)], annotation.bounds));
            }
        }
        this.preserveIsLockProperty(freeTextAnnotation, annotation);
        if (!isNullOrUndefined(freeTextAnnotation.customData)) {
            annotation.setValues('CustomData', JSON.stringify(freeTextAnnotation.customData));
        }
        if (Object.prototype.hasOwnProperty.call(freeTextAnnotation, 'textAlign') && !isNullOrUndefined(freeTextAnnotation.textAlign))
        {
            annotation.textAlignment = this.getPdfTextAlignment(freeTextAnnotation.textAlign.toString().toLowerCase());
        }
        if (Object.prototype.hasOwnProperty.call(freeTextAnnotation, 'allowedInteractions') && !isNullOrUndefined(freeTextAnnotation.allowedInteractions))
        {
            annotation.setValues('AllowedInteractions', JSON.stringify(freeTextAnnotation.allowedInteractions));
        }
        page.annotations.add(annotation);
    }


    private renderSignHereStamp(rubberStampAnnotation: PdfRubberStampAnnotation, rectangle: Rect, icon: string, textBrush:
    PdfBrush, page: PdfPage, pens: PdfPen, graphicsPath: PdfPath): void {
        const stringFormat: PdfStringFormat = new PdfStringFormat();
        const font: PdfFont = new PdfStandardFont(PdfFontFamily.helvetica, 20, PdfFontStyle.bold | PdfFontStyle.italic);
        stringFormat.alignment = PdfTextAlignment.center;
        stringFormat.lineAlignment = PdfVerticalAlignment.middle;
        let point1: number[] = [0, 0];
        let point2: number[] = [0, 0];
        const drawingPath: PdfPath = new PdfPath();
        const appearance: PdfTemplate = rubberStampAnnotation.appearance.normal;
        if (this.defaultHeight > 0 && this.defaultWidth > 0) {
            appearance.graphics.scaleTransform(rectangle.width / (this.defaultWidth + 4), rectangle.height / 28.00);
        }
        point1 = [(this.defaultWidth / 2 + 1), 15, 0, 0];
        point2 = [0, 0];
        drawingPath.addLine(point1[0], point1[1], point2[0], point2[1]);
        const pointValues: number[] = [drawingPath._points[0][0], drawingPath._points[0][1], 0, 0];
        if (graphicsPath) {
            let minX: number = Number.MAX_VALUE;
            let minY: number = Number.MAX_VALUE;
            let maxX: number = Number.MIN_VALUE;
            let maxY: number = Number.MIN_VALUE;
            for (let i: number = 0; i < graphicsPath._points.length; i++) {
                const point: number[] = graphicsPath._points[parseInt(i.toString(), 10)];
                minX = Math.min(minX, point[0]);
                minY = Math.min(minY, point[1]);
                maxX = Math.max(maxX, point[0]);
                maxY = Math.max(maxY, point[1]);
            }
            const offsetX: number = (rectangle.width - (maxX - minX)) / 2 - minX;
            const offsetY: number = (rectangle.height - (maxY - minY)) / 2 - minY;
            for (let i: number = 0; i < graphicsPath._points.length; i++) {
                graphicsPath._points[parseInt(i.toString(), 10)][0] += offsetX;
                graphicsPath._points[parseInt(i.toString(), 10)][1] += offsetY;
            }
            rubberStampAnnotation.appearance.normal.graphics.drawPath(graphicsPath, pens, textBrush);
        } else {
            appearance.graphics.drawString(icon.toUpperCase(), font, pointValues, pens, textBrush, stringFormat);
        }
    }

    private retriveDefaultWidth(subject: string): void {
        switch (subject.trim()) {
        case 'Witness':
            this.defaultWidth = 97.39;
            this.defaultHeight = 16.84;
            break;
        case 'Initial Here':
            this.defaultWidth = 151.345;
            this.defaultHeight = 16.781;
            break;
        case 'Sign Here':
            this.defaultWidth = 121.306;
            this.defaultHeight = 16.899;
            break;
        default:
            this.defaultWidth = 0;
            this.defaultHeight = 0;
            break;
        }
    }

    private renderDynamicStamp(rubberStampAnnotation: PdfRubberStampAnnotation, icon: string, text: string, textBrush: PdfBrush,
                               rectangle: Rect, pens: PdfPen, page: PdfPage): void {
        const stringFormat: PdfStringFormat = new PdfStringFormat();
        stringFormat.alignment = PdfTextAlignment.left;
        stringFormat.lineAlignment = PdfVerticalAlignment.middle;
        let stampFont: PdfFont = null;
        let detailsFont: PdfFont = null;
        let hasUniCode: Boolean = false;
        const regex: any = /[\u0600-\u06FF]/;
        const flag: Boolean = regex.test(text);
        if (flag) {
            hasUniCode = true;
        }
        if (hasUniCode) {
            stampFont = new PdfTrueTypeFont(getArialFontData(),
                                            Browser.isDevice && Browser.isAndroid ?
                                                this.pdfViewer.annotationModule.calculateFontSize(icon.toUpperCase(), rectangle) - 10 :
                                                this.pdfViewer.annotationModule.calculateFontSize(icon.toUpperCase(), rectangle) - 5,
                                            PdfFontStyle.bold | PdfFontStyle.italic);
            detailsFont =  new PdfTrueTypeFont(getArialFontData(),
                                               this.pdfViewer.annotationModule.calculateFontSize(text.toUpperCase(), rectangle) - 5,
                                               PdfFontStyle.bold | PdfFontStyle.italic);
        }
        else {
            stampFont = new PdfStandardFont(PdfFontFamily.helvetica,
                                            Browser.isDevice && Browser.isAndroid ?
                                                this.pdfViewer.annotationModule.calculateFontSize(icon.toUpperCase(), rectangle) - 10 :
                                                this.pdfViewer.annotationModule.calculateFontSize(icon.toUpperCase(), rectangle) - 5,
                                            PdfFontStyle.bold | PdfFontStyle.italic);
            detailsFont = new PdfStandardFont(PdfFontFamily.helvetica,
                                              this.pdfViewer.annotationModule.calculateFontSize(text, rectangle) - 5,
                                              PdfFontStyle.bold | PdfFontStyle.italic);
        }
        const appearance: PdfTemplate = rubberStampAnnotation.appearance.normal;
        let point1: number[] = [0, 0];
        let point2: number[] = [0, 0];
        const drawingPath: PdfPath = new PdfPath();
        point1 = [5, (rectangle.height / 3)];
        point2 = [5, (rectangle.height - (detailsFont.size * 2))];
        drawingPath.addLine(point1[0], point1[1], point2[0], point2[1]);
        const stampTypeBounds: number[] = [drawingPath._points[0][0], drawingPath._points[0][1], 0, 0];
        const stampTimeStampbounds: number[] = [drawingPath._points[1][0], drawingPath._points[1][1],
            (rectangle.width - drawingPath._points[1][0]), (rectangle.height - drawingPath._points[1][1])];
        appearance.graphics.drawString(icon.toUpperCase(), stampFont, stampTypeBounds, pens, textBrush, stringFormat);
        appearance.graphics.drawString(text, detailsFont, stampTimeStampbounds, pens, textBrush, stringFormat);
    }

    private calculateBoundsXY(wrapperBounds: any, bounds: Rect, pageNo: number, pdfPageBase: any): Rect {
        const boundsXY: Rect = new Rect();
        const pageSize: Size = this.pdfViewer.pdfRendererModule.getPageSize(pageNo);
        if (pdfPageBase.rotation === PdfRotationAngle.angle90) {
            boundsXY.x = this.convertPixelToPoint(wrapperBounds.y);
            boundsXY.y = this.convertPixelToPoint(pageSize.width - wrapperBounds.x - wrapperBounds.width);
        }
        else if (pdfPageBase.rotation === PdfRotationAngle.angle180) {
            boundsXY.x = this.convertPixelToPoint(pageSize.width - wrapperBounds.x - wrapperBounds.width);
            boundsXY.y = this.convertPixelToPoint(pageSize.height - wrapperBounds.y - wrapperBounds.height);
        }
        else if (pdfPageBase.rotation === PdfRotationAngle.angle270) {
            boundsXY.x = this.convertPixelToPoint(pageSize.height - wrapperBounds.y - wrapperBounds.height);
            boundsXY.y = this.convertPixelToPoint(wrapperBounds.x);
        }
        else {
            boundsXY.x = this.convertPixelToPoint(wrapperBounds.x);
            boundsXY.y = this.convertPixelToPoint(wrapperBounds.y);
        }
        return boundsXY;
    }

    private setMeasurementUnit(unit: string): PdfMeasurementUnit {
        let measurementUnit: PdfMeasurementUnit;
        switch (unit) {
        case 'cm':
            measurementUnit = PdfMeasurementUnit.centimeter;
            break;
        case 'in':
            measurementUnit = PdfMeasurementUnit.inch;
            break;
        case 'mm':
            measurementUnit = PdfMeasurementUnit.millimeter;
            break;
        case 'pt':
            measurementUnit = PdfMeasurementUnit.point;
            break;
        case 'p':
            measurementUnit = PdfMeasurementUnit.pica;
            break;
        }
        return measurementUnit;
    }

    private getRubberStampRotateAngle(angleEnum: PdfRotationAngle, rotationAngle: number): number {
        let angle: number = 0;
        switch (angleEnum) {
        case 0:
            angle = 0;
            break;
        case 1:
            angle = 90;
            break;
        case 2:
            angle = 180;
            break;
        case 3:
            angle = 270;
            break;
        default:
            break;
        }
        angle -= rotationAngle;
        return angle;
    }

    private getFontFamily(fontFamily: string): PdfFontFamily {
        let font: PdfFontFamily = PdfFontFamily.helvetica;
        fontFamily = !isNullOrUndefined(fontFamily) && fontFamily !== '' ? fontFamily : 'Helvetica';
        switch (fontFamily) {
        case 'Helvetica':
            font = PdfFontFamily.helvetica;
            break;
        case 'Courier':
            font = PdfFontFamily.courier;
            break;
        case 'Times New Roman':
            font = PdfFontFamily.timesRoman;
            break;
        case 'Symbol':
            font = PdfFontFamily.symbol;
            break;
        case 'ZapfDingbats':
            font = PdfFontFamily.zapfDingbats;
            break;
        default:
            break;
        }
        return font;
    }

    private getFontStyle(fontJson: {[key: string]: boolean}): PdfFontStyle{
        let fontStyle: PdfFontStyle = PdfFontStyle.regular;
        if (!isNullOrUndefined(fontJson)){
            if (fontJson.isBold){
                fontStyle = fontStyle | PdfFontStyle.bold;
            }
            if (fontJson.isItalic){
                fontStyle = fontStyle | PdfFontStyle.italic;
            }
            if (fontJson.isStrikeout){
                fontStyle = fontStyle | PdfFontStyle.strikeout;
            }
            if (fontJson.isUnderline){
                fontStyle = fontStyle | PdfFontStyle.underline;
            }
        }
        return fontStyle;
    }

    private getPdfTextAlignment(alignment: string): PdfTextAlignment {
        let textAlignment: PdfTextAlignment = PdfTextAlignment.left;
        switch (alignment) {
        case 'center':
            textAlignment = PdfTextAlignment.center;
            break;
        case 'right':
            textAlignment = PdfTextAlignment.right;
            break;
        case 'justify':
            textAlignment = PdfTextAlignment.justify;
            break;
        default:
            break;
        }
        return textAlignment;
    }

    private drawStampAsPath(resultObjects: string, rubberStampAnnotation: PdfRubberStampAnnotation, textBrush: PdfBrush,
                            stampBrush: PdfBrush): PdfPath {
        let currentPoint: PointBase = { x: 0, y: 0 };
        const graphicsPath: PdfPath = new PdfPath();
        const stampObjects: string = resultObjects;
        for (let index: number = 0; index < stampObjects.length; index++) {
            const val: any = stampObjects[parseInt(index.toString(), 10)];
            const path: string = val.command.toString();
            if (path === 'M') {
                graphicsPath.startFigure();
                currentPoint = { x: val.x, y: val.y };
            }
            if (path === 'L') {
                const array: any[] = [
                    currentPoint, { x: val.x, y: val.y }
                ];
                this.transformPoints(array);
                const array1: PointBase[] = [
                    { x: array[0].x, y: array[0].y }, { x: array[1].x, y: array[1].y }
                ];
                graphicsPath.addLine(this.convertPixelToPoint(array1[0].x),
                                     this.convertPixelToPoint(array1[0].y), this.convertPixelToPoint(array1[1].x),
                                     this.convertPixelToPoint(array1[1].y));
                currentPoint = { x: val.x, y: val.y };
            }
            if (path === 'C') {
                const array2: PointBase[] = [
                    currentPoint,
                    { x: val.x, y: val.y },
                    { x: val.x1, y: val.y1 },
                    { x: val.x2, y: val.y2 }
                ];
                this.transformPoints(array2);
                const array21: PointBase[] = [
                    { x: array2[0].x, y: array2[0].y },
                    { x: array2[1].x, y: array2[1].y },
                    { x: array2[2].x, y: array2[2].y },
                    { x: array2[3].x, y: array2[3].y }
                ];
                graphicsPath.addBezier(this.convertPixelToPoint(array21[0].x),
                                       this.convertPixelToPoint(array21[0].y),
                                       this.convertPixelToPoint(array21[1].x), this.convertPixelToPoint(array21[1].y),
                                       this.convertPixelToPoint(array21[2].x), this.convertPixelToPoint(array21[2].y),
                                       this.convertPixelToPoint(array21[3].x), this.convertPixelToPoint(array21[3].y));
                currentPoint = { x: val.x, y: val.y };
            }
            if (path === 'Z' || path === 'z') {
                graphicsPath.closeFigure();
            }

        }
        return graphicsPath;
    }

    private transformPoints(points: any[]): void {
        if (!isNullOrUndefined(points)) {
            for (let i: number = 0; i < points.length; i++) {
                points[parseInt(i.toString(), 10)] = this.transform(points[parseInt(i.toString(), 10)]);
            }
        }
    }

    private transform(point: any): any {
        const x: number = point.x;
        const y: number = point.y;
        return { x, y };
    }

    private getIconName(stampAnnotation: any, subject: string, rubberStampAnnotation: PdfRubberStampAnnotation): boolean {
        let iconExists: boolean = true;
        switch (subject.trim()) {
        case 'Approved':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.approved;
            break;
        case 'Confidential':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.confidential;
            break;
        case 'Not Approved':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.notApproved;
            break;
        case 'Draft':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.draft;
            break;
        case 'Final':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.final;
            break;
        case 'Completed':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.completed;
            break;
        case 'For Public Release':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.forPublicRelease;
            break;
        case 'Not For Public Release':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.notForPublicRelease;
            break;
        case 'For Comment':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.forComment;
            break;
        case 'Void':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.void;
            break;
        case 'Preliminary Results':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.preliminaryResults;
            break;
        case 'Information Only':
            rubberStampAnnotation.icon = PdfRubberStampAnnotationIcon.informationOnly;
            break;
        default:
            iconExists = false;
            break;
        }
        return iconExists;
    }

    private addCircleMeasurementAnnotation(measureShapeAnnotation: any, page: PdfPage): PdfCircleAnnotation {
        const bounds: Rect = JSON.parse(measureShapeAnnotation.bounds);
        const cropValues : PointBase = this.getCropBoxValue(page, false);
        const left: number = this.convertPixelToPoint(bounds.left);
        const top: number = this.convertPixelToPoint(bounds.top);
        const width: number = this.convertPixelToPoint(bounds.width);
        const height: number = this.convertPixelToPoint(bounds.height);
        if (isNullOrUndefined(bounds.left)) {
            measureShapeAnnotation.bounds.left = 0;
        }
        if (isNullOrUndefined(bounds.top)) {
            measureShapeAnnotation.bounds.top = 0;
        }
        let cropX : number = 0;
        let cropY : number = 0;
        if (cropValues.x !== 0 && cropValues.y !== 0 && cropValues.x === left) {
            cropX = cropValues.x;
            cropY = cropValues.y;
        }
        else if (cropValues.x === 0 && page.cropBox[2] === page.size[0] && cropValues.y === page.size[1]) {
            cropX = cropValues.x;
            cropY = cropValues.y;
        }
        const circleAnnotation: PdfCircleAnnotation = new PdfCircleAnnotation(cropX + left, cropY + top, width, height);
        if (!isNullOrUndefined(measureShapeAnnotation.note)) {
            circleAnnotation.text = measureShapeAnnotation.note.toString();
        }
        circleAnnotation.author = !isNullOrUndefined(measureShapeAnnotation.author) && measureShapeAnnotation.author.toString() !== '' ? measureShapeAnnotation.author.toString() : 'Guest';
        circleAnnotation._dictionary.set('NM', measureShapeAnnotation.annotName.toString());
        if (!isNullOrUndefined(measureShapeAnnotation.subject)) {
            circleAnnotation.subject = measureShapeAnnotation.subject.toString();
        }
        if (!isNullOrUndefined(measureShapeAnnotation.strokeColor)) {
            const strokeColor: any = JSON.parse(measureShapeAnnotation.strokeColor);
            const color: number[] = [strokeColor.r, strokeColor.g, strokeColor.b];
            circleAnnotation.color = color;
        }
        if (!isNullOrUndefined(measureShapeAnnotation.fillColor)) {
            const fillColor: any = JSON.parse(measureShapeAnnotation.fillColor);
            if (!this.isTransparentColor(fillColor)){
                const innerColor: number[] = [fillColor.r, fillColor.g, fillColor.b];
                circleAnnotation.innerColor = innerColor;
            }
            if (fillColor.a < 1 && fillColor.a > 0) {
                circleAnnotation._dictionary.update('FillOpacity', fillColor.a);
                fillColor.a = 1;
            }
            else {
                circleAnnotation._dictionary.update('FillOpacity', fillColor.a);
            }
        }
        if (!isNullOrUndefined(measureShapeAnnotation.opacity)) {
            circleAnnotation.opacity = measureShapeAnnotation.opacity;
        }
        const lineBorder: PdfAnnotationBorder = new PdfAnnotationBorder();
        lineBorder.width = measureShapeAnnotation.thickness;
        lineBorder.style = measureShapeAnnotation.borderStyle;
        lineBorder.dash = measureShapeAnnotation.borderDashArray;
        circleAnnotation.border = lineBorder;
        circleAnnotation.rotationAngle = this.getRotateAngle(measureShapeAnnotation.rotateAngle);
        let dateValue: Date;
        if (!isNullOrUndefined(measureShapeAnnotation.modifiedDate) && !isNaN(Date.parse(measureShapeAnnotation.modifiedDate))) {
            dateValue = new Date(Date.parse(measureShapeAnnotation.modifiedDate));
            circleAnnotation.modifiedDate = dateValue;
        }
        const commentsDetails: any = measureShapeAnnotation.comments;
        if (commentsDetails.length > 0) {
            for (let i: number = 0; i < commentsDetails.length; i++) {
                circleAnnotation.comments.add(this.addCommentsCollection(commentsDetails[parseInt(i.toString(), 10)],
                                                                         circleAnnotation.bounds));
            }
        }
        const reviewDetails: any = measureShapeAnnotation.review;
        circleAnnotation.reviewHistory.add(this.addReviewCollections(reviewDetails, circleAnnotation.bounds));
        if (!isNullOrUndefined(measureShapeAnnotation.isCloudShape) && measureShapeAnnotation.isCloudShape) {
            const borderEffect: PdfBorderEffect = new PdfBorderEffect();
            borderEffect.style = PdfBorderEffectStyle.cloudy; borderEffect.intensity = measureShapeAnnotation.cloudIntensity;
            circleAnnotation._borderEffect = borderEffect;
            const rectDifferences: string[] = JSON.parse(measureShapeAnnotation.rectangleDifference);
            if (rectDifferences.length > 0) {
                const rd: number[] = this.getRDValues(rectDifferences);
                circleAnnotation._dictionary.update('RD', rd);
            }
        }
        this.preserveIsLockProperty(measureShapeAnnotation, circleAnnotation);
        circleAnnotation.measureType = PdfCircleMeasurementType.radius;
        const measureDetail: any = JSON.parse(measureShapeAnnotation.calibrate);
        if (!isNullOrUndefined(measureDetail)) {
            circleAnnotation._dictionary.set('Measure', this.setMeasureDictionary(measureDetail));
        }
        if (!isNullOrUndefined(measureShapeAnnotation.customData)) {
            circleAnnotation.setValues('CustomData', JSON.stringify(measureShapeAnnotation.customData));
        }
        circleAnnotation.setAppearance(true);
        return circleAnnotation;
    }

    private setMeasureDictionary(measureDetail: any): _PdfDictionary {
        const measureDictionary: _PdfDictionary = new _PdfDictionary();
        measureDictionary.set('Type', 'Measure');
        measureDictionary.set('R', measureDetail.ratio);
        if (!isNullOrUndefined(measureDetail.x)) {
            const xNumberFormat: _PdfDictionary[] = this.createNumberFormat(measureDetail.x);
            measureDictionary.set('X', xNumberFormat);
        }
        if (!isNullOrUndefined(measureDetail.distance)) {
            const dNumberFormat: _PdfDictionary[] = this.createNumberFormat(JSON.parse(measureDetail.distance));
            measureDictionary.set('D', dNumberFormat);
        }
        if (!isNullOrUndefined(measureDetail.area)) {
            const aNumberFormat: _PdfDictionary[] = this.createNumberFormat(JSON.parse(measureDetail.area));
            measureDictionary.set('A', aNumberFormat);
        }
        if (!isNullOrUndefined(measureDetail.angle)) {
            const tNumberFormat: _PdfDictionary[] = this.createNumberFormat(JSON.parse(measureDetail.angle));
            measureDictionary.set('T', tNumberFormat);
        }
        if (!isNullOrUndefined(measureDetail.volume)) {
            const vNumberFormat: _PdfDictionary[] = this.createNumberFormat(JSON.parse(measureDetail.volume));
            measureDictionary.set('V', vNumberFormat);
        }
        return measureDictionary;
    }

    private createNumberFormat(numberFormatList: any): _PdfDictionary[] {
        const numberFormats: _PdfDictionary[] = [];
        if (isNullOrUndefined(numberFormatList) || numberFormatList.length === 0) {
            return undefined;
        }
        for (let index: number = 0; index < numberFormatList.length; index++) {
            const numberFormatDictionary: _PdfDictionary = new _PdfDictionary();
            const numberFormat: any = numberFormatList[parseInt(index.toString(), 10)];
            numberFormatDictionary.set('Type', 'NumberFormat');
            numberFormatDictionary.set('U', numberFormat.unit);
            numberFormatDictionary.set('F', numberFormat.fractionalType);
            numberFormatDictionary.set('D', numberFormat.denominator);
            numberFormatDictionary.set('C', numberFormat.conversionFactor);
            numberFormatDictionary.set('FD', numberFormat.formatDenominator);
            numberFormats.push(numberFormatDictionary);
        }
        return numberFormats;
    }

    private checkAnnotationLock(annotation: any): boolean {
        let isLock: boolean = false;
        if (!isNullOrUndefined(annotation.annotationSettings)) {
            const annotationSettings: any = annotation.annotationSettings;
            if (!isNullOrUndefined(annotationSettings.isLock)){
                isLock = annotationSettings.isLock;
            }
        }
        return isLock;
    }

    private getSaveVertexPoints(points: any, page: PdfPage): number[] {
        const pageHeight: number = page.size[1];
        const pointList: number[] = [];
        for (let index: number = 0; index < points.length; index++) {
            const x: number = this.convertPixelToPoint(points[parseInt(index.toString(), 10)].x);
            pointList.push(x);
            const y: number = pageHeight - this.convertPixelToPoint(points[parseInt(index.toString(), 10)].y);
            pointList.push(y);
        }
        return pointList;
    }

    private getLineEndingStyle(endingStyle: string): PdfLineEndingStyle {
        let style: PdfLineEndingStyle = PdfLineEndingStyle.none;
        switch (endingStyle) {
        case 'Square':
            style = PdfLineEndingStyle.square;
            break;
        case 'ClosedArrow':
        case 'Closed':
            style = PdfLineEndingStyle.closedArrow;
            break;
        case 'RClosedArrow':
            style = PdfLineEndingStyle.rClosedArrow;
            break;
        case 'OpenArrow':
        case 'Open':
            style = PdfLineEndingStyle.openArrow;
            break;
        case 'ROpenArrow':
            style = PdfLineEndingStyle.rOpenArrow;
            break;
        case 'Butt':
            style = PdfLineEndingStyle.butt;
            break;
        case 'Circle':
        case 'Round':
            style = PdfLineEndingStyle.circle;
            break;
        case 'Diamond':
            style = PdfLineEndingStyle.diamond;
            break;
        case 'Slash':
            style = PdfLineEndingStyle.slash;
            break;
        }
        return style;

    }
    private getCaptionType(captionPosition: string): PdfLineCaptionType {
        let captionType: PdfLineCaptionType = PdfLineCaptionType.inline;
        switch (captionPosition) {
        case 'Inline':
            captionType = PdfLineCaptionType.inline;
            break;
        case 'Top':
            captionType = PdfLineCaptionType.top;
            break;
        }
        return captionType;
    }

    private addReviewCollections(popupAnnotation: any, bounds: any): PdfPopupAnnotation {
        const annotation: PdfPopupAnnotation = new PdfPopupAnnotation(null, bounds.x, bounds.y, bounds.width, bounds.height);
        if (popupAnnotation['state'] != null) {
            annotation.state = this.getReviewState(popupAnnotation['state'].toString());
            annotation.stateModel = PdfAnnotationStateModel.review;
        }
        return annotation;
    }

    private addCommentsCollection(popupAnnotation: any, bounds: any): PdfPopupAnnotation {
        const annotation: PdfPopupAnnotation = new PdfPopupAnnotation();
        annotation.text = popupAnnotation.note;
        annotation.author = popupAnnotation.author;
        annotation.subject = popupAnnotation.subject;
        if (!isNullOrUndefined(popupAnnotation.note)) {
            annotation.text = popupAnnotation['note'].toString();
        }
        else {
            annotation._annotFlags = PdfAnnotationFlag.print;
        }
        const reviewDetails: any = popupAnnotation.review;
        annotation.reviewHistory.add(this.addReviewCollections(reviewDetails, bounds));
        let dateValue: Date;
        if (!isNullOrUndefined(popupAnnotation.modifiedDate) && !isNaN(Date.parse(popupAnnotation.modifiedDate))) {
            dateValue = new Date(Date.parse(popupAnnotation.modifiedDate));
            annotation.modifiedDate = dateValue;
        }
        if (!isNullOrUndefined(popupAnnotation.annotName))
        {
            annotation._dictionary.set('NM', popupAnnotation.annotName.toString());
        }
        return annotation;
    }

    private getReviewState(state: string): PdfAnnotationState {
        let reviewState: PdfAnnotationState;
        switch (state) {
        case 'Accepted':
            reviewState = PdfAnnotationState.accepted;
            break;
        case 'Cancelled':
            reviewState = PdfAnnotationState.cancel;
            break;
        case 'Completed':
            reviewState = PdfAnnotationState.completed;
            break;
        case 'Rejected':
            reviewState = PdfAnnotationState.rejected;
            break;
        case 'None':
            reviewState = PdfAnnotationState.none;
            break;
        default:
            reviewState = PdfAnnotationState.unmarked;
            break;
        }
        return reviewState;
    }

    private convertPixelToPoint(value: number): number {
        return (value * 72 / 96);
    }

    private convertPointToPixel(value: number): number {
        return (value * 96 / 72);
    }

    private isTransparentColor(fillColor: any): boolean {
        return fillColor && fillColor.a === 0;
    }

    private getRDValues(values: string[]): number[] {
        const rectDifference: number[] = [];
        for (let i: number = 0; i < values.length; i++) {
            rectDifference.push(parseFloat(values[parseInt(i.toString(), 10)]));
        }
        return rectDifference;
    }

    private getRotateAngle(angleString: string): PdfRotationAngle {
        let angle: PdfRotationAngle = PdfRotationAngle.angle0;
        switch (angleString) {
        case 'RotateAngle0':
            angle = PdfRotationAngle.angle0;
            break;
        case 'RotateAngle180':
            angle = PdfRotationAngle.angle180;
            break;
        case 'RotateAngle270':
            angle = PdfRotationAngle.angle270;
            break;
        case 'RotateAngle90':
            angle = PdfRotationAngle.angle90;
            break;
        }
        return angle;
    }

    /**
     * @private
     * @param {string} angleString - height
     * @returns {number} - angle
     */
    public getInkRotateAngle(angleString: string): number {
        let angle: number = 0;
        switch (angleString) {
        case '0':
            angle = 0;
            break;
        case '1':
            angle = -90;
            break;
        case '2':
            angle = -180;
            break;
        case '3':
            angle = -270;
            break;
        }
        return angle;
    }

    /**
     * @private
     * @param {PdfInkAnnotation} inkAnnot - inkAnnot
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @param {number} pageNumber - pageNumber
     * @param {PdfPage} loadedPage - loadedPage
     * @returns {void}
     */
    public loadSignature(inkAnnot: PdfInkAnnotation, height: number, width: number, pageRotation: number, pageNumber: number,
                         loadedPage: PdfPage): SignatureAnnotationBase {
        const signature: SignatureAnnotationBase = new SignatureAnnotationBase();
        let outputstring: string = '';
        if (!isNullOrUndefined(inkAnnot.inkPointsCollection)) {
            for (let index: number = 0; index < inkAnnot.inkPointsCollection.length; index++) {
                const inkList: number[] = inkAnnot.inkPointsCollection[parseInt(index.toString(), 10)];
                for (let j: number = 0; j < inkList.length; j += 2) {
                    let x: number;
                    let y: number;
                    if (inkAnnot._page.rotation === PdfRotationAngle.angle90) {
                        x = inkList[j + 1];
                        y = inkList[parseInt(j.toString(), 10)];
                    }
                    else if (inkAnnot._page.rotation === PdfRotationAngle.angle180) {
                        x = inkAnnot._page.size[0] - inkList[parseInt(j.toString(), 10)];
                        y = inkList[j + 1];
                    }
                    else if (inkAnnot._page.rotation === PdfRotationAngle.angle270) {
                        x = inkAnnot._page.size[0] - inkList[j + 1];
                        y = inkAnnot._page.size[1] - inkList[parseInt(j.toString(), 10)];
                    }
                    else {
                        x = inkList[parseInt(j.toString(), 10)];
                        y = inkAnnot._page.size[1] - inkList[j + 1];
                    }
                    if (j === 0) {
                        outputstring += 'M' + x + ',' + y + ' ';
                    }
                    else {
                        outputstring += 'L' + x + ',' + y + ' ';
                    }
                }
            }
        }
        signature.AnnotationType = 'Signature';
        signature.Bounds = this.getBounds(inkAnnot.bounds, height, width, pageRotation);
        signature.Opacity = inkAnnot.opacity;
        signature.Thickness = inkAnnot.border.width;
        signature.PathData = outputstring;
        signature.StrokeColor = 'rgba(' + inkAnnot.color[0] + ',' + inkAnnot.color[1] + ',' + inkAnnot.color[2] + ',' + (inkAnnot.color[3] ? inkAnnot.color[3] : 1) + ')';
        signature.PageNumber = pageNumber;
        signature.SignatureName = inkAnnot.name;
        return signature;
    }

    /**
     * @private
     * @param {PdfInkAnnotation} inkAnnot - inkAnnot
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - PageRotation
     * @param {number} pageNumber - number
     * @param {PdfPage} loadedPage - loadedPage
     * @returns {void}
     */
    public loadInkAnnotation(inkAnnot: PdfInkAnnotation, height: number, width: number, pageRotation: number, pageNumber: number,
                             loadedPage: PdfPage): InkSignatureAnnotation {
        const signature: InkSignatureAnnotation = new InkSignatureAnnotation();
        let outputstring: string = '';
        if (!isNullOrUndefined(inkAnnot.inkPointsCollection)) {
            for (let index: number = 0; index < inkAnnot.inkPointsCollection.length; index++) {
                const inkList: number[] = inkAnnot.inkPointsCollection[parseInt(index.toString(), 10)];
                for (let j: number = 0; j < inkList.length; j += 2) {
                    let x: number;
                    let y: number;
                    if (inkAnnot._page.rotation === PdfRotationAngle.angle90) {
                        x = inkList[j + 1];
                        y = inkList[parseInt(j.toString(), 10)];
                    }
                    else if (inkAnnot._page.rotation === PdfRotationAngle.angle180) {
                        x = inkAnnot._page.size[0] - inkList[parseInt(j.toString(), 10)];
                        y = inkList[j + 1];
                    }
                    else if (inkAnnot._page.rotation === PdfRotationAngle.angle270) {
                        x = inkAnnot._page.size[0] - inkList[j + 1];
                        y = inkAnnot._page.size[1] - inkList[parseInt(j.toString(), 10)];
                    }
                    else {
                        x = inkList[parseInt(j.toString(), 10)];
                        y = inkAnnot._page.size[1] - inkList[j + 1];
                    }
                    if (j === 0) {
                        outputstring += 'M' + x + ',' + y + ' ';
                    }
                    else {
                        outputstring += 'L' + x + ',' + y + ' ';
                    }
                }
            }
        }
        signature.Author = inkAnnot.author;
        signature.Subject = inkAnnot.subject;
        if (!isNullOrUndefined(inkAnnot.modifiedDate)) {
            signature.ModifiedDate = this.formatDate(inkAnnot.modifiedDate);
        }
        else {
            signature.ModifiedDate = this.formatDate(new Date());
        }
        signature.Note = this.getValidNoteContent(inkAnnot.text);
        for (let i: number = 0; i < inkAnnot.reviewHistory.count; i++) {
            signature.State = this.getStateString(inkAnnot.reviewHistory.at(parseInt(i.toString(), 10)).state);
            signature.StateModel = this.getStateModelString(inkAnnot.reviewHistory.at(parseInt(i.toString(), 10)).stateModel);
        }
        if (isNullOrUndefined(signature.State) || isNullOrUndefined(signature.StateModel)) {
            signature.State = 'Unmarked';
            signature.StateModel = 'None';
        }
        signature.Comments = new Array<PopupAnnotationBase>();
        for (let i: number = 0; i < inkAnnot.comments.count; i++) {
            const annot: PopupAnnotationBase = this.loadPopupAnnotation(inkAnnot.comments.at(i), height, width, pageRotation);
            signature.Comments.push(annot);
        }
        this.updateIsLockProperty(signature, inkAnnot);
        signature.AnnotationType = 'Ink';
        signature.AnnotType = 'Ink';
        signature.Bounds = this.getBounds(inkAnnot.bounds, height, width, pageRotation);
        if (inkAnnot.bounds.y < 0) {
            const cropRect: Rect = new Rect(inkAnnot.bounds.x, loadedPage.cropBox[1] + inkAnnot.bounds.y, inkAnnot.bounds.width,
                                            inkAnnot.bounds.height);
            signature.Bounds = this.getBounds(cropRect, height, width, pageRotation);
        }
        signature.Opacity = inkAnnot.opacity;
        signature.Thickness = inkAnnot.border.width;
        signature.PathData = outputstring;
        signature.StrokeColor = 'rgba(' + inkAnnot.color[0] + ',' + inkAnnot.color[1] + ',' + inkAnnot.color[2] + ',' + (inkAnnot.color[3] ? inkAnnot.color[3] : 1) + ')';
        signature.PageNumber = pageNumber;
        signature.AnnotName = inkAnnot.name;
        if (inkAnnot._dictionary.has('CustomData') && !isNullOrUndefined(inkAnnot._dictionary.get('CustomData'))) {
            const customData: any = inkAnnot._dictionary.get('CustomData');
            if (customData != null) {
                signature.ExistingCustomData = customData;
            }
        }
        return signature;
    }

    /**
     * @param {PdfSquareAnnotation} squareAnnot - squareAnnot
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @param {PdfFreeTextAnnotation} shapeFreeText - shapeFreeText
     * @private
     * @returns {void}
     */
    public loadSquareAnnotation(squareAnnot: PdfSquareAnnotation, height: number, width: number, pageRotation: number,
                                shapeFreeText: PdfFreeTextAnnotation): ShapeAnnotationBase {
        const shapeAnnotation: ShapeAnnotationBase = new ShapeAnnotationBase();
        shapeAnnotation.ShapeAnnotationType = 'Square';
        shapeAnnotation.Author = squareAnnot.author;
        shapeAnnotation.AnnotName = squareAnnot.name;
        shapeAnnotation.Subject = squareAnnot.subject;
        if (!isNullOrUndefined(squareAnnot.modifiedDate)) {
            shapeAnnotation.ModifiedDate = this.formatDate(squareAnnot.modifiedDate);
        }
        else {
            shapeAnnotation.ModifiedDate = this.formatDate(new Date());
        }
        shapeAnnotation.Note = this.getValidNoteContent(squareAnnot.text);
        shapeAnnotation.Thickness = squareAnnot.border.width;
        shapeAnnotation.BorderStyle = this.getBorderStylesString(squareAnnot.border.style);
        shapeAnnotation.BorderDashArray = squareAnnot.border.dash ? squareAnnot.border.dash[0] ? squareAnnot.border.dash[0] : 0 : 0;
        shapeAnnotation.Opacity = squareAnnot.opacity;
        shapeAnnotation.RotateAngle = this.getRotateAngleString(squareAnnot.rotate);
        shapeAnnotation.AnnotType = 'shape';
        for (let i: number = 0; i < squareAnnot.reviewHistory.count; i++) {
            shapeAnnotation.State = this.getStateString(squareAnnot.reviewHistory.at(parseInt(i.toString(), 10)).state);
            shapeAnnotation.StateModel = this.getStateModelString(squareAnnot.reviewHistory.at(parseInt(i.toString(), 10)).stateModel);
        }
        if (isNullOrUndefined(shapeAnnotation.State) || isNullOrUndefined(shapeAnnotation.StateModel)) {
            shapeAnnotation.State = 'Unmarked';
            shapeAnnotation.StateModel = 'None';
        }

        shapeAnnotation.Comments = new Array<PopupAnnotationBase>();
        for (let i: number = 0; i < squareAnnot.comments.count; i++) {
            const annot: PopupAnnotationBase = this.loadPopupAnnotation(squareAnnot.comments.at(i), height, width, pageRotation);
            shapeAnnotation.Comments.push(annot);
        }
        shapeAnnotation.Bounds = this.getBounds(squareAnnot.bounds, height, width, pageRotation);
        shapeAnnotation.LineHeadStart = 'None';
        shapeAnnotation.LineHeadEnd = 'None';
        if (!isNullOrUndefined(squareAnnot.borderEffect)) {
            if (squareAnnot.borderEffect.style === PdfBorderEffectStyle.cloudy) {
                shapeAnnotation.IsCloudShape = true;
                shapeAnnotation.CloudIntensity = squareAnnot.borderEffect.intensity;
            }
            else {
                shapeAnnotation.IsCloudShape = false;
                shapeAnnotation.CloudIntensity = 0;
            }
        }
        else {
            shapeAnnotation.IsCloudShape = false;
            shapeAnnotation.CloudIntensity = 0;
        }
        if (squareAnnot._dictionary.has('RD') && !isNullOrUndefined(squareAnnot._dictionary.get('RD'))) {
            shapeAnnotation.RectangleDifference = squareAnnot._dictionary.get('RD');
        }
        else {
            shapeAnnotation.RectangleDifference = new Array<string>();
        }
        this.updateIsLockProperty(shapeAnnotation, squareAnnot);
        if (squareAnnot._dictionary.has('AllowedInteractions')) {
            const allowedInteractions: string[] = squareAnnot.getValues('AllowedInteractions');
            const text: any = allowedInteractions[0];
            shapeAnnotation.AllowedInteractions = JSON.parse(text);
        }
        shapeAnnotation.StrokeColor = !isNullOrUndefined(squareAnnot.color) ? 'rgba(' + squareAnnot.color[0] + ',' + squareAnnot.color[1] + ',' + squareAnnot.color[2] + ',' + (squareAnnot.color[3] ? squareAnnot.color[3] : 1) + ')' : 'rgba(0,0,0,1)';
        let fillOpacity: number = (!isNullOrUndefined(squareAnnot.color) && squareAnnot.color[3]) ? squareAnnot.color[3] : 1;
        if (squareAnnot._dictionary.has('FillOpacity') && !isNullOrUndefined(squareAnnot._dictionary.get('FillOpacity'))) {
            fillOpacity = parseInt(squareAnnot._dictionary.get('FillOpacity').toString(), 10);
        }
        fillOpacity = squareAnnot.innerColor ? fillOpacity : 0;
        squareAnnot.innerColor = squareAnnot.innerColor ? squareAnnot.innerColor : [255, 255, 255];
        shapeAnnotation.FillColor = 'rgba(' + squareAnnot.innerColor[0] + ',' + squareAnnot.innerColor[1] + ',' + squareAnnot.innerColor[2] + ',' + fillOpacity + ')';
        shapeAnnotation.EnableShapeLabel = false;
        if (shapeFreeText != null) {
            shapeAnnotation.EnableShapeLabel = true;
            shapeAnnotation.LabelContent = shapeFreeText.text;
            shapeAnnotation.LabelFillColor = 'rgba(' + shapeFreeText.color[0] + ',' + shapeFreeText.color[1] + ',' + shapeFreeText.color[2] + ',' + (shapeFreeText.color[3] ? shapeFreeText.color[3] : 1) + ')';
            shapeAnnotation.FontColor = 'rgba(' + shapeFreeText.textMarkUpColor[0] + ',' + shapeFreeText.textMarkUpColor[1] + ',' + shapeFreeText.textMarkUpColor[2] + ',' + (shapeFreeText.textMarkUpColor[3] ? shapeFreeText.textMarkUpColor[3] : 1) + ')';
            shapeAnnotation.LabelBorderColor = 'rgba(' + shapeFreeText.borderColor[0] + ',' + shapeFreeText.borderColor[1] + ',' + shapeFreeText.borderColor[2] + ',' + (shapeFreeText.borderColor[3] ? shapeFreeText.borderColor[3] : 1) + ')';
            shapeAnnotation.FontSize = shapeFreeText.font.size;
        }
        if (squareAnnot._dictionary.has('CustomData') && !isNullOrUndefined(squareAnnot._dictionary.get('CustomData'))) {
            const customData: any = squareAnnot._dictionary.get('CustomData');
            if (customData != null) {
                shapeAnnotation.ExistingCustomData = customData;
            }
        }
        return shapeAnnotation;
    }

    /**
     * @param {PdfLineAnnotation} lineAnnot - lineAnnot
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @param {PdfFreeTextAnnotation} shapeFreeText - shapeFreeText
     * @private
     * @returns {void}
     */
    public loadLineAnnotation(lineAnnot: PdfLineAnnotation, height: number, width: number, pageRotation: number,
                              shapeFreeText: PdfFreeTextAnnotation): ShapeAnnotationBase {
        const shapeAnnotation: ShapeAnnotationBase = new ShapeAnnotationBase();
        shapeAnnotation.ShapeAnnotationType = 'Line';
        shapeAnnotation.Author = lineAnnot.author;
        shapeAnnotation.AnnotName = lineAnnot.name;
        shapeAnnotation.Subject = lineAnnot.subject;
        if (!isNullOrUndefined(lineAnnot.modifiedDate)) {
            shapeAnnotation.ModifiedDate = this.formatDate(lineAnnot.modifiedDate);
        }
        else {
            shapeAnnotation.ModifiedDate = this.formatDate(new Date());
        }
        shapeAnnotation.Note = this.getValidNoteContent(lineAnnot.text);
        shapeAnnotation.Thickness = lineAnnot.border.width;
        shapeAnnotation.BorderStyle = this.getBorderStylesString(lineAnnot.border.style);
        shapeAnnotation.BorderDashArray = lineAnnot.border.dash ? lineAnnot.border.dash[0] ? lineAnnot.border.dash[0] : 0 : 0;
        shapeAnnotation.Opacity = lineAnnot.opacity;
        shapeAnnotation.RotateAngle = this.getRotateAngleString(lineAnnot.rotate);
        shapeAnnotation.AnnotType = 'shape';
        shapeAnnotation.EnableShapeLabel = false;
        if (shapeFreeText != null) {
            shapeAnnotation.EnableShapeLabel = true;
            shapeAnnotation.LabelContent = shapeFreeText.text;
            shapeAnnotation.LabelFillColor = 'rgba(' + shapeFreeText.color[0] + ',' + shapeFreeText.color[1] + ',' + shapeFreeText.color[2] + ',' + (shapeFreeText.color[3] ? shapeFreeText.color[3] : 1) + ')';
            shapeAnnotation.FontColor = 'rgba(' + shapeFreeText.textMarkUpColor[0] + ',' + shapeFreeText.textMarkUpColor[1] + ',' + shapeFreeText.textMarkUpColor[2] + ',' + (shapeFreeText.textMarkUpColor[3] ? shapeFreeText.textMarkUpColor[3] : 1) + ')';
            shapeAnnotation.LabelBorderColor = 'rgba(' + shapeFreeText.borderColor[0] + ',' + shapeFreeText.borderColor[1] + ',' + shapeFreeText.borderColor[2] + ',' + (shapeFreeText.borderColor[3] ? shapeFreeText.borderColor[3] : 1) + ')';
            shapeAnnotation.FontSize = shapeFreeText.font.size;
            shapeAnnotation.FontFamily = this.getFontFamilyString((shapeFreeText.font as PdfStandardFont)._fontFamily);
        }
        for (let i: number = 0; i < lineAnnot.reviewHistory.count; i++) {
            shapeAnnotation.State = this.getStateString(lineAnnot.reviewHistory.at(parseInt(i.toString(), 10)).state);
            shapeAnnotation.StateModel = this.getStateModelString(lineAnnot.reviewHistory.at(parseInt(i.toString(), 10)).stateModel);
        }
        if (isNullOrUndefined(shapeAnnotation.State) || isNullOrUndefined(shapeAnnotation.StateModel)) {
            shapeAnnotation.State = 'Unmarked';
            shapeAnnotation.StateModel = 'None';
        }

        shapeAnnotation.Comments = new Array<PopupAnnotationBase>();
        for (let i: number = 0; i < lineAnnot.comments.count; i++) {
            const annot: PopupAnnotationBase = this.loadPopupAnnotation(lineAnnot.comments.at(i), height, width, pageRotation);
            shapeAnnotation.Comments.push(annot);
        }
        shapeAnnotation.Bounds = this.getBounds(lineAnnot.bounds, height, width, pageRotation);
        shapeAnnotation.LineHeadStart = this.getLineEndingStyleString(lineAnnot.lineEndingStyle.begin);
        shapeAnnotation.LineHeadEnd = this.getLineEndingStyleString(lineAnnot.lineEndingStyle.end);
        if (!isNullOrUndefined(lineAnnot._borderEffect)) {
            if (lineAnnot._borderEffect.style === PdfBorderEffectStyle.cloudy) {
                shapeAnnotation.IsCloudShape = true;
                shapeAnnotation.CloudIntensity = lineAnnot._borderEffect.intensity;
            } else {
                shapeAnnotation.IsCloudShape = false;
                shapeAnnotation.CloudIntensity = 0;
            }
        } else {
            shapeAnnotation.IsCloudShape = false;
            shapeAnnotation.CloudIntensity = 0;
        }
        shapeAnnotation.VertexPoints = this.getLinePoints(lineAnnot.linePoints, height, width, pageRotation, lineAnnot._page);
        if (lineAnnot._dictionary.has('RD') && !isNullOrUndefined(lineAnnot._dictionary.get('RD'))) {
            shapeAnnotation.RectangleDifference = lineAnnot._dictionary.get('RD');
        } else {
            shapeAnnotation.RectangleDifference = new Array<string>();
        }
        this.updateIsLockProperty(shapeAnnotation, lineAnnot);
        if (lineAnnot._dictionary.has('AllowedInteractions')) {
            const allowedInteractions: string[] = lineAnnot.getValues('AllowedInteractions');
            const text: any = allowedInteractions[0];
            shapeAnnotation.AllowedInteractions = JSON.parse(text);
        }
        const color: number[] = !isNullOrUndefined(lineAnnot.color) ? lineAnnot.color : [0, 0, 0];
        shapeAnnotation.StrokeColor = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] ? color[3] : 1) + ')';
        let fillOpacity: number = lineAnnot.color && lineAnnot.color[3] ? lineAnnot.color[3] : 1;
        if (lineAnnot._dictionary.has('FillOpacity') && !isNullOrUndefined(lineAnnot._dictionary.get('FillOpacity'))) {
            fillOpacity = parseInt(lineAnnot._dictionary.get('FillOpacity').toString(), 10);
        }
        fillOpacity = lineAnnot.innerColor ? fillOpacity : 0;
        lineAnnot.innerColor = lineAnnot.innerColor ? lineAnnot.innerColor : [255, 255, 255];
        shapeAnnotation.FillColor = 'rgba(' + lineAnnot.innerColor[0] + ',' + lineAnnot.innerColor[1] + ',' + lineAnnot.innerColor[2] + ',' + fillOpacity + ')';
        if (lineAnnot._dictionary.has('CustomData') && !isNullOrUndefined(lineAnnot._dictionary.get('CustomData'))) {
            const customData: any = lineAnnot._dictionary.get('CustomData');
            if (customData != null) {
                shapeAnnotation.ExistingCustomData = customData;
            }
        }
        if (lineAnnot.lineIntent === PdfLineIntent.lineArrow || !lineAnnot._dictionary.has('Measure')) {
            return shapeAnnotation;
        } else {
            const measureShapeAnnotation: MeasureShapeAnnotationBase = new MeasureShapeAnnotationBase(shapeAnnotation);
            if (lineAnnot._dictionary.has('Measure')) {
                measureShapeAnnotation.Calibrate = this.getMeasureObject(lineAnnot);
            }
            measureShapeAnnotation.Indent = lineAnnot.lineIntent.toString();
            measureShapeAnnotation.Caption = lineAnnot.caption.cap;
            measureShapeAnnotation.LeaderLength = lineAnnot.leaderExt;
            measureShapeAnnotation.LeaderLineExtension = lineAnnot.leaderLine;
            measureShapeAnnotation.ExistingCustomData = shapeAnnotation.ExistingCustomData;
            if (lineAnnot._dictionary.has('LLO')) {
                measureShapeAnnotation.LeaderLineOffset = lineAnnot._dictionary.get('LLO');
            } else {
                measureShapeAnnotation.LeaderLineOffset = 0;
            }
            measureShapeAnnotation.CaptionPosition = lineAnnot.caption.type.toString();
            if (lineAnnot.flags === PdfAnnotationFlag.readOnly) {
                measureShapeAnnotation.IsCommentLock = true;
            } else {
                measureShapeAnnotation.IsCommentLock = false;
            }
            if (lineAnnot.flags === PdfAnnotationFlag.print) {
                measureShapeAnnotation.IsPrint = true;
            }
            if (lineAnnot._dictionary.has('CustomData') && !isNullOrUndefined(lineAnnot._dictionary.get('CustomData'))) {
                const customData: any = lineAnnot._dictionary.get('CustomData');
                if (customData != null) {
                    measureShapeAnnotation.ExistingCustomData = customData;
                }
            }
            return measureShapeAnnotation;
        }
    }

    private getLinePoints(points: number[], pageHeight: number, pageWidth: number, pageRotation: number, page: PdfPage): AnnotPoint[] {
        const linePoints: AnnotPoint[] = [];
        let startingPoint: AnnotPoint = new AnnotPoint(points[0], points[1]);
        let endingPoint: AnnotPoint = new AnnotPoint(points[2], points[3]);
        const cropBox: number[] = this.getBothCropBoxValue(page);
        let cropBoxX: number = 0;
        let cropBoxY: number = 0;
        if (!(cropBox[0] === 0 && (page as PdfPage).cropBox[2] === page.size[2] && cropBox[1] === page.size[3])) {
            cropBoxX = cropBox[0];
            cropBoxY = cropBox[1];
        }
        if (pageRotation === 0) {
            startingPoint = { X: this.convertPointToPixel(points[0]) - this.convertPointToPixel(cropBoxX),
                Y: (pageHeight - this.convertPointToPixel(points[1])) + this.convertPointToPixel(cropBoxY) };
            endingPoint = { X: this.convertPointToPixel(points[2]) - this.convertPointToPixel(cropBoxX),
                Y: (pageHeight - this.convertPointToPixel(points[3])) + this.convertPointToPixel(cropBoxY) };
        } else if (pageRotation === 1) {
            startingPoint = { X: this.convertPointToPixel(points[1]), Y: this.convertPointToPixel(points[0]) };
            endingPoint = { X: this.convertPointToPixel(points[3]), Y: this.convertPointToPixel(points[2]) };
        } else if (pageRotation === 2) {
            startingPoint = { X: pageWidth - this.convertPointToPixel(points[0]), Y: this.convertPointToPixel(points[1]) };
            endingPoint = { X: pageWidth - this.convertPointToPixel(points[2]), Y: this.convertPointToPixel(points[3]) };
        } else if (pageRotation === 3) {
            startingPoint = { X: (pageWidth - this.convertPointToPixel(points[1])), Y: (pageHeight - this.convertPointToPixel(points[0])) };
            endingPoint = { X: pageWidth - this.convertPointToPixel(points[3]), Y: pageHeight - this.convertPointToPixel(points[2]) };
        }
        linePoints.push(startingPoint);
        linePoints.push(endingPoint);
        return linePoints;
    }

    /**
     * @param {PdfEllipseAnnotation} ellipseAnnot - ellipseAnnot
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @param {PdfFreeTextAnnotation} shapeFreeText - shapeFreeTezt
     * @private
     * @returns {void}
     */
    public loadEllipseAnnotation(ellipseAnnot: PdfEllipseAnnotation, height: number, width: number,
                                 pageRotation: number, shapeFreeText: PdfFreeTextAnnotation): ShapeAnnotationBase {
        const shapeAnnotation: ShapeAnnotationBase = new ShapeAnnotationBase();
        shapeAnnotation.ShapeAnnotationType = 'Circle';
        shapeAnnotation.Author = ellipseAnnot.author;
        shapeAnnotation.AnnotName = ellipseAnnot.name;
        shapeAnnotation.Subject = ellipseAnnot.subject;
        if (!isNullOrUndefined(ellipseAnnot.modifiedDate)) {
            shapeAnnotation.ModifiedDate = this.formatDate(ellipseAnnot.modifiedDate);
        }
        else {
            shapeAnnotation.ModifiedDate = this.formatDate(new Date());
        }
        shapeAnnotation.Note = this.getValidNoteContent(ellipseAnnot.text);
        shapeAnnotation.Thickness = ellipseAnnot.border.width;
        shapeAnnotation.BorderStyle = this.getBorderStylesString(ellipseAnnot.border.style);
        shapeAnnotation.BorderDashArray = ellipseAnnot.border.dash ? ellipseAnnot.border.dash[0] ? ellipseAnnot.border.dash[0] : 0 : 0;
        shapeAnnotation.Opacity = ellipseAnnot.opacity;
        shapeAnnotation.RotateAngle = this.getRotateAngleString(ellipseAnnot.rotate);
        shapeAnnotation.AnnotType = 'shape';
        for (let i: number = 0; i < ellipseAnnot.reviewHistory.count; i++) {
            shapeAnnotation.State = this.getStateString(ellipseAnnot.reviewHistory.at(parseInt(i.toString(), 10)).state);
            shapeAnnotation.StateModel = this.getStateModelString(ellipseAnnot.reviewHistory.at(parseInt(i.toString(), 10)).stateModel);
        }
        if (isNullOrUndefined(shapeAnnotation.State) || isNullOrUndefined(shapeAnnotation.StateModel)) {
            shapeAnnotation.State = 'Unmarked';
            shapeAnnotation.StateModel = 'None';
        }
        shapeAnnotation.Comments = new Array<PopupAnnotationBase>();
        for (let i: number = 0; i < ellipseAnnot.comments.count; i++) {
            const annot: PopupAnnotationBase = this.loadPopupAnnotation(ellipseAnnot.comments.at(i), height, width, pageRotation);
            shapeAnnotation.Comments.push(annot);
        }
        shapeAnnotation.Bounds = this.getBounds(ellipseAnnot.bounds, height, width, pageRotation);
        shapeAnnotation.LineHeadStart = 'None';
        shapeAnnotation.LineHeadEnd = 'None';
        if (!isNullOrUndefined(ellipseAnnot._borderEffect)) {
            if (ellipseAnnot._borderEffect.style === PdfBorderEffectStyle.cloudy) {
                shapeAnnotation.IsCloudShape = true;
                shapeAnnotation.CloudIntensity = ellipseAnnot._borderEffect.intensity;
            }
            else {
                shapeAnnotation.IsCloudShape = false;
                shapeAnnotation.CloudIntensity = 0;
            }
        }
        else {
            shapeAnnotation.IsCloudShape = false;
            shapeAnnotation.CloudIntensity = 0;
        }
        if (ellipseAnnot._dictionary.has('RD') && !isNullOrUndefined(ellipseAnnot._dictionary.get('RD'))) {
            shapeAnnotation.RectangleDifference = ellipseAnnot._dictionary.get('RD');
        }
        else {
            shapeAnnotation.RectangleDifference = new Array<string>();
        }
        this.updateIsLockProperty(shapeAnnotation, ellipseAnnot);
        if (ellipseAnnot._dictionary.has('AllowedInteractions')) {
            const allowedInteractions: string[] = ellipseAnnot.getValues('AllowedInteractions');
            const text: any = allowedInteractions[0];
            shapeAnnotation.AllowedInteractions = JSON.parse(text);
        }
        shapeAnnotation.StrokeColor = 'rgba(' + ellipseAnnot.color[0] + ',' + ellipseAnnot.color[1] + ',' + ellipseAnnot.color[2] + ',' + (ellipseAnnot.color[3] ? ellipseAnnot.color[3] : 1) + ')';
        let fillOpacity: number = ellipseAnnot.color[3] ? ellipseAnnot.color[3] : 1;
        if (ellipseAnnot._dictionary.has('FillOpacity') && !isNullOrUndefined(ellipseAnnot._dictionary.get('FillOpacity'))) {
            fillOpacity = parseInt(ellipseAnnot._dictionary.get('FillOpacity').toString(), 10);
        }
        fillOpacity = ellipseAnnot.innerColor ? fillOpacity : 0;
        ellipseAnnot.innerColor = ellipseAnnot.innerColor ? ellipseAnnot.innerColor : [255, 255, 255];
        shapeAnnotation.FillColor = 'rgba(' + ellipseAnnot.innerColor[0] + ',' + ellipseAnnot.innerColor[1] + ',' + ellipseAnnot.innerColor[2] + ',' + fillOpacity + ')';
        shapeAnnotation.EnableShapeLabel = false;
        if (shapeFreeText != null) {
            shapeAnnotation.EnableShapeLabel = true;
            shapeAnnotation.LabelContent = shapeFreeText.text;
            shapeAnnotation.LabelFillColor = 'rgba(' + shapeFreeText.color[0] + ',' + shapeFreeText.color[1] + ',' + shapeFreeText.color[2] + ',' + (shapeFreeText.color[3] ? shapeFreeText.color[3] : 1) + ')';
            shapeAnnotation.FontColor = 'rgba(' + shapeFreeText.textMarkUpColor[0] + ',' + shapeFreeText.textMarkUpColor[1] + ',' + shapeFreeText.textMarkUpColor[2] + ',' + (shapeFreeText.textMarkUpColor[3] ? shapeFreeText.textMarkUpColor[3] : 1) + ')';
            shapeAnnotation.LabelBorderColor = 'rgba(' + shapeFreeText.borderColor[0] + ',' + shapeFreeText.borderColor[1] + ',' + shapeFreeText.borderColor[2] + ',' + (shapeFreeText.borderColor[3] ? shapeFreeText.borderColor[3] : 1) + ')';
            shapeAnnotation.FontSize = shapeFreeText.font.size;
        }
        if (ellipseAnnot._dictionary.has('CustomData') && !isNullOrUndefined(ellipseAnnot._dictionary.get('CustomData'))) {
            const customData: any = ellipseAnnot._dictionary.get('CustomData');
            if (customData != null) {
                shapeAnnotation.ExistingCustomData = customData;
            }
        }
        if (ellipseAnnot._dictionary.has('Measure')) {
            shapeAnnotation.FillColor = 'rgba(' + ellipseAnnot.innerColor[0] + ',' + ellipseAnnot.innerColor[1] + ',' + ellipseAnnot.innerColor[2] + ',' + fillOpacity + ')';
            const measureShapeAnnotation: MeasureShapeAnnotationBase = new MeasureShapeAnnotationBase(shapeAnnotation);
            measureShapeAnnotation.Calibrate = this.getMeasureObject(ellipseAnnot as PdfAnnotation);
            if (ellipseAnnot._dictionary.has('IT')) {
                measureShapeAnnotation.Indent = ellipseAnnot._dictionary.get('IT');
            }
            else {
                measureShapeAnnotation.Indent = 'PolyLineDimension';
            }
            measureShapeAnnotation.Caption = false;
            measureShapeAnnotation.LeaderLength = 0;
            measureShapeAnnotation.LeaderLineExtension = 0;
            measureShapeAnnotation.LeaderLineOffset = 0;
            measureShapeAnnotation.CaptionPosition = '';
            if (ellipseAnnot.flags === PdfAnnotationFlag.readOnly) {
                measureShapeAnnotation.IsCommentLock = true;
            }
            else {
                measureShapeAnnotation.IsCommentLock = false;
            }
            if (ellipseAnnot.flags === PdfAnnotationFlag.print) {
                measureShapeAnnotation.IsPrint = true;
            }
            if (ellipseAnnot._dictionary.has('CustomData') && !isNullOrUndefined(ellipseAnnot._dictionary.get('CustomData'))) {
                const customData: any = ellipseAnnot._dictionary.get('CustomData');
                if (customData != null) {
                    measureShapeAnnotation.ExistingCustomData = customData;
                }
            }
            return measureShapeAnnotation;
        }
        else {
            return shapeAnnotation;
        }
    }

    /**
     * @param {PdfPolygonAnnotation} polygonAnnot - polygonAnnot
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @param {PdfFreeTextAnnotation} shapeFreeText - shapeFreeText
     * @private
     * @returns {void}
     */
    public loadPolygonAnnotation(polygonAnnot: PdfPolygonAnnotation, height: number, width: number, pageRotation: number,
                                 shapeFreeText: PdfFreeTextAnnotation): ShapeAnnotationBase {
        const shapeAnnotation: ShapeAnnotationBase = new ShapeAnnotationBase();
        shapeAnnotation.ShapeAnnotationType = 'Polygon';
        shapeAnnotation.Author = polygonAnnot.author;
        shapeAnnotation.AnnotName = polygonAnnot.name;
        shapeAnnotation.Subject = polygonAnnot.subject;
        if (!isNullOrUndefined(polygonAnnot.modifiedDate)){
            shapeAnnotation.ModifiedDate = this.formatDate(polygonAnnot.modifiedDate);
        }
        else{
            shapeAnnotation.ModifiedDate = this.formatDate(new Date());
        }
        shapeAnnotation.Note = this.getValidNoteContent(polygonAnnot.text);
        shapeAnnotation.Thickness = polygonAnnot.border.width;
        shapeAnnotation.BorderStyle = this.getBorderStylesString(polygonAnnot.border.style);
        shapeAnnotation.BorderDashArray = polygonAnnot.border.dash ? polygonAnnot.border.dash[0] ? polygonAnnot.border.dash[0] : 0 : 0;
        shapeAnnotation.Opacity = polygonAnnot.opacity;
        shapeAnnotation.RotateAngle = this.getRotateAngleString(polygonAnnot.rotate);
        shapeAnnotation.AnnotType = 'shape';
        for (let i: number = 0; i < polygonAnnot.reviewHistory.count; i++)
        {
            shapeAnnotation.State = this.getStateString(polygonAnnot.reviewHistory.at(parseInt(i.toString(), 10)).state);
            shapeAnnotation.StateModel = this.getStateModelString(polygonAnnot.reviewHistory.at(parseInt(i.toString(), 10)).stateModel);
        }
        if (isNullOrUndefined(shapeAnnotation.State) || isNullOrUndefined(shapeAnnotation.StateModel))
        {
            shapeAnnotation.State = 'Unmarked';
            shapeAnnotation.StateModel = 'None';
        }
        shapeAnnotation.Comments = new Array<PopupAnnotationBase>();
        for (let i: number = 0; i < polygonAnnot.comments.count; i++)
        {
            const annot: PopupAnnotationBase = this.loadPopupAnnotation(polygonAnnot.comments.at(i), height, width, pageRotation);
            shapeAnnotation.Comments.push(annot);
        }
        shapeAnnotation.Bounds = this.getBounds(polygonAnnot.bounds, height, width, pageRotation);
        if (!isNullOrUndefined(polygonAnnot._dictionary.get('Vertices'))){
            shapeAnnotation.VertexPoints = this.getVertexPoints(polygonAnnot._dictionary.get('Vertices'), width, height, pageRotation, polygonAnnot._page);
        }
        if (!isNullOrUndefined(shapeAnnotation.VertexPoints) && JSON.stringify(shapeAnnotation.VertexPoints[0]) !==
        JSON.stringify(shapeAnnotation.VertexPoints[shapeAnnotation.VertexPoints.length - 1])){
            shapeAnnotation.VertexPoints.push(shapeAnnotation.VertexPoints[0]);
        }
        shapeAnnotation.StrokeColor = 'rgba(' + polygonAnnot.color[0] + ',' + polygonAnnot.color[1] + ',' + polygonAnnot.color[2] + ',' + (polygonAnnot.color[3] ? polygonAnnot.color[3] : 1) + ')';
        let fillOpacity: number = polygonAnnot.color[3] ? polygonAnnot.color[3] : 1;
        if (polygonAnnot._dictionary.has('FillOpacity') && !isNullOrUndefined(polygonAnnot._dictionary.get('FillOpacity'))) {
            fillOpacity = parseInt(polygonAnnot._dictionary.get('FillOpacity').toString(), 10);
        }
        fillOpacity = polygonAnnot.innerColor ? fillOpacity : 0;
        polygonAnnot.innerColor = polygonAnnot.innerColor ? polygonAnnot.innerColor : [255, 255, 255];
        shapeAnnotation.FillColor = 'rgba(' + polygonAnnot.innerColor[0] + ',' + polygonAnnot.innerColor[1] + ',' + polygonAnnot.innerColor[2] + ',' + fillOpacity + ')';
        shapeAnnotation.LineHeadStart = 'None';
        shapeAnnotation.LineHeadEnd = 'None';
        shapeAnnotation.EnableShapeLabel = false;
        if (shapeFreeText != null){
            shapeAnnotation.EnableShapeLabel = true;
            shapeAnnotation.LabelContent = shapeFreeText.text;
            shapeAnnotation.LabelFillColor = 'rgba(' + shapeFreeText.color[0] + ',' + shapeFreeText.color[1] + ',' + shapeFreeText.color[2] + ',' + (shapeFreeText.color[3] ? shapeFreeText.color[3] : 1) + ')';
            shapeAnnotation.FontColor = 'rgba(' + shapeFreeText.textMarkUpColor[0] + ',' + shapeFreeText.textMarkUpColor[1] + ',' + shapeFreeText.textMarkUpColor[2] + ',' + (shapeFreeText.textMarkUpColor[3] ? shapeFreeText.textMarkUpColor[3] : 1) + ')';
            shapeAnnotation.LabelBorderColor = 'rgba(' + shapeFreeText.borderColor[0] + ',' + shapeFreeText.borderColor[1] + ',' + shapeFreeText.borderColor[2] + ',' + (shapeFreeText.borderColor[3] ? shapeFreeText.borderColor[3] : 1) + ')';
            shapeAnnotation.FontSize = shapeFreeText.font.size;
        }
        if (!isNullOrUndefined(polygonAnnot.borderEffect)){
            if (polygonAnnot.borderEffect.style === PdfBorderEffectStyle.cloudy){
                shapeAnnotation.IsCloudShape = true;
                shapeAnnotation.CloudIntensity = polygonAnnot.borderEffect.intensity;
            }
            else{
                shapeAnnotation.IsCloudShape = false;
                shapeAnnotation.CloudIntensity = 0;
            }
        }
        else{
            shapeAnnotation.IsCloudShape = false;
            shapeAnnotation.CloudIntensity = 0;
        }
        if (polygonAnnot._dictionary.has('RD') && !isNullOrUndefined(polygonAnnot._dictionary.get('RD'))){
            shapeAnnotation.RectangleDifference = polygonAnnot._dictionary.get('RD');
        }
        else{
            shapeAnnotation.RectangleDifference = new Array<string>();
        }
        this.updateIsLockProperty(shapeAnnotation, polygonAnnot);
        if (polygonAnnot._dictionary.has('CustomData') && !isNullOrUndefined(polygonAnnot._dictionary.get('CustomData')))
        {
            const customData: any = polygonAnnot._dictionary.get('CustomData');
            if (customData != null)
            {
                shapeAnnotation.ExistingCustomData = customData;
            }
        }
        if (polygonAnnot._dictionary.has('AllowedInteractions')) {
            const allowedInteractions: string[] = polygonAnnot.getValues('AllowedInteractions');
            const text: any = allowedInteractions[0];
            shapeAnnotation.AllowedInteractions = JSON.parse(text);
        }
        if (polygonAnnot._dictionary.has('Measure')) {
            const measureShapeAnnotation: MeasureShapeAnnotationBase = new MeasureShapeAnnotationBase(shapeAnnotation);
            if (polygonAnnot._dictionary.has('IT') && !isNullOrUndefined(polygonAnnot._dictionary.get('IT'))) {
                measureShapeAnnotation.Indent = polygonAnnot._dictionary.get('IT').name;
            } else {
                measureShapeAnnotation.Indent = 'PolygonDimension';
            }
            measureShapeAnnotation.Calibrate = this.getMeasureObject(polygonAnnot);
            if (isNullOrUndefined(measureShapeAnnotation.Calibrate)) {
                return shapeAnnotation;
            }
            if (measureShapeAnnotation.Indent === 'PolygonVolume' && polygonAnnot._dictionary.has('Depth') && (!isNullOrUndefined(polygonAnnot._dictionary.get('Depth')))) {
                measureShapeAnnotation.Calibrate.Depth = polygonAnnot._dictionary.get('Depth');
            }
            measureShapeAnnotation.Caption = false;
            measureShapeAnnotation.LeaderLength = 0;
            measureShapeAnnotation.LeaderLineExtension = 0;
            measureShapeAnnotation.LeaderLineOffset = 0;
            measureShapeAnnotation.CaptionPosition = '';
            if (polygonAnnot.flags === PdfAnnotationFlag.readOnly) {
                measureShapeAnnotation.IsCommentLock = true;
            } else {
                measureShapeAnnotation.IsCommentLock = false;
            }
            if (polygonAnnot.flags === PdfAnnotationFlag.print) {
                measureShapeAnnotation.IsPrint = true;
            }
            if (polygonAnnot._dictionary.has('CustomData') && !isNullOrUndefined(polygonAnnot._dictionary.get('CustomData'))) {
                const customData: any = polygonAnnot._dictionary.get('CustomData');
                if (!isNullOrUndefined(customData)) {
                    measureShapeAnnotation.ExistingCustomData = customData;
                }
            }
            return measureShapeAnnotation;
        } else {
            return shapeAnnotation;
        }
    }

    /**
     * @param {PdfPolyLineAnnotation} polyLineAnnot - polyLineAnnot
     * @param {number} height -height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @param {PdfFreeTextAnnotation} shapeFreeText - shapeFreeText
     * @private
     * @returns {void}
     */
    public loadPolylineAnnotation(polyLineAnnot: PdfPolyLineAnnotation, height: number, width: number,
                                  pageRotation: number, shapeFreeText: PdfFreeTextAnnotation): ShapeAnnotationBase {
        const shapeAnnotation: ShapeAnnotationBase = new ShapeAnnotationBase();
        shapeAnnotation.ShapeAnnotationType = 'Polyline';
        shapeAnnotation.Author = polyLineAnnot.author;
        shapeAnnotation.AnnotName = polyLineAnnot.name;
        shapeAnnotation.Subject = polyLineAnnot.subject;
        if (!isNullOrUndefined(polyLineAnnot.modifiedDate)){
            shapeAnnotation.ModifiedDate = this.formatDate(polyLineAnnot.modifiedDate);
        }
        else{
            shapeAnnotation.ModifiedDate = this.formatDate(new Date());
        }
        shapeAnnotation.Note = this.getValidNoteContent(polyLineAnnot.text);
        shapeAnnotation.Thickness = polyLineAnnot.border.width;
        shapeAnnotation.BorderStyle = this.getBorderStylesString(polyLineAnnot.border.style);
        shapeAnnotation.BorderDashArray = polyLineAnnot.border.dash ? polyLineAnnot.border.dash[0] ? polyLineAnnot.border.dash[0] : 0 : 0;
        shapeAnnotation.Opacity = polyLineAnnot.opacity;
        shapeAnnotation.RotateAngle = this.getRotateAngleString(polyLineAnnot.rotate);
        shapeAnnotation.AnnotType = 'shape';
        if (!isNullOrUndefined(polyLineAnnot.reviewHistory)) {
            for (let i: number = 0; i < polyLineAnnot.reviewHistory.count; i++) {
                shapeAnnotation.State = this.getStateString(polyLineAnnot.reviewHistory.at(parseInt(i.toString(), 10)).state);

                shapeAnnotation.StateModel = this.getStateModelString(polyLineAnnot.reviewHistory.at(parseInt(i.toString(), 10)).
                    stateModel);
            }
        }
        if (isNullOrUndefined(shapeAnnotation.State) || isNullOrUndefined(shapeAnnotation.StateModel))
        {
            shapeAnnotation.State = 'Unmarked';
            shapeAnnotation.StateModel = 'None';
        }
        shapeAnnotation.Comments = new Array<PopupAnnotationBase>();
        if (!isNullOrUndefined(polyLineAnnot.comments)) {
            for (let i: number = 0; i < polyLineAnnot.comments.count; i++) {
                const annot: PopupAnnotationBase = this.loadPopupAnnotation(polyLineAnnot.comments.at(i), height, width, pageRotation);
                shapeAnnotation.Comments.push(annot);
            }
        }
        shapeAnnotation.Bounds = this.getBounds(polyLineAnnot.bounds, height, width, pageRotation);
        if (!isNullOrUndefined(polyLineAnnot._dictionary.get('Vertices'))){
            shapeAnnotation.VertexPoints = this.getVertexPoints(polyLineAnnot._dictionary.get('Vertices'), width, height, pageRotation, polyLineAnnot._page);
        }
        shapeAnnotation.StrokeColor = 'rgba(' + polyLineAnnot.color[0] + ',' + polyLineAnnot.color[1] + ',' + polyLineAnnot.color[2] + ',' + (polyLineAnnot.color[3] ? polyLineAnnot.color[3] : 1) + ')';
        let fillOpacity: number = polyLineAnnot.color[3] ? polyLineAnnot.color[3] : 1;
        if (polyLineAnnot._dictionary.has('FillOpacity') && !isNullOrUndefined(polyLineAnnot._dictionary.get('FillOpacity'))) {
            fillOpacity = parseInt(polyLineAnnot._dictionary.get('FillOpacity').toString(), 10);
        }
        fillOpacity = polyLineAnnot.innerColor ? fillOpacity : 0;
        polyLineAnnot.innerColor = polyLineAnnot.innerColor ? polyLineAnnot.innerColor : [255, 255, 255];
        shapeAnnotation.FillColor = 'rgba(' + polyLineAnnot.innerColor[0] + ',' + polyLineAnnot.innerColor[1] + ',' + polyLineAnnot.innerColor[2] + ',' + fillOpacity + ')';
        shapeAnnotation.LineHeadStart = this.getLineEndingStyleString(polyLineAnnot.beginLineStyle);
        shapeAnnotation.LineHeadEnd = this.getLineEndingStyleString(polyLineAnnot.endLineStyle);
        shapeAnnotation.EnableShapeLabel = false;
        if (shapeFreeText != null){
            shapeAnnotation.EnableShapeLabel = true;
            shapeAnnotation.LabelContent = shapeFreeText.text;
            shapeAnnotation.LabelFillColor = 'rgba(' + shapeFreeText.color[0] + ',' + shapeFreeText.color[1] + ',' + shapeFreeText.color[2] + ',' + (shapeFreeText.color[3] ? shapeFreeText.color[3] : 1) + ')';
            shapeAnnotation.FontColor = 'rgba(' + shapeFreeText.textMarkUpColor[0] + ',' + shapeFreeText.textMarkUpColor[1] + ',' + shapeFreeText.textMarkUpColor[2] + ',' + (shapeFreeText.textMarkUpColor[3] ? shapeFreeText.textMarkUpColor[3] : 1) + ')';
            shapeAnnotation.LabelBorderColor = 'rgba(' + shapeFreeText.borderColor[0] + ',' + shapeFreeText.borderColor[1] + ',' + shapeFreeText.borderColor[2] + ',' + (shapeFreeText.borderColor[3] ? shapeFreeText.borderColor[3] : 1) + ')';
            shapeAnnotation.FontSize = shapeFreeText.font.size;
        }
        if (!isNullOrUndefined(polyLineAnnot._borderEffect)){
            if (polyLineAnnot._borderEffect.style === PdfBorderEffectStyle.cloudy){
                shapeAnnotation.IsCloudShape = true;
                shapeAnnotation.CloudIntensity = polyLineAnnot._borderEffect.intensity;
            }
            else{
                shapeAnnotation.IsCloudShape = false;
                shapeAnnotation.CloudIntensity = 0;
            }
        }
        else{
            shapeAnnotation.IsCloudShape = false;
            shapeAnnotation.CloudIntensity = 0;
        }
        if (polyLineAnnot._dictionary.has('RD') && !isNullOrUndefined(polyLineAnnot._dictionary.get('RD'))){
            shapeAnnotation.RectangleDifference = polyLineAnnot._dictionary.get('RD');
        }
        else{
            shapeAnnotation.RectangleDifference = new Array<string>();
        }
        this.updateIsLockProperty(shapeAnnotation, polyLineAnnot);
        if (polyLineAnnot._dictionary.has('CustomData') && !isNullOrUndefined(polyLineAnnot._dictionary.get('CustomData')))
        {
            const customData: any = polyLineAnnot._dictionary.get('CustomData');
            if (customData != null)
            {
                shapeAnnotation.ExistingCustomData = customData;
            }
        }
        if (polyLineAnnot._dictionary.has('AllowedInteractions')) {
            const allowedInteractions: string[] = polyLineAnnot.getValues('AllowedInteractions');
            const text: any = allowedInteractions[0];
            shapeAnnotation.AllowedInteractions = JSON.parse(text);
        }
        if (polyLineAnnot._dictionary.has('Measure')) {
            shapeAnnotation.FillColor = 'rgba(' + polyLineAnnot.innerColor[0] + ',' + polyLineAnnot.innerColor[1] + ',' + polyLineAnnot.innerColor[2] + ',' + fillOpacity + ')';
            const measureShapeAnnotation: MeasureShapeAnnotationBase = new MeasureShapeAnnotationBase(shapeAnnotation);
            measureShapeAnnotation.Calibrate = this.getMeasureObject(polyLineAnnot as PdfAnnotation);
            if (polyLineAnnot._dictionary.has('IT')) {
                measureShapeAnnotation.Indent = polyLineAnnot._dictionary.get('IT').name;
            }
            else {
                measureShapeAnnotation.Indent = 'PolyLineDimension';
            }
            measureShapeAnnotation.Caption = false;
            measureShapeAnnotation.LeaderLength = 0;
            measureShapeAnnotation.LeaderLineExtension = 0;
            measureShapeAnnotation.LeaderLineOffset = 0;
            measureShapeAnnotation.CaptionPosition = '';
            if (polyLineAnnot.flags === PdfAnnotationFlag.readOnly) {
                measureShapeAnnotation.IsCommentLock = true;
            }
            else {
                measureShapeAnnotation.IsCommentLock = false;
            }
            if (polyLineAnnot.flags === PdfAnnotationFlag.print) {
                measureShapeAnnotation.IsPrint = true;
            }
            if (polyLineAnnot._dictionary.has('CustomData') && !isNullOrUndefined(polyLineAnnot._dictionary.get('CustomData'))) {
                const customData: any = polyLineAnnot._dictionary.get('CustomData');
                if (customData != null) {
                    measureShapeAnnotation.ExistingCustomData = customData;
                }
            }
            return measureShapeAnnotation;
        }
        else {
            return shapeAnnotation;
        }
    }

    /**
     * @private
     * @param {PdfRubberStampAnnotation} annotation - annotation
     * @param {number} pageNumber - pageNumber
     * @returns {void}
     */
    public loadSignatureImage(annotation: PdfRubberStampAnnotation, pageNumber: number): SignatureAnnotationBase {
        const stampAnnotation: PdfRubberStampAnnotation = annotation as PdfRubberStampAnnotation;
        const formsFields: SignatureAnnotationBase = new SignatureAnnotationBase();
        formsFields.SignatureName = stampAnnotation.name;
        let dictionary: any = annotation._dictionary.get('AP');
        if (dictionary === null) {
            const pdfReference: any = annotation._dictionary.get('AP');
            if (pdfReference !== null && pdfReference.Object !== null) {
                dictionary = pdfReference.Object;
            }
        }
        if (dictionary !== null && dictionary.has('N') ){
            this.m_renderer.findStampImage(annotation);
        }
        formsFields.Bounds = new Rect(stampAnnotation.bounds.x, stampAnnotation.bounds.y, stampAnnotation.bounds.width,
                                      stampAnnotation.bounds.height);
        formsFields.PathData = this.m_renderer.imageData;
        formsFields.AnnotationType = 'SignatureImage';
        formsFields.PageNumber = pageNumber;
        formsFields.Opacity = stampAnnotation.opacity;
        formsFields.StrokeColor = 'rgba(' + stampAnnotation.color + ',' + stampAnnotation.color[1] + ',' + stampAnnotation.color[2] + ',' + (stampAnnotation.color[3] ? stampAnnotation.color[3] : 1) + ')';
        return formsFields;
    }

    private getMeasureObject(annotation: PdfAnnotation): Measure {
        const measureObject : Measure = new Measure();
        let measureDictionary : _PdfDictionary;
        if (annotation._dictionary.has('Measure')) {
            measureDictionary = annotation._dictionary.get('Measure');
        }
        if (measureDictionary.has('R')) {
            measureObject.Ratio = measureDictionary.get('R');
        }
        else{
            return null;
        }
        let xList: NumberFormat[];
        if (measureDictionary.has('X')) {
            xList = this.getMeasureValues(measureDictionary.getArray('X'));
        }
        measureObject.X = xList;
        let distanceList: NumberFormat[];
        if (measureDictionary.has('D')) {
            distanceList = this.getMeasureValues(measureDictionary.getArray('D'));
        }
        measureObject.Distance = distanceList;
        let areaList: NumberFormat[];
        if (measureDictionary.has('A')) {
            areaList = this.getMeasureValues(measureDictionary.getArray('A'));
        }
        measureObject.Area = areaList;
        let angleList: NumberFormat[];
        if (measureDictionary.has('T')) {
            angleList = this.getMeasureValues(measureDictionary.getArray('T'));
        }
        measureObject.Angle = angleList;
        let volumeList: NumberFormat[];
        if (measureDictionary.has('V')) {
            volumeList = this.getMeasureValues(measureDictionary.getArray('V'));
        }
        measureObject.Volume = volumeList;
        if (!isNullOrUndefined(measureDictionary) && measureDictionary.has('TargetUnitConversion')) {
            measureObject.TargetUnitConversion = measureDictionary.get('TargetUnitConversion').FloatValue;
        }
        else {
            measureObject.TargetUnitConversion = 0;
        }
        return measureObject;
    }

    private getMeasureValues(arrayValues: any[]): NumberFormat[] {
        const measureValuesArray: NumberFormat[] = new Array<NumberFormat>();
        if (!isNullOrUndefined(arrayValues)) {
            for (let index: number = 0; index < arrayValues.length; index++) {
                const measureFormat: any = arrayValues[parseInt(index.toString(), 10)];
                const measureValue: NumberFormat = new NumberFormat();
                if (!isNullOrUndefined(measureFormat)) {
                    if (measureFormat.has('D') && !isNullOrUndefined(measureFormat.get('D'))) {
                        measureValue.Denominator = measureFormat.get('D');
                    }
                    if (measureFormat.has('C') && !isNullOrUndefined(measureFormat.get('C'))) {
                        measureValue.ConversionFactor = measureFormat.get('C');
                    }
                    if (measureFormat.has('F') && !isNullOrUndefined(measureFormat.get('F'))) {
                        const fObject: any = measureFormat.get('F');
                        if (typeof fObject === 'object' && !isNullOrUndefined(fObject.name)) {
                            measureValue.FractionalType = fObject.name;
                        }
                    }
                    else {
                        measureValue.FractionalType = 'D';
                    }
                    if (measureFormat.has('FD') && !isNullOrUndefined(measureFormat.get('FD'))) {
                        measureValue.FormatDenominator = measureFormat.get('FD');
                    }
                    if (measureFormat.has('U') && !isNullOrUndefined(measureFormat.get('U'))) {
                        measureValue.Unit = measureFormat.get('U');
                    }
                }
                measureValuesArray.push(measureValue);
            }
        }
        return measureValuesArray;
    }

    private getVertexPoints(vertices: number[], pageWidth: number, pageHeight: number, pageRotation: number, page: PdfPage): AnnotPoint[] {
        const vertexPoints: AnnotPoint[] = [];
        const cropBox: number[] = this.getBothCropBoxValue(page);
        let cropBoxX: number = 0;
        let cropBoxY: number = 0;
        if (!(cropBox[0] === 0 && (page as PdfPage).cropBox[2] === page.size[2] && cropBox[1] === page.size[3])) {
            cropBoxX = cropBox[0];
            cropBoxY = cropBox[1];
        }
        if (pageRotation === 0) {
            for (let i: number = 0; i < vertices.length; i++) {
                const point: AnnotPoint = { X: this.convertPointToPixel(vertices[parseInt(i.toString(), 10)]) -
                    this.convertPointToPixel(cropBoxX), Y: (pageHeight - this.convertPointToPixel(vertices[i + 1])) +
                    this.convertPointToPixel(cropBoxY) };
                i = i + 1;
                vertexPoints.push(point);
            }
        } else if (pageRotation === 1){
            for (let i: number = 0; i < vertices.length; i ++) {
                const point: AnnotPoint = { X: this.convertPointToPixel(vertices[i + 1]),
                    Y: this.convertPointToPixel(vertices[parseInt(i.toString(), 10)]) };
                i = i + 1;
                vertexPoints.push(point);
            }
        } else if (pageRotation === 2){
            for (let i: number = 0; i < vertices.length; i ++) {
                const point: AnnotPoint = { X: pageWidth - this.convertPointToPixel(vertices[parseInt(i.toString(), 10)]),
                    Y: this.convertPointToPixel(vertices[i + 1]) };
                i = i + 1;
                vertexPoints.push(point);
            }
        } else if (pageRotation === 3){
            for (let i: number = 0; i < vertices.length; i ++) {
                const point: AnnotPoint = { X: pageWidth - this.convertPointToPixel(vertices[i + 1]),
                    Y: pageHeight - this.convertPointToPixel(vertices[parseInt(i.toString(), 10)]) };
                i = i + 1;
                vertexPoints.push(point);
            }
        }
        return vertexPoints;
    }

    private getLineIndentString(lineIntent: PdfLineIntent): string {
        switch (lineIntent) {
        case PdfLineIntent.lineArrow:
            return 'LineArrow';
        case PdfLineIntent.lineDimension:
            return 'LineDimension';
        }
    }

    private getLineEndingStyleString(lineEndingStyle: PdfLineEndingStyle): string {
        switch (lineEndingStyle) {
        case PdfLineEndingStyle.none:
            return 'None';
        case PdfLineEndingStyle.butt:
            return 'Butt';
        case PdfLineEndingStyle.circle:
            return 'Circle';
        case PdfLineEndingStyle.closedArrow:
            return 'ClosedArrow';
        case PdfLineEndingStyle.diamond:
            return 'Diamond';
        case PdfLineEndingStyle.openArrow:
            return 'OpenArrow';
        case PdfLineEndingStyle.rClosedArrow:
            return 'RClosedArrow';
        case PdfLineEndingStyle.rOpenArrow:
            return 'ROpenArrow';
        case PdfLineEndingStyle.slash:
            return 'Slash';
        case PdfLineEndingStyle.square:
            return 'Square';
        }
    }

    private getBorderStylesString(borderStyle: PdfBorderStyle): string {
        switch (borderStyle) {
        case PdfBorderStyle.solid:
            return 'Solid';
        case PdfBorderStyle.dashed:
            return 'Dashed';
        case PdfBorderStyle.beveled:
            return 'Beveled';
        case PdfBorderStyle.inset:
            return 'Inset';
        case PdfBorderStyle.underline:
            return 'Underline';
        case PdfBorderStyle.dot:
            return 'Dot';
        default:
            return 'None';
        }
    }

    private getBorderStyle(borderStyle: string): PdfBorderStyle {
        let style: PdfBorderStyle = PdfBorderStyle.solid;
        switch (borderStyle) {
        case 'Solid':
            style = PdfBorderStyle.solid;
            break;
        case 'Dashed':
            style = PdfBorderStyle.dashed;
            break;
        case 'Beveled':
            style = PdfBorderStyle.beveled;
            break;
        case 'Inset':
            style = PdfBorderStyle.inset;
            break;
        case 'Underline':
            style = PdfBorderStyle.underline;
            break;
        case 'Dot':
            style = PdfBorderStyle.dot;
            break;
        }
        return style;
    }

    private getRotateAngleString(angle: PdfRotationAngle): string {
        switch (angle) {
        case PdfRotationAngle.angle0:
            return 'RotateAngle0';
        case PdfRotationAngle.angle90:
            return 'RotateAngle90';
        case PdfRotationAngle.angle180:
            return 'RotateAngle180';
        case PdfRotationAngle.angle270:
            return 'RotateAngle270';
        default:
            return 'RotateAngle0';
        }
    }

    private getValidNoteContent(note: string): string {
        if (isNullOrUndefined(note) || note === '' || note === ' ') {
            return '';
        }
        return note;
    }

    private getBounds(bounds: any, pageHeight: number, pageWidth: number, pageRotation: number): AnnotBounds {
        let bound: AnnotBounds;
        if (pageRotation === 0) {
            bound = new AnnotBounds(this.convertPointToPixel(bounds.x), this.convertPointToPixel(bounds.y),
                                    this.convertPointToPixel(bounds.width), this.convertPointToPixel(bounds.height));
        }
        else if (pageRotation === 1) {
            bound = new AnnotBounds(pageWidth - this.convertPointToPixel(bounds.y) - this.convertPointToPixel(bounds.height),
                                    this.convertPointToPixel(bounds.x), this.convertPointToPixel(bounds.height),
                                    this.convertPointToPixel(bounds.width));
        }
        else if (pageRotation === 2) {
            bound = new AnnotBounds(pageWidth - this.convertPointToPixel(bounds.x) - this.convertPointToPixel(bounds.width),
                                    pageHeight - this.convertPointToPixel(bounds.y) - this.convertPointToPixel(bounds.height),
                                    this.convertPointToPixel(bounds.width), this.convertPointToPixel(bounds.height));
        }
        else if (pageRotation === 3) {
            bound = new AnnotBounds(this.convertPointToPixel(bounds.y), pageHeight - this.convertPointToPixel(bounds.x) -
            this.convertPointToPixel(bounds.width), this.convertPointToPixel(bounds.height), this.convertPointToPixel(bounds.width));
        }
        return bound;
    }

    /**
     * @private
     * @param {PdfPopupAnnotation} popupAnnot - popupAnnot
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @returns {void}
     */
    public loadPopupAnnotation(popupAnnot: PdfPopupAnnotation, height: number, width: number, pageRotation: number): PopupAnnotationBase {
        const popupAnnotation: PopupAnnotationBase = new PopupAnnotationBase();
        popupAnnotation.Author = popupAnnot.author;
        popupAnnotation.Subject = popupAnnot.subject;
        if (popupAnnot._dictionary.has('Subtype') && !isNullOrUndefined(popupAnnot._dictionary.get('Subtype')) && !isNullOrUndefined(popupAnnot._dictionary.get('Subtype').name)) {
            popupAnnotation.SubType = popupAnnot._dictionary.get('Subtype').name.toString();
        }
        if (popupAnnot._dictionary.has('Type') && !isNullOrUndefined(popupAnnot._dictionary.get('Type')) && !isNullOrUndefined(popupAnnot._dictionary.get('Type').name)) {
            popupAnnotation.Type = popupAnnot._dictionary.get('Type').name.toString();
        }
        if (popupAnnot._dictionary.has('IRT') && !isNullOrUndefined(popupAnnot._dictionary.get('IRT'))) {
            const reference: any = popupAnnot._dictionary.get('IRT');
            if (reference != null) {
                popupAnnotation.Reference = reference.Reference;
            }
        }
        popupAnnotation.AnnotName = popupAnnot.name;
        if (!isNullOrUndefined(popupAnnot.modifiedDate)) {
            popupAnnotation.ModifiedDate = this.formatDate(popupAnnot.modifiedDate);
        }
        else {
            popupAnnotation.ModifiedDate = this.formatDate(new Date());
        }
        popupAnnotation.Note = popupAnnot.text;
        this.updateIsLockProperty(popupAnnotation, popupAnnot);
        popupAnnotation.Icon = this.getPopupIconString(popupAnnot.icon);
        popupAnnotation.State = this.getStateString(popupAnnot.state);
        popupAnnotation.StateModel = this.getStateModelString(popupAnnot.stateModel);
        popupAnnotation.Size = new SizeBase(popupAnnot.bounds.width, popupAnnot.bounds.height);
        popupAnnot.color = popupAnnot.color ? popupAnnot.color : [0, 0, 0];
        popupAnnotation.Color = new AnnotColor(popupAnnot.color[0], popupAnnot.color[1], popupAnnot.color[2]);
        popupAnnotation.Opacity = popupAnnot.opacity;
        popupAnnotation.AnnotType = 'sticky';
        popupAnnotation.StrokeColor = 'rgba(' + popupAnnotation.Color.R + ',' + popupAnnotation.Color.G + ',' + popupAnnotation.Color.B + ',' + 1 + ')';
        popupAnnotation.Bounds = this.getBounds(popupAnnot.bounds, height, width, pageRotation);
        for (let i: number = 0; i < popupAnnot.reviewHistory.count; i++) {
            popupAnnotation.State = this.getStateString(popupAnnot.reviewHistory.at(parseInt(i.toString(), 10)).state);
            popupAnnotation.StateModel = this.getStateModelString(popupAnnot.reviewHistory.at(parseInt(i.toString(), 10)).stateModel);
        }
        if (isNullOrUndefined(popupAnnotation.State) || popupAnnotation.State === 'None' || isNullOrUndefined(popupAnnotation.StateModel)) {
            popupAnnotation.State = 'Unmarked';
            popupAnnotation.StateModel = 'None';
        }
        popupAnnotation.Comments = new Array<PopupAnnotationBase>();
        if (popupAnnot._dictionary.has('CustomData') && !isNullOrUndefined(popupAnnot._dictionary.get('CustomData'))) {
            const customData: any = popupAnnot._dictionary.get('CustomData');
            if (customData != null) {
                popupAnnotation.ExistingCustomData = customData;
            }
        }
        for (let i: number = 0; i < popupAnnot.comments.count; i++) {
            popupAnnotation.Comments.push(this.loadPopupAnnotation(popupAnnot.comments.at(i), height, width, pageRotation));
        }
        return popupAnnotation;
    }

    /**
     * @param {PdfFreeTextAnnotation} freeTextAnnot - freeTextAnnot
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @param {PdfPage} page - page
     * @private
     * @returns {void}
     */
    public loadFreeTextAnnotation(freeTextAnnot: PdfFreeTextAnnotation, height: number, width: number,
                                  pageRotation: number, page: PdfPage): FreeTextAnnotationBase {
        const freeTextAnnotation: FreeTextAnnotationBase = new FreeTextAnnotationBase();
        freeTextAnnotation.AnnotationIntent = this.getAnnotationIntentString(freeTextAnnot.annotationIntent); // returns wrong value
        freeTextAnnotation.AnnotationFlags = this.getAnnotationFlagsString(freeTextAnnot.flags);
        freeTextAnnotation.Author = freeTextAnnot.author;
        freeTextAnnotation.AnnotName = freeTextAnnot.name;
        if (isNullOrUndefined(freeTextAnnotation.AnnotName) || freeTextAnnotation.AnnotName === ''){
            freeTextAnnotation.AnnotName = Math.abs(Math.random()).toString(36).substring(2);
        }
        freeTextAnnotation.AnnotType = 'Text Box';
        freeTextAnnotation.FreeTextAnnotationType = 'Text Box';
        if (freeTextAnnot.borderColor) {
            freeTextAnnotation.BorderColor = new AnnotColor(freeTextAnnot.borderColor[0], freeTextAnnot.borderColor[1],
                                                            freeTextAnnot.borderColor[2]);
        }
        else {
            freeTextAnnotation.BorderColor = new AnnotColor(255, 255, 255);
        }
        const points: AnnotPoint[] = [{X: 100, Y: 400}, {X: 200, Y: 400}];
        freeTextAnnotation.CalloutLines = points;
        const backgroundColor: number[] = freeTextAnnot.color ? freeTextAnnot.color : [0, 0, 0];
        if (isNullOrUndefined(freeTextAnnot.color)) {
            freeTextAnnotation.IsTransparentSet = true;
        }
        freeTextAnnotation.Color = new AnnotColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
        freeTextAnnotation.Flatten = freeTextAnnot.flatten;
        freeTextAnnotation.FlattenPopups = !isNullOrUndefined(freeTextAnnot.flattenPopups) ? freeTextAnnot.flattenPopups : false; // returns undefined
        if ((freeTextAnnot.font as PdfStandardFont)._fontFamily === 2) {
            freeTextAnnotation.FontFamily = this.getFontFamilyString((freeTextAnnot.font as PdfStandardFont)._fontFamily);
        } else {
            freeTextAnnotation.FontFamily = freeTextAnnot._obtainFontDetails().name;
        }
        freeTextAnnotation.FontSize = this.convertPointToPixel(freeTextAnnot.font.size);
        freeTextAnnotation.Font = new FontBase(freeTextAnnot.font, freeTextAnnotation.FontFamily); // need to be checked
        freeTextAnnotation.Thickness = freeTextAnnot.border.width;
        if (freeTextAnnot.borderColor) {
            freeTextAnnotation.StrokeColor = 'rgba(' + freeTextAnnot.borderColor[0] + ',' + freeTextAnnot.borderColor[1] + ',' + freeTextAnnot.borderColor[2] + ',' + (freeTextAnnot.borderColor[3] ? freeTextAnnot.borderColor[3] : 1) + ')';
        }
        else {
            freeTextAnnotation.StrokeColor = 'rgba(255, 255, 255, 1)';
        }
        let fillOpacity: number;
        if (freeTextAnnot._dictionary.has('FillOpacity') && !isNullOrUndefined(freeTextAnnot._dictionary.get('FillOpacity'))) {
            fillOpacity = parseInt(freeTextAnnot._dictionary.get('FillOpacity').toString(), 10);
        }
        fillOpacity = freeTextAnnot.color ? (!isNullOrUndefined(fillOpacity) ? fillOpacity : 1) : 0;
        freeTextAnnotation.FillColor = 'rgba(' + backgroundColor[0] + ',' + backgroundColor[1] + ',' + backgroundColor[2] + ',' + fillOpacity + ')';
        freeTextAnnotation.Layer = freeTextAnnot._dictionary.has('Layer') ? freeTextAnnot._dictionary.get('Layer') : null;
        // freeTextAnnotation.Location = freeTextAnnot._dictionary.has('Location') ? freeTextAnnot._dictionary.get('Location') : JSON.stringify({X: freeTextAnnot.bounds.x ,Y: freeTextAnnot.bounds.y});
        freeTextAnnotation.Location = freeTextAnnot._dictionary.has('Location') ? freeTextAnnot._dictionary.get('Location') : '{X=' + freeTextAnnot.bounds.x + ',Y=' + freeTextAnnot.bounds.y + '}';
        freeTextAnnotation.MarkupText = freeTextAnnot.text;
        if (!isNullOrUndefined(freeTextAnnot.modifiedDate)) {
            freeTextAnnotation.ModifiedDate = this.formatDate(freeTextAnnot.modifiedDate);
        }
        else {
            freeTextAnnotation.ModifiedDate = this.formatDate(new Date());
        }
        freeTextAnnotation.Name = 'freeText';
        freeTextAnnotation.Opacity = freeTextAnnot.opacity;
        if (freeTextAnnot._dictionary.has('Rotation') && !isNullOrUndefined(freeTextAnnot._dictionary.get('Rotation'))){
            freeTextAnnotation.Rotate = parseInt(freeTextAnnot._dictionary.get('Rotation'), 10);
        }
        if (freeTextAnnot._dictionary.has('Rotate') && !isNullOrUndefined(freeTextAnnot._dictionary.get('Rotate'))){
            freeTextAnnotation.Rotate = parseInt(freeTextAnnot._dictionary.get('Rotate'), 10);
        }
        if (!isNullOrUndefined(freeTextAnnot.subject)){
            freeTextAnnotation.Subject = freeTextAnnot.subject;
        }
        else{
            freeTextAnnotation.Subject = 'Text Box';
        }
        freeTextAnnotation.Text = freeTextAnnot.text;
        freeTextAnnotation.MarkupText = freeTextAnnot.text;
        freeTextAnnotation.TextAlign = this.getTextAlignmentString(freeTextAnnot.textAlignment);
        if (isNullOrUndefined(freeTextAnnotation.State) || freeTextAnnotation.State === 'None' || isNullOrUndefined(freeTextAnnotation.StateModel)) {
            freeTextAnnotation.State = 'Unmarked';
            freeTextAnnotation.StateModel = 'None';
        }
        freeTextAnnotation.FontColor = !isNullOrUndefined(freeTextAnnot.textMarkUpColor) ? 'rgba(' + freeTextAnnot.textMarkUpColor[0] + ',' + freeTextAnnot.textMarkUpColor[1] + ',' + freeTextAnnot.textMarkUpColor[2] + ',' + (freeTextAnnot.textMarkUpColor[3] ? freeTextAnnot.textMarkUpColor[3] : 1) + ')' : 'rgba(0, 0, 0, 1)';
        for (let i: number = 0; i < freeTextAnnot.reviewHistory.count; i++) {
            freeTextAnnotation.State = this.getStateString(freeTextAnnot.reviewHistory.at(parseInt(i.toString(), 10)).state);
            freeTextAnnotation.StateModel = this.getStateModelString(freeTextAnnot.reviewHistory.at(parseInt(i.toString(), 10)).stateModel);
        }
        freeTextAnnotation.Comments = new Array<PopupAnnotationBase>();
        for (let i: number = 0; i < freeTextAnnot.comments.count; i++) {
            const annot: PopupAnnotationBase = this.loadPopupAnnotation(freeTextAnnot.comments.at(i), height, width, pageRotation);
            freeTextAnnotation.Comments.push(annot);
        }
        freeTextAnnotation.Bounds = this.getBounds(freeTextAnnot.bounds, height, width, pageRotation);
        if (freeTextAnnotation.Bounds.Y < 0){
            const cropRect: any = {x: freeTextAnnot.bounds.x, y: page.cropBox[1] + freeTextAnnot.bounds.y,
                width: freeTextAnnot.bounds.width, height: freeTextAnnot.bounds.height};
            freeTextAnnotation.Bounds = this.getBounds(cropRect, height, width, pageRotation);
        }
        freeTextAnnotation.PageRotation = pageRotation;
        this.updateIsLockProperty(freeTextAnnotation, freeTextAnnot);
        if (freeTextAnnot._dictionary.has('CustomData') && !isNullOrUndefined(freeTextAnnot._dictionary.get('CustomData'))) {
            const customData: any = freeTextAnnot._dictionary.get('CustomData');
            if (customData != null) {
                freeTextAnnotation.ExistingCustomData = customData;
            }
        }
        if (freeTextAnnot._dictionary.has('AllowedInteractions')) {
            const allowedInteractions: string[] = freeTextAnnot.getValues('AllowedInteractions');
            const text: any = allowedInteractions[0];
            freeTextAnnotation.AllowedInteractions = JSON.parse(text);
        }
        return freeTextAnnotation;
    }

    private getTextAlignmentString(textAlignment: PdfTextAlignment): string {
        switch (textAlignment) {
        case PdfTextAlignment.left:
            return 'Left';
        case PdfTextAlignment.right:
            return 'Right';
        case PdfTextAlignment.center:
            return 'Center';
        case PdfTextAlignment.justify:
            return 'Justify';
        default:
            return 'Left';
        }
    }

    /**
     * @param {PdfFreeTextAnnotation} inkAnnot - inkAnnot
     * @param {number} pageNumber - pageNumber
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @private
     * @returns {void}
     */
    public loadSignatureText(inkAnnot: PdfFreeTextAnnotation, pageNumber: number, height: number,
                             width: number, pageRotation: number): SignatureAnnotationBase {
        const formFields: SignatureAnnotationBase = new SignatureAnnotationBase();
        formFields.SignatureName = inkAnnot.name;
        formFields.Bounds = this.getBounds(inkAnnot.bounds, width, height, pageRotation);
        formFields.AnnotationType = 'SignatureText';
        formFields.FontFamily = this.getFontFamilyString((inkAnnot.font as PdfStandardFont)._fontFamily);
        formFields.FontSize = this.convertPointToPixel(inkAnnot.font.size);
        formFields.PathData = inkAnnot.text;
        formFields.PageNumber = pageNumber;
        formFields.StrokeColor = 'rgba(' + inkAnnot.textMarkUpColor[0] + ',' + inkAnnot.textMarkUpColor[1] + ',' + inkAnnot.textMarkUpColor[2] + ',' + (inkAnnot.textMarkUpColor[3] ? inkAnnot.textMarkUpColor[3] : 1) + ')';
        formFields.Opacity = inkAnnot.opacity;
        formFields.Thickness = 1;
        return formFields;
    }

    private getFontFamilyString(fontFamily: PdfFontFamily): string {
        switch (fontFamily) {
        case PdfFontFamily.helvetica:
            return 'Helvetica';
        case PdfFontFamily.timesRoman:
            return 'Times New Roman';
        case PdfFontFamily.courier:
            return 'Courier';
        case PdfFontFamily.symbol:
            return 'Symbol';
        case PdfFontFamily.zapfDingbats:
            return 'ZapfDingbats';
        default:
            return 'Helvetica';
        }
    }

    private getAnnotationFlagsString(flags: PdfAnnotationFlag): string {
        switch (flags) {
        case PdfAnnotationFlag.default:
            return 'Default';
        case PdfAnnotationFlag.invisible:
            return 'Invisible';
        case PdfAnnotationFlag.hidden:
            return 'Hidden';
        case PdfAnnotationFlag.print:
            return 'Print';
        case PdfAnnotationFlag.noZoom:
            return 'NoZoom';
        case PdfAnnotationFlag.noRotate:
            return 'NoRotate';
        case PdfAnnotationFlag.noView:
            return 'NoView';
        case PdfAnnotationFlag.readOnly:
            return 'ReadOnly';
        case PdfAnnotationFlag.locked:
            return 'Locked';
        case PdfAnnotationFlag.toggleNoView:
            return 'ToggleNoView';
        default:
            return 'Default';
        }
    }

    private getAnnotationIntentString(annotationIntent: PdfAnnotationIntent): string {
        switch (annotationIntent) {
        case PdfAnnotationIntent.freeTextCallout:
            return 'FreeTextCallout';
        case PdfAnnotationIntent.freeTextTypeWriter:
            return 'FreeTextTypeWriter';
        case PdfAnnotationIntent.none:
            return 'None';
        }
    }

    private getStateString(state: PdfAnnotationState): string {
        switch (state) {
        case PdfAnnotationState.accepted:
            return 'Accepted';
        case PdfAnnotationState.rejected:
            return 'Rejected';
        case PdfAnnotationState.cancel:
            return 'Cancelled';
        case PdfAnnotationState.completed:
            return 'Completed';
        case PdfAnnotationState.none:
            return 'None';
        case PdfAnnotationState.unmarked:
            return 'Unmarked';
        case PdfAnnotationState.marked:
            return 'Marked';
        case PdfAnnotationState.unknown:
            return 'Unknown';
        default:
            return null;
        }
    }

    private getStateModelString(stateModel: PdfAnnotationStateModel): string {
        switch (stateModel) {
        case PdfAnnotationStateModel.review:
            return 'Review';
        case PdfAnnotationStateModel.marked:
            return 'Marked';
        case PdfAnnotationStateModel.none:
            return 'None';
        default:
            return 'None';
        }
    }

    private getPopupIconString(icon: PdfPopupIcon): string {
        switch (icon) {
        case PdfPopupIcon.comment:
            return 'Comment';
        case PdfPopupIcon.help:
            return 'Help';
        case PdfPopupIcon.insert:
            return 'Insert';
        case PdfPopupIcon.key:
            return 'Key';
        case PdfPopupIcon.newParagraph:
            return 'NewParagraph';
        case PdfPopupIcon.note:
            return 'Note';
        case PdfPopupIcon.paragraph:
            return 'Paragraph';
        default:
            return null;
        }
    }

    private formatDate(date: Date): string {

        const month: string = this.datePadding(date.getMonth() + 1); // Months are zero-based
        const day: string = this.datePadding(date.getDate());
        const year: number = date.getFullYear();
        const hours: string = this.datePadding(date.getHours());
        const minutes: string = this.datePadding(date.getMinutes());
        const seconds: string = this.datePadding(date.getSeconds());
        return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    }

    // Pad the numbers with leading zeros if they are single digits
    private datePadding(number: number): string {
        return number < 10 ? ('0' + number) : number.toString();
    }

    /**
     * @param {string} jsonObject - jsonObject
     * @param {PdfDocument} loadedDocument - loadedDocument
     * @private
     * @returns {void}
     */
    public removeSignatureTypeAnnot(jsonObject: { [key: string]: string }, loadedDocument: PdfDocument): void {
        if (
            (Object.prototype.hasOwnProperty.call(jsonObject, 'isAnnotationsExist') &&
                JSON.parse(jsonObject['isAnnotationsExist'])) ||
            (Object.prototype.hasOwnProperty.call(jsonObject, 'isFormFieldAnnotationsExist') &&
                JSON.parse(jsonObject['isFormFieldAnnotationsExist']))
        ) {
            const annotationPageList: any = jsonObject.annotationsPageList ? jsonObject.annotationsPageList : [];
            const formFieldsPageList : string = jsonObject.formFieldsPageList ? (jsonObject.formFieldsPageList) : '[]' ;
            if (annotationPageList.length !== 0) {
                const removeAnnotList: any = JSON.parse(annotationPageList);
                for (let i: number = 0; i < removeAnnotList.length; i++) {
                    const loadedPageNo: string = removeAnnotList[parseInt(i.toString(), 10)];
                    // Removing annotations from the page.
                    const page: PdfPage = loadedDocument.getPage(parseInt(loadedPageNo, 10));
                    const oldPageAnnotations: PdfAnnotationCollection = page.annotations;
                    const totalAnnotation: number = parseInt(oldPageAnnotations.count.toString(), 10);
                    for (let m: number = totalAnnotation - 1; m >= 0; m--) {
                        const annotation: PdfAnnotation = oldPageAnnotations.at(m);
                        if (
                            annotation instanceof PdfFreeTextAnnotation ||
                            annotation instanceof PdfInkAnnotation ||
                            annotation instanceof PdfLineAnnotation ||
                            annotation instanceof PdfRubberStampAnnotation ||
                            annotation instanceof PdfTextMarkupAnnotation ||
                            annotation instanceof PdfPopupAnnotation ||
                            annotation instanceof PdfSquareAnnotation ||
                            annotation instanceof PdfCircleAnnotation ||
                            annotation instanceof PdfEllipseAnnotation ||
                            annotation instanceof PdfPolygonAnnotation ||
                            annotation instanceof PdfRectangleAnnotation ||
                            annotation instanceof PdfPolyLineAnnotation
                        ) {
                            oldPageAnnotations.remove(annotation);
                        }
                    }

                }
            }
            if (formFieldsPageList.length !== 0) {
                const removeAnnotList: any = JSON.parse(formFieldsPageList);
                for (let i: number = 0; i < removeAnnotList.length; i++) {
                    const loadedPageNo: string = removeAnnotList[parseInt(i.toString(), 10)];
                    // Removing formfields from the page.
                    const page: PdfPage = loadedDocument.getPage(parseInt(loadedPageNo, 10) - 1);
                    const oldPageAnnotations: PdfAnnotationCollection = page.annotations;
                    const totalAnnotation: number = parseInt(oldPageAnnotations.count.toString(), 10);
                    for (let m: number = totalAnnotation - 1; m >= 0; m--) {
                        const annotation: PdfAnnotation = oldPageAnnotations.at(m);

                        if (
                            annotation instanceof PdfFreeTextAnnotation ||
                            annotation instanceof PdfInkAnnotation ||
                            annotation instanceof PdfLineAnnotation ||
                            annotation instanceof PdfRubberStampAnnotation ||
                            annotation instanceof PdfTextMarkupAnnotation ||
                            annotation instanceof PdfPopupAnnotation ||
                            annotation instanceof PdfSquareAnnotation ||
                            annotation instanceof PdfCircleAnnotation ||
                            annotation instanceof PdfEllipseAnnotation ||
                            annotation instanceof PdfPolygonAnnotation ||
                            annotation instanceof PdfRectangleAnnotation ||
                            annotation instanceof PdfPolyLineAnnotation
                        ) {
                            oldPageAnnotations.remove(annotation);
                        }
                    }

                }
            }
        }
    }

    /**
     * @private
     * @param {any} annotation - annotation
     * @param {any} AnnotFromPDF - AnnotFromPDF
     * @returns {void}
     */
    public updateIsLockProperty(annotation: any, AnnotFromPDF: any): void {
        const annotFlags: string = _annotationFlagsToString(AnnotFromPDF.flags);
        if (!isNullOrUndefined(annotFlags) && annotFlags.includes('locked')) {
            annotation.IsLocked = true;
        }
        else {
            annotation.IsLocked = false;
        }
        if (!isNullOrUndefined(annotFlags) && annotFlags.includes('readOnly')) {
            annotation.IsCommentLock = true;
        }
        else {
            annotation.IsCommentLock = false;
        }
        if (!isNullOrUndefined(annotFlags) && annotFlags.includes('print')) {
            annotation.IsPrint = true;
        }
    }

    /**
     * @param {PdfTextMarkupAnnotation} textMarkup - textMarkup
     * @param {number} height - height
     * @param {number} width - width
     * @param {number} pageRotation - pageRotation
     * @param {PdfPage} page - page
     * @private
     * @returns {void}
     */
    public loadTextMarkupAnnotation(textMarkup: PdfTextMarkupAnnotation, height: number, width: number, pageRotation: number,
                                    page: PdfPage): TextMarkupAnnotationBase {
        const markupAnnotation: TextMarkupAnnotationBase = new TextMarkupAnnotationBase();
        markupAnnotation.TextMarkupAnnotationType = this.getMarkupAnnotTypeString(textMarkup.textMarkupType);
        if (markupAnnotation.TextMarkupAnnotationType === 'StrikeOut') {
            markupAnnotation.TextMarkupAnnotationType = 'Strikethrough';
        }
        markupAnnotation.Author = textMarkup.author;
        markupAnnotation.Subject = textMarkup.subject;
        markupAnnotation.AnnotName = textMarkup.name;
        markupAnnotation.Note = textMarkup.text ? textMarkup.text : '';
        markupAnnotation.Rect = new RectangleBase(textMarkup.bounds.x, textMarkup.bounds.y,
                                                  textMarkup.bounds.width + textMarkup.bounds.x,
                                                  textMarkup.bounds.height + textMarkup.bounds.y);
        markupAnnotation.Opacity = textMarkup.opacity;
        // markupAnnotation.Color = 'rgba(' + textMarkup.color[0] + ',' + textMarkup.color[1] + ',' + textMarkup.color[2] + ',' + (textMarkup.color[3] ? textMarkup.color[3] : 1) + ')';
        markupAnnotation.Color = '#' + (1 << 24 | textMarkup.color[0] << 16 | textMarkup.color[1] << 8 | textMarkup.color[2]).toString(16).slice(1);
        if (!isNullOrUndefined(textMarkup.modifiedDate)){
            markupAnnotation.ModifiedDate = this.formatDate(textMarkup.modifiedDate);
        }
        else{
            markupAnnotation.ModifiedDate = this.formatDate(new Date());
        }
        markupAnnotation.AnnotationRotation = textMarkup.rotationAngle;
        const quadPoints: string[] = textMarkup._dictionary.has('QuadPoints') ? textMarkup._dictionary.get('QuadPoints') : [];
        let bounds: AnnotBounds[] = [];
        if (pageRotation === 0) {
            for (let i: number = 0; i < textMarkup.boundsCollection.length; i++) {
                const [x, y, width, height]: any = textMarkup.boundsCollection[parseInt(i.toString(), 10)];
                const boundsObject: any = { x, y, width, height };
                bounds.push(this.getBounds(boundsObject, height, width, pageRotation));
            }
        } else {
            bounds = this.getTextMarkupBounds(quadPoints, height, width, pageRotation, page);
        }
        if (textMarkup.boundsCollection && textMarkup.boundsCollection.length === 0 && textMarkup.bounds) {
            const boundsObject: any = {
                x: textMarkup.bounds.x, y: textMarkup.bounds.y,
                width: textMarkup.bounds.width, height: textMarkup.bounds.height
            };
            bounds.push(this.getBounds(boundsObject, height, width, pageRotation));
        }
        markupAnnotation.Bounds = bounds;
        markupAnnotation.AnnotType = 'textMarkup';
        for (let i: number = 0; i < textMarkup.reviewHistory.count; i++)
        {
            markupAnnotation.State = this.getStateString(textMarkup.reviewHistory.at(parseInt(i.toString(), 10)).state);
            markupAnnotation.StateModel = this.getStateModelString(textMarkup.reviewHistory.at(parseInt(i.toString(), 10)).stateModel);
        }
        if (isNullOrUndefined(markupAnnotation.State) || isNullOrUndefined(markupAnnotation.StateModel))
        {
            markupAnnotation.State = 'Unmarked';
            markupAnnotation.StateModel = 'None';
        }
        markupAnnotation.Comments = new Array<PopupAnnotationBase>();
        for (let i: number = 0; i < textMarkup.comments.count; i++)
        {
            const annot: PopupAnnotationBase = this.loadPopupAnnotation(textMarkup.comments.at(i), height, width, pageRotation);
            markupAnnotation.Comments.push(annot);
        }
        this.updateIsLockProperty(markupAnnotation, textMarkup);
        if (textMarkup._dictionary.has('CustomData') && !isNullOrUndefined(textMarkup._dictionary.get('CustomData')))
        {
            const customData: any = textMarkup._dictionary.get('CustomData');
            if (customData != null)
            {
                markupAnnotation.ExistingCustomData = customData;
            }
        }
        if (textMarkup._dictionary.has('AllowedInteractions')) {
            const allowedInteractions: string[] = textMarkup.getValues('AllowedInteractions');
            const text: any = allowedInteractions[0];
            markupAnnotation.AllowedInteractions = JSON.parse(text);
        }
        if (textMarkup._dictionary.has('TextMarkupContent')) {
            const textMarkupData: string[] = textMarkup.getValues('TextMarkupContent');
            if (!isNullOrUndefined(textMarkupData)) {
                markupAnnotation.TextMarkupContent = textMarkupData[0];
            }
        }
        return markupAnnotation;
    }

    private getTextMarkupBounds(quadPoints: string[], pageHeight: number, pageWidth: number, pageRotation: number,
                                page: PdfPage): AnnotBounds[] {
        let x: number = 0;
        let y: number = 0;
        let width: number = 0;
        let height: number = 0;
        const annotationBoundList: AnnotBounds[] = [];
        const cropValues : PointBase = this.getCropBoxValue(page, false);
        let cropX : number = 0;
        let cropY : number = 0;
        if (cropValues.x !== 0 && cropValues.y !== 0 ) {
            cropX = cropValues.x;
            cropY = cropValues.y;
        }
        if (!isNullOrUndefined(quadPoints)){
            for (let k: number = 0; k < quadPoints.length; k++){
                if (pageRotation === 0){
                    x = this.convertPointToPixel(parseInt(quadPoints[parseInt(k.toString(), 10)], 10) - cropX);
                    y = pageHeight - this.convertPointToPixel(parseInt(quadPoints[k + 1], 10) + cropY);
                    height = this.convertPointToPixel(parseInt(quadPoints[k + 3], 10) - parseInt(quadPoints[k + 7], 10));
                    width = this.convertPointToPixel(parseInt(quadPoints[k + 6], 10) - parseInt(quadPoints[k + 4], 10));
                }
                else if (pageRotation === 1){
                    x = this.convertPointToPixel(parseInt(quadPoints[k + 5], 10));
                    y = this.convertPointToPixel(parseInt(quadPoints[parseInt(k.toString(), 10)], 10));
                    height = this.convertPointToPixel(parseInt(quadPoints[k + 6], 10) - parseInt(quadPoints[k + 4], 10));
                    width = this.convertPointToPixel(parseInt(quadPoints[k + 3], 10) - parseInt(quadPoints[k + 7], 10));
                }
                else if (pageRotation === 2){
                    x = pageWidth - this.convertPointToPixel(parseInt(quadPoints[k + 2], 10));
                    y = this.convertPointToPixel(parseInt(quadPoints[k + 5], 10));
                    height = this.convertPointToPixel(parseInt(quadPoints[k + 3], 10) - parseInt(quadPoints[k + 7], 10));
                    width = this.convertPointToPixel(parseInt(quadPoints[k + 6], 10) - parseInt(quadPoints[k + 4], 10));
                }
                else{
                    x = pageWidth - this.convertPointToPixel(parseInt(quadPoints[k + 1], 10));
                    y = pageHeight - this.convertPointToPixel(parseInt(quadPoints[k + 6], 10));
                    height = this.convertPointToPixel(parseInt(quadPoints[k + 6], 10) - parseInt(quadPoints[k + 4], 10));
                    width = this.convertPointToPixel(parseInt(quadPoints[k + 3], 10) - parseInt(quadPoints[k + 7], 10));
                }
                const bounds: AnnotBounds = new AnnotBounds(x, y, width, height);
                k = k + 7;
                annotationBoundList.push(bounds);
            }
        }
        return annotationBoundList;
    }

    /**
     * @private
     * @returns {void}
     */
    public destroy(): void {
        this.formats = null;
        this.defaultWidth = null;
        this.defaultHeight = null;
        // eslint-disable-next-line
        this.m_renderer = null;
    }

    private getMarkupAnnotTypeString(textMarkupType: PdfTextMarkupAnnotationType): string{
        let type: string = '';
        switch (textMarkupType) {
        case PdfTextMarkupAnnotationType.highlight:
            type = 'Highlight';
            break;
        case PdfTextMarkupAnnotationType.strikeOut:
            type = 'StrikeOut';
            break;
        case PdfTextMarkupAnnotationType.underline:
            type = 'Underline';
            break;
        case PdfTextMarkupAnnotationType.squiggly:
            type = 'Squiggly';
            break;
        }
        return type;
    }

}

/**
 *
 * @hidden
 */
export class PointBase {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

/**
 *
 * @hidden
 */
export class FreeTextAnnotationBase {
    public Author: string;
    public AnnotationSelectorSettings: any = null;
    public MarkupText: string;
    public TextMarkupColor: string = null;
    public Color: AnnotColor = null;
    public Font: FontBase = null;
    public BorderColor: AnnotColor;
    public Border: PdfAnnotationBorder = null;
    public LineEndingStyle: string = null;
    public AnnotationFlags: string = null;
    public IsCommentLock: boolean;
    public IsLocked: boolean;
    public Text: string;
    public Opacity: number;
    public CalloutLines: AnnotPoint[] = null;
    public ModifiedDate: string = null;
    public AnnotName: string;
    public AnnotType: string;
    public Name: string;
    public Comments: PopupAnnotationBase[] = null;
    public AnnotationIntent: string;
    public CreatedDate: string = null;
    public Flatten: boolean;
    public FlattenPopups: boolean;
    public InnerColor: string = null;
    public Layer: PdfLayer = null;
    public Location: string;
    public Page: PdfPage = null;
    public PageTags: string = null;
    public ReviewHistory: string  = null;
    public Rotate: number = 0;
    public Size: SizeBase;
    public Subject: string;
    public State: string;
    public StateModel: string;
    public StrokeColor: string;
    public FillColor: string;
    public Thickness: number;
    public FontColor: string;
    public FontSize: number;
    public FontFamily: string;
    public FreeTextAnnotationType: string;
    public TextAlign: string;
    public Note: string = null;
    public CustomData: { [key: string]: any } = null;
    public AnnotationSettings: any = null;
    public AllowedInteractions: string[];
    public IsPrint: boolean = true;
    public IsReadonly: boolean = false;
    public ExistingCustomData: string = null;
    public Bounds: AnnotBounds =  null;
    public PageRotation: number = 0;
    public IsTransparentSet: boolean = false;
}

/**
 *
 * @hidden
 */
export class InkSignatureAnnotation {
    public Bounds: any;
    public AnnotationType: string;
    public CustomData: { [key: string]: any };
    public Opacity: number;
    public StrokeColor: string;
    public Thickness: number;
    public PathData: string;
    public IsLocked: boolean;
    public IsCommentLock: boolean;
    public PageNumber: number;
    public AnnotName: string;
    public Author: string;
    public ModifiedDate: string;
    public Subject: string;
    public Note: string;
    public State: string;
    public StateModel: string;
    public AnnotationSelectorSettings: any;
    public AnnotationSettings: any;
    public AllowedInteractions: string[];
    public Comments: PopupAnnotationBase[];
    public AnnotType: string;
    public IsPrint: boolean;
    public ExistingCustomData: string;
    constructor() {
        this.AnnotationType = null;
        this.Bounds = null;
        this.CustomData = null;
        this.Opacity = 0;
        this.StrokeColor = null;
        this.Thickness = null;
        this.PathData = null;
        this.IsLocked = null;
        this.IsCommentLock = null;
        this.PageNumber = null;
        this.AnnotName = null;
        this.Author = null;
        this.ModifiedDate = null;
        this.Subject = null;
        this.Note = null;
        this.State = null;
        this.StateModel = null;
        this.AnnotationSelectorSettings = null;
        this.AnnotationSettings = null;
        this.AllowedInteractions = null;
        this.Comments = null;
        this.AnnotType = null;
        this.IsPrint = null;
        this.ExistingCustomData = null;
    }
}

/**
 *
 * @hidden
 */
export class ShapeAnnotationBase {
    public ShapeAnnotationType: string;
    public Author: string;
    public AnnotationSelectorSettings: any;
    public ModifiedDate: string;
    public Subject: string;
    public Note: string;
    public IsCommentLock: boolean;
    public StrokeColor: string;
    public FillColor: string;
    public Opacity: number;
    public Bounds: any; // Use 'any' for compatibility with System.Drawing.RectangleF or Syncfusion.Drawing.RectangleF
    public Thickness: number;
    public BorderStyle: string;
    public BorderDashArray: number;
    public RotateAngle: string;
    public IsCloudShape: boolean;
    public CloudIntensity: number;
    public RectangleDifference: string[];
    public VertexPoints: AnnotPoint[]; // for line, polyline, and polygon annotations
    public LineHeadStart: string; // only for line and polyline annotations
    public LineHeadEnd: string; // only for line and polyline annotations
    public IsLocked: boolean;
    public AnnotName: string;
    public Comments: PopupAnnotationBase[];
    public State: string;
    public StateModel: string;
    public AnnotType: string;
    public EnableShapeLabel: boolean;
    public LabelContent: string;
    public LabelFillColor: string;
    public LabelBorderColor: string;
    public FontColor: string;
    public FontSize: number;
    public FontFamily: string;
    public CustomData: { [key: string]: any };
    public LabelBounds: AnnotBounds;
    public LabelSettings: any;
    public AnnotationSettings: any;
    public AllowedInteractions: string[];
    public IsPrint: boolean;
    public ExistingCustomData: string;
    public AnnotationRotation: number;
    constructor() {
        this.LabelBounds = new AnnotBounds(0, 0, 0, 0);
        this.LabelContent = null;
        this.LabelFillColor = null;
        this.LabelBorderColor = null;
        this.LabelSettings = null;
        this.FontColor = null;
        this.FontSize = 0;
        this.FontFamily = null;
        this.AnnotationSettings = null;
        this.AnnotationSelectorSettings = null;
        this.VertexPoints = null;
        this.CustomData = null;
        this.ExistingCustomData = null;
        this.IsPrint = true;
        this.AllowedInteractions = null;
        this.AnnotationRotation = 0;
    }
}

/**
 *
 * @hidden
 */
export class MeasureShapeAnnotationBase{
    /**
     * MeasureShapeAnnotation
     */
    public ShapeAnnotationType: string;
    public Author: string;
    public AnnotationSelectorSettings: any;
    public ModifiedDate: string;
    public Subject: string;
    public Note: string;
    public IsCommentLock: boolean;
    public StrokeColor: string;
    public FillColor: string;
    public Opacity: number;
    public Bounds: any; // Use 'any' for compatibility with System.Drawing.RectangleF or Syncfusion.Drawing.RectangleF
    public Thickness: number;
    public BorderStyle: string;
    public BorderDashArray: number;
    public RotateAngle: string;
    public IsCloudShape: boolean;
    public CloudIntensity: number;
    public RectangleDifference: string[];
    public VertexPoints: AnnotPoint[]; // for line, polyline, and polygon annotations
    public LineHeadStart: string; // only for line and polyline annotations
    public LineHeadEnd: string; // only for line and polyline annotations
    public IsLocked: boolean;
    public AnnotName: string;
    public Comments: PopupAnnotationBase[];
    public State: string;
    public StateModel: string;
    public AnnotType: string;
    public EnableShapeLabel: boolean;
    public LabelContent: string;
    public LabelFillColor: string;
    public LabelBorderColor: string;
    public FontColor: string;
    public FontSize: number;
    public FontFamily: string;
    public CustomData: { [key: string]: any };
    public LabelBounds: AnnotBounds;
    public LabelSettings: any;
    public AnnotationSettings: any;
    public AllowedInteractions: string[];
    public IsPrint: boolean;
    public ExistingCustomData: string;
    public AnnotationRotation: number;
    constructor(shapeAnnotation: ShapeAnnotationBase) {
        this.LabelBounds = new AnnotBounds(0, 0, 0, 0);
        this.LabelContent = null;
        this.LabelFillColor = null;
        this.LabelBorderColor = null;
        this.LabelSettings = null;
        this.FontColor = null;
        this.FontSize = 0;
        this.FontFamily = null;
        this.AnnotationSettings = null;
        this.AnnotationSelectorSettings = null;
        this.VertexPoints = null;
        this.CustomData = null;
        this.ExistingCustomData = null;
        this.IsPrint = true;
        this.AllowedInteractions = null;
        this.AnnotationRotation = 0;
        this.Author = shapeAnnotation.Author;
        this.AnnotationSelectorSettings = shapeAnnotation.AnnotationSelectorSettings;
        this.BorderDashArray = shapeAnnotation.BorderDashArray;
        this.BorderStyle = shapeAnnotation.BorderStyle;
        this.Bounds = shapeAnnotation.Bounds;
        this.CloudIntensity = shapeAnnotation.CloudIntensity;
        this.FillColor = shapeAnnotation.FillColor;
        this.IsCloudShape = shapeAnnotation.IsCloudShape;
        this.IsLocked = shapeAnnotation.IsLocked;
        this.LineHeadEnd = shapeAnnotation.LineHeadEnd;
        this.LineHeadStart = shapeAnnotation.LineHeadStart;
        this.ModifiedDate = shapeAnnotation.ModifiedDate;
        this.Note = shapeAnnotation.Note;
        this.Opacity = shapeAnnotation.Opacity;
        this.RectangleDifference = shapeAnnotation.RectangleDifference;
        this.RotateAngle = shapeAnnotation.RotateAngle;
        this.ShapeAnnotationType = shapeAnnotation.ShapeAnnotationType;
        this.StrokeColor = shapeAnnotation.StrokeColor;
        this.Subject = shapeAnnotation.Subject;
        this.Thickness = shapeAnnotation.Thickness;
        this.VertexPoints = shapeAnnotation.VertexPoints;
        this.AnnotName = shapeAnnotation.AnnotName;
        this.Comments = shapeAnnotation.Comments;
        this.State = shapeAnnotation.State;
        this.StateModel = shapeAnnotation.StateModel;
        this.AnnotType = 'shape_measure';
        this.AnnotationSettings = shapeAnnotation.AnnotationSettings;
        this.EnableShapeLabel = shapeAnnotation.EnableShapeLabel;
        this.AllowedInteractions = shapeAnnotation.AllowedInteractions;
        this.AnnotationRotation = shapeAnnotation.AnnotationRotation;
        if (shapeAnnotation.EnableShapeLabel === true) {
            this.LabelContent = shapeAnnotation.LabelContent;
            this.LabelFillColor = shapeAnnotation.LabelFillColor;
            this.FontColor = shapeAnnotation.FontColor;
            this.LabelBorderColor = shapeAnnotation.LabelBorderColor;
            this.FontSize = shapeAnnotation.FontSize;
            this.LabelSettings = shapeAnnotation.LabelSettings;
            this.LabelBounds = shapeAnnotation.LabelBounds;
        }
    }
    public Indent: string;
    public Caption: boolean;
    public CaptionPosition: string;
    public LeaderLineExtension: number;
    public LeaderLength: number;
    public LeaderLineOffset: number;
    public Calibrate: Measure;
}

/**
 *
 * @hidden
 */
export class SignatureAnnotationBase{
    public AnnotationType: string;
    public Bounds: any;
    public Opacity: number;
    public StrokeColor: string;
    public Thickness: number;
    public PathData: string = null;
    public PageNumber: number;
    public SignatureName: string;
    public ExistingCustomData: string = null;
    public FontFamily: string;
    public FontSize: number;
}

class Measure {
    public Ratio: string = '';
    public X: NumberFormat[] = [];
    public Distance: NumberFormat[] = [];
    public Area: NumberFormat[]  = [];
    public Angle: NumberFormat[] = [];
    public Volume: NumberFormat[] = [];
    public TargetUnitConversion: number = 0;
    public Depth: number = 0;
}

class NumberFormat {
    public Unit: string;
    public ConversionFactor: number;
    public FractionalType: string;
    public Denominator: number;
    public FormatDenominator: boolean;
    constructor() {
        this.Unit = '';
        this.ConversionFactor = 0;
        this.FractionalType = '';
        this.Denominator = 0;
        this.FormatDenominator = false;
    }
}

/**
 *
 * @hidden
 */
export class PopupAnnotationBase {
    public Author: string;
    public AnnotationSelectorSettings: any;
    public ModifiedDate: string;
    public Subject: string;
    public IsLock: boolean;
    public IsCommentLock: boolean;
    public AnnotationFlags: string;
    public Note: string;
    public Type: string;
    public SubType: string;
    public AnnotName: string;
    public Icon: string;
    public Comments: PopupAnnotationBase[];
    public State: string;
    public StateModel: string;
    public Opacity: number;
    public StrokeColor: string;
    public Color: AnnotColor;
    public Reference: any; // Use 'any' for compatibility with Syncfusion.Pdf.Primitives.PdfReference or similar
    public AnnotType: string;
    public CustomData: { [key: string]: any };
    public AnnotationSettings: any;
    public IsPrint: boolean;
    public ExistingCustomData: string;
    public Bounds: AnnotBounds;
    public Size: SizeBase;
    public IsLocked: boolean;
    constructor() {
        this.AnnotationFlags = null;
        this.AnnotationSelectorSettings = null;
        this.AnnotationSettings = null;
        this.ExistingCustomData = null;
        this.CustomData = null;
        this.IsPrint = false;
    }
}

/**
 *
 * @hidden
 */
export class TextMarkupAnnotationBase{
    TextMarkupAnnotationType: string;
    AnnotationSelectorSettings: any;
    Author: string;
    ModifiedDate: string;
    Subject: string;
    Note: string;
    IsCommentLock: boolean;
    Bounds: AnnotBounds[];
    Color: string;
    Opacity: number;
    Rect: RectangleBase;
    AnnotName: string;
    Comments: PopupAnnotationBase[];
    State: string;
    StateModel: string;
    AnnotType: string;
    CustomData: any;
    ExistingCustomData: string;
    IsMultiSelect: boolean;
    AnnotNameCollection: string[];
    AnnotpageNumbers: number[];
    AnnotationSettings: any;
    AllowedInteractions: string[];
    IsPrint: boolean;
    IsLocked: boolean;
    TextMarkupContent: string;
    AnnotationRotation: number;
    constructor() {
        this.AnnotationSelectorSettings = null;
        this.AnnotationSettings = null;
        this.ExistingCustomData = null;
        this.CustomData = null;
        this.IsPrint = true;
        this.IsMultiSelect = false;
        this.AnnotpageNumbers = null;
        this.AnnotNameCollection = null;
    }
}

/**
 *
 * @hidden
 */
export class PdfLayer {
    //PdfLayer
}

/**
 *
 * @hidden
 */
export class AnnotPoint {
    public X: number;
    public Y: number;
    constructor(_X: number, _Y: number) {
        this.X = _X;
        this.Y = _Y;
    }
}

/**
 *
 * @hidden
 */
export class AnnotBounds {
    public X: number;
    public Y: number;
    public Width: number;
    public Height: number;
    public Location: {
        X: number;
        Y: number;
    };
    public Size: SizeBase;
    public Left: number;
    public Top: number;
    public Right: number;
    public Bottom: number;
    constructor(_X: number, _Y: number, _Width: number, _Height: number) {
        this.X = _X;
        this.Y = _Y;
        this.Width = _Width;
        this.Height = _Height;
        this.Location = {
            X: _X,
            Y: _Y
        };
        this.Size = {
            IsEmpty: false,
            Width: _Width,
            Height: _Height
        };
        this.Left = _X;
        this.Top = _Y;
        this.Right = _X + _Width;
        this.Bottom = _Y + _Height;
    }
}

/**
 *
 * @hidden
 */
export class AnnotColor {
    public R: number;
    public G: number;
    public B: number;
    public IsEmpty: boolean = true;
    constructor(_R: number, _G: number, _B: number) {
        this.R = _R;
        this.G = _G;
        this.B = _B;
        if (this.R !== 0 || this.G !== 0 || this.B !== 0) {
            this.IsEmpty = false;
        }
    }
}

/**
 *
 * @hidden
 */
export class FontBase{
    public Bold: boolean;
    public FontFamily : PdfFontFamily;
    public Height: number;
    public Italic: boolean;
    public Name: string;
    public Size: number;
    public Strikeout: boolean;
    public Style: PdfFontStyle;
    public Underline: boolean;
    constructor(pdfFont: PdfFont, fontFamilyString: string) {
        this.Bold = pdfFont.isBold;
        this.FontFamily = (pdfFont as PdfStandardFont)._fontFamily;
        this.Height = pdfFont.height;
        this.Italic = pdfFont.isItalic;
        this.Name = fontFamilyString;
        this.Size = pdfFont.size;
        this.Strikeout = pdfFont.isStrikeout;
        this.Style = pdfFont.style;
        this.Underline = pdfFont.isUnderline;
    }
}

/**
 *
 * @hidden
 */
export class Path {
    points: [number, number][];
    constructor() {
        this.points = [];
    }
    moveTo(x: number, y: number): void {
        this.points.push([x, y]);
    }
    lineTo(x: number, y: number): void {
        this.points.push([x, y]);
    }
    transform(matrix: [number, number, number][]): void {
        this.points = this.points.map(([x, y]: [number, number]): [number, number] => {
            const newX: number = matrix[0][0] * x + matrix[0][1] * y + matrix[0][2];
            const newY: number = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2];
            return [newX, newY];
        });
    }
}

/**
 *
 * @hidden
 */
export class RectangleBase{
    /**
     * Value of `left`.
     *
     * @private
     */
    left: number;
    /**
     * Value of `top`.
     *
     * @private
     */
    top: number;
    /**
     * Value of `right`.
     *
     * @private
     */
    right: number;
    /**
     * Value of `bottom`.
     *
     * @private
     */
    bottom: number;
    /**
     * @param {number} left - left
     * @param {number} top - top
     * @param {number} right - right
     * @param {number} bottom - bottom
     * @private
     */
    constructor(left: number, top: number, right: number, bottom: number){
        this.left = left;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.width = right - left;
        this.height = bottom - top;
    }
    /**
     * Gets a value of width
     */
    readonly width: number;
    /**
     * Gets a value of height
     */
    readonly height: number;
}
