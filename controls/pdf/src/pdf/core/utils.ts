import { _PdfDictionary, _PdfName, _PdfReference } from './pdf-primitives';
import { PdfPage } from './pdf-page';
import { PdfFormFieldVisibility, PdfAnnotationFlag, PdfCheckBoxStyle, PdfHighlightMode, PdfBorderStyle, PdfBorderEffectStyle, PdfLineEndingStyle, _PdfCheckFieldState, PdfMeasurementUnit, _PdfGraphicsUnit, PdfTextMarkupAnnotationType, PdfRotationAngle, PdfAnnotationState, PdfAnnotationStateModel, PdfPopupIcon, PdfRubberStampAnnotationIcon, PdfAttachmentIcon, PdfAnnotationIntent, PdfBlendMode, _PdfAnnotationType, PdfNumberStyle, PdfDashStyle } from './enumerator';
import { _PdfTransformationMatrix } from './graphics/pdf-graphics';
import { PdfDocument, PdfPageSettings } from './pdf-document';
import { _PdfBaseStream, _PdfStream } from './base-stream';
import { PdfStateItem, PdfComment, PdfWidgetAnnotation, PdfAnnotation, PdfLineAnnotation, PdfInteractiveBorder, _PaintParameter, PdfRubberStampAnnotation } from './annotations/annotation';
import { PdfPopupAnnotationCollection } from './annotations/annotation-collection';
import { PdfTemplate } from './graphics/pdf-template';
import { PdfField, PdfTextBoxField, PdfComboBoxField } from './form/field';
import { PdfCjkFontFamily, PdfCjkStandardFont, PdfFont, PdfFontFamily, PdfFontStyle, PdfStandardFont, PdfTrueTypeFont } from './fonts/pdf-standard-font';
import { _PdfCrossReference } from './pdf-cross-reference';
import { PdfForm } from './form';
import { _ImageDecoder } from './graphics/images/image-decoder';
import { _JpegDecoder } from './graphics/images/jpeg-decoder';
import { _PngDecoder } from './graphics/images/png-decoder';
import { CompressedStreamWriter } from '@syncfusion/ej2-compression';
/**
 * Represents a bounding rectangle with an origin (x, y) and size (width, height).
 *
 * @property {number} x - The horizontal coordinate of the rectangle's origin.
 * @property {number} y - The vertical coordinate of the rectangle's origin.
 * @property {number} width - The width of the rectangle.
 * @property {number} height - The height of the rectangle.
 */
export type Rectangle = {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * Represents the size.
 *
 * @property {number} width - The width.
 * @property {number} height - The height.
 */
export type Size = {
    width: number;
    height: number;
};
/**
 * Represents a point in a two-dimensional coordinate system.
 *
 * @property {number} x - The x-coordinate of the point.
 * @property {number} y - The y-coordinate of the point.
 */
export type Point = {
    x: number;
    y: number;
};
/**
 * Gets the unsigned value.
 *
 * @param {number} value input value.
 * @param {number} bits bits to process.
 * @returns {number} unsigned value.
 */
export function _toUnsigned(value: number, bits: number): number {
    return (value & ((2 ** bits) - 1));
}
/**
 * Gets the signed 16 bit value.
 *
 * @param {number} value input value.
 * @returns {number} unsigned value.
 */
export function _toSigned16(value: number): number {
    return (value << 16) >> 16;
}
/**
 * Gets the signed 32 bit value.
 *
 * @param {number} value input value.
 * @returns {number} unsigned value.
 */
export function _toSigned32(value: number): number {
    return (value << 0);
}
/**
 * Copy values from one array to another.
 *
 * @param {number[]} target destination array.
 * @param {number} at target index.
 * @param {number[]} source source array.
 * @param {number} start start index.
 * @param {number} end end index.
 * @returns {void} Returns nothing.
 */
export function _copyRange(
    target: number[],
    at: number,
    source: number[],
    start: number = 0,
    end: number = source.length
): void {
    start = Math.max(0, Math.min(source.length, start));
    end = Math.max(0, Math.min(source.length, end));
    const length: number = end - start;
    target.length = Math.max(target.length, at + length);
    for (let i: number = 0; i < length; i++) {
        target[at + i] = source[start + i];
    }
}
/**
 * Checks the type of the image using header bytes.
 *
 * @param {Uint8Array} imageData image data.
 * @param {number[]} header header bytes.
 * @returns {boolean} Header matched or not.
 */
export function _checkType(imageData: Uint8Array, header: number[]): boolean {
    return header.every((value: number, index: number) => value === imageData[<number>index]);
}
/**
 * Gets the image decoder.
 *
 * @param {Uint8Array} imageData image data.
 * @returns {_ImageDecoder} Image decoder.
 */
export function _getDecoder(imageData: Uint8Array): _ImageDecoder {
    let decoder: _ImageDecoder;
    if (_checkType(imageData, [255, 216])) {
        decoder = new _JpegDecoder(imageData);
    } else if (_checkType(imageData, [137, 80, 78, 71, 13, 10, 26, 10])) {
        decoder = new _PngDecoder(imageData);
    } else {
        throw new Error('Unsupported image format');
    }
    return decoder;
}
/**
 * Gets the page rotation.
 *
 * @param {PdfPage} page Page.
 * @param {number} height Height.
 * @param {number} left Left.
 * @returns {number} Page rotation.
 */
export function _checkRotation(page: PdfPage, height: number, left: number): number {
    let topValue: number = 0;
    left = (typeof left === 'undefined' || left === null) ? 0 : left;
    if (page.rotation === PdfRotationAngle.angle90) {
        topValue = (typeof height === 'undefined' || height === null) ? 0 : left;
    } else if (page.rotation === PdfRotationAngle.angle180) {
        topValue = (typeof height === 'undefined' || height === null) ? 0 : height;
    } else if (page.rotation === PdfRotationAngle.angle270) {
        const size: number[] = page.size;
        topValue = (typeof height === 'undefined' || height === null) ? 0 : size[0] - left;
    }
    return topValue;
}
/**
 * Gets the page index.
 *
 * @param {PdfDocument} loadedDocument Loaded document.
 * @param {_PdfDictionary} pageDictionary Page dictionary.
 * @returns {number} Page index.
 */
export function _getPageIndex(loadedDocument: PdfDocument, pageDictionary: _PdfDictionary): number {
    let index: number = -1;
    if (pageDictionary && pageDictionary instanceof _PdfDictionary) {
        for (let i: number = 0; i < loadedDocument.pageCount; i++) {
            const page: PdfPage = loadedDocument.getPage(i);
            if (page && page._pageDictionary && (page._pageDictionary === pageDictionary ||
               page._pageDictionary.objId === pageDictionary.objId)) {
                index = i;
                break;
            }
        }
    }
    return index;
}
/**
 * Convert string value from annotation flag
 *
 * @private
 * @param {PdfAnnotationFlag} flag Annotation flag.
 * @returns {string} Valid string to write into XML.
 */
export function _annotationFlagsToString(flag: PdfAnnotationFlag): string {
    const values: string[] = [];
    if ((flag & PdfAnnotationFlag.hidden) !== 0) {
        values.push('hidden');
    }
    if ((flag & PdfAnnotationFlag.invisible) !== 0) {
        values.push('invisible');
    }
    if ((flag & PdfAnnotationFlag.locked) !== 0) {
        values.push('locked');
    }
    if ((flag & PdfAnnotationFlag.noRotate) !== 0) {
        values.push('norotate');
    }
    if ((flag & PdfAnnotationFlag.noView) !== 0) {
        values.push('noview');
    }
    if ((flag & PdfAnnotationFlag.noZoom) !== 0) {
        values.push('nozoom');
    }
    if ((flag & PdfAnnotationFlag.print) !== 0) {
        values.push('print');
    }
    if ((flag & PdfAnnotationFlag.readOnly) !== 0) {
        values.push('readonly');
    }
    if ((flag & PdfAnnotationFlag.toggleNoView) !== 0) {
        values.push('togglenoview');
    }
    if ((flag & PdfAnnotationFlag.default) !== 0) {
        values.push('default');
    }
    return values.join(',');
}
/**
 * Convert string value to annotation flag
 *
 * @private
 * @param {string} flag String value to map
 * @returns {PdfAnnotationFlag} Annotation flag
 */
export function _stringToAnnotationFlags(flag: string): PdfAnnotationFlag {
    switch (flag) {
    case 'hidden':
        return PdfAnnotationFlag.hidden;
    case 'invisible':
        return PdfAnnotationFlag.invisible;
    case 'locked':
        return PdfAnnotationFlag.locked;
    case 'norotate':
        return PdfAnnotationFlag.noRotate;
    case 'noview':
        return PdfAnnotationFlag.noView;
    case 'nozoom':
        return PdfAnnotationFlag.noZoom;
    case 'print':
        return PdfAnnotationFlag.print;
    case 'readonly':
        return PdfAnnotationFlag.readOnly;
    case 'togglenoview':
        return PdfAnnotationFlag.toggleNoView;
    default:
        return PdfAnnotationFlag.default;
    }
}
/**
 * Convert string value to byte array
 *
 * @private
 * @param {string} value string value.
 * @returns {string} Valid string to write into PDF.
 */
export function _stringToPdfString(value: string): string {
    if (typeof value === 'string' && value.length > 0 && value.charCodeAt(0) >= '\xEF'.charCodeAt(0)) {
        let encoding: string;
        if (value[0] === '\xEF' && value[1] === '\xBB' && value[2] === '\xBF') {
            encoding = 'utf-8';
        } else if (value[0] === '\xFF' && value[1] === '\xFE') {
            encoding = 'utf-16le';
        } else if (value[0] === '\xFE' && value[1] === '\xFF') {
            encoding = 'utf-16be';
        }
        if (encoding) {
            try {
                return (new TextDecoder(encoding, { fatal: true })).decode(_stringToBytes(value) as Uint8Array);
            }
            catch (e) { } // eslint-disable-line
        }
    }
    const buffer: string[] = [];
    const translateTable: number[] = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x2d8,
        0x2c7, 0x2c6, 0x2d9, 0x2dd, 0x2db, 0x2da, 0x2dc, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0x2022, 0x2020, 0x2021, 0x2026, 0x2014, 0x2013, 0x192,
        0x2044, 0x2039, 0x203a, 0x2212, 0x2030, 0x201e, 0x201c, 0x201d, 0x2018,
        0x2019, 0x201a, 0x2122, 0xfb01, 0xfb02, 0x141, 0x152, 0x160, 0x178, 0x17d,
        0x131, 0x142, 0x153, 0x161, 0x17e, 0, 0x20ac
    ];
    for (let i: number = 0; i < value.length; i++) {
        const code: number = translateTable[value.charCodeAt(i)];
        buffer.push(code ? String.fromCharCode(code) : value.charAt(i));
    }
    return buffer.join('');
}
/**
 * Convert string value to byte array
 *
 * @private
 * @param {string} value string value.
 * @param {boolean} isDirect Whether to return a number[] or Uint8Array.
 * @param {boolean} isPassword Whether the string is a password.
 * @param {number[]} destination Destination array.
 * @returns {number[] | Uint8Array} Byte array
 */
export function _stringToBytes(value: string, isDirect: boolean = false,
                               isPassword: boolean = false, destination?: number[]): number[] | Uint8Array {
    let bytes: number[] = [];
    if (destination) {
        bytes = destination;
    }
    if (isPassword) {
        for (let i: number = 0; i < value.length; i++) {
            bytes.push(value.charCodeAt(i));
        }
    } else {
        for (let i: number = 0; i < value.length; i++) {
            let charCode: number = value.charCodeAt(i);
            if (charCode < 0x80) {
                bytes.push(charCode);
            } else if (charCode < 0x800) {
                bytes.push((charCode >> 6) | 0xC0);
                bytes.push((charCode & 0x3F) | 0x80);
            } else if (charCode < 0xD800 || charCode >= 0xE000) {
                bytes.push((charCode >> 12) | 0xE0);
                bytes.push(((charCode >> 6) & 0x3F) | 0x80);
                bytes.push((charCode & 0x3F) | 0x80);
            } else {
                i++;
                charCode = 0x10000 + (((charCode & 0x3FF) << 10) | (value.charCodeAt(i) & 0x3FF));
                bytes.push((charCode >> 18) | 0xF0);
                bytes.push(((charCode >> 12) & 0x3F) | 0x80);
                bytes.push(((charCode >> 6) & 0x3F) | 0x80);
                bytes.push((charCode & 0x3F) | 0x80);
            }
        }
    }
    return isDirect ? bytes : new Uint8Array(bytes);
}
/**
 * Check equal or not.
 *
 * @private
 * @param {number[]} first byte array.
 * @param {number[]} second byte array.
 * @returns {boolean} Equal or not
 */
export function _areArrayEqual(first: Uint8Array | number[], second: Uint8Array | number[]): boolean {
    return first.length === second.length && first.every((val: number, i: number) => val === second[<number>i]);
}
/**
 * Convert number to string as round value with fixed decimal points 2.
 *
 * @private
 * @param {number[]} value number value.
 * @returns {boolean} Equal string.
 */
export function _numberToString(value: number): string {
    if (Number.isInteger(value)) {
        return value.toString();
    }
    return value.toFixed(7);
}
/**
 * Check whether entries in two array are equal or not.
 *
 * @private
 * @param {number[]} value first array.
 * @param {number[]} current second array.
 * @returns {boolean} Return true if for each elements are equal in both array.
 */
export function _areNotEqual(value: number[], current: number[]): boolean {
    let result: boolean = false;
    if (value.length !== current.length) {
        return true;
    }
    for (let i: number = 0; i < value.length; i++) {
        if (value[i] !== current[i]) { // eslint-disable-line
            result = true;
            break;
        }
    }
    return result;
}
/**
 * Process bytes and convert as string.
 *
 * @private
 * @param {Uint8Array} bytes Input data.
 * @param {boolean} isJson Whether is json or xfdf.
 * @returns {string} String value processed from input bytes.
 */
export function _bytesToString(bytes: Uint8Array, isJson: boolean = false): string {
    const length: number = bytes.length;
    const max: number = 8192;
    const stringBuffer: string[] = [];
    if (length < max) {
        return (isJson ? _decodeUnicodeBytes(bytes) : String.fromCharCode.apply(null, bytes));
    }
    for (let i: number = 0; i < length; i += max) {
        const chunkEnd: number = Math.min(i + max, length);
        const chunk: Uint8Array = bytes.subarray(i, chunkEnd);
        stringBuffer.push(isJson ? _decodeUnicodeBytes(chunk) : String.fromCharCode.apply(null, chunk));
    }
    return stringBuffer.join('');
}
/**
 * Decode unicode string.
 *
 * @private
 * @param {Uint8Array} bytes Input data.
 * @returns {string} String value processed from input bytes.
 */
export function _decodeUnicodeBytes(bytes: Uint8Array): string {
    let result: string = '';
    let i: number = 0;
    while (i < bytes.length) {
        const byte: number = bytes[i++];
        if (byte < 0x80) {
            result += String.fromCharCode(byte);
        } else if (byte < 0xE0) {
            result += String.fromCharCode(((byte & 0x1F) << 6) | (bytes[i++] & 0x3F));
        } else if (byte < 0xF0) {
            result += String.fromCharCode(((byte & 0x0F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F));
        } else {
            const codePoint: number = ((byte & 0x07) << 18) | ((bytes[i++] & 0x3F) << 12) |
                ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F) - 0x10000;
            result += String.fromCharCode((codePoint >> 10) + 0xD800, (codePoint & 0x03FF) + 0xDC00);
        }
    }
    return result;
}
/**
 * Convert string to unicode array.
 *
 * @private
 * @param {string} value string value.
 * @returns {Uint8Array} unicode array
 */
export function _stringToUnicodeArray(value: string): Uint8Array {
    const output: number[] = [];
    if (value !== null && typeof value !== 'undefined') {
        for (let i: number = 0; i < value.length; i++) {
            const code: number = value.charCodeAt(i);
            output.push(code / 256 >>> 0);
            output.push(code & 0xff);
        }
    }
    const unicodeArray: Uint8Array = new Uint8Array(output);
    return unicodeArray;
}
/**
 * Convert byte array to hex string.
 *
 * @private
 * @param {Uint8Array} byteArray Byte array.
 * @returns {string} Hex string.
 */
export function _byteArrayToHexString(byteArray: Uint8Array): string {
    const stringBuffer: string[] = [];
    byteArray.forEach((byte: number) => {
        let nextHexByte: string = byte.toString(16).toUpperCase();
        if (nextHexByte.length < 2) {
            nextHexByte = '0' + nextHexByte;
        }
        stringBuffer.push(nextHexByte);
    });
    return stringBuffer.join('');
}
/**
 * Convert hex string to byte array.
 *
 * @private
 * @param {string} hexString Hex string.
 * @param {boolean} isDirect Whether to return object or number[]. Default is false.
 * @returns {Uint8Array | number[]} Byte array.
 */
export function _hexStringToByteArray(hexString: string, isDirect: boolean = false): Uint8Array | number[] {
    const array: number[] = [];
    if (hexString) {
        for (let i: number = 0; i < hexString.length; i += 2) {
            array.push(parseInt(hexString.substring(i, i + 2), 16));
        }
    }
    return isDirect ? array : new Uint8Array(array);
}
/**
 * Convert hex string to normal string.
 *
 * @private
 * @param {string} hexString Hex string.
 * @returns {string} Normal string.
 */
