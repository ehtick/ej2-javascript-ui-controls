import { DigestAlgorithm, CryptographicStandard, PdfTemplateHorizontalAlignment, PdfTemplateVerticalAlignment, PdfTemplateLayerMode } from './enumerator';
import { PdfFont } from './fonts/pdf-standard-font';
import { PdfStringFormat } from './fonts/pdf-string-format';
import { PdfBrush, PdfPen } from './graphics/pdf-graphics';
import { PdfLayoutFormat } from './graphics/pdf-layouter';
import { PdfPageTemplateElement } from './graphics/pdf-page-template-element';
import { PdfTemplate } from './graphics/pdf-template';
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
 * Represents a color using RGB components and an optional transparency flag.
 *
 * @property {number} r - Red component of the color (0 to 255).
 * @property {number} g - Green component of the color (0 to 255).
 * @property {number} b - Blue component of the color (0 to 255).
 * @property {boolean} isTransparent - Optional flag indicating whether the color is transparent.
 */
export type PdfColor = {
    r: number;
    g: number;
    b: number;
    isTransparent?: boolean;
};
/**
 * Represents a text element with layout-aware rendering options.
 *
 * @property {string} text - The text content to render. Must be a non-empty string.
 * @property {PdfFont} font - The font used to render the text.
 * @property {PdfPen} pen - Optional pen used to outline the text.
 * @property {PdfBrush} brush - Optional brush used to fill the text. Defaults to black if not provided.
 * @property {PdfStringFormat} stringFormat - Optional string formatting options such as alignment or line spacing.
 * @property {PdfLayoutFormat} layoutFormat - Optional layout format that controls how the text is arranged within bounds.
 */
export type PdfTextElement = {
    text: string;
    font: PdfFont;
    pen?: PdfPen;
    brush?: PdfBrush;
    stringFormat?: PdfStringFormat;
    layoutFormat?: PdfLayoutFormat;
};
/**
 * A callback function used for external signing of a PDF document with extended options.
 *
 * If public certificates are provided before signing, `data` will be a 256-byte hash
 * that should be signed using the certificate's private key.
 * If no public certificates are provided, `data` will be the full PDF content,
 * and the function should compute the hash using the given algorithm and standard.
 *
 * @param {Uint8Array} data - Either a 256-byte hash or the full PDF data, depending on the signing setup.
 * @param {Object} options - Signing options.
 * @param {DigestAlgorithm} options.algorithm - The digest algorithm to use.
 * @param {CryptographicStandard} options.cryptographicStandard - The cryptographic standard.
 * @returns {{ signedData: Uint8Array, timestampData?: Uint8Array } | void | Promise<{ signedData: Uint8Array; timestampData?: Uint8Array }>}
 */
export type ExternalSignatureCallback = (
    data: Uint8Array,
    options: {
        algorithm: DigestAlgorithm,
        cryptographicStandard: CryptographicStandard
    }
) => {signedData: Uint8Array, timestampData?: Uint8Array} | void | Promise<{ signedData: Uint8Array; timestampData?: Uint8Array }>;
/**
 * A callback function used to obtain the timestamp from a trusted timestamp authority (TSA) server.
 *
 * @param {Uint8Array} data - Request bytes for timestamping.
 * @returns {Promise<Uint8Array>} - Timestamp data obtained from a trusted timestamp authority server.
 */
export type TimestampCallback = (data: Uint8Array) => Promise<{ data: Uint8Array }>;
/**
 * Represents a multilingual language-keyed string map for XMP metadata.
 *
 * @property {string} [lang] - The language tag (e.g., "en-US", "fr-FR") mapped to its string value.
 */
export type PdfXmpLangArray = { [lang: string]: string };
/**
 * Represents page dimension structure for XMP paged text schema.
 *
 * @property {number} width - Width of the page.
 * @property {number} height - Height of the page.
 * @property {string} [unit] - Optional unit of measurement (e.g., "pt", "mm").
 */
export type PdfXmpDimensionsStruct = { width: number; height: number; unit?: string };
/**
 * Represents a thumbnail image structure for XMP Basic schema.
 *
 * @property {number} width - Width of the thumbnail in pixels.
 * @property {number} height - Height of the thumbnail in pixels.
 * @property {string} format - Image format (e.g., "JPEG", "PNG").
 * @property {string} image - Base64-encoded image data.
 */
export type PdfXmpThumbnail = { width: number; height: number; format: string; image: string };
/**
 * Represents the header and footer template settings with support for positional, even, odd, and layer-based rendering.
 *
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment }} top - Optional top template with horizontal alignment and layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment }} bottom - Optional bottom template with horizontal alignment and layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment }} left - Optional left-side template with vertical alignment and layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment }} right - Optional right-side template with vertical alignment and layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment }} oddTop - Optional top template for odd pages with layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment }} oddBottom - Optional bottom template for odd pages with layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment }} oddLeft - Optional left-side template for odd pages with layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment }} oddRight - Optional right-side template for odd pages with layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment }} evenTop - Optional top template for even pages with layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment }} evenBottom - Optional top template for even pages with layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment }} evenLeft - Optional left-side template for even pages with layer configuration.
 * @property {{ template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment }} evenRight - Optional right-side template for even pages with layer configuration.
 */
export type PdfDocumentTemplate = {
    left?: { template: PdfPageTemplateElement; templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment };
    right?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment };
    top?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment };
    bottom?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment };
    evenLeft?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment };
    evenRight?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment };
    evenTop?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment };
    evenBottom?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode;
        alignment?: PdfTemplateHorizontalAlignment };
    oddLeft?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment };
    oddRight?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateVerticalAlignment };
    oddTop?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment };
    oddBottom?: { template: PdfPageTemplateElement;  templateLayerMode?: PdfTemplateLayerMode; alignment?: PdfTemplateHorizontalAlignment };
};
/**
 * Internal helper type for template-value caching.
 *
 * @private
 */
export type _PdfTemplateValuePair = {
    template: PdfTemplate;
    value: string;
};