export function _hexStringToString(hexString: string): string {
    let result: string = '';
    if (hexString && hexString[0] === '#') {
        hexString = hexString.substring(1);
        for (let i: number = 0; i < hexString.length; i += 2) {
            result += String.fromCharCode(parseInt(hexString.substring(i, i + 2), 16));
        }
        return result;
    }
    return hexString;
}
/**
 * Check whether the character code is white space.
 *
 * @private
 * @param {number} ch The character code to check.
 * @returns {boolean} True if the character is space, otherwise false.
 */
export function _isWhiteSpace(ch: number): boolean {
    return ch === 0x20 || ch === 0x09 || ch === 0x0d || ch === 0x0a;
}
/**
 * Decode a chunk of base64 string into Uint8Array.
 *
 * @private
 * @param {string} input The base64 string to decode.
 * @returns {Uint8Array} Decoded bytes as Uint8Array.
 */
function _decodeChunk(input: string): Uint8Array {
    const key: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let chr1: number;
    let chr2: number;
    let chr3: number;
    let enc1: number;
    let enc2: number;
    let enc3: number;
    let enc4: number;
    let i: number = 0;
    let resultIndex: number = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, ''); // eslint-disable-line
    let totalLength: number = input.length * 3 / 4;
    if (input.charAt(input.length - 1) === key.charAt(64)) {
        totalLength--;
    }
    const output: Array<number> = new Array<number>(totalLength | 0);
    while (i < input.length) {
        enc1 = key.indexOf(input.charAt(i++));
        enc2 = key.indexOf(input.charAt(i++));
        enc3 = key.indexOf(input.charAt(i++));
        enc4 = key.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        if (resultIndex < totalLength) {
            output[resultIndex++] = chr1;
        }
        if (resultIndex < totalLength) {
            output[resultIndex++] = chr2;
        }
        if (resultIndex < totalLength) {
            output[resultIndex++] = chr3;
        }
    }
    return new Uint8Array(output);
}
/**
 * Decode bytes from base64 string.
 *
 * @private
 * @param {string} input The base64 string to decode.
 * @param {boolean} isDirect Whether to return object or number[]. Default is false.
 * @returns {Uint8Array | number[]} Decoded bytes.
 */
export function _decode(input: string, isDirect: boolean = false): Uint8Array | number[] {
    const chunkSize: number = 3000000;
    if (input.length >= chunkSize) {
        input = input.replace(/[^A-Za-z0-9+/=]/g, '');
        const outputChunks: Uint8Array[] = [];
        let totalLength: number = 0;
        for (let i: number = 0; i < input.length; i += chunkSize) {
            const chunk: string = input.substring(i, i + chunkSize);
            const decodedChunk: Uint8Array = _decodeChunk(chunk);
            outputChunks.push(decodedChunk);
            totalLength += decodedChunk.length;
        }
        const output: Uint8Array = new Uint8Array(totalLength);
        let offset: number = 0;
        for (const chunk of outputChunks) {
            output.set(chunk, offset);
            offset += chunk.length;
        }
        return isDirect ? Array.from(output) : output;
    } else {
        const key: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let chr1: number;
        let chr2: number;
        let chr3: number;
        let enc1: number;
        let enc2: number;
        let enc3: number;
        let enc4: number;
        let i: number = 0;
        let resultIndex: number = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, ''); // eslint-disable-line
        let totalLength: number = input.length * 3 / 4;
        if (input.charAt(input.length - 1) === key.charAt(64)) {
            totalLength--;
        }
        const output: Array<number> = new Array<number>(totalLength | 0);
        while (i < input.length) {
            enc1 = key.indexOf(input.charAt(i++));
            enc2 = key.indexOf(input.charAt(i++));
            enc3 = key.indexOf(input.charAt(i++));
            enc4 = key.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            if (resultIndex < totalLength) {
                output[resultIndex++] = chr1;
            }
            if (resultIndex < totalLength) {
                output[resultIndex++] = chr2;
            }
            if (resultIndex < totalLength) {
                output[resultIndex++] = chr3;
            }
        }
        return isDirect ? output : new Uint8Array(output);
    }
}
/**
 * Encode a chunk of bytes to base64 string.
 *
 * @private
 * @param {Uint8Array} bytes Bytes to encode.
 * @param {boolean} isLastChunk Defines a last chunk of bytes.
 * @returns {string} Decoded string.
 */
function _encodeChunk(bytes: Uint8Array, isLastChunk: boolean = false): string {
    const key: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const output: string[] = [];
    const length: number = bytes.length;
    let i: number = 0;
    while (i < length) {
        const byte1: number = bytes[i++];
        const byte2: number = i < length ? bytes[i++] : 0;
        const byte3: number = i < length ? bytes[i++] : 0;
        output.push(
            key[byte1 >> 2],
            key[((byte1 & 3) << 4) | (byte2 >> 4)],
            i - 1 > length ? '=' : key[((byte2 & 15) << 2) | (byte3 >> 6)],
            i > length ? '=' : key[byte3 & 63]
        );
    }
    if (isLastChunk) {
        if (length % 3 === 1) {
            output[output.length - 1] = '=';
            output[output.length - 2] = '=';
        } else if (length % 3 === 2) {
            output[output.length - 1] = '=';
        }
    }
    return output.join('');
}
/**
 * Encode bytes to base64 string.
 *
 * @private
 * @param {Uint8Array} bytes Bytes to encode.
 * @returns {string} Decoded string.
 */
export function _encode(bytes: Uint8Array): string {
    const chunkSize: number = 3000000;
    const key: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const length: number = bytes.length;
    if (length >= chunkSize) {
        const output: string[] = [];
        if (length > chunkSize) {
            for (let start: number = 0; start < length; start += chunkSize) {
                const chunk: Uint8Array = bytes.subarray(start, Math.min(start + chunkSize, length));
                if ((start + chunkSize) >= length) {
                    output.push(_encodeChunk(chunk, true));
                } else {
                    output.push(_encodeChunk(chunk));
                }
            }
        } else {
            output.push(_encodeChunk(bytes, true));
        }
        return output.join('');
    } else {
        let output: string = '';
        let currentChar: number = 0;
        for (let i: number = 0; i < bytes.length; i++) {
            if (i % 3 === 0) {
                currentChar = (bytes[<number>i] >> 2);
                output += key[<number>currentChar];
                currentChar = (bytes[<number>i] << 4) & 63;
            } else if (i % 3 === 1) {
                currentChar += (bytes[<number>i] >> 4);
                output += key[<number>currentChar];
                currentChar = (bytes[<number>i] << 2) & 63;
            } else if (i % 3 === 2) {
                currentChar += (bytes[<number>i] >> 6);
                output += key[<number>currentChar];
                currentChar = bytes[<number>i] & 63;
                output += key[<number>currentChar];
            }
        }
        if (bytes.length % 3 === 1) {
            output += `${key[<number>currentChar]}==`;
        }
        if (bytes.length % 3 === 2) {
            output += `${key[<number>currentChar]}=`;
        }
        return output;
    }
}
/**
 * Get property value in inheritable mode.
 *
 * @private
 * @param {_PdfDictionary} dictionary Input dictionary.
 * @param {string} key Input dictionary.
 * @param {boolean} isArray Search array.
 * @param {boolean} stopWhenFound Stop when found.
 * @param {string[]} parentKey Key string for parent node.
 * @returns {any} Property value.
 */
export function _getInheritableProperty(dictionary: _PdfDictionary,
                                        key: string,
                                        isArray: boolean = false,
                                        stopWhenFound: boolean = true,
                                        ...parentKey: string[]): any { // eslint-disable-line
    let values: any; // eslint-disable-line
    const refSet: any = new Set(); // eslint-disable-line
    while (dictionary instanceof _PdfDictionary && dictionary.objId && !refSet.has(dictionary.objId)) {
        if (dictionary.objId) {
            refSet.add(dictionary.objId);
        }
        const value: any = isArray ? dictionary.getArray(key) : dictionary.get(key); // eslint-disable-line
        if (value !== undefined) {
            if (stopWhenFound) {
                return value;
            }
            if (!values) {
                values = [];
            }
            values.push(value);
        }
        let index: number = 0;
        let hasParent: boolean = false;
        while (index < parentKey.length) {
            const element: string = parentKey[index]; // eslint-disable-line
            if (dictionary.has(element)) {
                dictionary = dictionary.get(element);
                hasParent = true;
                break;
            }
            index++;
        }
        if (!hasParent) {
            break;
        }
    }
    return values;
}
/**
 * Calculate bounds of annotation or field.
 *
 * @private
 * @param {_PdfDictionary} dictionary Input dictionary.
 * @param {boolean} isWidget Input page.
 * @returns {any} Bounds value.
 */
export function _parseRectangle(dictionary: _PdfDictionary, isWidget?: boolean): { x: number, y: number, width: number, height: number } {
    const rectangle: { x: number, y: number, width: number, height: number } = { x: 0, y: 0, width: 0, height: 0 };
    const elements: number[] = dictionary.getArray('Rect');
    if (elements && Array.isArray(elements)) {
        const x1: number = elements[0];
        const y1: number = elements[1];
        const x2: number = elements[2];
        const y2: number = elements[3];
        if (typeof x1 !== 'undefined' && typeof y1 !== 'undefined' && typeof x2 !== 'undefined' && typeof y2 !== 'undefined') {
            rectangle.x = Math.min(x1, x2);
            rectangle.y = Math.min(y1, y2);
            rectangle.width = Math.max(x1, x2) - rectangle.x;
            rectangle.height = Math.max(y1, y2) - rectangle.y;
            if (isWidget) {
                rectangle.height = parseFloat(rectangle.height.toFixed(3));
                if (elements[1] < 0) {
                    rectangle.y = elements[1];
                    if (elements[1] > elements[3]) {
                        rectangle.y -= rectangle.height;
                    }
                }
            }
        }
    }
    return rectangle;
}
/**
 * Calculate bounds of annotation or field.
 *
 * @private
 * @param {_PdfDictionary} dictionary Input dictionary.
 * @param {string} page Input page.
 * @returns {any} Bounds value.
 */
export function _calculateBounds(dictionary: _PdfDictionary, page: PdfPage): { x: number, y: number, width: number, height: number } {
    let rect: { x: number, y: number, width: number, height: number };
    if (dictionary.has('Rect')) {
        rect = _parseRectangle(dictionary);
        if (page) {
            const size: number[] = page.size;
            const mBox: number[] = page.mediaBox;
            const cropBox: number[] = page.cropBox;
            if (cropBox && Array.isArray(cropBox) && cropBox.length === 4 && page._pageDictionary.has('CropBox')) {
                if ((cropBox[0] !== 0 || cropBox[1] !== 0 || size[0] === cropBox[2] ||
                    size[1] === cropBox[3]) && (rect.x !== cropBox[0])) {
                    rect.x -= cropBox[0];
                    rect.y = cropBox[3] - (rect.y + rect.height);
                } else {
                    rect.y = size[1] - (rect.y + rect.height);
                }
            } else if (mBox && Array.isArray(mBox) && mBox.length === 4 && page._pageDictionary.has('MediaBox')) {
                if (mBox[0] > 0 || mBox[1] > 0 || size[0] === mBox[2] || size[1] === mBox[3]) {
                    rect.x -= mBox[0];
                    rect.y = mBox[3] - (rect.y + rect.height);
                } else {
                    rect.y = size[1] - (rect.y + rect.height);
                }
            } else {
                rect.y = size[1] - (rect.y + rect.height);
            }
        } else {
            rect.y = rect.y + rect.height;
        }
    }
    return rect;
}
/**
 * Calculate bounds of annotation or field.
 *
 * @private
 * @param {number[]} value array value.
 * @returns {any} Rectangle value.
 */
export function _toRectangle(value: number[]): { x: number, y: number, width: number, height: number } {
    return {
        x: Math.min(value[0], value[2]),
        y: Math.min(value[1], value[3]),
        width: Math.abs(value[0] - value[2]),
        height: Math.abs(value[1] - value[3])
    };
}
/**
 * Calculate bounds of annotation or field.
 *
 * @private
 * @param {any} value Rectangle value.
 * @param {any} value.x X value.
 * @param {any} value.y Y value.
 * @param {any} value.width Width value.
 * @param {any} value.height Height value.
 * @returns {number[]} Bounds value.
 */
export function _fromRectangle(value: { x: number, y: number, width: number, height: number }): number[] {
    return [value.x, value.y, value.x + value.width, value.y + value.height];
}
/**
 * Calculate bounds of annotation or field.
 *
 * @private
 * @param {number[]} value Input dictionary.
 * @param {string} page Input page.
 * @returns {number[]} Bounds value.
 */
export function _getUpdatedBounds(value: number[], page?: PdfPage): number[] {
    let x: number = value[0];
    let y: number = value[1];
    const width: number = value[2];
    const height: number = value[3];
    if (page) {
        const size: number[] = page.size;
        const pageWidth: number = size[0];
        const pageHeight: number = size[1];
        const mBox: number[] = page.mediaBox;
        const cropBox: number[] = page.cropBox;
        if (cropBox && Array.isArray(cropBox) && cropBox.length === 4) {
            if (cropBox[0] !== 0 || cropBox[1] !== 0 || pageWidth === cropBox[2] || pageHeight === cropBox[3]) {
                x += cropBox[0];
                y = cropBox[3] - (y + height);
            } else {
                y = pageHeight - (y + height);
            }
        } else if (mBox && Array.isArray(mBox) && mBox.length === 4) {
            if (mBox[0] > 0 || mBox[1] > 0 || pageWidth === mBox[2] || pageHeight === mBox[3]) {
                x -= mBox[0];
                y = mBox[3] - (y + height);
            } else {
                y = pageHeight - (y + height);
            }
        } else {
            y = pageHeight - (y + height);
        }
    }
    return [x, y, x + width, y + height];
}
/**
 * Parse RGB color.
 *
 * @private
 * @param {string} colorString Color value in string format.
 * @returns {number[]} RGB color value.
 */
export function _convertToColor(colorString: string): number[] {
    let color: number[] = _getColorValue(colorString);
    if (!color) {
        const result: RegExpExecArray = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colorString);
        if (result) {
            color = [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
        }
    }
    return color;
}
/**
 * Parse RGB color.
 *
 * @private
 * @param {number[]} array Color array in dictionary.
 * @returns {number[]} RGB color value.
 */
export function _parseColor(array: number[]): number[] {
    let color: number[];
    if (array) {
        if (array.length === 1) {
            const entry: number = array[0];
            if (typeof entry !== 'undefined') {
                const round: number = Math.round(entry * 255);
                color = [round, round, round];
            }
        } else if (array.length === 3) {
            const r: number = array[0];
            const g: number = array[1];
            const b: number = array[2];
            if (typeof r !== 'undefined' && typeof g !== 'undefined' && typeof b !== 'undefined') {
                color = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
            }
        } else if (array.length === 4) {
            const c: number = array[0];
            const m: number = array[1];
            const y: number = array[2];
            const k: number = array[3];
            if (typeof c !== 'undefined' && typeof m !== 'undefined' && typeof y !== 'undefined' && typeof k !== 'undefined') {
                const fBlack: number = k * 255;
                color = [Math.round(255 - Math.min(255, ((c * (255 - fBlack)) + fBlack))),
                    Math.round(255 - Math.min(255, ((m * (255 - fBlack)) + fBlack))),
                    Math.round(255 - Math.min(255, ((y * (255 - fBlack)) + fBlack)))];
            }
        }
    }
    return color;
}
/**
 * Get the border style in _PdfName.
 *
 * @private
 * @param {PdfBorderStyle} style border style in enum.
 * @returns {_PdfName} border style in _PdfName.
 */
export function _mapBorderStyle(style: PdfBorderStyle): _PdfName {
    let token: string = 'S';
    switch (style) {
    case PdfBorderStyle.dot:
    case PdfBorderStyle.dashed:
        token = 'D';
        break;
    case PdfBorderStyle.beveled:
        token = 'B';
        break;
    case PdfBorderStyle.inset:
        token = 'I';
        break;
    case PdfBorderStyle.underline:
        token = 'U';
        break;
    }
    return _PdfName.get(token);
}
/**
 * Get the border effect style in _PdfName.
 *
 * @private
 * @param {string} style border effect style as string.
 * @returns {PdfBorderEffectStyle} border effect style.
 */
export function _mapBorderEffectStyle(style: string): PdfBorderEffectStyle {
    let value: PdfBorderEffectStyle = PdfBorderEffectStyle.solid;
    switch (style) {
    case 'C':
        value = PdfBorderEffectStyle.cloudy;
        break;
    }
    return value;
}
/**
 * Get the string value for line ending style.
 *
 * @private
 * @param {PdfLineEndingStyle} style style in enum.
 * @returns {string} value default None.
 */
export function _reverseMapEndingStyle(style: PdfLineEndingStyle): string {
    let value: string = 'None';
    if (typeof style !== 'undefined') {
        switch (style) {
        case PdfLineEndingStyle.openArrow:
            value = 'OpenArrow';
            break;
        case PdfLineEndingStyle.closedArrow:
            value = 'ClosedArrow';
            break;
        case PdfLineEndingStyle.rOpenArrow:
            value = 'ROpenArrow';
            break;
        case PdfLineEndingStyle.rClosedArrow:
            value = 'RClosedArrow';
            break;
        case PdfLineEndingStyle.butt:
            value = 'Butt';
            break;
        case PdfLineEndingStyle.diamond:
            value = 'Diamond';
            break;
        case PdfLineEndingStyle.circle:
            value = 'Circle';
            break;
        case PdfLineEndingStyle.square:
            value = 'Square';
            break;
        case PdfLineEndingStyle.slash:
            value = 'Slash';
            break;
        }
    }
    return value;
}
/**
 * Get the enum value for line ending style.
 *
 * @private
 * @param {string} style Style value in string.
 * @param {PdfLineEndingStyle} defaultValue Default style value to return.
 * @returns {PdfLineEndingStyle} enum value default 0.
 */
export function _mapLineEndingStyle(style: string, defaultValue?: PdfLineEndingStyle): PdfLineEndingStyle { // eslint-disable-line
    let value: PdfLineEndingStyle;
    switch (style.toLowerCase()) {
    case 'openarrow':
        value = PdfLineEndingStyle.openArrow;
        break;
    case 'closedarrow':
        value = PdfLineEndingStyle.closedArrow;
        break;
    case 'ropenarrow':
        value = PdfLineEndingStyle.rOpenArrow;
        break;
    case 'rclosedarrow':
        value = PdfLineEndingStyle.rClosedArrow;
        break;
    case 'butt':
        value = PdfLineEndingStyle.butt;
        break;
    case 'diamond':
        value = PdfLineEndingStyle.diamond;
        break;
    case 'circle':
        value = PdfLineEndingStyle.circle;
        break;
    case 'square':
        value = PdfLineEndingStyle.square;
        break;
    case 'slash':
        value = PdfLineEndingStyle.slash;
        break;
    default:
        value = PdfLineEndingStyle.none;
        break;
    }
    return value;
}
/**
 * Get highlight mode.
 *
 * @private
 * @param {string} mode Mode entry in dictionary.
 * @returns {PdfHighlightMode} Highlight mode.
 */
export function _mapHighlightMode(mode: string): PdfHighlightMode {
    switch (mode) {
    case 'P':
        return PdfHighlightMode.push;
    case 'N':
        return PdfHighlightMode.noHighlighting;
    case 'O':
        return PdfHighlightMode.outline;
    default:
        return PdfHighlightMode.invert;
    }
}
/**
 * Get highlight mode as string.
 *
 * @private
 * @param {PdfHighlightMode} mode Mode entry.
 * @returns {_PdfName} Highlight mode as PDF name.
 */
export function _reverseMapHighlightMode(mode: PdfHighlightMode): _PdfName {
    switch (mode) {
    case PdfHighlightMode.push:
        return _PdfName.get('P');
    case PdfHighlightMode.noHighlighting:
        return _PdfName.get('N');
    case PdfHighlightMode.outline:
        return _PdfName.get('O');
    default:
        return _PdfName.get('I');
    }
}
/**
 * Reverse map blend mode.
 *
 * @private
 * @param {PdfBlendMode} mode Mode entry.
 * @returns {_PdfName} Blend mode as name.
 */
export function _reverseMapBlendMode(mode: PdfBlendMode): _PdfName {
    let token: string = 'Normal';
    switch (mode) {
    case PdfBlendMode.multiply:
        token = 'Multiply';
        break;
    case PdfBlendMode.screen:
        token = 'Screen';
        break;
    case PdfBlendMode.overlay:
        token = 'Overlay';
        break;
    case PdfBlendMode.darken:
        token = 'Darken';
        break;
    case PdfBlendMode.lighten:
        token = 'Lighten';
        break;
    case PdfBlendMode.colorDodge:
        token = 'ColorDodge';
        break;
    case PdfBlendMode.colorBurn:
        token = 'ColorBurn';
        break;
    case PdfBlendMode.hardLight:
        token = 'HardLight';
        break;
    case PdfBlendMode.softLight:
        token = 'SoftLight';
        break;
    case PdfBlendMode.difference:
        token = 'Difference';
        break;
    case PdfBlendMode.exclusion:
        token = 'Exclusion';
        break;
    case PdfBlendMode.hue:
        token = 'Hue';
        break;
    case PdfBlendMode.saturation:
        token = 'Saturation';
        break;
    case PdfBlendMode.color:
        token = 'Color';
        break;
    case PdfBlendMode.luminosity:
        token = 'Luminosity';
        break;
    default:
        token = 'Normal';
        break;
    }
    return _PdfName.get(token);
}
/**
 * Map blend mode.
 *
 * @private
 * @param {_PdfName} token Blend mode as name.
 * @returns {PdfBlendMode} Mode value;
 */
export function _mapBlendMode(token: _PdfName): PdfBlendMode {
    let style: PdfBlendMode = PdfBlendMode.normal;
    switch (token.name) {
    case 'Multiply':
        style = PdfBlendMode.multiply;
        break;
    case 'Screen':
        style = PdfBlendMode.screen;
        break;
    case 'Overlay':
        style = PdfBlendMode.overlay;
        break;
    case 'Darken':
        style = PdfBlendMode.darken;
        break;
    case 'Lighten':
        style = PdfBlendMode.lighten;
        break;
    case 'ColorDodge':
        style = PdfBlendMode.colorDodge;
        break;
    case 'ColorBurn':
        style = PdfBlendMode.colorBurn;
        break;
    case 'HardLight':
        style = PdfBlendMode.hardLight;
        break;
    case 'SoftLight':
        style = PdfBlendMode.softLight;
        break;
    case 'Difference':
        style = PdfBlendMode.difference;
        break;
    case 'Exclusion':
        style = PdfBlendMode.exclusion;
        break;
    case 'Hue':
        style = PdfBlendMode.hue;
        break;
    case 'Saturation':
        style = PdfBlendMode.saturation;
        break;
    case 'Color':
        style = PdfBlendMode.color;
        break;
    case 'Luminosity':
        style = PdfBlendMode.luminosity;
        break;
    default:
        style = PdfBlendMode.normal;
        break;
    }
    return style;
}
/**
 * Convert float to string.
 *
 * @private
 * @param {number} value number value.
 * @returns {string} equal fixed length string value;
 */
export function _floatToString(value: number): string {
    let returnString: string = value.toFixed(2);
    if (returnString === '0.00') {
        returnString = '.00';
    }
    return returnString;
}
/**
 * Check and add proc set value.
 *
 * @private
 * @param {string} value entry.
 * @param {_PdfDictionary} dictionary source dictionary.
 * @returns {void} Nothing;
 */
export function _addProcSet(value: string, dictionary: _PdfDictionary): void {
    const name: _PdfName = _PdfName.get(value);
    if (dictionary.has('ProcSet')) {
        const procset: _PdfName[] = dictionary.getArray('ProcSet');
        if (procset && procset.indexOf(name) === -1) {
            procset.push(name);
            dictionary.update('ProcSet', procset);
        }
    } else {
        dictionary.update('ProcSet', [name]);
    }
}
/**
 * Get new GUID string.
 *
 * @private
 * @returns {string} A new GUID string;
 */
export function _getNewGuidString(): string {
    return 'aaaaaaaa-aaaa-4aaa-baaa-aaaaaaaaaaaa'.replace(/[ab]/g, (c: string) => {
        const random: number = Math.random() * 16 | 0;
        const result: number = c === 'a' ? random : (random & 0x3 | 0x8);
        return result.toString(16);
    });
}
/**
 * Escape PDF name.
 *
 * @private
 * @param {string} value name value.
 * @returns {string} equal and processed name value;
 */
export function _escapePdfName(value: string): string {
    const buffer: string[] = [];
    let start: number = 0;
    for (let i: number = 0; i < value.length; i++) {
        const char: number = value.charCodeAt(i);
        if (char < 0x21 ||
            char > 0x7e ||
            char === 0x23 ||
            char === 0x28 ||
            char === 0x29 ||
            char === 0x3c ||
            char === 0x3e ||
            char === 0x5b ||
            char === 0x5d ||
            char === 0x7b ||
            char === 0x7d ||
            char === 0x2f ||
            char === 0x25) {
            if (start < i) {
                buffer.push(value.substring(start, i));
            }
            buffer.push(`#${char.toString(16)}`);
            start = i + 1;
        }
    }
    if (buffer.length === 0) {
        return value;
    }
    if (start < value.length) {
        buffer.push(value.substring(start, value.length));
    }
    return buffer.join('');
}
/**
 * Calculate bezier arc points.
 *
 * @private
 * @param {number} x1 value.
 * @param {number} y1 value.
 * @param {number} x2 value.
 * @param {number} y2 value.
 * @param {number} start value.
 * @param {number} extent value.
 * @returns {number[]} bezier arc points;
 */
export function _getBezierArc(x1: number, y1: number, x2: number, y2: number, start: number, extent: number): number[] {
    if (x1 > x2) {
        const swap: number = x1;
        x1 = x2;
        x2 = swap;
    }
    if (y2 > y1) {
        const swap: number = y1;
        y1 = y2;
        y2 = swap;
    }
    let angle: number;
    let count: number;
    if (Math.abs(extent) <= 90) {
        angle = extent;
        count = 1;
    } else {
        count = Math.ceil(Math.abs(extent) / 90);
        angle = extent / count;
    }
    const first: number = ((x1 + x2) / 2);
    const second: number = ((y1 + y2) / 2);
    const firstAngle: number = ((x2 - x1) / 2);
    const secondAngle: number = ((y2 - y1) / 2);
    const half: number = (<number>(angle * (Math.PI / 360)));
    const value: number = (<number>(Math.abs(4.0 / 3.0 * (1.0 - Math.cos(half)) / Math.sin(half))));
    const points: number[] = [];
    for (let i: number = 0; (i < count); i++) {
        const zero: number = <number>(((start + (i * angle)) * (Math.PI / 180)));
        const one: number = <number>(((start + ((i + 1) * angle)) * (Math.PI / 180)));
        const cosZero: number = <number>(Math.cos(zero));
        const cosOne: number = <number>(Math.cos(one));
        const sinZero: number = <number>(Math.sin(zero));
        const sinOne: number = <number>(Math.sin(one));
        if ((angle > 0)) {
            points.push(first + (firstAngle * cosZero));
            points.push(second - (secondAngle * sinZero));
            points.push(first + (firstAngle * (cosZero - (value * sinZero))));
            points.push(second - (secondAngle * (sinZero + (value * cosZero))));
            points.push(first + (firstAngle * (cosOne + (value * sinOne))));
            points.push(second - (secondAngle * (sinOne - (value * cosOne))));
            points.push(first + (firstAngle * cosOne));
            points.push(second - (secondAngle * sinOne));
        } else {
            points.push(first + (firstAngle * cosZero));
            points.push(second - (secondAngle * sinZero));
            points.push(first + (firstAngle * (cosZero + (value * sinZero))));
            points.push(second - (secondAngle * (sinZero - (value * cosZero))));
            points.push(first + (firstAngle * (cosOne - (value * sinOne))));
            points.push(second - (secondAngle * (sinOne + (value * cosOne))));
            points.push(first + (firstAngle * cosOne));
            points.push(second - (secondAngle * sinOne));
        }
    }
    return points;
}
/**
 * Find page of the annotation.
 *
 * @private
 * @param {PdfDocument} document PDF document.
 * @param {_PdfReference} reference Annotation reference.
 * @returns {PdfPage} Page of the annotation;
 */
export function _findPage(document: PdfDocument, reference: _PdfReference): PdfPage {
    let page: PdfPage;
    for (let i: number = 0; i < document.pageCount && typeof page === 'undefined'; i++) {
        const entry: PdfPage = document.getPage(i);
        if (entry && entry._pageDictionary.has('Annots')) {
            const annots: _PdfReference[] = entry._pageDictionary.get('Annots');
            if (Array.isArray(annots) &&
                typeof page === 'undefined' &&
                annots.some((ref: _PdfReference) => ref instanceof _PdfReference && ref === reference)) {
                page = entry;
            }
        }
    }
    return page;
}
/**
 * Check the field is checked or not.
 *
 * @private
 * @param {_PdfDictionary} dictionary PDF dictionary.
 * @returns {boolean} True if the field is checked, otherwise false;
 */
export function _checkField(dictionary: _PdfDictionary): boolean {
    let check: boolean = false;
    if (dictionary.has('AS')) {
        const state: _PdfName = dictionary.get('AS');
        if (state) {
            check = state.name !== 'Off';
        } else {
            const actual: _PdfName = dictionary.get('V');
            if (actual) {
                check = actual.name === _getItemValue(dictionary);
            }
        }
    }
    return check;
}
/**
 * Get item value from state item field.
 *
 * @private
 * @param {_PdfDictionary} itemDictionary PDF document.
 * @returns {string} value of item;
 */
export function _getItemValue(itemDictionary: _PdfDictionary): string {
    let itemValue: string = '';
    let name: _PdfName;
    if (itemDictionary.has('AS')) {
        name = itemDictionary.get('AS');
        if (name !== null && name.name !== 'Off') {
            itemValue = name.name;
        }
    }
    if (itemValue === '' && itemDictionary.has('AP')) {
        const dictionary: _PdfDictionary = itemDictionary.get('AP');
        if (dictionary && dictionary.has('N')) {
            let appearance: _PdfBaseStream | _PdfDictionary = dictionary.get('N');
            if (appearance instanceof _PdfBaseStream) {
                appearance = appearance.dictionary;
            }
            if (appearance && appearance instanceof _PdfDictionary) {
                let hasKey: boolean = false;
                appearance.forEach((key: string, value: any) => { // eslint-disable-line
                    if (!hasKey && key !== 'off') {
                        itemValue = key;
                        hasKey = true;
                    }
                });
            }
        }
    }
    return itemValue;
}
/**
 * Get state item template.
 *
 * @private
 * @param {_PdfCheckFieldState} state Check field state.
 * @param {PdfStateItem | PdfField} item source to check.
 * @returns {PdfTemplate} Appearance template;
 */
export function _getStateTemplate(state: _PdfCheckFieldState, item: PdfStateItem | PdfField): PdfTemplate {
    const value: string = state === _PdfCheckFieldState.checked ? _getItemValue(item._dictionary) : 'Off';
    let template: PdfTemplate;
    if (item._dictionary.has('AP')) {
        const dictionary: _PdfDictionary = item._dictionary.get('AP');
        if (dictionary && dictionary.has('N')) {
            let appearance: _PdfBaseStream | _PdfDictionary = dictionary.get('N');
            if (appearance && appearance instanceof _PdfBaseStream) {
                appearance = appearance.dictionary;
            }
            if (appearance && appearance instanceof _PdfDictionary && (value && value !== '' && appearance.has(value))) {
                const stream: _PdfBaseStream = appearance.get(value);
                const reference: _PdfReference = appearance.getRaw(value);
                if (reference) {
                    stream.reference = reference;
                }
                if (stream) {
                    template = new PdfTemplate(stream, item._crossReference);
                }
            }
        }
    }
    return template;
}
/**
 * Get color value
 *
 * @private
 * @param {string} colorName name of the color.
 * @returns {number[]} return color value as number array.
 */
export function _getColorValue(colorName: string): number[] {
    let color: number[];
    switch (colorName) {
    case 'transparent':
        color = [255, 255, 255];
        break;
    case 'aliceblue':
        color = [240, 248, 255];
        break;
    case 'antiquewhite':
        color = [250, 235, 215];
        break;
    case 'aqua':
        color = [0, 255, 255];
        break;
    case 'aquamarine':
        color = [127, 255, 212];
        break;
    case 'azure':
        color = [240, 255, 255];
        break;
    case 'beige':
        color = [245, 245, 220];
        break;
    case 'bisque':
        color = [255, 228, 196];
        break;
    case 'black':
        color = [0, 0, 0];
        break;
    case 'blanchedalmond':
        color = [255, 235, 205];
        break;
    case 'blue':
        color = [0, 0, 255];
        break;
    case 'blueviolet':
        color = [138, 43, 226];
        break;
    case 'brown':
        color = [165, 42, 42];
        break;
    case 'burlywood':
        color = [222, 184, 135];
        break;
    case 'cadetBlue':
        color = [95, 158, 160];
        break;
    case 'chartreuse':
        color = [127, 255, 0];
        break;
    case 'chocolate':
        color = [210, 105, 30];
        break;
    case 'coral':
        color = [255, 127, 80];
        break;
    case 'cornflowerblue':
        color = [100, 149, 237];
        break;
    case 'cornsilk':
        color = [255, 248, 220];
        break;
    case 'crimson':
        color = [220, 20, 60];
        break;
    case 'cyan':
        color = [0, 255, 255];
        break;
    case 'darkblue':
        color = [0, 0, 139];
        break;
    case 'darkcyan':
        color = [0, 139, 139];
        break;
    case 'darkgoldenrod':
        color = [184, 134, 11];
        break;
    case 'darkgray':
        color = [169, 169, 169];
        break;
    case 'darkgreen':
        color = [0, 100, 0];
        break;
    case 'darkkhaki':
        color = [189, 183, 107];
        break;
    case 'darkmagenta':
        color = [139, 0, 139];
        break;
    case 'darkolivegreen':
        color = [85, 107, 47];
        break;
    case 'darkorange':
        color = [255, 140, 0];
        break;
    case 'darkorchid':
        color = [153, 50, 204];
        break;
    case 'darkred':
        color = [139, 0, 0];
        break;
    case 'darksalmon':
        color = [233, 150, 122];
        break;
    case 'darkseagreen':
        color = [143, 188, 139];
        break;
    case 'darkslateblue':
        color = [72, 61, 139];
        break;
    case 'darkslategray':
        color = [47, 79, 79];
        break;
    case 'darkturquoise':
        color = [0, 206, 209];
        break;
    case 'darkviolet':
        color = [148, 0, 211];
        break;
    case 'deeppink':
        color = [255, 20, 147];
        break;
    case 'deepskyblue':
        color = [0, 191, 255];
        break;
    case 'dimgray':
        color = [105, 105, 105];
        break;
    case 'dodgerblue':
        color = [30, 144, 255];
        break;
    case 'firebrick':
        color = [178, 34, 34];
        break;
    case 'floralwhite':
        color = [255, 250, 240];
        break;
    case 'forestgreen':
        color = [34, 139, 34];
        break;
    case 'fuchsia':
        color = [255, 0, 255];
        break;
    case 'gainsboro':
        color = [220, 220, 220];
        break;
    case 'ghostwhite':
        color = [248, 248, 255];
        break;
    case 'gold':
        color = [255, 215, 0];
        break;
    case 'goldenrod':
        color = [218, 165, 32];
        break;
    case 'gray':
        color = [128, 128, 128];
        break;
    case 'green':
        color = [0, 128, 0];
        break;
    case 'greenyellow':
        color = [173, 255, 47];
        break;
    case 'honeydew':
        color = [240, 255, 240];
        break;
    case 'hotpink':
        color = [255, 105, 180];
        break;
    case 'indianred':
        color = [205, 92, 92];
        break;
    case 'indigo':
        color = [75, 0, 130];
        break;
    case 'ivory':
        color = [255, 255, 240];
        break;
    case 'khaki':
        color = [240, 230, 140];
        break;
    case 'lavender':
        color = [230, 230, 250];
        break;
    case 'lavenderblush':
        color = [255, 240, 245];
        break;
    case 'lawngreen':
        color = [124, 252, 0];
        break;
    case 'lemonchiffon':
        color = [255, 250, 205];
        break;
    case 'lightblue':
        color = [173, 216, 230];
        break;
    case 'lightcoral':
        color = [240, 128, 128];
        break;
    case 'lightcyan':
        color = [224, 255, 255];
        break;
    case 'lightgoldenrodyellow':
        color = [250, 250, 210];
        break;
    case 'lightgreen':
        color = [144, 238, 144];
        break;
    case 'lightgray':
        color = [211, 211, 211];
        break;
    case 'LightPink':
        color = [255, 182, 193];
        break;
    case 'lightsalmon':
        color = [255, 160, 122];
        break;
    case 'lightseagreen':
        color = [32, 178, 170];
        break;
    case 'lightskyblue':
        color = [135, 206, 250];
        break;
    case 'lightslategray':
        color = [119, 136, 153];
        break;
    case 'lightsteelblue':
        color = [176, 196, 222];
        break;
    case 'lightyellow':
        color = [255, 255, 224];
        break;
    case 'lime':
        color = [0, 255, 0];
        break;
    case 'limeGreen':
        color = [50, 205, 50];
        break;
    case 'linen':
        color = [250, 240, 230];
        break;
    case 'magenta':
        color = [255, 0, 255];
        break;
    case 'maroon':
        color = [128, 0, 0];
        break;
    case 'mediumaquamarine':
        color = [102, 205, 170];
        break;
    case 'mediumblue':
        color = [0, 0, 205];
        break;
    case 'mediumorchid':
        color = [186, 85, 211];
        break;
    case 'mediumpurple':
        color = [147, 112, 219];
        break;
    case 'mediumseagreen':
        color = [60, 179, 113];
        break;
    case 'mediumslateblue':
        color = [123, 104, 238];
        break;
    case 'mediumspringgreen':
        color = [0, 250, 154];
        break;
    case 'mediumturquoise':
        color = [72, 209, 204];
        break;
    case 'mediumvioletred':
        color = [199, 21, 133];
        break;
    case 'midnightblue':
        color = [25, 25, 112];
        break;
    case 'mintcream':
        color = [245, 255, 250];
        break;
    case 'mistyrose':
        color = [255, 228, 225];
        break;
    case 'moccasin':
        color = [255, 228, 181];
        break;
    case 'navajowhite':
        color = [255, 222, 173];
        break;
    case 'navy':
        color = [0, 0, 128];
        break;
    case 'oldLace':
        color = [253, 245, 230];
        break;
    case 'olive':
        color = [128, 128, 0];
        break;
    case 'olivedrab':
        color = [107, 142, 35];
        break;
    case 'orange':
        color = [255, 165, 0];
        break;
    case 'orangered':
        color = [255, 69, 0];
        break;
    case 'orchid':
        color = [218, 112, 214];
        break;
    case 'palegoldenrod':
        color = [238, 232, 170];
        break;
    case 'palegreen':
        color = [152, 251, 152];
        break;
    case 'paleturquoise':
        color = [175, 238, 238];
        break;
    case 'palebioletred':
        color = [219, 112, 147];
        break;
    case 'papayawhip':
        color = [255, 239, 213];
        break;
    case 'peachpuff':
        color = [255, 218, 185];
        break;
    case 'peru':
        color = [205, 133, 63];
        break;
    case 'pink':
        color = [255, 192, 203];
        break;
    case 'plum':
        color = [221, 160, 221];
        break;
    case 'powderblue':
        color = [176, 224, 230];
        break;
    case 'purple':
        color = [128, 0, 128];
        break;
    case 'red':
        color = [255, 0, 0];
        break;
    case 'rosybrown':
        color = [188, 143, 143];
        break;
    case 'royalblue':
        color = [65, 105, 225];
        break;
    case 'saddlebrown':
        color = [139, 69, 19];
        break;
    case 'salmon':
        color = [250, 128, 114];
        break;
    case 'sandybrown':
        color = [244, 164, 96];
        break;
    case 'seagreen':
        color = [46, 139, 87];
        break;
    case 'seashell':
        color = [255, 245, 238];
        break;
    case 'sienna':
        color = [160, 82, 45];
        break;
    case 'silver':
        color = [192, 192, 192];
        break;
    case 'skyblue':
        color = [135, 206, 235];
        break;
    case 'slateblue':
        color = [106, 90, 205];
        break;
    case 'slategray':
        color = [112, 128, 144];
        break;
    case 'snow':
        color = [255, 250, 250];
        break;
    case 'springgreen':
        color = [0, 255, 127];
        break;
    case 'steelblue':
        color = [70, 130, 180];
        break;
    case 'tan':
        color = [210, 180, 140];
        break;
    case 'teal':
        color = [0, 128, 128];
        break;
    case 'thistle':
        color = [216, 191, 216];
        break;
    case 'tomato':
        color = [255, 99, 71];
        break;
    case 'turquoise':
        color = [64, 224, 208];
        break;
    case 'violet':
        color = [238, 130, 238];
        break;
    case 'wheat':
        color = [245, 222, 179];
        break;
    case 'white':
        color = [255, 255, 255];
        break;
    case 'whitesmoke':
        color = [245, 245, 245];
        break;
    case 'yellow':
        color = [255, 255, 0];
        break;
    case 'yellowgreen':
        color = [154, 205, 50];
        break;
    }
    return color;
}
/**
 * Update box value in template bounds.
 *
 * @private
 * @param {PdfTemplate} template Template object.
 * @param {number} angle Angle value.
 * @param {PdfRubberStampAnnotation} annotation Rubberstamp annotation.
 * @returns {void} Nothing.
 */
export function _setMatrix(template: PdfTemplate, angle?: number, annotation?: PdfRubberStampAnnotation): void {
    const box: number[] = template._content.dictionary.getArray('BBox');
    let centerX: number = 0.1;
    let centerY: number = 0.1;
    if (box && typeof angle !== 'undefined' && angle !== null) {
        if (angle === 0) {
            template._content.dictionary.set('Matrix', [1, 0, 0, 1, -box[0], -box[1]]);
        } else {
            const matrix: _PdfTransformationMatrix = new _PdfTransformationMatrix();
            if (angle === 90) {
                matrix._translate(box[3], -box[0]);
            } else if (angle === 180) {
                matrix._translate(box[2], box[3]);
            } else if (angle === 270) {
                matrix._translate(-box[1], box[2]);
            }
            if (angle % 90 !== 0 && annotation && annotation instanceof PdfRubberStampAnnotation) {
                let box0: number;
                let box1: number;
                if (box && Array.isArray(box) && box.length > 1) {
                    box0 = box[0];
                    box1 = box[1];
                }
                const w: number = annotation.bounds.width;
                const h: number = annotation.bounds.height;
                if (typeof box0 === 'number' && typeof box1 === 'number' && box0 !== 0 && box1 !== 0) {
                    const width: number = _getCenterX(angle, box, centerX, annotation);
                    const height: number = _getCenterY(angle, box, centerY, annotation);
                    if (width > 0) {
                        if (w > width) {
                            while (
                                Math.round(w * 10) / 10 !== Math.round(_getCenterX(angle, box, centerX, annotation) * 10) / 10 &&
                                Math.round(w * 10) / 10 > Math.round(_getCenterX(angle, box, centerX, annotation) * 10) / 10
                            ) {
                                centerX += 0.1;
                            }
                        } else {
                            while (
                                Math.round(w * 10) / 10 !== Math.round(_getCenterX(angle, box, centerX, annotation) * 10) / 10 &&
                                Math.round(w * 10) / 10 < Math.round(_getCenterX(angle, box, centerX, annotation) * 10) / 10
                            ) {
                                centerX -= 0.1;
                            }
                        }
                    } else {
                        while (
                            Math.round(w * 10) / 10 !== Math.round(_getCenterX(angle, box, centerX, annotation) * 10) / 10 &&
                            Math.round(w * 10) / 10 > Math.round(_getCenterX(angle, box, centerX, annotation) * 10) / 10
                        ) {
                            centerX += 0.1;
                        }
                    }
                    if (height > 0) {
                        if (h > height) {
                            while (
                                Math.round(h * 10) / 10 !== Math.round(_getCenterY(angle, box, centerY, annotation) * 10) / 10 &&
                                Math.round(h * 10) / 10 > Math.round(_getCenterY(angle, box, centerY, annotation) * 10) / 10
                            ) {
                                centerY += 0.1;
                            }
                        } else {
                            while (
                                Math.round(h * 10) / 10 !== Math.round(_getCenterY(angle, box, centerY, annotation) * 10) / 10 &&
                                Math.round(h * 10) / 10 < Math.round(_getCenterY(angle, box, centerY, annotation) * 10) / 10
                            ) {
                                centerY -= 0.1;
                            }
                        }
                    } else {
                        while (
                            Math.round(h * 10) / 10 !== Math.round(_getCenterY(angle, box, centerY, annotation) * 10) / 10 &&
                            Math.round(h * 10) / 10 > Math.round(_getCenterY(angle, box, centerY, annotation) * 10) / 10
                        ) {
                            centerY += 0.1;
                        }
                    }
                    matrix._translate(centerX, centerY);
                } else {
                    const targetCenterX: number = Math.abs(annotation.bounds.width -
                        Math.round(_getCenterX(angle, box, centerX, annotation)));
                    const targetCenterY: number = Math.abs(annotation.bounds.height -
                        Math.round(_getCenterY(angle, box, centerY, annotation)));
                    if (Math.round(annotation.bounds.width) > centerX) {
                        centerX = Math.round(targetCenterX / centerX) * centerX;
                    }
                    if (Math.round(annotation.bounds.width) > centerY) {
                        centerY = Math.round(targetCenterY / centerY) * centerY;
                    }
                    matrix._translate(centerX, centerY);
                }
            }
            matrix._rotate(angle);
            template._content.dictionary.set('Matrix', matrix._matrix._elements);
        }
    }
}
/**
 * Computes the center X-coordinate after transforming the bounding box by a rotation matrix.
 *
 * @private
 * @param {number} angle The rotation angle in degrees.
 * @param {number[]} bbox The bounding box represented as an array of four numbers [x, y, width, height].
 * @param {number} x The original center X-coordinate.
 * @param {PdfRubberStampAnnotation} annotation The annotation to be transformed.
 * @returns {number} The transformed center X-coordinate.
 */
export function _getCenterX(angle: number, bbox: number[], x: number, annotation: PdfRubberStampAnnotation): number {
    const matrix: _PdfTransformationMatrix = new _PdfTransformationMatrix();
    matrix._translate(x, x);
    matrix._rotate(angle);
    const rectangleF: number[] = annotation._transformBBox({x: bbox[0], y: bbox[1], width: bbox[2], height: bbox[3]},
                                                           matrix._matrix._elements);
    return rectangleF[2];
}
/**
 * Computes the center Y-coordinate after transforming the bounding box by a rotation matrix.
 *
 * @private
 * @param {number} angle The rotation angle in degrees.
 * @param {number[]} bbox The bounding box represented as an array of four numbers [x, y, width, height].
 * @param {number} y The original center Y-coordinate.
 * @param {PdfRubberStampAnnotation} annotation The annotation to be transformed.
 * @returns {number} The transformed center Y-coordinate.
 */
export function _getCenterY(angle: number, bbox: number[], y: number, annotation: PdfRubberStampAnnotation): number {
    const matrix: _PdfTransformationMatrix = new _PdfTransformationMatrix();
    matrix._translate(y, y);
    matrix._rotate(angle);
    const rectangleF: number[] = annotation._transformBBox({x: bbox[0], y: bbox[1], width: bbox[2], height: bbox[3]},
                                                           matrix._matrix._elements);
    return rectangleF[3];
}
/**
 * Get the state item style to string
 *
 * @private
 * @param {PdfCheckBoxStyle} style State item style.
 * @returns {string} return as string value.
 */
export function _styleToString(style: PdfCheckBoxStyle): string {
    let value: string = '4';
    switch (style) {
    case PdfCheckBoxStyle.circle:
        value = 'l';
        break;
    case PdfCheckBoxStyle.cross:
        value = '8';
        break;
    case PdfCheckBoxStyle.diamond:
        value = 'u';
        break;
    case PdfCheckBoxStyle.square:
        value = 'n';
        break;
    case PdfCheckBoxStyle.star:
        value = 'H';
        break;
    }
    return value;
}
/**
 * Get the string to state item style
 *
 * @private
 * @param {string} style State item style as string.
 * @returns {PdfCheckBoxStyle} return as state item style.
 */
export function _stringToStyle(style: string): PdfCheckBoxStyle {
    let value: PdfCheckBoxStyle = PdfCheckBoxStyle.check;
    switch (style) {
    case 'l':
        value = PdfCheckBoxStyle.circle;
        break;
    case '8':
        value = PdfCheckBoxStyle.cross;
        break;
    case 'u':
        value = PdfCheckBoxStyle.diamond;
        break;
    case 'n':
        value = PdfCheckBoxStyle.square;
        break;
    case 'H':
        value = PdfCheckBoxStyle.star;
        break;
    }
    return value;
}
/**
 * Map measurement unit type.
 *
 * @private
 * @param {string} unitString measurement unit as string.
 * @returns {PdfMeasurementUnit} measurement unit.
 */
export function _mapMeasurementUnit(unitString: string): PdfMeasurementUnit {
    let unit: PdfMeasurementUnit;
    switch (unitString) {
    case 'cm':
        unit = PdfMeasurementUnit.centimeter;
        break;
    case 'in':
        unit = PdfMeasurementUnit.inch;
        break;
    case 'mm':
        unit = PdfMeasurementUnit.millimeter;
        break;
    case 'p':
        unit = PdfMeasurementUnit.pica;
        break;
    case 'pt':
        unit = PdfMeasurementUnit.point;
        break;
    default:
        unit = PdfMeasurementUnit.centimeter;
        break;
    }
    return unit;
}
/**
 * Map markup annotation type.
 *
 * @private
 * @param {string} text markup type as string.
 * @returns {PdfTextMarkupAnnotationType} markup type as name.
 */
export function _mapMarkupAnnotationType(text: string): PdfTextMarkupAnnotationType {
    let type: PdfTextMarkupAnnotationType;
    switch (text) {
    case 'Highlight':
        type = PdfTextMarkupAnnotationType.highlight;
        break;
    case 'Squiggly':
        type = PdfTextMarkupAnnotationType.squiggly;
        break;
    case 'StrikeOut':
        type = PdfTextMarkupAnnotationType.strikeOut;
        break;
    case 'Underline':
        type = PdfTextMarkupAnnotationType.underline;
        break;
    default:
        type = PdfTextMarkupAnnotationType.highlight;
        break;
    }
    return type;
}
/**
 * Reverse text markup annotation type.
 *
 * @private
 * @param {PdfTextMarkupAnnotationType} type markup type.
 * @returns {string} markup type as name.
 */
export function _reverseMarkupAnnotationType(type: PdfTextMarkupAnnotationType): string {
    let token: string = 'Highlight';
    switch (type) {
    case PdfTextMarkupAnnotationType.highlight:
        token = 'Highlight';
        break;
    case PdfTextMarkupAnnotationType.squiggly:
        token = 'Squiggly';
        break;
    case PdfTextMarkupAnnotationType.strikeOut:
        token = 'StrikeOut';
        break;
    case PdfTextMarkupAnnotationType.underline:
        token = 'Underline';
        break;
    default:
        token = 'Highlight';
        break;
    }
    return token;
}
/**
 * Map graphics unit.
 *
 * @private
 * @param {string} unitString String value.
 * @returns {_PdfGraphicsUnit} PDF graphics unit.
 */
export function _mapGraphicsUnit(unitString: string): _PdfGraphicsUnit {
    let unit: _PdfGraphicsUnit;
    switch (unitString) {
    case 'cm':
        unit = _PdfGraphicsUnit.centimeter;
        break;
    case 'in':
        unit = _PdfGraphicsUnit.inch;
        break;
    case 'mm':
        unit = _PdfGraphicsUnit.millimeter;
        break;
    case 'p':
        unit = _PdfGraphicsUnit.pica;
        break;
    case 'pt':
        unit = _PdfGraphicsUnit.point;
        break;
    default:
        unit = _PdfGraphicsUnit.centimeter;
        break;
    }
    return unit;
}
/**
 * Map rubber stamp icon.
 *
 * @param {string} iconString String value.
 * @returns {PdfRubberStampAnnotationIcon} Rubber stamp icon.
 */
export function _mapRubberStampIcon(iconString: string): PdfRubberStampAnnotationIcon {
    let icon: PdfRubberStampAnnotationIcon;
    switch (iconString) {
    case '#Approved':
    case 'SBApproved':
        icon = PdfRubberStampAnnotationIcon.approved;
        break;
    case '#AsIs':
    case 'SBAsIs':
        icon = PdfRubberStampAnnotationIcon.asIs;
        break;
    case '#Completed':
    case 'SBCompleted':
        icon = PdfRubberStampAnnotationIcon.completed;
        break;
    case '#Confidential':
    case 'SBConfidential':
        icon = PdfRubberStampAnnotationIcon.confidential;
        break;
    case '#Departmental':
    case 'SBDepartmental':
        icon = PdfRubberStampAnnotationIcon.departmental;
        break;
    case '#Draft':
    case 'SBDraft':
        icon = PdfRubberStampAnnotationIcon.draft;
        break;
    case '#Experimental':
    case 'SBExperimental':
        icon = PdfRubberStampAnnotationIcon.experimental;
        break;
    case '#Expired':
    case 'SBExpired':
        icon = PdfRubberStampAnnotationIcon.expired;
        break;
    case '#Final':
    case 'SBFinal':
        icon = PdfRubberStampAnnotationIcon.final;
        break;
    case '#ForComment':
    case 'SBForComment':
        icon = PdfRubberStampAnnotationIcon.forComment;
        break;
    case '#ForPublicRelease':
    case 'SBForPublicRelease':
        icon = PdfRubberStampAnnotationIcon.forPublicRelease;
        break;
    case '#InformationOnly':
    case 'SBInformationOnly':
        icon = PdfRubberStampAnnotationIcon.informationOnly;
        break;
    case '#NotApproved':
    case 'SBNotApproved':
        icon = PdfRubberStampAnnotationIcon.notApproved;
        break;
    case '#NotForPublicRelease':
    case 'SBNotForPublicRelease':
        icon = PdfRubberStampAnnotationIcon.notForPublicRelease;
        break;
    case '#PreliminaryResults':
    case 'SBPreliminaryResults':
        icon = PdfRubberStampAnnotationIcon.preliminaryResults;
        break;
    case '#Sold':
    case 'SBSold':
        icon = PdfRubberStampAnnotationIcon.sold;
        break;
    case '#TopSecret':
    case 'SBTopSecret':
        icon = PdfRubberStampAnnotationIcon.topSecret;
        break;
    case '#Void':
    case 'SBVoid':
        icon = PdfRubberStampAnnotationIcon.void;
        break;
    default:
        icon = PdfRubberStampAnnotationIcon.draft;
        break;
    }
    return icon;
}
/**
 * Map popup icon.
 *
 * @private
 * @param {string} iconString String value.
 * @returns {PdfRubberStampAnnotationIcon} Popup icon.
 */
export function _mapPopupIcon(iconString: string): PdfPopupIcon {
    let icon: PdfPopupIcon;
    switch (iconString) {
    case 'Note':
        icon = PdfPopupIcon.note;
        break;
    case 'Comment':
        icon = PdfPopupIcon.comment;
        break;
    case 'Help':
        icon = PdfPopupIcon.help;
        break;
    case 'Insert':
        icon = PdfPopupIcon.insert;
        break;
    case 'Key':
        icon = PdfPopupIcon.key;
        break;
    case 'NewParagraph':
        icon = PdfPopupIcon.newParagraph;
        break;
    case 'Paragraph':
        icon = PdfPopupIcon.paragraph;
        break;
    default:
        icon = PdfPopupIcon.note;
        break;
    }
    return icon;
}
/**
 * Convert annotation state to string value.
 *
 * @private
 * @param {PdfAnnotationState} type Annotation state.
 * @returns {string} String value.
 */
export function _reverseMapAnnotationState(type: PdfAnnotationState): string {
    let token: string = 'None';
    switch (type) {
    case PdfAnnotationState.none:
        token = 'None';
        break;
    case PdfAnnotationState.accepted:
        token = 'Accepted';
        break;
    case PdfAnnotationState.rejected:
        token = 'Rejected';
        break;
    case PdfAnnotationState.cancel:
        token = 'Cancelled';
        break;
    case PdfAnnotationState.completed:
        token = 'Completed';
        break;
    case PdfAnnotationState.marked:
        token = 'Marked';
        break;
    case PdfAnnotationState.unmarked:
        token = 'Unmarked';
        break;
    case PdfAnnotationState.unknown:
        token = 'Unknown';
        break;
    default:
        token = 'None';
        break;
    }
    return token;
}
/**
 * Convert string value to annotation state.
 *
 * @private
 * @param {string} type String value.
 * @returns {PdfAnnotationState} Annotation state.
 */
export function _mapAnnotationState(type: string): PdfAnnotationState {
    let token: PdfAnnotationState = PdfAnnotationState.none;
    switch (type) {
    case 'None':
        token = PdfAnnotationState.none;
        break;
    case 'Accepted':
        token = PdfAnnotationState.accepted;
        break;
    case 'Rejected':
        token = PdfAnnotationState.rejected;
        break;
    case 'Cancelled':
        token = PdfAnnotationState.cancel;
        break;
    case 'Completed':
        token = PdfAnnotationState.completed;
        break;
    case 'Marked':
        token = PdfAnnotationState.marked;
        break;
    case 'Unmarked':
        token = PdfAnnotationState.unmarked;
        break;
    case 'Unknown':
        token = PdfAnnotationState.unknown;
        break;
    }
    return token;
}
/**
 * Convert annotation state model to string value.
 *
 * @private
 * @param {PdfAnnotationStateModel} type Annotation state model.
 * @returns {string} String value.
 */
export function _reverseMapAnnotationStateModel(type: PdfAnnotationStateModel): string {
    let token: string = 'None';
    switch (type) {
    case PdfAnnotationStateModel.none:
        token = 'None';
        break;
    case PdfAnnotationStateModel.marked:
        token = 'Marked';
        break;
    case PdfAnnotationStateModel.review:
        token = 'Review';
        break;
    default:
        token = 'None';
        break;
    }
    return token;
}
/**
 * Convert string value to annotation state model.
 *
 * @private
 * @param {string} type String value.
 * @returns {PdfAnnotationStateModel} Annotation state model.
 */
export function _mapAnnotationStateModel(type: string): PdfAnnotationStateModel {
    let token: PdfAnnotationStateModel = PdfAnnotationStateModel.none;
    switch (type) {
    case 'None':
        token = PdfAnnotationStateModel.none;
        break;
    case 'Marked':
        token = PdfAnnotationStateModel.marked;
        break;
    case 'Review':
        token = PdfAnnotationStateModel.review;
        break;
    }
    return token;
}
/**
 * Map attachment icon.
 *
 * @private
 * @param {string} iconString String value.
 * @returns {PdfAttachmentIcon} Icon.
 */
export function _mapAttachmentIcon(iconString: string): PdfAttachmentIcon {
    let icon: PdfAttachmentIcon;
    switch (iconString) {
    case 'PushPin':
        icon = PdfAttachmentIcon.pushPin;
        break;
    case 'Tag':
        icon = PdfAttachmentIcon.tag;
        break;
    case 'Graph':
        icon = PdfAttachmentIcon.graph;
        break;
    case 'Paperclip':
        icon = PdfAttachmentIcon.paperClip;
        break;
    default:
        icon = PdfAttachmentIcon.pushPin;
        break;
    }
    return icon;
}
/**
 * Map attachment intent.
 *
 * @private
 * @param {string} intentString String value.
 * @returns {PdfAnnotationIntent} intent.
 */
export function _mapAnnotationIntent(intentString: string): PdfAnnotationIntent {
    let intent: PdfAnnotationIntent;
    switch (intentString) {
    case 'None':
        intent = PdfAnnotationIntent.none;
        break;
    case 'FreeTextCallout':
        intent = PdfAnnotationIntent.freeTextCallout;
        break;
    case 'FreeTextTypeWriter':
        intent = PdfAnnotationIntent.freeTextTypeWriter;
        break;
    default:
        intent = PdfAnnotationIntent.none;
        break;
    }
    return intent;
}
/**
 * Convert PDF font style to string value.
 *
 * @private
 * @param {PdfFontStyle} style Font style.
 * @returns {string} String value.
 */
export function _reverseMapPdfFontStyle(style: PdfFontStyle): string {
    const value: string[] = [];
    if ((style & PdfFontStyle.bold) > 0) {
        value.push('Bold');
    }
    if ((style & PdfFontStyle.italic) > 0) {
        value.push('Italic');
    }
    if ((style & PdfFontStyle.underline) > 0) {
        value.push('Underline');
    }
    if ((style & PdfFontStyle.strikeout) > 0) {
        value.push('Strikeout');
    }
    if (value.length === 0) {
        return 'Regular';
    }
    return value.join(', ');
}
/**
 * Get special character.
 *
 * @private
 * @param {string} input Input string.
 * @returns {string} String value.
 */
export function _getSpecialCharacter(input: string): string {
    let result: string;
    switch (input) {
    case 'head2right':
        result = '\u27A2';
        break;
    case 'aacute':
        result = 'a\u0301';
        break;
    case 'eacute':
        result = 'e\u0301';
        break;
    case 'iacute':
        result = 'i\u0301';
        break;
    case 'oacute':
        result = 'o\u0301';
        break;
    case 'uacute':
        result = 'u\u0301';
        break;
    case 'circleright':
        result = '\u27B2';
        break;
    case 'bleft':
        result = '\u21E6';
        break;
    case 'bright':
        result = '\u21E8';
        break;
    case 'bup':
        result = '\u21E7';
        break;
    case 'bdown':
        result = '\u21E9';
        break;
    case 'barb4right':
        result = '\u2794';
        break;
    case 'bleftright':
        result = '\u2B04';
        break;
    case 'bupdown':
        result = '\u21F3';
        break;
    case 'bnw':
        result = '\u2B00';
        break;
    case 'bne':
        result = '\u2B01';
        break;
    case 'bsw':
        result = '\u2B03';
        break;
    case 'bse':
        result = '\u2B02';
        break;
    case 'bdash1':
        result = '\u25AD';
        break;
    case 'bdash2':
        result = '\u25AB';
        break;
    case 'xmarkbld':
        result = '\u2717';
        break;
    case 'checkbld':
        result = '\u2713';
        break;
    case 'boxxmarkbld':
        result = '\u2612';
        break;
    case 'boxcheckbld':
        result = '\u2611';
        break;
    case 'space':
        result = '\u0020';
        break;
    case 'pencil':
        result = '\u270F';
        break;
    case 'scissors':
        result = '\u2702';
        break;
    case 'scissorscutting':
        result = '\u2701';
        break;
    case 'readingglasses':
        result = '\u2701';
        break;
    case 'bell':
        result = '\u2701';
        break;
    case 'book':
        result = '\u2701';
        break;
    case 'telephonesolid':
        result = '\u2701';
        break;
    case 'telhandsetcirc':
        result = '\u2701';
        break;
    case 'envelopeback':
        result = '\u2701';
        break;
    case 'hourglass':
        result = '\u231B';
        break;
    case 'keyboard':
        result = '\u2328';
        break;
    case 'tapereel':
        result = '\u2707';
        break;
    case 'handwrite':
        result = '\u270D';
        break;
    case 'handv':
        result = '\u270C';
        break;
    case 'handptleft':
        result = '\u261C';
        break;
    case 'handptright':
        result = '\u261E';
        break;
    case 'handptup':
        result = '\u261D';
        break;
    case 'handptdown':
        result = '\u261F';
        break;
    case 'smileface':
        result = '\u263A';
        break;
    case 'frownface':
        result = '\u2639';
        break;
    case 'skullcrossbones':
        result = '\u2620';
        break;
    case 'flag':
        result = '\u2690';
        break;
    case 'pennant':
        result = '\u1F6A9';
        break;
    case 'airplane':
        result = '\u2708';
        break;
    case 'sunshine':
        result = '\u263C';
        break;
    case 'droplet':
        result = '\u1F4A7';
        break;
    case 'snowflake':
        result = '\u2744';
        break;
    case 'crossshadow':
        result = '\u271E';
        break;
    case 'crossmaltese':
        result = '\u2720';
        break;
    case 'starofdavid':
        result = '\u2721';
        break;
    case 'crescentstar':
        result = '\u262A';
        break;
    case 'yinyang':
        result = '\u262F';
        break;
    case 'om':
        result = '\u0950';
        break;
    case 'wheel':
        result = '\u2638';
        break;
    case 'aries':
        result = '\u2648';
        break;
    case 'taurus':
        result = '\u2649';
        break;
    case 'gemini':
        result = '\u264A';
        break;
    case 'cancer':
        result = '\u264B';
        break;
    case 'leo':
        result = '\u264C';
        break;
    case 'virgo':
        result = '\u264D';
        break;
    case 'libra':
        result = '\u264E';
        break;
    case 'scorpio':
        result = '\u264F';
        break;
    case 'saggitarius':
        result = '\u2650';
        break;
    case 'capricorn':
        result = '\u2651';
        break;
    case 'aquarius':
        result = '\u2652';
        break;
    case 'pisces':
        result = '\u2653';
        break;
    case 'ampersanditlc':
        result = '\u0026';
        break;
    case 'ampersandit':
        result = '\u0026';
        break;
    case 'circle6':
        result = '\u25CF';
        break;
    case 'circleshadowdwn':
        result = '\u274D';
        break;
    case 'square6':
        result = '\u25A0';
        break;
    case 'box3':
        result = '\u25A1';
        break;
    case 'boxshadowdwn':
        result = '\u2751';
        break;
    case 'boxshadowup':
        result = '\u2752';
        break;
    case 'lozenge4':
        result = '\u2B27';
        break;
    case 'lozenge6':
        result = '\u29EB';
        break;
    case 'rhombus6':
        result = '\u25C6';
        break;
    case 'xrhombus':
        result = '\u2756';
        break;
    case 'rhombus4':
        result = '\u2B25';
        break;
    case 'clear':
        result = '\u2327';
        break;
    case 'escape':
        result = '\u2353';
        break;
    case 'command':
        result = '\u2318';
        break;
    case 'rosette':
        result = '\u2740';
        break;
    case 'rosettesolid':
        result = '\u273F';
        break;
    case 'quotedbllftbld':
        result = '\u275D';
        break;
    case 'quotedblrtbld':
        result = '\u275E';
        break;
    case '.notdef':
        result = '\u25AF';
        break;
    case 'zerosans':
        result = '\u24EA';
        break;
    case 'onesans':
        result = '\u2460';
        break;
    case 'twosans':
        result = '\u2461';
        break;
    case 'threesans':
        result = '\u2462';
        break;
    case 'foursans':
        result = '\u2463';
        break;
    case 'fivesans':
        result = '\u2464';
        break;
    case 'sixsans':
        result = '\u2465';
        break;
    case 'sevensans':
        result = '\u2466';
        break;
    case 'eightsans':
        result = '\u2467';
        break;
    case 'ninesans':
        result = '\u2468';
        break;
    case 'tensans':
        result = '\u2469';
        break;
    case 'zerosansinv':
        result = '\u24FF';
        break;
    case 'onesansinv':
        result = '\u2776';
        break;
    case 'twosansinv':
        result = '\u2777';
        break;
    case 'threesansinv':
        result = '\u2778';
        break;
    case 'foursansinv':
        result = '\u2779';
        break;
    case 'circle2':
        result = '\u00B7';
        break;
    case 'circle4':
        result = '\u2022';
        break;
    case 'square2':
        result = '\u25AA';
        break;
    case 'ring2':
        result = '\u25CB';
        break;
    case 'ringbutton2':
        result = '\u25C9';
        break;
    case 'target':
        result = '\u25CE';
        break;
    case 'square4':
        result = '\u25AA';
        break;
    case 'box2':
        result = '\u25FB';
        break;
    case 'crosstar2':
        result = '\u2726';
        break;
    case 'pentastar2':
        result = '\u2605';
        break;
    case 'hexstar2':
        result = '\u2736';
        break;
    case 'octastar2':
        result = '\u2734';
        break;
    case 'dodecastar3':
        result = '\u2739';
        break;
    case 'octastar4':
        result = '\u2735';
        break;
    case 'registercircle':
        result = '\u2316';
        break;
    case 'cuspopen':
        result = '\u27E1';
        break;
    case 'cuspopen1':
        result = '\u2311';
        break;
    case 'circlestar':
        result = '\u2605';
        break;
    case 'starshadow':
        result = '\u2730';
        break;
    case 'deleteleft':
        result = '\u232B';
        break;
    case 'deleteright':
        result = '\u2326';
        break;
    case 'scissorsoutline':
        result = '\u2704';
        break;
    case 'telephone':
        result = '\u260F';
        break;
    case 'telhandset':
        result = '\u1F4DE';
        break;
    case 'handptlft1':
        result = '\u261C';
        break;
    case 'handptrt1':
        result = '\u261E';
        break;
    case 'handptlftsld1':
        result = '\u261A';
        break;
    case 'handptrtsld1':
        result = '\u261B';
        break;
    case 'handptup1':
        result = '\u261D';
        break;
    case 'handptdwn1':
        result = '\u261F';
        break;
    case 'xmark':
        result = '\u2717';
        break;
    case 'check':
        result = '\u2713';
        break;
    case 'boxcheck':
        result = '\u2611';
        break;
    case 'boxx':
        result = '\u2612';
        break;
    case 'boxxbld':
        result = '\u2612';
        break;
    case 'circlex':
        result = '=\u2314';
        break;
    case 'circlexbld':
        result = '\u2314';
        break;
    case 'prohibit':
    case 'prohibitbld':
        result = '\u29B8';
        break;
    case 'ampersanditaldm':
    case 'ampersandbld':
    case 'ampersandsans':
    case 'ampersandsandm':
        result = '\u0026';
        break;
    case 'interrobang':
    case 'interrobangdm':
    case 'interrobangsans':
    case 'interrobngsandm':
        result = '\u203D';
        break;
    case 'sacute':
        result = 'ś';
        break;
    case 'Sacute':
        result = 'Ś';
        break;
    case 'eogonek':
        result = 'ę';
        break;
    case 'cacute':
        result = 'ć';
        break;
    case 'aogonek':
        result = 'ą';
        break;
    default:
        result = input;
        break;
    }
    return result;
}
/**
 * Get latin character.
 *
 * @private
 * @param {string} input Input string.
 * @returns {string} String value.
 */
export function _getLatinCharacter(input: string): string {
    let result: string;
    switch (input) {
    case 'zero':
        result = '0';
        break;
    case 'one':
        result = '1';
        break;
    case 'two':
        result = '2';
        break;
    case 'three':
        result = '3';
        break;
    case 'four':
        result = '4';
        break;
    case 'five':
        result = '5';
        break;
    case 'six':
        result = '6';
        break;
    case 'seven':
        result = '7';
        break;
    case 'eight':
        result = '8';
        break;
    case 'nine':
        result = '9';
        break;
    case 'aacute':
        result = 'á';
        break;
    case 'asciicircum':
        result = '^';
        break;
    case 'asciitilde':
        result = '~';
        break;
    case 'asterisk':
        result = '*';
        break;
    case 'at':
        result = '@';
        break;
    case 'atilde':
        result = 'ã';
        break;
    case 'backslash':
        result = '\\';
        break;
    case 'bar':
        result = '|';
        break;
    case 'braceleft':
        result = '{';
        break;
    case 'braceright':
        result = '}';
        break;
    case 'bracketleft':
        result = '[';
        break;
    case 'bracketright':
        result = ']';
        break;
    case 'breve':
        result = '˘';
        break;
    case 'brokenbar':
        result = '|';
        break;
    case 'bullet3':
        result = '•';
        break;
    case 'bullet':
        result = '•';
        break;
    case 'caron':
        result = 'ˇ';
        break;
    case 'ccedilla':
        result = 'ç';
        break;
    case 'cedilla':
        result = '¸';
        break;
    case 'cent':
        result = '¢';
        break;
    case 'circumflex':
        result = 'ˆ';
        break;
    case 'colon':
        result = ':';
        break;
    case 'comma':
        result = ',';
        break;
    case 'copyright':
        result = '©';
        break;
    case 'currency1':
        result = '¤';
        break;
    case 'dagger':
        result = '†';
        break;
    case 'daggerdbl':
        result = '‡';
        break;
    case 'degree':
        result = '°';
        break;
    case 'dieresis':
        result = '¨';
        break;
    case 'divide':
        result = '÷';
        break;
    case 'dollar':
        result = '$';
        break;
    case 'dotaccent':
        result = '˙';
        break;
    case 'dotlessi':
        result = 'ı';
        break;
    case 'eacute':
        result = 'é';
        break;
    case 'middot':
        result = '˙';
        break;
    case 'edieresis':
        result = 'ë';
        break;
    case 'egrave':
        result = 'è';
        break;
    case 'ellipsis':
        result = '...';
        break;
    case 'emdash':
        result = '—';
        break;
    case 'endash':
        result = '–';
        break;
    case 'equal':
        result = '=';
        break;
    case 'eth':
        result = 'ð';
        break;
    case 'exclam':
        result = '!';
        break;
    case 'exclamdown':
        result = '¡';
        break;
    case 'florin':
        result = 'ƒ';
        break;
    case 'fraction':
        result = '⁄';
        break;
    case 'germandbls':
        result = 'ß';
        break;
    case 'grave':
        result = '`';
        break;
    case 'greater':
        result = '>';
        break;
    case 'guillemotleft4':
        result = '«';
        break;
    case 'guillemotright4':
        result = '»';
        break;
    case 'guilsinglleft':
        result = '‹';
        break;
    case 'guilsinglright':
        result = '›';
        break;
    case 'hungarumlaut':
        result = '˝';
        break;
    case 'hyphen5':
        result = '-';
        break;
    case 'iacute':
        result = 'í';
        break;
    case 'icircumflex':
        result = 'î';
        break;
    case 'idieresis':
        result = 'ï';
        break;
    case 'igrave':
        result = 'ì';
        break;
    case 'less':
        result = '<';
        break;
    case 'logicalnot':
        result = '¬';
        break;
    case 'lslash':
        result = 'ł';
        break;
    case 'Lslash':
        result = 'Ł';
        break;
    case 'macron':
        result = '¯';
        break;
    case 'minus':
        result = '−';
        break;
    case 'mu':
        result = 'μ';
        break;
    case 'multiply':
        result = '×';
        break;
    case 'ntilde':
        result = 'ñ';
        break;
    case 'numbersign':
        result = '#';
        break;
    case 'oacute':
        result = 'ó';
        break;
    case 'ocircumflex':
        result = 'ô';
        break;
    case 'odieresis':
        result = 'ö';
        break;
    case 'oe':
        result = 'oe';
        break;
    case 'ogonek':
        result = '˛';
        break;
    case 'ograve':
        result = 'ò';
        break;
    case 'onehalf':
        result = '1/2';
        break;
    case 'onequarter':
        result = '1/4';
        break;
    case 'onesuperior':
        result = '¹';
        break;
    case 'ordfeminine':
        result = 'ª';
        break;
    case 'ordmasculine':
        result = 'º';
        break;
    case 'otilde':
        result = 'õ';
        break;
    case 'paragraph':
        result = '¶';
        break;
    case 'parenleft':
        result = '(';
        break;
    case 'parenright':
        result = ')';
        break;
    case 'percent':
        result = '%';
        break;
    case 'period':
        result = '.';
        break;
    case 'periodcentered':
        result = '·';
        break;
    case 'perthousand':
        result = '‰';
        break;
    case 'plus':
        result = '+';
        break;
    case 'plusminus':
        result = '±';
        break;
    case 'question':
        result = '?';
        break;
    case 'questiondown':
        result = '¿';
        break;
    case 'quotedbl':
        result = '\'';
        break;
    case 'quotedblbase':
        result = '„';
        break;
    case 'quotedblleft':
        result = '“';
        break;
    case 'quotedblright':
        result = '”';
        break;
    case 'quoteleft':
        result = '‘';
        break;
    case 'quoteright':
        result = '’';
        break;
    case 'quotesinglbase':
        result = '‚';
        break;
    case 'quotesingle':
        result = '\'';
        break;
    case 'registered':
        result = '®';
        break;
    case 'ring':
        result = '˚';
        break;
    case 'scaron':
        result = 'š';
        break;
    case 'section':
        result = '§';
        break;
    case 'semicolon':
        result = ';';
        break;
    case 'slash':
        result = '/';
        break;
    case 'space6':
        result = ' ';
        break;
    case 'space':
        result = ' ';
        break;
    case 'udieresis':
        result = 'ü';
        break;
    case 'uacute':
        result = 'ú';
        break;
    case 'Ecircumflex':
        result = 'Ê';
        break;
    case 'hyphen':
        result = '-';
        break;
    case 'underscore':
        result = '_';
        break;
    case 'adieresis':
        result = 'ä';
        break;
    case 'ampersand':
        result = '&';
        break;
    case 'Adieresis':
        result = 'Ä';
        break;
    case 'Udieresis':
        result = 'Ü';
        break;
    case 'ccaron':
        result = 'č';
        break;
    case 'Scaron':
        result = 'Š';
        break;
    case 'zcaron':
        result = 'ž';
        break;
    case 'sterling':
        result = '£';
        break;
    case 'agrave':
        result = 'à';
        break;
    case 'ecircumflex':
        result = 'ê';
        break;
    case 'acircumflex':
        result = 'â';
        break;
    case 'Oacute':
        result = 'Ó';
        break;
    default:
        result = input;
        break;
    }
    return result;
}
/**
 * Encode value to string.
 *
 * @private
 * @param {string} value Input string.
 * @returns {string} result.
 */
export function _encodeValue(value: string): string {
    let name: string = '';
    for (let i: number = 0; i < value.length; i++) {
        const code: number = value.charCodeAt(i) & 0xff;
        const entry: string = String.fromCharCode(code);
        let hex: string = '';
        switch (entry) {
        case ' ':
        case '%':
        case '(':
        case ')':
        case '<':
        case '>':
        case '[':
        case ']':
        case '{':
        case '}':
        case '/':
        case '#':
            name += '#';
            hex = code.toString(16).toUpperCase();
            name += (hex.length === 1 ? ('0' + hex) : hex);
            break;
        default:
            if (code > 126 || code < 37) {
                name += '#';
                hex = code.toString(16).toUpperCase();
                name += (hex.length === 1 ? ('0' + hex) : hex);
            } else {
                name += entry;
            }
            break;
        }
    }
    return name;
}
/**
 * Parse and retrieve comments and review history from the annotation.
 *
 * @private
 * @param {PdfComment} annotation Input annotation.
 * @param {boolean} isReview Input is review or not.
 * @returns {PdfPopupAnnotationCollection} result.
 */
export function _getCommentsOrReview(annotation: PdfComment, isReview: boolean): PdfPopupAnnotationCollection {
    if (isReview) {
        return annotation.reviewHistory;
    } else {
        return annotation.comments;
    }
}
/**
 * Returns true if input dictionary is belongs to the review history.
 *
 * @private
 * @param {_PdfDictionary} dictionary Input dictionary.
 * @returns {boolean} Input is review or not.
 */
export function _checkReview(dictionary: _PdfDictionary): boolean {
    const flag: number = dictionary.get('F');
    return ((dictionary.has('State') || dictionary.has('StateModel')) && (flag === 30 || flag === 128));
}
/**
 * Returns true if input dictionary is belongs to the comments.
 *
 * @private
 * @param {_PdfDictionary} dictionary Input dictionary.
 * @returns {boolean} Input is comments or not.
 */
export function _checkComment(dictionary: _PdfDictionary): boolean {
    const flag: number = dictionary.get('F');
    return (!(dictionary.has('State') || dictionary.has('StateModel')) && (flag === 28 || flag === 128));
}
/**
 * Update visibility.
 *
 * @private
 * @param {_PdfDictionary} dictionary Input dictionary.
 * @param {PdfFormFieldVisibility} value Visibility.
 * @returns {void} Nothing.
 */
export function _updateVisibility(dictionary: _PdfDictionary, value: PdfFormFieldVisibility): void {
    if (dictionary.has('F')) {
        delete dictionary._map.F;
        dictionary._updated = true;
    }
    switch (value) {
    case PdfFormFieldVisibility.hidden:
        dictionary.update('F', PdfAnnotationFlag.hidden as number);
        break;
    case PdfFormFieldVisibility.hiddenPrintable:
        dictionary.update('F', (PdfAnnotationFlag.noView | PdfAnnotationFlag.print) as number);
        break;
    case PdfFormFieldVisibility.visible:
        if (dictionary.has('DV')) {
            delete dictionary._map.DV;
            dictionary._updated = true;
        }
        if (dictionary.has('MK')) {
            const mkDict: _PdfDictionary = dictionary.get('MK');
            if (mkDict && mkDict.has('BG')) {
                delete mkDict._map.BG;
                mkDict._updated = true;
            }
        }
        break;
    }
}
/**
 * Remove duplicate reference.
 *
 * @private
 * @param {_PdfDictionary} dictionary Input dictionary.
 * @param {_PdfCrossReference} crossTable Cross reference table.
 * @param {string} key Key string for appearance type.
 * @returns {void} Nothing.
 */
export function _removeDuplicateReference(dictionary: _PdfDictionary, crossTable: _PdfCrossReference, key: string): void {
    if (dictionary && dictionary.has(key)) {
        const oldAppearance: _PdfReference = dictionary.getRaw(key);
        if (oldAppearance && oldAppearance instanceof _PdfReference && oldAppearance._isNew) {
            let appearance: any = dictionary.get(key); // eslint-disable-line
            if (appearance) {
                if (appearance instanceof _PdfReference) {
                    appearance = crossTable._fetch(appearance);
                }
                let appearanceDictionary: _PdfDictionary;
                if (appearance instanceof _PdfDictionary) {
                    appearanceDictionary = appearance;
                } else if (appearance instanceof _PdfBaseStream) {
                    appearanceDictionary = appearance.dictionary;
                }
                if (appearanceDictionary && appearanceDictionary.has('Resources')) {
                    _removeDuplicateFromResources(appearanceDictionary.get('Resources'), crossTable);
                }
            }
            crossTable._cacheMap.delete(oldAppearance);
        }
    }
}
/**
 * Remove duplicate reference from resources.
 *
 * @private
 * @param {_PdfDictionary} resources Input resources.
 * @param {_PdfCrossReference} crossTable Cross reference table.
 * @returns {void} Nothing.
 */
export function _removeDuplicateFromResources(resources: _PdfDictionary, crossTable: _PdfCrossReference): void {
    if (resources && resources.size > 0) {
        resources.forEach((key: string, value: any) => { // eslint-disable-line
            if (typeof key !== 'undefined' && typeof value !== 'undefined') {
                if (value instanceof _PdfReference) {
                    const reference: _PdfReference = value;
                    if (reference._isNew) {
                        const dictionary: _PdfDictionary = resources.get(key);
                        if (dictionary && dictionary instanceof _PdfDictionary) {
                            if (key === 'XObject' && dictionary.has('Resources')) {
                                _removeDuplicateFromResources(dictionary.get('Resources'), crossTable);
                            }
                            crossTable._cacheMap.delete(reference);
                        }
                    }
                } else if (value instanceof _PdfDictionary) {
                    if (value.has('Resources')) {
                        _removeDuplicateFromResources(value.get('Resources'), crossTable);
                    }
                    if (key === 'Font' || key === 'XObject' || key === 'ExtGState') {
                        _removeDuplicateFromResources(value, crossTable);
                    }
                }
            }
        });
    }
}
/**
 * Remove duplicate reference.
 *
 * @private
 * @param {any} normal Input.
 * @param {_PdfCrossReference} crossReference Cross reference table.
 * @param {string} firstKey Key string for appearance type.
 * @param {string} secondKey Key string for appearance type.
 * @returns {void} Nothing.
 */
export function _removeReferences(normal: any, crossReference: _PdfCrossReference, firstKey: string, secondKey: string): void { // eslint-disable-line
    let normalElement: _PdfDictionary;
    if (normal) {
        if (normal instanceof _PdfDictionary) {
            normalElement = normal;
        } else if (normal instanceof _PdfStream) {
            normalElement = normal.dictionary;
        }
    }
    if (normalElement) {
        _removeDuplicateReference(normalElement, crossReference, firstKey);
        _removeDuplicateReference(normalElement, crossReference, secondKey);
    }
}
export class BaseException {
    message: string;
    name: string;
    constructor(message: string, name: string) {
        this.message = message;
        this.name = name;
    }
}
export class FormatError extends BaseException {
    constructor(message: string) {
        super(message, 'FormatError');
    }
}
export class ParserEndOfFileException extends BaseException {
    constructor(message: string) {
        super(message, 'ParserEndOfFileException');
    }
}
/**
 * Gets the default string.
 *
 * @param {string} item Input string.
 * @returns {string} result.
 */
export function _defaultToString(item: string|number|string[]|number[]|Object|Object[]|boolean): string {
    if (Object.prototype.toString.call(item) === '[object String]') {
        return '$s' + item;
    } else {
        return '$o' + item.toString();
    }
}
/**
 * Gets the form field font.
 *
 * @param {PdfForm} form form.
 * @param {PdfWidgetAnnotation} widget widget annotation.
 * @param {PdfField} field field.
 * @returns {PdfFont} font.
 */
export function _obtainFontDetails(form: PdfForm, widget: PdfWidgetAnnotation, field: PdfField): PdfFont {
    let fontFamily: string = '';
    let fontSize: number;
    let font: PdfFont;
    let defaultAppearance: string;
    if (widget && widget._dictionary.has('DA') || field._dictionary.has('DA')) {
        if (widget && widget._dictionary.has('DA')) {
            defaultAppearance = widget._dictionary.get('DA');
        } else {
            defaultAppearance = field._dictionary.get('DA');
        }
    }
    if (defaultAppearance && defaultAppearance.includes('Tf')) {
        const parts: string[] = defaultAppearance.trim().split(/\s+/);
        const index: number = parts.indexOf('Tf');
        if (index >= 2) {
            fontFamily = parts[index - 2];
            if (fontFamily.startsWith('/')) {
                fontFamily = fontFamily.slice(1);
            }
            if (fontFamily) {
                fontFamily = _decodeFontFamily(fontFamily);
            }
            fontSize = parseFloat(parts[index - 1]);
        }
    }
    if (fontFamily) {
        fontFamily = fontFamily.trim();
    }
    if (form && form._dictionary.has('DR')) {
        const resources: _PdfDictionary = form._dictionary.get('DR');
        if (resources.has('Font')) {
            const fonts: _PdfDictionary = resources.get('Font');
            if (fonts.has(fontFamily)) {
                const fontDictionary: _PdfDictionary = fonts.get(fontFamily);
                if (fontDictionary && fontFamily && fontDictionary.has('BaseFont')) {
                    const baseFont: _PdfName = fontDictionary.get('BaseFont');
                    let textFontStyle: PdfFontStyle = PdfFontStyle.regular;
                    if (baseFont) {
                        defaultAppearance = baseFont.name;
                        if (baseFont.name === 'Helvetica') {
                            baseFont.name = 'Helv';
                        }
                        textFontStyle = _getFontStyle(baseFont.name);
                        if (defaultAppearance.includes('-')) {
                            defaultAppearance = defaultAppearance.substring(0, defaultAppearance.indexOf('-'));
                        }
                        if (widget && widget._dictionary.has('DA')) {
                            if (widget._dictionary.has('AP')) {
                                font = _mapFont(defaultAppearance, fontSize, textFontStyle, widget);
                            } else {
                                font = _mapFont(defaultAppearance, fontSize, textFontStyle, widget, fontDictionary);
                            }
                        } else if (field && field._dictionary.has('DA')) {
                            if (field._dictionary.has('AP')) {
                                font = _mapFont(defaultAppearance, fontSize, textFontStyle, field);
                            } else {
                                font = _mapFont(defaultAppearance, fontSize, textFontStyle, field, fontDictionary);
                            }
                        }
                    }
                }
            }
        }
        if (font && font._dictionary && font._dictionary.has('BaseFont')) {
            const fontName: string = font._dictionary.get('BaseFont').name;
            if (fontName && fontName !== fontFamily) {
                const fonts: _PdfDictionary = resources.get('Font');
                if (fonts && fonts.has(fontFamily)) {
                    const fontDictionary: _PdfDictionary = fonts.get(fontFamily);
                    const fontSubtType: any = fontDictionary.get('Subtype').name; // eslint-disable-line
                    if (fontDictionary && fontFamily && fontDictionary.has('BaseFont')) {
                        const baseFont: _PdfName = fontDictionary.get('BaseFont');
                        const textFontStyle: PdfFontStyle = baseFont ? _getFontStyle(baseFont.name) : PdfFontStyle.regular;
                        if (fontSubtType === 'TrueType') {
                            const fontData: Uint8Array = _createFontStream(form, fontDictionary);
                            if (fontData && fontData.length > 0) {
                                const base64String: string = _encode(fontData);
                                if (base64String && base64String.length > 0) {
                                    let isUnicode: boolean = true;
                                    if (widget || field) {
                                        const dictionary: _PdfDictionary = widget ? widget._dictionary : field._dictionary;
                                        if (dictionary && dictionary.has('V')) {
                                            const text: string = dictionary.get('V');
                                            if (text !== null && typeof text !== 'undefined') {
                                                isUnicode = _isUnicode(text);
                                                if (dictionary.has('FT')) {
                                                    const type: _PdfName = dictionary.get('FT');
                                                    if (type.name === 'Ch' && dictionary.has('Opt')) {
                                                        const options: Array<string>[] = dictionary.get('Opt');
                                                        if (options && options.length > 0) {
                                                            for (const [itemsKey, itemsValue]
                                                                of options.filter((innerArray: string[]) => innerArray.length > 1)) {
                                                                if (itemsKey === text) {
                                                                    isUnicode = _isUnicode(itemsValue);
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    font = new PdfTrueTypeFont(base64String, fontSize, textFontStyle);
                                    (font as PdfTrueTypeFont)._isUnicode = isUnicode;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if ((font === null || typeof font === 'undefined') && fontSize) {
        font = new PdfStandardFont(PdfFontFamily.helvetica, fontSize, PdfFontStyle.regular);
    }
    if ((font === null || typeof font === 'undefined') || (font && font.size === 1)) {
        if (widget && !(widget._field instanceof PdfComboBoxField)) {
            font = widget._circleCaptionFont;
        } else if (field && !(field instanceof PdfComboBoxField) ) {
            font = field._circleCaptionFont;
        }
    }
    return font;
}
/**
 * Gets the font style.
 *
 * @param {string} fontFamilyString Font family string.
 * @returns {PdfFontStyle} result.
 */
export function _getFontStyle(fontFamilyString: string) : PdfFontStyle {
    let position: number = fontFamilyString.indexOf('-');
    if (position < 0) {
        position = fontFamilyString.indexOf(',');
    }
    let style: PdfFontStyle = PdfFontStyle.regular;
    if (position >= 0) {
        const standardName: string = fontFamilyString.substring(position + 1, fontFamilyString.length);
        switch (standardName) {
        case 'Bold':
        case 'BoldMT':
            style = PdfFontStyle.bold;
            break;
        case 'Italic':
        case 'ItalicMT':
        case 'Oblique':
        case 'It':
            style = PdfFontStyle.italic;
            break;
        case 'BoldItalic':
        case 'BoldItalicMT':
        case 'BoldOblique':
            style = PdfFontStyle.bold | PdfFontStyle.italic;
            break;
        }
    }
    return style;
}
/**
 * Map the font.
 *
 * @param {string} name Font name.
 * @param {number} size Font size.
 * @param {PdfFontStyle} style Font style.
 * @param {PdfAnnotation} annotation Annotation or Field.
 * @param {_PdfDictionary} fontDictionary Font dictionary.
 * @returns {PdfFont} result.
 */
export function _mapFont(name: string, size: number, style: PdfFontStyle, annotation: PdfAnnotation | PdfField,
                         fontDictionary?: _PdfDictionary): PdfFont {
    let font: PdfFont;
    let fontData: Uint8Array;
    let fontFamily: string = name ? name : '';
    if (fontFamily.includes('-')) {
        fontFamily = fontFamily.substring(0, fontFamily.indexOf('-'));
    }
    if (typeof size === 'undefined' && annotation instanceof PdfLineAnnotation && annotation._isLoaded) {
        size = 10;
    }
    const fontSize: number = typeof size !== 'undefined' ? size : 1;
    if (annotation._dictionary.has('DS') || annotation._dictionary.has('DA')) {
        switch (fontFamily) {
        case 'Helv':
        case 'Helvetica':
            font = new PdfStandardFont(PdfFontFamily.helvetica, fontSize, style);
            break;
        case 'Cour':
        case 'Courier':
            font = new PdfStandardFont(PdfFontFamily.courier, fontSize, style);
            break;
        case 'Symb':
        case 'Symbol':
            font = new PdfStandardFont(PdfFontFamily.symbol, fontSize, style);
            break;
        case 'Times':
        case 'TiRo':
        case 'TimesRoman':
            font = new PdfStandardFont(PdfFontFamily.timesRoman, fontSize, style);
            break;
        case 'ZaDb':
        case 'ZapfDingbats':
            font = new PdfStandardFont(PdfFontFamily.zapfDingbats, fontSize, style);
            break;
        case 'MonotypeSungLight':
            font = new PdfCjkStandardFont(PdfCjkFontFamily.monotypeSungLight, fontSize, style);
            break;
        case 'SinoTypeSongLight':
            font = new PdfCjkStandardFont(PdfCjkFontFamily.sinoTypeSongLight, fontSize, style);
            break;
        case 'MonotypeHeiMedium':
            font = new PdfCjkStandardFont(PdfCjkFontFamily.monotypeHeiMedium, fontSize, style);
            break;
        case 'HanyangSystemsGothicMedium':
            font = new PdfCjkStandardFont(PdfCjkFontFamily.hanyangSystemsGothicMedium, fontSize, style);
            break;
        case 'HanyangSystemsShinMyeongJoMedium':
            font = new PdfCjkStandardFont(PdfCjkFontFamily.hanyangSystemsShinMyeongJoMedium, fontSize, style);
            break;
        case 'HeiseiKakuGothicW5':
            font = new PdfCjkStandardFont(PdfCjkFontFamily.heiseiKakuGothicW5, fontSize, style);
            break;
        case 'HeiseiMinchoW3':
            font = new PdfCjkStandardFont(PdfCjkFontFamily.heiseiMinchoW3, fontSize, style);
            break;
        default:
            if (annotation._dictionary.has('AP')) {
                fontData = _tryParseFontStream(annotation._dictionary, annotation._crossReference, annotation, name);
            } else if (fontDictionary) {
                fontData = _getFontFromDescriptor(fontDictionary);
            }
            if (fontData && fontData.length > 0) {
                let isUnicode: boolean = true;
                if (annotation._dictionary && annotation._dictionary.has('V')) {
                    const text: string = annotation._dictionary.get('V');
                    if (text !== null && typeof text !== 'undefined') {
                        isUnicode = _isUnicode(text);
                        if (annotation._dictionary.has('FT')) {
                            const type: _PdfName = annotation._dictionary.get('FT');
                            if (type.name === 'Ch' && annotation._dictionary.has('Opt')) {
                                const options: Array<string>[] = annotation._dictionary.get('Opt');
                                if (options && options.length > 0) {
                                    for (let i: number = 0 ; i < options.length; i++) {
                                        const innerArray: string[] = options[<number>i];
                                        if (innerArray && innerArray.length > 1) {
                                            const itemsKey: string = innerArray[0];
                                            const itemsValue: string = innerArray[1];
                                            if (itemsKey && itemsValue) {
                                                if (itemsKey === text &&  itemsValue) {
                                                    isUnicode = _isUnicode(itemsValue);
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                const ttf: PdfTrueTypeFont = new PdfTrueTypeFont(fontData, fontSize, style) as PdfTrueTypeFont;
                ttf._isUnicode = isUnicode;
                font = ttf;
            }
            break;
        }
    }
    if (font === null || typeof font === 'undefined') {
        const isAnnotation: boolean = annotation instanceof PdfAnnotation;
        const isField: boolean = annotation instanceof PdfField;
        if (isAnnotation || isField) {
            const annotationType: _PdfAnnotationType = (annotation as PdfAnnotation)._type;
            const hasCircleFont: boolean = annotation._circleCaptionFont && fontSize > annotation._circleCaptionFont.size;
            const isWidget: boolean = isAnnotation && annotationType !== _PdfAnnotationType.widgetAnnotation;
            const isLargerTextBox: boolean = annotation instanceof PdfTextBoxField && hasCircleFont;
            const isLargerComboBox: boolean  = annotation instanceof PdfComboBoxField && hasCircleFont;
            if (isWidget || isLargerTextBox || isLargerComboBox) {
                font = new PdfStandardFont(PdfFontFamily.helvetica, fontSize, style);
            } else {
                font = annotation._circleCaptionFont;
            }
            if (annotationType === _PdfAnnotationType.widgetAnnotation && hasCircleFont) {
                font = new PdfStandardFont(PdfFontFamily.helvetica, fontSize, style);
            }
        }
    }
    return font;
}
/**
 * Gets the font stream.
 *
 * @param {_PdfDictionary} widgetDictionary Widget dictionary.
 * @param {_PdfCrossReference} crossReference Cross reference.
 * @param {PdfAnnotation} annotation Annotation.
 * @param {string} fontResourceName Font resource name.
 * @returns {Uint8Array} result.
 */
export function _tryParseFontStream(widgetDictionary: _PdfDictionary, crossReference: _PdfCrossReference,
                                    annotation: PdfAnnotation | PdfField, fontResourceName?: string): Uint8Array {
    let fontData: Uint8Array;
    const appearance: _PdfDictionary = widgetDictionary.get('AP');
    if (appearance && appearance instanceof _PdfDictionary && appearance.has('N')) {
        let baseStream: any = appearance.get('N'); // eslint-disable-line
        let normal: any; // eslint-disable-line
        if (baseStream) {
            if (baseStream instanceof _PdfStream) {
                normal = baseStream;
            } else if ((annotation instanceof PdfField || annotation instanceof PdfWidgetAnnotation) && baseStream.stream &&
                baseStream.stream instanceof _PdfStream) {
                normal = baseStream.stream;
            } else if (baseStream.stream && baseStream.stream instanceof _PdfStream) {
                normal = baseStream.stream;
            }
        }
        if (normal && normal instanceof _PdfStream && normal.dictionary.has('Resources')) {
            const resourcesDictionary: _PdfDictionary = normal.dictionary.get('Resources');
            if (resourcesDictionary && resourcesDictionary.has('Font')) {
                const fontDictionary: _PdfDictionary = resourcesDictionary.get('Font');
                if (fontDictionary && fontDictionary instanceof _PdfDictionary) {
                    fontDictionary.forEach((key: _PdfName, value: _PdfReference) => {
                        if (value instanceof _PdfReference) {
                            const dictionary: _PdfDictionary = crossReference._fetch(value);
                            fontData = _getFontFromDescriptor(dictionary);
                        }
                    });
                }
            }
        }
    }
    if (!fontData && annotation && annotation instanceof PdfField && annotation._form && annotation._form._dictionary.has('DR')
        && fontResourceName !== null && typeof fontResourceName !== 'undefined') {
        const form: PdfForm = annotation._form;
        const resources: _PdfDictionary = form._dictionary.get('DR');
        if (resources && resources.has('Font')) {
            const fonts: _PdfDictionary = resources.get('Font');
            if (fonts && fonts.has(fontResourceName)) {
                const fontDictionary: _PdfDictionary = fonts.get(fontResourceName);
                if (fontDictionary && fontDictionary.has('FontDescriptor')) {
                    fontData = _getFontFromDescriptor(fontDictionary);
                }
            }
        }
    }
    return fontData;
}
/**
 * Gets the font data.
 *
 * @param {_PdfDictionary} dictionary font dictionary.
 * @returns {Uint8Array} result.
 */
export function _getFontFromDescriptor(dictionary: _PdfDictionary): Uint8Array {
    let fontData: Uint8Array;
    let fontDescriptor: _PdfDictionary;
    if (dictionary && dictionary.has('DescendantFonts')) {
        let descendant: any[] = dictionary.getArray('DescendantFonts'); // eslint-disable-line
        if (descendant && descendant.length > 0) {
            descendant.forEach((descendantFont: any) => { // eslint-disable-line
                if (descendantFont && descendantFont instanceof _PdfDictionary && descendantFont.has('FontDescriptor')) {
                    fontDescriptor = descendantFont.get('FontDescriptor');
                }
            });
        }
    } else if (dictionary && dictionary.has('FontDescriptor')) {
        fontDescriptor = dictionary.get('FontDescriptor');
    }
    if (fontDescriptor && fontDescriptor.has('FontFile2')) {
        const fontFile: any = fontDescriptor.get('FontFile2'); // eslint-disable-line
        if (fontFile instanceof _PdfStream && fontFile.length > 0) {
            fontData = fontFile.getByteRange(fontFile.start, fontFile.end);
        } else if (fontFile.stream instanceof _PdfStream && fontFile.stream.length > 0 && fontFile.dictionary &&
            (fontFile.dictionary.has('Length1') || fontFile.dictionary.has('Length'))) {
            const streamLength: number = fontFile.dictionary.get(fontFile.dictionary.has('Length1') ? 'Length1' : 'Length');
            fontFile.getBytes(streamLength);
            fontData = fontFile.buffer.subarray(0, streamLength);
        }
    }
    return fontData;
}
/**
 * Gets the boolean if two arrays are equal.
 *
 * @param {Array<number[]>} inkPointsCollection Ink points collection.
 * @param {Array<number[]>} previousCollection Previous collection.
 * @returns {boolean} result.
 */
export function _checkInkPoints(inkPointsCollection: Array<number[]>, previousCollection: Array<number[]>): boolean {
    if (inkPointsCollection.length !== previousCollection.length) {
        return false;
    }
    return inkPointsCollection.every((point: number[], index: number) =>
        _areArrayEqual(point, previousCollection[<number>index])
    );
}
/**
 * Update the annotation bounds.
 *
 * @param {PdfAnnotation} annotation annotation.
 * @param {number[]} bounds annotation bounds.
 * @returns {number[]} bounds.
 */
export function _updateBounds(annotation: PdfAnnotation, bounds?: number[]): number[] {
    if (bounds) {
        annotation._bounds = { x: bounds[0], y: bounds[1], width: bounds[2], height: bounds[3] };
    }
    let rect: number[];
    if (annotation._page && annotation.bounds) {
        rect = [annotation.bounds.x, annotation.bounds.y + annotation.bounds.height,
            annotation.bounds.width, annotation.bounds.height];
        if (annotation._page._isNew && annotation._page._pageSettings) {
            const pageSettings: PdfPageSettings = annotation._page._pageSettings;
            const pageBounds: number[] = [pageSettings.margins.left, pageSettings.margins.top, pageSettings.size[0] -
                (pageSettings.margins.left + pageSettings.margins.right),
            pageSettings.size[1] - (pageSettings.margins.top + pageSettings.margins.bottom)];
            rect[0] += pageBounds[0];
            rect[1] = pageSettings.size[1] - (pageBounds[1] + rect[1]);
        } else {
            const size: number[] = annotation._page.size;
            rect[1] = size[1] - (annotation.bounds.y + annotation.bounds.height);
            const cropBoxOrMediaBox: number[] = annotation._getCropOrMediaBox();
            if (cropBoxOrMediaBox && cropBoxOrMediaBox.length > 2 && (cropBoxOrMediaBox[0] !== 0 || cropBoxOrMediaBox[1] !== 0)) {
                rect[0] += cropBoxOrMediaBox[0];
                rect[1] += cropBoxOrMediaBox[1];
            }
        }
        return [rect[0], rect[1], rect[0] + rect[2], rect[1] + rect[3]];
    }
    return rect;
}
/**
 * Decode text.
 *
 * @param {string} text Text to decode.
 * @param {boolean} isColorSpace Color space or not
 * @param {boolean} isPassword Password or not
 * @returns {string} Decoded text.
 */
export function _decodeText(text: string, isColorSpace: boolean, isPassword: boolean): string {
    if (text && typeof text === 'string' && !isColorSpace && !isPassword) {
        if (text.startsWith('þÿ')) {
            text = text.substring(2);
            if (text.endsWith('ÿý')) {
                text = text.substring(0, text.length - 2);
            }
            const bytes: Uint8Array = _stringToBytes(text, false, true) as Uint8Array;
            const codeUnits: number[] = [];
            for (let i: number = 0; i < bytes.length; i += 2) {
                codeUnits.push((bytes[<number>i] << 8) | bytes[i + 1]);
            }
            text = String.fromCharCode(...codeUnits);
        }
    }
    return text;
}
/**
 * Number of bytes required to save the number.
 *
 * @param {number} input number.
 * @returns {number} number of bytes.
 */
export function _getSize(input: number): number {
    let size: number = 0;
    const uintMaxValue: number = 0xFFFFFFFF;
    const ushortMaxValue: number = 0xFFFF;
    const byteMaxValue: number = 0xFF;
    if (input <= uintMaxValue) {
        if (input <= ushortMaxValue) {
            if (input <= byteMaxValue) {
                size = 1;
            } else {
                size = 2;
            }
        } else {
            if (input <= (ushortMaxValue | (ushortMaxValue << 8))) {
                size = 3;
            } else {
                size = 4;
            }
        }
    } else {
        size = 8;
    }
    return size;
}
/**
 * Convert the string to big endian bytes.
 *
 * @param {string} input string.
 * @returns {number[]} bytes.
 */
export function _stringToBigEndianBytes(input: string): number[] {
    const bytes: number[] = [];
    for (let i: number = 0; i < input.length; i++) {
        const charCode: number = input.charCodeAt(<number>i);
        if (charCode <= 0xFFFF) {
            bytes.push((charCode >> 8) & 0xFF);
            bytes.push(charCode & 0xFF);
        }
    }
    return bytes;
}
/**
 * Convert number respect to ordered list number style.
 *
 * @param {number} intArabic Input value.
 * @param {PdfNumberStyle} numberStyle Number style.
 * @returns {string} String value.
 */
export function _convertNumber(intArabic: number, numberStyle: PdfNumberStyle): string {
    switch (numberStyle) {
    case PdfNumberStyle.none:
        return '';
    case PdfNumberStyle.numeric:
        return intArabic.toString();
    case PdfNumberStyle.lowerLatin:
        return _arabicToLetter(intArabic).toLowerCase();
    case PdfNumberStyle.lowerRoman:
        return _arabicToRoman(intArabic).toLowerCase();
    case PdfNumberStyle.upperLatin:
        return _arabicToLetter(intArabic);
    case PdfNumberStyle.upperRoman:
        return _arabicToRoman(intArabic);
    }
}
/**
 * Convert arabic numbers to roman style.
 *
 * @param {number} intArabic Input value.
 * @returns {string} String value.
 */
export function _arabicToRoman(intArabic: number): string {
    let retval: string = '';
    const romanNumerals: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    for (const [value, numeral] of romanNumerals) {
        while (intArabic >= value) {
            retval += numeral;
            intArabic -= value;
        }
    }
    return retval;
}
/**
 * Convert arabic numbers to alphabet.
 *
 * @param {number} arabic Input value.
 * @returns {string} String value.
 */
export function _arabicToLetter(arabic: number): string {
    let result: string = '';
    while (arabic > 0) {
        let remainder: number = arabic % 26;
        arabic = Math.floor(arabic / 26);
        if (remainder === 0) {
            arabic--;
            remainder = 26;
        }
        result = _appendChar(remainder) + result;
    }
    return result;
}
/**
 * Convert character code to string.
 *
 * @param {number} value Input value.
 * @returns {string} String value.
 */
export function _appendChar(value: number): string {
    if (value <= 0 || value > 26) {
        throw new Error('Value can not be less 0 and greater 26');
    }
    return String.fromCharCode(64 + value);
}
/**
 * Check whether the value is null or undefined.
 *
 * @param {any} value Input value.
 * @returns {boolean} Return true if the value is null or undefined; otherwise, return false
 */
export function _isNullOrUndefined (value: any): boolean { // eslint-disable-line
    if (value !== null && typeof value !== 'undefined') {
        return true;
    }
    return false;
}
/**
 * Defines a property on an object with specific attributes.
 *
 * @param {Object} obj - The target object on which the property will be defined.
 * @param {string} prop - The name of the property to define.
 * @param {any} value - The value to assign to the property.
 * @param {boolean} [serializable = false] - If true, the property will not be enumerable.
 * @returns {any} The value of the property that was defined.
 *
 */
export function _defineProperty(obj: any, prop: string, value: any, serializable = false): any { // eslint-disable-line
    Object.defineProperty(obj, prop, {
        value,
        enumerable: !serializable,
        configurable: true,
        writable: false
    });
    return value;
}
/**
 * Compresses the content of a PDFBaseStream
 *
 * @param {_PdfBaseStream} stream - Base stream to compress.
 * @param {boolean} isExport - Denotes compress the stream as a hex-encoded string.
 * @returns {boolean} compressed string.
 */
export function _compressStream(stream: _PdfBaseStream, isExport: boolean = false): string {
    let value: string = stream.getString();
    const byteArray: number[] = [];
    for (let i: number = 0; i < value.length; i++) {
        byteArray.push(value.charCodeAt(i));
    }
    const dataArray: Uint8Array = new Uint8Array(byteArray);
    const sw: CompressedStreamWriter = new CompressedStreamWriter();
    sw.write(dataArray, 0, dataArray.length);
    sw.close();
    value = sw.getCompressedString;
    stream.dictionary.update('Filter', _PdfName.get('FlateDecode'));
    if (isExport) {
        const buffer: number[] = [];
        for (let i: number = 0; i < value.length; i++) {
            buffer.push(value.charCodeAt(i) & 0xff);
        }
        return _byteArrayToHexString(new Uint8Array(buffer));
    }
    return value;
}
/**
 * Check whether the input string contains any right-to-left (RTL) characters.
 *
 * @param {string} input The input string.
 * @returns {boolean} Returns true if the string contains any RTL characters; otherwise, returns false.
 */
export function _isRightToLeftCharacters(input: string): boolean {
    // Unicode range for RTL characters
    const rtlRegex: RegExp = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
    return rtlRegex.test(input);
}
/**
 * Updates the page count value in the dictionary
 *
 * @param {_PdfDictionary} dictionary - Dictionary to update page count.
 * @param {number} valueToIncrement - Page count.
 * @returns {void} Nothing.
 */
export function _updatePageCount(dictionary: _PdfDictionary, valueToIncrement: number): void {
    dictionary.update('Count', dictionary.get('Count') + valueToIncrement);
    if (dictionary.has('Parent')) {
        const parentDictionary: _PdfDictionary = dictionary.get('Parent');
        if (parentDictionary && parentDictionary.get('Type').name === 'Pages') {
            _updatePageCount(parentDictionary, valueToIncrement);
        }
    }
}
/**
 * Updates the page settings in the dictionary
 *
 * @param {_PdfDictionary} dictionary - Dictionary to update page settings.
 * @param {PdfPageSettings} settings - PDF page settings.
 * @returns {void} Nothing.
 */
export function _updatePageSettings(dictionary: _PdfDictionary, settings: PdfPageSettings): void {
    const bounds: number[] = [0, 0, settings.size[0], settings.size[1]];
    dictionary.update('MediaBox', bounds);
    dictionary.update('CropBox', bounds);
    let rotate: number = Math.floor(settings.rotation as number) * 90;
    if (rotate >= 360) {
        rotate = rotate % 360;
    }
    dictionary.update('Rotate', rotate);
}
/**
 * Base64 encoded string representing an empty PDF document.
 */
export const _emptyPdfData: string = 'JVBERi0xLjQNCiWDkvr+DQoxIDAgb2JqDQo8PA0KL1R5cGUgL0NhdGFsb2cNCi9QYWdlcyAyIDAgUg0KL0Fjcm9Gb3JtIDMgMCBSDQo+Pg0KZW5kb2JqDQoyIDAgb2JqDQo8PA0KL1R5cGUgL1BhZ2VzDQovS2lkcyBbNCAwIFJdDQovQ291bnQgMQ0KL1Jlc291cmNlcyA8PD4+DQoNCi9NZWRpYUJveCBbLjAwIC4wMCA1OTUuMDAgODQyLjAwXQ0KL1JvdGF0ZSAwDQo+Pg0KZW5kb2JqDQozIDAgb2JqDQo8PA0KL0ZpZWxkcyBbXQ0KPj4NCmVuZG9iag0KNCAwIG9iag0KPDwNCi9Db3VudCAxDQovVHlwZSAvUGFnZXMNCi9LaWRzIFs1IDAgUl0NCi9QYXJlbnQgMiAwIFINCj4+DQplbmRvYmoNCjUgMCBvYmoNCjw8DQovVHlwZSAvUGFnZQ0KL1BhcmVudCA0IDAgUg0KPj4NCmVuZG9iag0KeHJlZg0KMCA2DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTcgMDAwMDAgbg0KMDAwMDAwMDA4OSAwMDAwMCBuDQowMDAwMDAwMjE4IDAwMDAwIG4NCjAwMDAwMDAyNTUgMDAwMDAgbg0KMDAwMDAwMDMzNCAwMDAwMCBuDQp0cmFpbGVyDQo8PA0KL1Jvb3QgMSAwIFINCi9TaXplIDYNCj4+DQoNCnN0YXJ0eHJlZg0KMzg3DQolJUVPRg0K';
/**
 * Checks if the given string contains any Unicode (non-ASCII) characters.
 *
 * @param {string} value - The string to check for Unicode characters.
 * @returns {boolean} `true` if the string contains at least one Unicode character; otherwise, `false`.
 */
export function _hasUnicodeCharacters(value: string): boolean {
    const unicodeRegex = /[^\x00-\x7F]/; // eslint-disable-line
    return value.split('').some(char => unicodeRegex.exec(char) !== null); // eslint-disable-line
}
/**
 * Creates a font stream for the given font and form, extracting the font data from font descriptors.
 *
 * @param {PdfForm} form - The target PDF form containing cross-references to the font data.
 * @param {_PdfDictionary} font - The dictionary that defines the font, containing references to font descriptors.
 * @returns {Uint8Array} The font data extracted from the font file.
 */
export function _createFontStream(form: PdfForm, font: _PdfDictionary): Uint8Array {
    let fontData: Uint8Array;
    if (font) {
        font.forEach((key: any, value: _PdfReference) => { // eslint-disable-line
            if (value && value.objectNumber) {
                const dictionary: _PdfDictionary = form._crossReference._fetch(value);
                if (dictionary) {
                    dictionary.forEach((key: any, value: any) => { // eslint-disable-line
                        if (value && value instanceof _PdfName && value.name === 'FontDescriptor') {
                            let fontFile: any; // eslint-disable-line
                            if (dictionary && dictionary.has('FontFile2')) {
                                fontFile = dictionary.get('FontFile2');
                                if (fontFile && fontFile instanceof _PdfBaseStream) {
                                    fontData = fontFile.getBytes();
                                }
                            } else if (dictionary && dictionary.has('FontFile3')) {
                                fontFile = dictionary.get('FontFile3');
                                if (fontFile && fontFile instanceof _PdfBaseStream) {
                                    fontData = fontFile.getBytes();
                                }
                            }
                        }
                    });
                }
            }
        });
    }
    return fontData;
}
/**
 * Determines whether a given string contains Unicode characters.
 *
 * @param {string} value - The string to be checked.
 * @returns {boolean} True if the string contains Unicode characters; otherwise, false.
 * @throws {Error} If the input value is null or undefined.
 */
export function _isUnicode(value: string): boolean {
    if (value === null || typeof value === 'undefined') {
        throw new Error('ArgumentNullException: value');
    }
    for (let i: number = 0; i < value.length; i++) {
        if (value.charCodeAt(i) > 127) {
            return true;
        }
    }
    return false;
}
/**
 * Converts a single hexadecimal character to its numeric value.
 *
 * @param {string} char - A single character string representing a hexadecimal digit ('0'-'9', 'A'-'F', 'a'-'f').
 * @returns {number} The numeric value corresponding to the hexadecimal character.
 * @throws {Error} Throws an error if the input character is not a valid hexadecimal character.
 */
export function _convertToHex(char: string): number {
    if (char >= '0' && char <= '9') {
        return char.charCodeAt(0) - '0'.charCodeAt(0);
    } else if (char >= 'A' && char <= 'F') {
        return char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    } else if (char >= 'a' && char <= 'f') {
        return char.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    } else {
        throw new Error(`Invalid hex character: ${char}`);
    }
}
/**
 * Decodes a font family string that contains hexadecimal encoded characters.
 *
 * @param {string} fontFamily - The font family string to be decoded. May contain hex encoded characters prefixed by '#'.
 * @returns {string} The decoded font family string with hex characters replaced by their ASCII equivalents.
 * @throws {Error} Throws an error if the input contains invalid hexadecimal sequences.
 */
export function _decodeFontFamily(fontFamily: string): string {
    const builder: string[] = [];
    const length: number = fontFamily.length;
    for (let k: number = 0; k < length; ++k) {
        let character: string = fontFamily[<number>k];
        if (character === '#') {
            const hex1: number = _convertToHex(fontFamily[k + 1]);
            const hex2: number = _convertToHex(fontFamily[k + 2]);
            character = String.fromCharCode((hex1 << 4) + hex2);
            k += 2;
        }
        builder.push(character);
    }
    return builder.join('');
}
/**
 * Updates the border style to dashed pattern if the border style is set to dashed.
 *
 * @private
 * @param {PdfInteractiveBorder} border - The interactive border object containing style information.
 * @param {_PaintParameter} parameter - The paint parameter object that contains the border pen to be updated.
 * @returns {void} Nothing.
 */
export function _updateDashedBorderStyle(border: PdfInteractiveBorder, parameter: _PaintParameter): void {
    if (border.style === PdfBorderStyle.dashed) {
        parameter.borderPen._dashStyle = PdfDashStyle.dash;
        parameter.borderPen._dashPattern = [3];
    }
}
/**
 * Sets the rotation angle for a PDF annotation if necessary.
 * It ensures that the rotation is within the normalized range [0, 360) degrees.
 *
 * @param {number} rotateAngle - The rotation angle to be set for the annotation. Negative values are normalized.
 * @param {PdfAnnotation} annot - The PDF annotation object which may have its rotation angle modified.
 * @returns {void} Nothing.
 */
export function _setRotateAngle(rotateAngle: number, annot: PdfAnnotation): void {
    if (annot && rotateAngle !== annot.rotate) {
        if (rotateAngle < 0) {
            rotateAngle = 360 + rotateAngle;
        }
        if (rotateAngle >= 360) {
            rotateAngle = 360 - rotateAngle;
        }
        annot._dictionary.update('Rotate', rotateAngle);
    }
}
