import { AnnotationConstraints, FlipDirection, NodeConstraints } from '../../enum/enum';
import { VisioTextAlignmentModel, VisioTextDecorationModel, VisioToSyncfusionTextBinder } from './visio-annotations';
import { VisioConnector } from './visio-connectors';
import { createCellMap, createPathFromGeometry, createPathFromGeometrySections, ensureArray, formatPathData, getAttrString, getCellMapStringValue, getTrimmedOrEmpty, inchToPoint, inchToPx, mapCellValues, radiansToDegrees, safeNumber } from './visio-core';
import { ParsingContext } from './visio-import-export';
import { VisioMaster, VisioShape } from './visio-models';
import { getNodeStyle, setAnnotationStyle } from './visio-theme';
import {
    Attributes,
    CellMapValue,
    DetermineShapeResult,
    DiagramHyperlink,
    FlippableShape,
    Point,
    ShadowProps,
    SyncfusionTextBinding,
    VisioShapeTransform,
    VisioTextTransform,
    BPMNPropertyMapType,
    BPMNShapeResult,
    BPMNEventShapeResult,
    BPMNGatewayShapeResult,
    BPMNActivityShapeResult,
    BPMNDataObjectShapeResult,
    BPMNTextAnnotationShapeResult,
    BPMNSimpleShapeResult,
    BPMNFlowShapeResult,
    UMLConnectorResult,
    UMLActivityShapeResult,
    NodeShapeConfig,
    VisioSection,
    VisioCell,
    VisioShapeNode,
    VisioNodeInput,
    DiagramPort,
    VisioAnnotationInput,
    VisioShapeInput,
    BPMNSubProcessInput,
    BPMNSubProcess,
    VisioRow,
    VisioShapeData,
    VisioPort,
    DiagramAnnotation,
    AnnotationStyle,
    ResolvedAnnotationStyle,
    AnnotationAlignmentConfig
} from './visio-types';

/**
 * Global shape index counter used during parsing to track shape position.
 * Incremented for each shape processed and used to look up master data.
 *
 * @type {{ value: number }}
 */
export const shapeIndex: { value: number } = { value: 0 };

/**
 * Constant representing the 'Property' section name in Visio shapes.
 * Used to locate property definitions in shape sections.
 *
 * @type {string}
 */
const PROPERTY_SECTION: string = 'Property';

/**
 * Constant representing the 'User' section name in Visio shapes.
 * Used to locate user-defined properties in shape sections.
 *
 * @type {string}
 */
const USER_SECTION: string = 'User';

/**
 * Constant representing the 'Relationships' cell name.
 * Used to locate relationship/connection formulas in shape cells.
 *
 * @type {string}
 */
const RELATIONSHIPS_CELL: string = 'Relationships';

/**
 * Constant representing the 'Value' cell name.
 * Used to locate value properties within section rows.
 *
 * @type {string}
 */
const VALUE_CELL: string = 'Value';

/**
 * Constant representing the 'Actions' section name in Visio shapes.
 * Used to locate action/behavioral definitions in shape sections.
 *
 * @type {string}
 */
const ACTIONS_SECTION: string = 'Actions';

/**
 * Converts a Visio shape object into a Syncfusion diagram node format.
 * This is the main transformation function that takes parsed Visio data
 * and converts it to the EJ2 diagram format.
 *
 * Handles:
 * - Coordinate system conversion (inches to pixels)
 * - Text binding and positioning
 * - Port/connection point mapping
 * - Styling and constraints application
 * - Shape type determination
 * - Group shape padding
 *
 * @param {any} node - The VisioShape object to convert.
 * @param {ParsingContext} context - Parser context with theme and configuration data.
 * @param {VisioNodeInput[]} shapeGroup - Array of all shapes (used for group processing).
 * @returns {any} A Syncfusion diagram node object with all properties transformed.
 *
 * @example
 * const diagramNode = convertVisioShapeToNode(visioShape, context, allShapes);
 * console.log(diagramNode.id); // Shape ID
 * console.log(diagramNode.width); // Width in pixels
 * console.log(diagramNode.annotations); // Text annotations
 *
 * @private
 */
export function convertVisioShapeToNode(node: any, context: ParsingContext, shapeGroup: VisioShape[]): any {
    // Compute EJ2 pivot by mapping Visio LocPin to top-origin pivot
    let pivot: Point = { x: 0.5, y: 0.5 };
    const hasSize: boolean = node && node.width != null && node.height != null;
    const hasPivot: boolean = node && node.pivotX != null && node.pivotY != null;

    if (hasSize && hasPivot) {
        const widthInches: number = Number(node.width);
        const heightInches: number = Number(node.height);
        if (widthInches > 0 && heightInches > 0) {
            pivot = normalizePivotForEJ2(
                Number(node.pivotX),
                Number(node.pivotY),
                widthInches,
                heightInches
            );
        }
    }

    // Convert Visio ports into Syncfusion diagram port format
    const diagramPorts: DiagramPort[] = (node.ports || []).map((port: VisioPort) => ({
        id: port.id,
        offset: { x: port.x, y: port.y },
        shape: 'Circle',
        style: { strokeColor: '#757575', strokeWidth: 1 }
    }));

    // Resolve annotation style for text rendering
    const annotation: VisioAnnotationInput | undefined = node.annotation as VisioAnnotationInput | undefined;
    const annotationStyle: ResolvedAnnotationStyle = setAnnotationStyle(node, context);

    // Initialize text binding (handles text positioning relative to shape bounds)
    let textBinding: SyncfusionTextBinding | null = null;

    // Process text annotation positioning if annotation data is available
    if (annotation && annotation.txtPinX !== undefined) {
        const shapeTransform: VisioShapeTransform = {
            pinX: node.offsetX,
            pinY: node.pinY / 96,
            width: node.width,
            height: node.height,
            verticalAlignment: setVerticalAlignment(node)
        };

        const textTransform: VisioTextTransform = {
            txtWidth: annotation.txtWidth,
            txtHeight: annotation.txtHeight,
            txtPinX: annotation.txtPinX,
            txtPinY: annotation.txtPinY,
            txtLocPinX: annotation.txtLocPinX,
            txtLocPinY: annotation.txtLocPinY,
            txtAngle: (annotation.rotateAngle || 0) * (Math.PI / 180),
            txtMargin: (annotation as any).margin
        };

        textBinding = VisioToSyncfusionTextBinder.bindVisioTextToSyncfusion(shapeTransform, textTransform);
    }

    // Resolve alignment and offset for annotation rendering
    const alignmentConfig: AnnotationAlignmentConfig = resolveAnnotationAlignmentAndOffset(node, textBinding);

    // Determine if this is a group node (contains child shapes)
    const isGroup: boolean = Array.isArray(node.children) && node.children.length > 0;

    // Build group-specific node object
    if (isGroup) {
        return {
            id: node.id,
            addInfo: node.addInfo,
            shape: setNodeShape(node, context, isGroup),
            style: getNodeStyle(node, context, isGroup),
            children: node.children,
            parentId: node.parentId,
            pivot,
            constraints: setConstraints(node, context),
            shadow: undefined,
            rotateAngle: (360 - radiansToDegrees(node.rotateAngle)) % 360 || 0,
            annotations: createAnnotationArray(node, alignmentConfig, annotationStyle)
        };
    }

    // Build standard non-group node object
    return {
        id: node.id,
        width: inchToPx(node.width),
        height: inchToPx(node.height),
        offsetX: inchToPx(node.offsetX),
        offsetY: node.offsetY,
        shape: setNodeShape(node, context, isGroup),
        addInfo: node.addInfo,
        style: getNodeStyle(node, context, isGroup),
        constraints: setConstraints(node, context),
        shadow: setShadow(node),
        flip: setFlip(node),
        visible: setVisibility(node),
        tooltip: { content: node.tooltip || '' },
        pivot,
        rotateAngle: (360 - radiansToDegrees(node.rotateAngle)) % 360 || 0,
        children: node.children,
        parentId: node.parentId,
        padding: setPadding(isGroup),
        ports: diagramPorts,
        margin: (node as VisioShapeData).calculatedMargin ? (node as VisioShapeData).calculatedMargin : undefined,
        annotations: createAnnotationArray(node, alignmentConfig, annotationStyle)
    };
}

/**
 * Determines the visibility state of a shape.
 * TextAnnotation shapes are always visible; other shapes use the visibility flag.
 *
 * @param {VisioNodeInput} node - The VisioShape object to check.
 * @returns {boolean} True if shape should be visible, false otherwise.
 *
 * @example
 * const visible = setVisibility(shape);
 * // Returns true for TextAnnotation, inverse of visibility for others
 *
 * @private
 */
function setVisibility(node: VisioNodeInput): boolean {
    // TextAnnotations are always visible
    return node.shape && node.shape.shape === 'TextAnnotation' ? true : node.visibility !== undefined ? !node.visibility : true;
}

/**
 * Type definition for shape padding (all four sides).
 * Used to define spacing around group shapes.
 *
 * @typedef {Object} Padding
 * @property {number} left - Left padding in pixels.
 * @property {number} right - Right padding in pixels.
 * @property {number} top - Top padding in pixels.
 * @property {number} bottom - Bottom padding in pixels.
 */
type Padding = { left: number; right: number; top: number; bottom: number };

/**
 * Sets padding for a shape based on whether it's a group or regular shape.
 * Group shapes have internal padding to accommodate child shapes;
 * regular shapes have no padding.
 *
 * @param {boolean} isGroup - Whether the shape is a group/container.
 * @returns {Padding} A padding object with all sides set uniformly.
 *
 * @example
 * const padding = setPadding(true);  // { left: 12, right: 12, top: 12, bottom: 12 }
 * const padding = setPadding(false); // { left: 0, right: 0, top: 0, bottom: 0 }
 *
 * @private
 */
function setPadding(isGroup: boolean): Padding {
    const value: number = isGroup ? 12 : 0;
    return { left: value, right: value, top: value, bottom: value };
}

/**
 * Converts a Visio text decoration model to EJ2 text decoration format.
 * Maps underline and strikethrough properties to EJ2 supported values.
 *
 * @param {VisioTextDecorationModel | undefined} textDecoration - The Visio text decoration model.
 * @returns {'None' | 'Underline' | 'LineThrough'} The EJ2 text decoration value.
 *
 * @example
 * const decoration = getTextDecoration(visioModel);
 * // Returns 'Underline', 'LineThrough', or 'None'
 *
 * @private
 */
export function getTextDecoration(textDecoration?: VisioTextDecorationModel): 'None' | 'Underline' | 'LineThrough' {
    if (!textDecoration) {
        return 'None';
    }
    if (textDecoration.underline) {
        return 'Underline';
    }
    if (textDecoration.strikethrough) {
        return 'LineThrough';
    }
    return 'None';
}

/**
 * Calculates the rotation angle for text annotations.
 * Handles segment angles for connector text and applies 360-degree normalization.
 *
 * @param {VisioNodeInput} node - The VisioShape with annotation data.
 * @returns {number} The rotation angle in degrees (0-360).
 *
 * @example
 * const angle = setRotateAngle(shape);
 * // Returns adjusted rotation angle with segment angle if applicable
 *
 * @private
 */
function setRotateAngle(node: VisioNodeInput): number {
    let rotateAngle: number = 0;

    if (node.annotation && node.annotation.rotateAngle) {
        // Normalize angle to 0-360 range (inverse for EJ2)
        rotateAngle = (360 - (node.annotation.rotateAngle)) % 360;

        // Add 90 degrees for segment angle (used for connector text)
        // if (node.annotation && node.annotation.segmentAngle) {
        //     rotateAngle += 90;
        // }
        return rotateAngle;
    } else if (node.annotation && node.annotation.segmentAngle) {
        rotateAngle += 90;
    }
    return rotateAngle;
}

/**
 * Extracts horizontal text alignment from a shape's annotation.
 *
 * @param {VisioNodeInput} node - The VisioShape with annotation data.
 * @returns {string} The horizontal alignment value ('Left', 'Right', 'Center', 'Justify').
 *
 * @example
 * const align = setHorizontalAlignment(shape);
 *
 * @private
 */
function setHorizontalAlignment(node: VisioNodeInput): string {
    return node.annotation && node.annotation.horizontalAlignment;
}

/**
 * Extracts vertical text alignment from a shape's annotation.
 *
 * @param {VisioNodeInput} node - The VisioShape with annotation data.
 * @returns {string} The vertical alignment value ('Top', 'Middle', 'Bottom').
 *
 * @example
 * const align = setVerticalAlignment(shape);
 *
 * @private
 */
function setVerticalAlignment(node: VisioNodeInput): string {
    return node.annotation && node.annotation.verticalAlignment;
}

/**
 * Resolves effective text alignment and offset for EJ2 annotation emission.
 * Consolidates orientation-aware alignment logic to handle vertical text, explicit pins, and defaults.
 * Eliminates code duplication between group and non-group node paths.
 *
 * @param {VisioNodeInput} node - The Visio node being converted
 * @param {SyncfusionTextBinding | null} textBinding - Pre-computed text binding from VisioToSyncfusionTextBinder
 * @returns {AnnotationAlignmentConfig} Resolved alignment values and offset for annotation rendering
 * @private
 */
function resolveAnnotationAlignmentAndOffset(
    node: VisioNodeInput,
    textBinding: SyncfusionTextBinding | null
): AnnotationAlignmentConfig {
    // Extract base alignment from annotation
    const baseVerticalAlign: string = setVerticalAlignment(node);
    const baseHorizontalAlign: string = setHorizontalAlignment(node);
    const isVerticalText: boolean = isVerticalTextAnnotation(node);

    // Check if explicit text positioning should be preserved
    const annotation: VisioAnnotationInput | undefined = node.annotation as VisioAnnotationInput | undefined;
    let hasExplicitTextPosition: boolean = false;
    if (annotation) {
        const hasExplicitFlag: boolean = (annotation as { hasExplicitTextPosition?: boolean }).hasExplicitTextPosition === true;
        hasExplicitTextPosition = hasExplicitFlag;
    }

    // Calculate node dimensions in pixels
    const nodeWidthPx: number = inchToPx(node.width);
    const nodeHeightPx: number = inchToPx(node.height);
    let annotationWidthInches: number = node.width;
    if (annotation && annotation.txtWidth) {
        annotationWidthInches = annotation.txtWidth;
    }
    const annotationWidthPx: number = inchToPx(annotationWidthInches);

    // Compute annotation offset using existing logic
    const annotationOffset: Point = calculateAnnotationOffset(
        textBinding,
        baseVerticalAlign,
        baseHorizontalAlign,
        nodeHeightPx,
        nodeHeightPx,
        annotationWidthPx,
        nodeWidthPx,
        isVerticalText,
        hasExplicitTextPosition
    );

    // Determine effective alignment based on text orientation
    let effectiveVerticalAlign: string = baseVerticalAlign;
    let effectiveHorizontalAlign: string = baseHorizontalAlign;

    if (isVerticalText) {
        // Vertical text: center both alignments; offset + rotation already position content
        effectiveVerticalAlign = 'Center';
        effectiveHorizontalAlign = 'Center';
    } else {
        if (hasExplicitTextPosition) {
            // Non-vertical with explicit pins: derive vertical anchor from TxtPinY, center horizontal
            effectiveHorizontalAlign = 'Center';
            const nodeHeightInches: number = typeof node.height === 'number' ? node.height : 0;
            const derived: 'Top' | 'Center' | 'Bottom' = deriveVerticalAlignForExplicitPins(
                annotation as VisioAnnotationInput,
                nodeHeightInches
            );
            effectiveVerticalAlign = derived;
        }
        // Otherwise, preserve computed alignments as-is
    }

    return {
        verticalAlign: effectiveVerticalAlign,
        horizontalAlign: effectiveHorizontalAlign,
        annotationOffset
    };
}

/**
 * Creates annotation array for Syncfusion diagram node.
 * Consolidates annotation properties including content, styling, alignment, and offset.
 * Shared by both group and non-group node paths.
 *
 * @param {VisioNodeInput} node - The Visio node being converted
 * @param {AnnotationAlignmentConfig} alignmentConfig - Resolved alignment and offset configuration
 * @param {ResolvedAnnotationStyle} annotationStyle - Resolved style for annotation rendering
 * @returns {any[]} Array containing single annotation object with all properties
 * @private
 */
function createAnnotationArray(
    node: VisioNodeInput,
    alignmentConfig: AnnotationAlignmentConfig,
    annotationStyle: ResolvedAnnotationStyle
): any[] {
    // Calculate annotation width in pixels from Visio inches
    let annotationInputWidthInches: number = node.width;
    const nodeAnnotation: VisioAnnotationInput = node.annotation as VisioAnnotationInput;
    if (nodeAnnotation.txtWidth) {
        annotationInputWidthInches = nodeAnnotation.txtWidth;
    }
    const annotationWidthPx: number = inchToPx(annotationInputWidthInches);

    const annotation: any = {
        content: node.annotation.content,
        width: annotationWidthPx,
        visibility: node.annotation.visible,
        hyperlink: setHyperLink(node, annotationStyle),
        rotateAngle: setRotateAngle(node),
        constraints: setAnnotationConstraints(node.annotation),
        verticalAlignment: alignmentConfig.verticalAlign,
        horizontalAlignment: alignmentConfig.horizontalAlign,
        offset: alignmentConfig.annotationOffset,
        style: annotationStyle
    };

    return [annotation];
}

/**
 * Calculates the final annotation offset after applying alignment rules.
 * If explicit text pins exist, preserves binder offsets. For vertical text (TextDirection=1),
 * swaps axes so Visio VerticalAlign maps to X and HorzAlign maps to Y.
 *
 * @param {SyncfusionTextBinding|null} textBinding - Binder-computed base offset (null => default center).
 * @param {'Top'|'Center'|'Bottom'} verticalAlignment - From Visio VerticalAlign.
 * @param {'Left'|'Center'|'Right'} horizontalAlignment - From Visio HorzAlign.
 * @param {number} annotationHeight - Annotation height (pixels). Not used; kept for signature stability.
 * @param {number} nodeHeight - Node height (pixels). Not used; kept for signature stability.
 * @param {number} annotationWidth - Annotation width (pixels). Not used; kept for signature stability.
 * @param {number} nodeWidth - Node width (pixels). Not used; kept for signature stability.
 * @param {boolean} isVerticalText - True if TextDirection=1 (rotated/vertical text).
 * @param {boolean} preserveExplicit - True when page-level text pins/dimensions define explicit position.
 * @returns {{x:number, y:number}} Final normalized offset in [0..1]×[0..1].
 */
function calculateAnnotationOffset(
    textBinding: SyncfusionTextBinding | null,
    verticalAlignment: string,
    horizontalAlignment: string,
    annotationHeight: number,
    nodeHeight: number,
    annotationWidth: number,
    nodeWidth: number,
    isVerticalText: boolean,
    preserveExplicit: boolean
): { x: number; y: number } {
    // Get base offset from binder or default to center
    let baseOffsetX: number = 0.5;
    let baseOffsetY: number = 0.5;
    if (textBinding !== null && textBinding.offset) {
        baseOffsetX = textBinding.offset.x;
        baseOffsetY = textBinding.offset.y;
    }

    // Clamp helper to ensure normalized range
    function clamp01(value: number): number {
        if (value < 0) { return 0; }
        if (value > 1) { return 1; }
        return value;
    }

    // Preserve explicit page-level text pins: do not snap to alignment edges
    if (preserveExplicit) {
        return { x: clamp01(baseOffsetX), y: clamp01(baseOffsetY) };
    }

    // Start with base offsets
    let finalX: number = baseOffsetX;
    let finalY: number = baseOffsetY;

    // Orientation-aware alignment snapping
    if (isVerticalText) {
        // For vertical text, Visio VerticalAlign controls the X edge.
        if (typeof verticalAlignment === 'string') {
            if (verticalAlignment === 'Top') {
                finalX = 1;
            } else if (verticalAlignment === 'Bottom') {
                finalX = 0;
            } else {
                // Center: keep binder X
            }
        }

        // For vertical text, Visio HorzAlign controls the Y edge.
        if (typeof horizontalAlignment === 'string') {
            if (horizontalAlignment === 'Left') {
                finalY = 0;
            } else if (horizontalAlignment === 'Right') {
                finalY = 1;
            } else {
                // Center: keep binder Y
            }
        }
    } else {
        // For horizontal text, HorzAlign controls X
        if (typeof horizontalAlignment === 'string') {
            if (horizontalAlignment === 'Left') {
                finalX = 0;
            } else if (horizontalAlignment === 'Right') {
                finalX = 1;
            } else {
                // Center: keep binder X
            }
        }

        // For horizontal text, VerticalAlign controls Y
        if (typeof verticalAlignment === 'string') {
            if (verticalAlignment === 'Top') {
                finalY = 0;
            } else if (verticalAlignment === 'Bottom') {
                finalY = 1;
            } else {
                // Center: keep binder Y
            }
        }
    }

    // Clamp and return
    finalX = clamp01(finalX);
    finalY = clamp01(finalY);
    return { x: finalX, y: finalY };
}

/**
 * Determines if a node's annotation should be treated as vertical text.
 * Considers both TextDirection=1 (segmentAngle flag) and TxtAngle approximates 90 or 270 degrees.
 * @param {VisioNodeInput} node - The node whose annotation is being emitted.
 * @returns {boolean} True if text is vertical; otherwise false.
 */
function isVerticalTextAnnotation(node: VisioNodeInput): boolean {
    // Guard: missing annotation cannot be vertical
    if (!node || !node.annotation) {
        return false;
    }

    // Use existing TextDirection mapping (segmentAngle flag)
    if (node.annotation.segmentAngle === true) {
        return true;
    }

    // Consider raw rotate angle (from TxtAngle in degrees) as a vertical detector
    // Treat angles close to 90 or 270 (within a small tolerance) as vertical.
    let rawAngle: number = 0;
    if (typeof node.annotation.rotateAngle === 'number') {
        rawAngle = node.annotation.rotateAngle;
    }

    // Normalize to [0..360)
    let normalized: number = rawAngle % 360;
    if (normalized < 0) {
        normalized = normalized + 360;
    }

    // Apply tolerance for numerical stability
    const tolerance: number = 0.5;
    const nearNinety: boolean = Math.abs(normalized - 90) <= tolerance;
    const nearTwoSeventy: boolean = Math.abs(normalized - 270) <= tolerance;

    if (nearNinety || nearTwoSeventy) {
        return true;
    }
    return false;
}

/**
 * Derives EJ2 vertical alignment for shapes that have explicit page-level text pins
 * and are NOT vertical text. Uses Visio's local Y (0=bottom, 1=top) to choose the
 * opposing EJ2 anchor so the binder's offset lands the block exactly like Visio.
 *
 * Rules:
 * - TxtPinY near top (>= ~0.67 of Height)  -> EJ2 'Bottom'
 * - TxtPinY near bottom (<= ~0.33 of Height) -> EJ2 'Top'
 * - Otherwise -> 'Center'
 *
 * If TxtPinY is unavailable, falls back to the emitted offsetY (normalized 0..1).
 *
 * @param {VisioAnnotationInput} annotation - Parsed annotation object (with txtPinY if present).
 * @param {number} nodeHeightInches - Node height in inches (Visio units).
 * @returns {'Top' | 'Center' | 'Bottom'} Vertical alignment to emit into EJ2.
 */
function deriveVerticalAlignForExplicitPins(
    annotation: VisioAnnotationInput,
    nodeHeightInches: number
): 'Top' | 'Center' | 'Bottom' {
    // Read TxtPinY (inches from bottom)
    let hasTxtPinY: boolean = false;
    let txtPinYInches: number = 0;
    if (
        annotation &&
        typeof (annotation as { txtPinY?: number }).txtPinY === 'number' &&
        isFinite(((annotation as { txtPinY?: number }).txtPinY as number))
    ) {
        txtPinYInches = ((annotation as { txtPinY?: number }).txtPinY as number);
        hasTxtPinY = true;
    }

    // Read TxtHeight (used for full-height detection)
    let hasTxtHeight: boolean = false;
    let txtHeightInches: number = 0;
    if (
        annotation &&
        typeof (annotation as { txtHeight?: number }).txtHeight === 'number' &&
        isFinite(((annotation as { txtHeight?: number }).txtHeight as number))
    ) {
        txtHeightInches = ((annotation as { txtHeight?: number }).txtHeight as number);
        hasTxtHeight = true;
    }

    // Read TxtLocPinY (needed to detect origin pin case)
    let hasTxtLocPinY: boolean = false;
    let txtLocPinYInches: number = 0;
    if (
        annotation &&
        typeof (annotation as { txtLocPinY?: number }).txtLocPinY === 'number' &&
        isFinite(((annotation as { txtLocPinY?: number }).txtLocPinY as number))
    ) {
        txtLocPinYInches = ((annotation as { txtLocPinY?: number }).txtLocPinY as number);
        hasTxtLocPinY = true;
    }

    // ---------------------------------------------------------------------
    // Implicit-center fallback
    // Visio renders centered when:
    //   - VerticalAlign is not authored,
    //   - the text block spans the full node height,
    //   - TxtPinY == 0 and TxtLocPinY == 0.
    //
    // This scenario appears visually centered in Visio and needs to map
    // to EJ2 'Center' to match output.
    // ---------------------------------------------------------------------
    const hasNodeHeight: boolean = typeof nodeHeightInches === 'number' &&
        isFinite(nodeHeightInches) && nodeHeightInches > 0;

    const isFullHeightBlock: boolean = hasTxtHeight &&
        hasNodeHeight &&
        Math.abs(txtHeightInches - nodeHeightInches) < 1e-6;

    const pinsAtOrigin: boolean = hasTxtPinY &&
        hasTxtLocPinY &&
        txtPinYInches === 0 &&
        txtLocPinYInches === 0;

    if (isFullHeightBlock && pinsAtOrigin) {
        return 'Center';
    }

    // Normalize TxtPinY to [0..1] (0 = bottom, 1 = top)
    let normalizedFromBottom: number = 0.5;
    if (hasTxtPinY && nodeHeightInches > 0 && isFinite(nodeHeightInches)) {
        normalizedFromBottom = txtPinYInches / nodeHeightInches;
        if (normalizedFromBottom < 0) { normalizedFromBottom = 0; }
        if (normalizedFromBottom > 1) { normalizedFromBottom = 1; }
    } else {
        // Fallback: derive from offsetY if TxtPinY is not present
        if (
            annotation &&
            (annotation as { offset?: { x: number; y: number } }).offset &&
            typeof ((annotation as { offset?: { x: number; y: number } }).offset as { x: number; y: number }).y === 'number'
        ) {
            const topOriginOffsetY: number = ((annotation as { offset?: { x: number; y: number } })
                .offset as { x: number; y: number }).y;

            let flipped: number = 1 - topOriginOffsetY;
            if (flipped < 0) { flipped = 0; }
            if (flipped > 1) { flipped = 1; }
            normalizedFromBottom = flipped;
        }
    }

    // Map normalized pin position to EJ2 vertical alignment
    const nearTopThreshold: number = 0.67;     // closer to top
    const nearBottomThreshold: number = 0.33;  // closer to bottom

    if (normalizedFromBottom >= nearTopThreshold) {
        return 'Bottom';
    }
    if (normalizedFromBottom <= nearBottomThreshold) {
        return 'Top';
    }
    return 'Center';
}

/**
 * Converts a Visio text alignment model to EJ2 text alignment format.
 * Maps left, right, justify properties to EJ2 supported values.
 *
 * @param {VisioTextAlignmentModel} alignment - The Visio text alignment model.
 * @returns {'Left' | 'Right' | 'Center' | 'Justify'} The EJ2 text alignment value.
 *
 * @example
 * const align = getTextAlign(visioAlignment);
 * // Returns 'Left', 'Right', 'Center', or 'Justify'
 *
 * @private
 */
export function getTextAlign(alignment: VisioTextAlignmentModel): 'Left' | 'Right' | 'Center' | 'Justify' {
    if (alignment.left) {
        return 'Left';
    }
    if (alignment.right) {
        return 'Right';
    }
    if (alignment.justify) {
        return 'Justify';
    }
    return 'Center';
}

/**
 * Sets annotation constraints based on shape lock properties.
 * Applies various constraints that control text editing, rotation, and selection.
 *
 * @param {VisioAnnotationInput} shape - The annotation/shape object with lock properties.
 * @returns {AnnotationConstraints} The EJ2 annotation constraints value.
 *
 * @example
 * const constraints = setAnnotationConstraints(annotation);
 *
 * @private
 */
function setAnnotationConstraints(shape: VisioAnnotationInput): AnnotationConstraints {
    let constraints: AnnotationConstraints = (shape as DiagramAnnotation).constraints;

    if (shape.lockTextEdit) {
        constraints = AnnotationConstraints.InheritReadOnly;
    }
    if (shape.lockRotate) {
        constraints &= ~AnnotationConstraints.Rotate;
    }
    if (shape.lockSelect) {
        constraints &= ~AnnotationConstraints.Select;
    }
    return constraints;
}

/**
 * Extracts hyperlink information from a shape's annotation.
 * Returns a hyperlink object if present, or undefined if no hyperlink exists.
 *
 * @param {VisioNodeInput} NodeData - The VisioShape with annotation data.
 * @param {ResolvedAnnotationStyle} nodeStyle - The VisioShape annotation style info.
 * @returns {DiagramHyperlink} The hyperlink object or undefined.
 *
 * @example
 * const hyperlink = setHyperLink(shape);
 * // Returns { link: '...', content: '...', hyperlinkOpenState: 'NewWindow' } or undefined
 *
 * @private
 */
function setHyperLink(NodeData: VisioNodeInput, nodeStyle: ResolvedAnnotationStyle): DiagramHyperlink {
    if (NodeData.annotation && NodeData.annotation.hyperlink && NodeData.annotation.hyperlink.link) {
        let textDecoration: string = 'None';
        if ((NodeData.annotation.style as AnnotationStyle).textDecoration.underline) {
            textDecoration = 'Underline';
        } else if ((NodeData.annotation.style as AnnotationStyle).textDecoration.strikethrough) {
            textDecoration = 'LineThrough';
        }
        return {
            link: NodeData.annotation.hyperlink.link,
            content: NodeData.annotation.content || '',
            hyperlinkOpenState: NodeData.annotation.hyperlink.newWindow ? 'NewWindow' : 'NewTab',
            color: nodeStyle.color || 'black',
            textDecoration: nodeStyle.textDecoration || 'None'
        };
    }
    return undefined;
}

/**
 * Sets the shape object for a Syncfusion diagram node.
 * Handles different shape types (Basic, Flow, Path, Image, BPMN, UML).
 * Converts Visio shape properties to EJ2 format with proper type mapping.
 *
 * @param {VisioNodeInput} shape - The VisioShape object with shape type information.
 * @param {ParsingContext} context - Parser context for warnings and configuration.
 * @param {boolean} isGroup - Whether the shape is a group/container (has children).
 * @returns {NodeShapeConfig} A shape object with type and type-specific properties.
 *
 * @example
 * const shapeObj = setNodeShape(visioShape, context);
 * // Returns { type: 'Basic', shape: 'Rectangle', cornerRadius: 0 }
 *
 * @private
 */
function setNodeShape(shape: VisioNodeInput, context: ParsingContext, isGroup: boolean): NodeShapeConfig {
    if (!shape || !shape.shape || isGroup) {
        return {
            type: 'Basic',
            shape: 'Rectangle',
            cornerRadius: 0
        };
    }

    // ==================== Extract Shape Type ====================
    const type: 'Basic' | 'Flow' | 'Path' | 'Image' | 'Bpmn' | 'UmlClassifier' | 'UmlActivity' = shape.shape.type;
    const mainShapeObject: VisioShapeInput = shape && shape.shape;

    // ==================== Log Rounding Limitations ====================
    if (shape.cornerRadius) {
        context.addWarning('[WARNING] :: In EJ2, cap type and rounding can only be adjusted for rectangles; there is no support for adjusting these properties for all shapes.');
    }

    // ==================== Handle BPMN Shapes ====================
    if (type === 'Bpmn') {
        const { type: bpmnType, ...bpmnProperties } = mainShapeObject;
        return {
            type: 'Bpmn',
            ...bpmnProperties,
            cornerRadius: shape.cornerRadius ? inchToPoint(shape.cornerRadius) : 0
        };
    }

    // ==================== Handle UML Activity Shapes ====================
    if ((type as string) === 'UmlActivity') {
        return {
            type: 'UmlActivity',
            shape: mainShapeObject.shape,
            cornerRadius: shape.cornerRadius ? inchToPoint(shape.cornerRadius) : 0
        };
    }

    // ==================== Default Shape Type Handling ====================
    return {
        type,
        // ==================== Type-Specific Properties ====================
        ...(type === 'Basic' || type === 'Flow'
            ? { shape: shape.shape.shape }  // Basic/Flow shapes have 'shape' property
            : type === 'Path'
                ? { data: shape.shape.data }  // Path shapes have 'data' property
                : type === 'Image'
                    ? { source: shape.shape.source }  // Image shapes have 'source' property
                    : {}),
        cornerRadius: shape.cornerRadius ? inchToPoint(shape.cornerRadius) : 0
    };
}

/**
 * Sets node constraints based on shape lock properties.
 * Applies constraints that control resizing, rotation, selection, and other interactions.
 *
 * @param {VisioNodeInput} shape - The VisioShape object with lock properties.
 * @param {ParsingContext} context - Parser context for warnings.
 * @returns {NodeConstraints} The EJ2 node constraints value.
 *
 * @example
 * const constraints = setConstraints(shape, context);
 *
 * @private
 */
function setConstraints(shape: VisioNodeInput, context: ParsingContext): NodeConstraints {
    let constraints: NodeConstraints = shape.constraints;
    constraints = NodeConstraints.Default;

    // ==================== Size Constraints ====================
    if (shape.lockHeight) {
        constraints &= ~(NodeConstraints.ResizeNorth | NodeConstraints.ResizeSouth);
    }
    if (shape.lockWidth) {
        constraints &= ~(NodeConstraints.ResizeWest | NodeConstraints.ResizeEast);
    }
    if (shape.lockHeight && shape.lockWidth) {
        constraints &= ~NodeConstraints.Resize;
    }

    // ==================== Position Constraints ====================
    if (shape.lockMoveX || shape.lockMoveY) {
        context.addWarning('[WARNING] :: In EJ2, individual disabling of drag constraints for X and Y positions is not supported. Therefore, if enabled, a node cannot be dragged.');
        constraints &= ~NodeConstraints.Drag;
    }

    // ==================== Rotation Constraints ====================
    if (shape.lockRotate) {
        constraints &= ~NodeConstraints.Rotate;
    }

    // ==================== Deletion Constraints ====================
    if (shape.lockDelete) {
        constraints &= ~NodeConstraints.Delete;
    }

    // ==================== Selection Constraints ====================
    if (shape.lockSelect) {
        constraints &= ~NodeConstraints.Select;
    }

    // ==================== Aspect Ratio Constraints ====================
    if (shape.lockAspect) {
        constraints |= NodeConstraints.AspectRatio;
    }

    // ==================== Text Edit Constraints ====================
    if (shape.lockTextEdit) {
        constraints |= NodeConstraints.ReadOnly;
    }

    // ==================== Shadow Constraints ====================
    if (shape.shadow && shape.shadow.shadowPattern) {
        constraints |= NodeConstraints.Shadow;
    }

    // ==================== Tooltip Constraints ====================
    if (shape.comment) {
        constraints |= NodeConstraints.Tooltip;
    }

    // ==================== Connection Constraints ====================
    if (shape.glueType && shape.glueValue === '8') {
        constraints &= ~(NodeConstraints.InConnect | NodeConstraints.OutConnect);
    }

    // ==================== Drop Target Constraints ====================
    if (shape.AllowDrop) {
        constraints |= NodeConstraints.AllowDrop;
    }

    return constraints;
}

/**
 * Normalizes Visio LocPin to EJ2 pivot with Y-axis flip.
 * EJ2 expects pivot in [0..1] from the top-left; Visio's LocPinY=0 is bottom.
 * @param {number} pivotXInches - Visio LocPinX in inches
 * @param {number} pivotYInches - Visio LocPinY in inches
 * @param {number} widthInches  - Shape width in inches
 * @param {number} heightInches - Shape height in inches
 * @returns {{ x: number, y: number }} Normalized EJ2 pivot (0..1)
 */
function normalizePivotForEJ2(
    pivotXInches: number,
    pivotYInches: number,
    widthInches: number,
    heightInches: number
): { x: number; y: number } {
    // Clamp helper to keep values within [0,1]
    function clamp01(v: number): number {
        if (v < 0) { return 0; }
        if (v > 1) { return 1; }
        return v;
    }

    // Compute normalized X from left (no flip needed on X)
    let xNormalized: number = 0.5;
    if (typeof widthInches === 'number' && isFinite(widthInches) && widthInches !== 0) {
        xNormalized = clamp01(pivotXInches / widthInches);
    }

    // Compute normalized Y from top; flip Visio's bottom-origin LocPinY
    let yNormalized: number = 0.5;
    if (typeof heightInches === 'number' && isFinite(heightInches) && heightInches !== 0) {
        yNormalized = clamp01(1 - (pivotYInches / heightInches));
    }

    return { x: xNormalized, y: yNormalized };
}

/**
 * Sets shadow properties for a shape if shadow is enabled.
 *
 * @param {VisioNodeInput} node - The VisioShape with shadow data.
 * @returns {ShadowProps} Shadow properties or undefined if no shadow.
 *
 * @example
 * const shadow = setShadow(shape);
 * // Returns { color: '#000000', opacity: 0.8, angle: 45, distance: 500 } or undefined
 *
 * @private
 */
function setShadow(node: VisioNodeInput): ShadowProps {
    if (node.shadow.shadowPattern && node.shadow.shapeShadowShow) {
        const shadow: ShadowProps = {
            color: node.shadow.shadowcolor,
            opacity: node.shadow.shadowOpacity,
            angle: node.shadow.shadow.angle,
            distance: (node.shadow.shadow.distance) * 100  // Scale distance
        };
        return shadow;
    }
    return undefined;
}

/**
 * Determines flip/mirroring direction for a shape.
 * Handles horizontal, vertical, or both directions.
 *
 * @param {FlippableShape} shape - The shape with flipX and flipY properties.
 * @returns {FlipDirection} The flip direction enum value.
 *
 * @example
 * const flip = setFlip(shape);
 * // Returns FlipDirection.Both, Horizontal, Vertical, or None
 *
 * @private
 */
function setFlip(shape: FlippableShape): FlipDirection {
    if (shape.flipX && shape.flipY) {
        return FlipDirection.Both;
    }
    if (shape.flipX) {
        return FlipDirection.Horizontal;
    }
    if (shape.flipY) {
        return FlipDirection.Vertical;
    }
    return FlipDirection.None;
}

/**
 * Determines the shape type and properties based on shape attributes and master data.
 * Maps Visio shape names to EJ2 diagram shape types (Basic, Flow, BPMN, UML, etc.).
 * Handles shape transformations and generates path data for custom shapes.
 *
 * @param {Attributes} attributes - The shape's XML attributes (Name, Type, etc.).
 * @param {VisioSection} defaultData - Default/master data containing geometry information.
 * @param {VisioShapeNode} shapes - The raw shape XML object with Cell and Section data.
 * @param {VisioNodeInput} [Node] - Optional: The VisioShape node being processed.
 * @param {ParsingContext} [context] - Optional: Parser context for warnings.
 * @returns {DetermineShapeResult} Shape type and type-specific properties.
 *
 * @example
 * const shapeResult = determineShapeType(attributes, defaultData, shapes, node, context);
 * // Returns { type: 'Basic', shape: 'Rectangle' } or other shape type
 *
 * @private
 */
export function determineShapeType(attributes: Attributes, defaultData: VisioSection, shapes: VisioShapeNode,
                                   Node?: VisioShape, context?: ParsingContext): DetermineShapeResult {
    // ==================== Define Shape Category Sets ====================
    const basicShapes: ReadonlySet<string> = new Set<string>([
        'Rectangle', 'Ellipse', 'Triangle', 'Pentagon', 'Heptagon', 'Octagon', 'Trapezoid',
        'Decagon', 'RightTriangle', 'Parallelogram', 'Hexagon', 'Cylinder', 'Diamond',
        'Polygon', 'Star', 'Plus'
    ]);

    const flowShapes: ReadonlySet<string> = new Set<string>([
        'Terminator', 'Process', 'Decision', 'Document', 'Data', 'Or', 'Collate', 'Merge',
        'Extract', 'Sort', 'SummingJunction', 'MultiDocument', 'OffPageReference',
        'PreDefinedProcess', 'DirectData', 'SequentialData', 'PaperTap', 'Card',
        'ManualOperation', 'StoredData', 'Preparation', 'Display', 'Delay', 'InternalStorage'
    ]);

    const bpmnShapes: ReadonlySet<string> = new Set<string>([
        'StartEvent', 'EndEvent', 'IntermediateEvent', 'Gateway', 'DataStore', 'DataObject',
        'TextAnnotation', 'Task', 'CollapsedSubProcess', 'ExpandedSubProcess', 'Group', 'Message'
    ]);

    const umlActivityShapes: ReadonlySet<string> = new Set<string>([
        'Action', 'Decision', 'MergeNode', 'InitialNode', 'FinalNode', 'ForkNode', 'JoinNode', 'Note'
    ]);

    const umlClassShapes: ReadonlySet<string> = new Set<string>([
        'Class', 'Member', 'Separator', 'Interface', 'Enumeration'
    ]);

    // ==================== Define Shape Transformation Maps ====================
    // Maps Visio shape names to EJ2 equivalents
    const shapeTransformations: ReadonlyMap<string, string> = new Map<string, string>([
        ['Subprocess', 'PreDefinedProcess'],
        ['MagneticTape', 'SequentialData'],
        ['Database', 'DirectData'],
        ['Microform', 'PaperTap'],
        ['custom3', 'Card'],
        ['custom2', 'ManualOperation'],
        ['Start/End', 'Terminator'],
        ['ExternalData', 'StoredData'],
        ['Custom4', 'Preparation']
    ]);

    // Maps for basic shape name normalization
    const basicTrans: ReadonlyMap<string, string> = new Map<string, string>([
        ['Cross', 'Plus'],
        ['5PointStar', 'Star'],
        ['Circle', 'Ellipse'],
        ['Can', 'Cylinder'],
        ['Square', 'Rectangle'],
        ['OnPageReference', 'Ellipse']
    ]);

    // ==================== Extract and Normalize Shape Name ====================
    const name: string = attributes.Name;
    let finalShape: string;

    if (name !== undefined) {
        // ==================== Normalize Shape Name ====================
        // Convert camelCase and remove hyphens/spaces
        let trimmedName: string = name.replace(/[-\s](.)/g, (match: string, letter: string) => letter.toUpperCase())
            .replace(/[-\s]/g, '');
        trimmedName = trimmedName.replace(/\.\d+$/, '').trim(); // Remove .digits suffix

        // ==================== Log Shape Appearance Warnings ====================
        if (name === 'Parallelogram' || name === 'Trapezoid' || name === 'Hexagon' ||
            name === 'Data' || name === 'Off-page reference' || name === 'Preparation' || name === 'Multi document') {
            context.addWarning(`[WARNING] :: In the Visio to EJ2 Basic import, the ${name} exist in the EJ2 diagram but their appearance differs.`);
        }

        // ==================== Apply Shape Transformations ====================
        const fromBasic: string = basicTrans.get(trimmedName);
        const fromTransform: string = shapeTransformations.get(trimmedName);

        finalShape = fromBasic !== undefined
            ? fromBasic
            : (fromTransform !== undefined ? fromTransform : trimmedName);

        // ==================== Special Handling for Decision Shape ====================
        // Decision could be UML or Flowchart - check master keywords
        if (finalShape === 'Decision') {
            const keywordsRaw: string = getShapeKeywordsFromMaster(shapes, context);
            const kw: string = (keywordsRaw || '').toLowerCase();

            const hasUml: boolean = kw.includes('uml');
            const hasFlow: boolean = kw.includes('flow') || kw.includes('flowchart');
            if (hasUml && !hasFlow) {
                if (finalShape === 'Decision') {
                    const shape: UMLActivityShapeResult = getUMLActivityShapes(shapes, finalShape);
                    return shape;
                }
            }
        }

        // ==================== Determine Final Shape Type ====================
        if (basicShapes.has(finalShape) || basicTrans.has(finalShape)) {
            return { type: 'Basic', shape: finalShape };
        }
        else if ((flowShapes.has(finalShape)) || shapeTransformations.has(finalShape)) {
            return { type: 'Flow', shape: finalShape };
        }
        else if (finalShape === 'Path') {
            // ==================== Generate Path Data for Custom Shapes ====================
            const drawpathData: string = createPathFromGeometry(attributes, undefined, undefined, { useLocalScaling: true });
            const drawformattedPath: string = formatPathData(drawpathData);
            return { type: 'Path', data: drawformattedPath };
        }
        else if (bpmnShapes.has(finalShape)) {
            const shape: BPMNShapeResult = getBPMNShapes(shapes, finalShape, Node, context);
            return shape;
        }
        else if (finalShape === 'Image') {
            return { type: 'Image', source: '' };
        }
        else if (umlActivityShapes.has(finalShape)) {
            const shape: UMLActivityShapeResult = getUMLActivityShapes(shapes, finalShape);
            return shape;
        }
    }

    // ==================== Default Shape ====================
    return undefined;
}

/**
 * Retrieves shape keywords from the shape's master definition.
 * Keywords are used for shape categorization and UML/BPMN detection.
 *
 * @param {VisioShapeNode} shape - The shape XML object with Master reference.
 * @param {ParsingContext} context - Parser context containing master data.
 * @returns {string} The shape keywords as a space-separated string, or empty string if not found.
 *
 * @example
 * const keywords = getShapeKeywordsFromMaster(shapeObj, context);
 * // Returns "uml flow diagram" or similar
 *
 * @private
 */
export function getShapeKeywordsFromMaster(shape: VisioShapeNode, context: ParsingContext): string {
    // ==================== Extract Master ID ====================
    const masterId: string = (shape && shape.$ && shape.$.Master != null)
        ? shape.$.Master
        : undefined;

    if (masterId == null) { return ''; }

    // ==================== Search Masters ====================
    const masters: VisioMaster[] = (context.data.masters) || [];
    if (!Array.isArray(masters)) { return ''; }

    const master: VisioMaster = masters.find((m: any) => {
        const mid: string = (m && m.id != null) ? m.id : undefined;
        return String(mid) === String(masterId);
    });

    // ==================== Return Keywords ====================
    if (!master || !master.shapeKeywords) { return ''; }
    return String(master.shapeKeywords);
}

/**
 * Retrieves UML activity shapes (Action, Decision, etc.).
 * Returns a UML Activity shape definition.
 *
 * @param {VisioShapeNode} shapes - The shape XML object.
 * @param {string} shapeName - The name of the UML activity shape.
 * @returns {UMLActivityShapeResult} A UML Activity shape definition.
 *
 * @example
 * const umlShape = getUMLActivityShapes(shapeXml, 'Decision');
 * // Returns { type: 'UmlActivity', shape: 'Decision' }
 *
 * @private
 */
function getUMLActivityShapes(shapes: VisioShapeNode, shapeName: string): UMLActivityShapeResult {
    return {
        type: 'UmlActivity',
        shape: shapeName
    };
}

/**
 * Main dispatcher for BPMN shape type determination.
 * Identifies specific BPMN shape subtypes and returns appropriate shape definitions.
 *
 * @param {VisioShapeNode} shapes - The shape XML object with Property section and cells.
 * @param {string} shapeName - The base BPMN shape name to categorize.
 * @param {VisioNodeInput} Node - The diagram node being processed.
 * @param {ParsingContext} context - Parser context for logging.
 * @returns {BPMNShapeResult} BPMN shape definition with type and subtype-specific properties.
 *
 * @example
 * const bpmnShape = getBPMNShapes(shapeObj, 'Event', node, context);
 * // Returns complete BPMN shape definition
 *
 * @private
 */
function getBPMNShapes(shapes: VisioShapeNode, shapeName: string, Node: VisioShape, context: ParsingContext): BPMNShapeResult {
    // ==================== Extract Property Map ====================
    const sections: VisioSection[] = ensureArray(shapes.Section);
    const propertySection: VisioSection = sections.find((sec: VisioSection) => sec.$ && sec.$.N === PROPERTY_SECTION);
    const propertyMap: BPMNPropertyMapType = createPropertyMap(propertySection);

    // ==================== Dispatch to Specific Shape Handler ====================
    if (shapeName.toLowerCase().includes('event')) {
        return getEventShape(shapes, propertyMap, Node);
    }
    else if (shapeName.toLowerCase().includes('gateway')) {
        return getGatewayShape(shapes, propertyMap, sections);
    }
    else if (shapeName.toLowerCase().includes('datastore')) {
        return getDataSourceShape();
    }
    else if (shapeName.toLowerCase().includes('dataobject')) {
        return getDataObjectShape(shapes, propertyMap, Node);
    }
    else if (shapeName.toLowerCase().includes('textannotation')) {
        return getTextAnnotationShape(shapes);
    }
    else if (shapeName.toLowerCase().includes('task') || shapeName.toLowerCase().includes('collapsedsubprocess')) {
        return getActivityShape(shapes, propertyMap);
    }
    else if (shapeName.toLowerCase().includes('expandedsubprocess')) {
        return getExpandedSubProcessShape(shapes, propertyMap, Node, context);
    }
    else if (shapeName.toLowerCase().includes('group')) {
        return getGroupShape(shapes);
    }
    else if (shapeName.toLowerCase().includes('message')) {
        return getMessageShape();
    }

    // ==================== Default to Event ====================
    return getEventShape(shapes, propertyMap, Node);
}

/**
 * Retrieves and processes BPMN flow shape (connector) types.
 * Identifies Association, Sequence, and Message flows.
 *
 * @param {VisioShapeNode} shapes - The shape XML object.
 * @param {string} shapeName - The flow shape name.
 * @param {VisioNodeInput} Node - The diagram node being processed.
 * @returns {BPMNFlowShapeResult | undefined} BPMN flow shape definition or undefined.
 *
 * @example
 * const flow = getBPMNFlowShapes(shapeObj, 'Association', node);
 *
 * @private
 */
export function getBPMNFlowShapes(shapes: VisioShapeNode, shapeName: string,
                                  Node: VisioNodeInput | VisioConnector): BPMNFlowShapeResult | undefined {
    let name: string = shapeName;

    // ==================== Extract BPMN Type from Properties ====================
    const sections: VisioSection[] = ensureArray(shapes.Section);
    const propertySection: VisioSection = sections.find((sec: VisioSection) => sec.$ && sec.$.N === PROPERTY_SECTION);
    const propertyMap: BPMNPropertyMapType = createPropertyMap(propertySection);

    const bpmnConnectingObjectType: string = propertyMap.get('BpmnConnectingObjectType');
    if (bpmnConnectingObjectType) {
        name = bpmnConnectingObjectType;
    }

    // ==================== Normalize Name and Dispatch ====================
    const cleanedBpmnType: string = name.replace(/\s+/g, '').toLowerCase();

    if (cleanedBpmnType.includes('association')) {
        return getBPMNAssociationFlow(propertyMap);
    }
    else if (cleanedBpmnType.includes('sequenceflow')) {
        return getBPMNSequenceFlow(propertyMap);
    }
    else if (cleanedBpmnType.includes('messageflow')) {
        return getBPMNMessageFlow();
    }
    return undefined;
}

/**
 * Processes BPMN Association flow shapes.
 * Determines flow direction (None, BiDirectional, Directional).
 *
 * @param {BPMNPropertyMapType} propertyMap - Property map from shape.
 * @returns {BPMNFlowShapeResult} Association flow definition.
 *
 * @example
 * const flow = getBPMNAssociationFlow(propMap);
 * // Returns { type: 'Bpmn', flow: 'Association', association: 'BiDirectional' }
 *
 * @private
 */
function getBPMNAssociationFlow(propertyMap: BPMNPropertyMapType): BPMNFlowShapeResult {
    let direction: 'Default' | 'BiDirectional' | 'Directional' = 'Default';

    // ==================== Direction Mapping ====================
    const associationDirectionMap: { [key: string]: ('BiDirectional' | 'Directional' | 'Default') } = {
        'none': 'Default',
        'both': 'BiDirectional',
        'one': 'Directional'
    };

    // ==================== Extract Direction ====================
    const bpmnAssociationDirection: string = propertyMap.get('BpmnDirection');
    if (bpmnAssociationDirection) {
        const lookupKey: string = bpmnAssociationDirection.replace(/\s+/g, '').toLowerCase();
        direction = associationDirectionMap[`${lookupKey}`] || 'Default';
    }

    return {
        type: 'Bpmn',
        flow: 'Association',
        association: direction
    };
}

/**
 * Processes BPMN Sequence flow shapes.
 * Determines flow condition type (Normal, Conditional, Default).
 *
 * @param {BPMNPropertyMapType} propertyMap - Property map from shape.
 * @returns {BPMNFlowShapeResult} Sequence flow definition.
 *
 * @example
 * const flow = getBPMNSequenceFlow(propMap);
 * // Returns { type: 'Bpmn', flow: 'Sequence', sequence: 'Conditional' }
 *
 * @private
 */
function getBPMNSequenceFlow(propertyMap: BPMNPropertyMapType): BPMNFlowShapeResult {
    let sequence: 'Default' | 'Normal' | 'Conditional' = 'Normal';

    // ==================== Condition Type Mapping ====================
    const associationDirectionMap: { [key: string]: ('Normal' | 'Conditional' | 'Default') } = {
        'default': 'Default',
        'none': 'Normal',
        'conditional': 'Conditional'
    };

    // ==================== Extract Condition Type ====================
    const bpmnAssociationDirection: string = propertyMap.get('BpmnConditionType');
    if (bpmnAssociationDirection) {
        const lookupKey: string = bpmnAssociationDirection.replace(/\s+/g, '').toLowerCase();
        sequence = associationDirectionMap[`${lookupKey}`] || 'Normal';
    }

    return {
        type: 'Bpmn',
        flow: 'Sequence',
        sequence: sequence
    };
}

/**
 * Processes BPMN Message flow shapes.
 * Returns a generic Message flow definition.
 *
 * @returns {BPMNFlowShapeResult} Message flow definition.
 *
 * @example
 * const flow = getBPMNMessageFlow();
 * // Returns { type: 'Bpmn', flow: 'Message', message: 'Default' }
 *
 * @private
 */
function getBPMNMessageFlow(): BPMNFlowShapeResult {
    return {
        type: 'Bpmn',
        flow: 'Message',
        message: 'Default'
    };
}

/**
 * Retrieves UML connector relationship types.
 * Identifies Inheritance, Association, Composition, etc.
 *
 * @param {VisioShapeNode} shapes - The shape XML object with Action section.
 * @param {string} shapeName - The connector name.
 * @param {VisioNodeInput} Node - The diagram node being processed.
 * @returns {UMLConnectorResult | undefined} UML connector definition with multiplicity.
 *
 * @example
 * const umlConnector = getUMLConnectors(shapeObj, 'Inheritance', node);
 *
 * @private
 */
export function getUMLConnectors(shapes: VisioShapeNode, shapeName: string,
                                 Node: VisioNodeInput | VisioConnector): UMLConnectorResult | undefined {
    let multiplicity: UMLConnectorResult['multiplicity'];

    // ==================== Type Mapping ====================
    const typeMapping: { [key: string]: string } = {
        'Row_3': 'Aggregation',
        'Row_4': 'Association',
        'Row_5': 'Composition',
        'Row_6': 'Dependency',
        'Row_7': 'DirectedAssociation',
        'Row_8': 'Inheritance',
        'Row_9': 'Realization'
    };

    // ==================== Check if UML Connector ====================
    const sections: VisioSection[] = ensureArray(shapes.Section);
    if (shapeName.includes('Inheritance') || shapeName.includes('Association') || shapeName.includes('Dependency')
        || shapeName.includes('Composition') || shapeName.includes('Aggregation') || shapeName.includes('InterfaceRealization') || shapeName.includes('DirectedAssociation')) {
        let shapeType: string = shapeName;

        // ==================== Extract Type from Actions Section ====================
        const actionsSection: VisioSection = sections.find((sec: VisioSection) => sec.$ && sec.$.N === ACTIONS_SECTION);
        if (actionsSection && actionsSection.Row) {
            const rows: VisioRow[] = ensureArray(actionsSection.Row);
            for (const row of rows) {
                if (row && row.$ && row.Cell) {
                    const cells: VisioCell[] = ensureArray(row.Cell);
                    const checkedCell: VisioCell = cells.find((cell: VisioCell) =>
                        cell.$ && cell.$.N === 'Checked' && cell.$.V === '1'
                    );

                    if (checkedCell) {
                        const rowName: string = row.$.N;

                        // ==================== Build Multiplicity for First Row ====================
                        if (rowName === 'Row_1') {
                            multiplicity = buildMultiplicity(shapes);
                        }

                        // ==================== Map Row to Type ====================
                        if (rowName in typeMapping) {
                            shapeType = typeMapping[`${rowName}`];
                            break;
                        }
                    }
                }
            }
        }

        // ==================== Normalize Interface Realization ====================
        if (shapeType === 'InterfaceRealization') {
            shapeType = 'Realization';
        }

        return {
            type: 'UmlClassifier',
            relationship: shapeType,
            multiplicity: multiplicity
        };
    }
    return undefined;
}

/**
 * Extracts text content from a shape XML object.
 * Looks for Text cell value.
 *
 * @param {VisioShapeNode | undefined} shape - The shape XML object.
 * @returns {string} The shape text content or empty string.
 *
 * @example
 * const text = getShapeText(shapeObj);
 *
 * @private
 */
function getShapeText(shape: VisioShapeNode | undefined): string {
    if (!shape) { return ''; }
    if (shape.Text && typeof shape.Text.value === 'string') { return shape.Text.value; }
    return '';
}

/**
 * Builds multiplicity information from child shapes of a connector.
 * Extracts multiplicity bounds from child shape text.
 *
 * @param {VisioShapeNode} groupShape - The connector group containing multiplicity child shapes.
 * @returns {UMLConnectorResult} Multiplicity object with source and target bounds.
 *
 * @example
 * const mult = buildMultiplicity(connectorShape);
 * // Returns { type: 'ManyToMany', source: {...}, target: {...} }
 *
 * @private
 */
function buildMultiplicity(groupShape: VisioShapeNode): UMLConnectorResult['multiplicity'] {
    // ==================== Extract Child Shapes ====================
    const children: VisioShapeNode[] = ensureArray(groupShape && groupShape.Shapes && groupShape.Shapes.Shape);

    // ==================== Extract Multiplicity Values ====================
    const t0: string = getShapeText(children[0]) || 'M1';
    const t1: string = getShapeText(children[1]) || 'M2';
    const t2: string = getShapeText(children[2]) || 'M3';
    const t3: string = getShapeText(children[3]) || 'M4';

    const sourceLower: string = t0;
    const sourceUpper: string = t1;
    const targetLower: string = t2;
    const targetUpper: string = t3;

    const sourceOptional: boolean = true;
    const targetOptional: boolean = true;

    const type: string = 'ManyToMany';

    return {
        type: type,
        source: { optional: sourceOptional, lowerBounds: sourceLower, upperBounds: sourceUpper },
        target: { optional: targetOptional, lowerBounds: targetLower, upperBounds: targetUpper }
    };
}

/**
 * Safely extracts property value from a section row's cell.
 * Looks for the Value cell within the row.
 *
 * @param {VisioRow} row - The property section row.
 * @param {string} propertyName - The expected property name.
 * @returns {string | undefined} The cell value or undefined if not found.
 *
 * @example
 * const value = getPropertyValue(row, 'BpmnEventType');
 *
 * @private
 */
function getPropertyValue(row: VisioRow, propertyName: string): string | undefined {
    if (!row || !row.$ || row.$.N !== propertyName || !row.Cell) {
        return undefined;
    }
    const cells: VisioCell[] = ensureArray(row.Cell);
    const valueCell: VisioCell = cells.find((c: VisioCell) => c && c.$ && c.$.N === VALUE_CELL);
    return valueCell && valueCell.$ && valueCell.$.V != null ? String(valueCell.$.V).replace(/\s+/g, '') : undefined;
}

/**
 * Creates a property map from a Property or User section.
 * Converts rows into a Map for efficient property lookup.
 *
 * @param {VisioSection} section - The Property or User section from shape.
 * @returns {BPMNPropertyMapType} Map of property name -> value.
 *
 * @example
 * const propMap = createPropertyMap(propertySection);
 *
 * @private
 */
function createPropertyMap(section: VisioSection): BPMNPropertyMapType {
    const propertyMap: BPMNPropertyMapType = new Map<string, string>();
    if (section && section.Row) {
        const propertyRows: VisioRow[] = ensureArray(section.Row);
        propertyRows.forEach((row: VisioRow) => {
            if (row && row.$ && row.$.N) {
                const value: string = getPropertyValue(row, row.$.N);
                if (value !== undefined) {
                    propertyMap.set(row.$.N, value);
                }
            }
        });
    }
    return propertyMap;
}

/**
 * Processes BPMN Event shapes.
 * Determines event type (Start, End, Intermediate) and trigger/result.
 *
 * @param {VisioShapeNode} shapes - The event shape XML object.
 * @param {BPMNPropertyMapType} propertyMap - Property map from shape.
 * @param {VisioNodeInput} node - The diagram node being processed.
 * @returns {BPMNEventShapeResult} BPMN Event shape definition.
 *
 * @example
 * const event = getEventShape(shapeObj, propMap, node);
 * // Returns { type: 'Bpmn', shape: 'Event', event: {...} }
 *
 * @private
 */
function getEventShape(shapes: VisioShapeNode, propertyMap: BPMNPropertyMapType, node: VisioShape): BPMNEventShapeResult {
    let eventName: string = 'Start';
    let trigger: string = 'None';

    // ==================== Event Type Mapping ====================
    const eventNameMap: { [key: string]: string } = {
        'start(non-interrupting)': 'NonInterruptingStart',
        'intermediate(non-interrupting)': 'NonInterruptingIntermediate',
        'intermediate(throwing)': 'ThrowingIntermediate'
    };

    const triggerMap: { [key: string]: string } = {
        'parallelmultiple': 'Parallel'
    };

    // ==================== Extract Event Type from Shape Name ====================
    if (shapes.$.Name) {
        const nameParts: string[] = shapes.$.Name.split(' ').map((p: string) => p.trim().toLowerCase());
        eventName = nameParts[0];
    }

    // ==================== Extract from Properties ====================
    const bpmnEventType: string = propertyMap.get('BpmnEventType');
    if (bpmnEventType) {
        eventName = bpmnEventType;
    }

    const bpmnTriggerOrResult: string = propertyMap.get('BpmnTriggerOrResult');
    if (bpmnTriggerOrResult) {
        trigger = bpmnTriggerOrResult;
    }

    // ==================== Normalize Names ====================
    eventName = toCapitalizedWords(eventName);
    trigger = toCapitalizedWords(trigger);
    eventName = eventNameMap[eventName.toLowerCase()] || eventName;
    trigger = triggerMap[trigger.toLowerCase()] || trigger;

    // ==================== Extract Colors from Child Shapes ====================
    const childShapes: VisioShapeNode[] = shapes.Shapes && shapes.Shapes.Shape && ensureArray(shapes.Shapes.Shape);
    if (childShapes && childShapes.length > 0) {
        let fillColorFound: boolean = false;
        let strokeColorFound: boolean = false;

        for (const childShape of childShapes) {
            if (childShape && childShape.Cell) {
                const childCell: Map<string, CellMapValue> = mapCellValues(childShape.Cell);

                if (!fillColorFound) {
                    const fillColor: string = getCellMapStringValue(childCell, 'FillForegnd');
                    if (fillColor !== undefined) {
                        if ((node as VisioShape).style && (node as VisioShape).style.fillColor === undefined) {
                            (node as VisioShape).style.fillColor = fillColor;
                        }
                        fillColorFound = true;
                    }
                }

                if (!strokeColorFound) {
                    const strokeColor: string = getCellMapStringValue(childCell, 'LineColor');
                    if (strokeColor !== undefined) {
                        if ((node as VisioShape).style && (node as VisioShape).style.strokeColor === undefined) {
                            (node as VisioShape).style.strokeColor = strokeColor;
                        }
                        strokeColorFound = true;
                    }
                }

                if (fillColorFound && strokeColorFound) {
                    break;
                }
            }
        }
    }

    return {
        type: 'Bpmn',
        shape: 'Event',
        event: {
            event: eventName,
            trigger: trigger
        }
    };
}

/**
 * Processes BPMN Gateway shapes.
 * Determines gateway type (Exclusive, Inclusive, Parallel, etc.).
 *
 * @param {VisioShapeNode} shapes - The gateway shape XML object.
 * @param {BPMNPropertyMapType} propertyMap - Property map from shape.
 * @param {VisioSection[]} sections - All sections from the shape.
 * @returns {BPMNGatewayShapeResult} BPMN Gateway shape definition.
 *
 * @example
 * const gateway = getGatewayShape(shapeObj, propMap, sections);
 * // Returns { type: 'Bpmn', shape: 'Gateway', gateway: {...} }
 *
 * @private
 */
function getGatewayShape(shapes: VisioShapeNode, propertyMap: BPMNPropertyMapType, sections: VisioSection[]): BPMNGatewayShapeResult {
    let gatewayType: string = 'None'; // Default gateway type

    // ==================== Gateway Type Mapping ====================
    const gatewayMap: { [key: string]: string } = {
        'exclusive': 'None',
        'inclusive': 'Inclusive',
        'parallel': 'Parallel',
        'complex': 'Complex',
        'event': 'EventBased',
        'eventbased': 'Exclusive',
        'exclusiveevent(instantiate)': 'ExclusiveEventBased',
        'parallelevent(instantiate)': 'ParallelEventBased'
    };

    // ==================== Extract Gateway Type ====================
    const bpmnGatewayType: string = propertyMap.get('BpmnGatewayType');
    if (bpmnGatewayType) {
        gatewayType = bpmnGatewayType;
    } else {
        const bpmnExclusiveType: string = propertyMap.get('BpmnExclusiveType');
        if (bpmnExclusiveType) {
            gatewayType = bpmnExclusiveType;
        }
    }

    // ==================== Check for Event-Based Gateway Marker ====================
    const actionsSection: VisioSection = sections.find((sec: VisioSection) => sec.$ && sec.$.N === ACTIONS_SECTION);
    if (actionsSection && actionsSection.Row) {
        const actionRows: VisioRow[] = ensureArray(actionsSection.Row);
        const exclusiveDataWithMarkerRow: VisioRow = actionRows.find((row: VisioRow) => row && row.$ && row.$.N === 'ExclusiveDataWithMarker');
        if (exclusiveDataWithMarkerRow && exclusiveDataWithMarkerRow.Cell) {
            const checkedCell: VisioCell = ensureArray(exclusiveDataWithMarkerRow.Cell).find((cell: VisioCell) => cell && cell.$ && cell.$.N === 'Checked');
            if (checkedCell && checkedCell.$.V === '1') {
                gatewayType = 'eventbased';
            }
        }
    }

    // ==================== Map to EJ2 Gateway Type ====================
    const lookupKey: string = gatewayType.toLowerCase().replace(/\s/g, '');
    const GatewayType: string = gatewayMap[`${lookupKey}`] || 'None';

    return {
        type: 'Bpmn',
        shape: 'Gateway',
        gateway: {
            type: GatewayType
        }
    };
}

/**
 * Returns a DataSource shape definition for BPMN.
 *
 * @returns {BPMNSimpleShapeResult} DataSource shape definition.
 *
 * @example
 * const dataStore = getDataSourceShape();
 *
 * @private
 */
function getDataSourceShape(): BPMNSimpleShapeResult {
    return {
        type: 'Bpmn',
        shape: 'DataSource'
    };
}

/**
 * Returns a Message shape definition for BPMN.
 *
 * @returns {BPMNSimpleShapeResult} Message shape definition.
 *
 * @example
 * const message = getMessageShape();
 *
 * @private
 */
function getMessageShape(): BPMNSimpleShapeResult {
    return {
        type: 'Bpmn',
        shape: 'Message'
    };
}

/**
 * Processes BPMN DataObject shapes.
 * Determines if collection flag is set.
 *
 * @param {VisioShapeNode} shapes - The data object shape XML object.
 * @param {BPMNPropertyMapType} propertyMap - Property map from shape.
 * @param {VisioNodeInput} node - The diagram node being processed.
 * @returns {BPMNDataObjectShapeResult} BPMN DataObject shape definition.
 *
 * @example
 * const dataObj = getDataObjectShape(shapeObj, propMap, node);
 *
 * @private
 */
function getDataObjectShape(shapes: VisioShapeNode, propertyMap: BPMNPropertyMapType, node: VisioShape): BPMNDataObjectShapeResult {
    let isCollection: boolean = false;

    // ==================== Extract Collection Flag ====================
    const bpmnCollection: string = propertyMap.get('BpmnCollection');
    if (bpmnCollection === '1') {
        isCollection = true;
    }

    // ==================== Extract Colors from Child Shapes ====================
    const childShapes: VisioShapeNode[] = shapes.Shapes && shapes.Shapes.Shape && ensureArray(shapes.Shapes.Shape);
    if (childShapes && childShapes.length > 0) {
        let fillColorFound: boolean = false;
        let strokeColorFound: boolean = false;

        for (const childShape of childShapes) {
            if (childShape && childShape.Cell) {
                const childCell: Map<string, CellMapValue> = mapCellValues(childShape.Cell);

                if (!fillColorFound) {
                    const fillColor: string = getCellMapStringValue(childCell, 'FillForegnd');
                    if (fillColor !== undefined) {
                        if ((node as VisioShape).style && (node as VisioShape).style.fillColor === undefined) {
                            (node as VisioShape).style.fillColor = fillColor;
                        }
                        fillColorFound = true;
                    }
                }

                if (!strokeColorFound) {
                    const strokeColor: string = getCellMapStringValue(childCell, 'LineColor');
                    if (strokeColor !== undefined) {
                        if ((node as VisioShape).style && (node as VisioShape).style.strokeColor === undefined) {
                            (node as VisioShape).style.strokeColor = strokeColor;
                        }
                        strokeColorFound = true;
                    }
                }

                if (fillColorFound && strokeColorFound) {
                    break;
                }
            }
        }
    }

    return {
        type: 'Bpmn',
        shape: 'DataObject',
        dataObject: {
            collection: isCollection,
            type: 'None'
        }
    };
}

/**
 * Processes BPMN TextAnnotation shapes.
 * Determines annotation direction and target relationship.
 *
 * @param {VisioShapeNode} shapes - The text annotation shape XML object.
 * @returns {BPMNTextAnnotationShapeResult} BPMN TextAnnotation shape definition.
 *
 * @example
 * const textAnnot = getTextAnnotationShape(shapeObj);
 *
 * @private
 */
function getTextAnnotationShape(shapes: VisioShapeNode): BPMNTextAnnotationShapeResult {
    let direction: 'Top' | 'Bottom' | 'Left' | 'Right' = 'Left';
    let targetId: string = '';

    // ==================== Direction Mapping ====================
    const orientationMap: { [key: string]: ('Top' | 'Bottom' | 'Left' | 'Right') } = {
        '1': 'Right',
        '2': 'Top',
        '3': 'Left',
        '4': 'Bottom'
    };

    // ==================== Extract Direction from User Section ====================
    const sections: VisioSection[] = ensureArray(shapes.Section);
    const userSection: VisioSection = sections.find((sec: VisioSection) => sec.$ && sec.$.N === USER_SECTION);
    const propertyMap: BPMNPropertyMapType = createPropertyMap(userSection as VisioSection);
    const orientation: string = propertyMap.get('Orientation');
    if (orientation && orientationMap[`${orientation}`]) {
        direction = orientationMap[`${orientation}`];
    }

    // ==================== Extract Target from Relationships ====================
    const shapeCells: VisioCell[] = ensureArray(shapes.Cell);
    const relationshipCell: VisioCell = shapeCells.find((cell: VisioCell) => cell && cell.$ && cell.$.N === RELATIONSHIPS_CELL);
    if (relationshipCell && relationshipCell.$.F) {
        targetId = getTextAnnotationTargetID(relationshipCell.$.F) || '';
    }

    return {
        type: 'Bpmn',
        shape: 'TextAnnotation',
        textAnnotation: {
            textAnnotationDirection: direction,
            textAnnotationTarget: targetId || ''
        }
    };
}

/**
 * Processes BPMN Activity (Task or SubProcess) shapes.
 * Determines activity type and delegates to appropriate handler.
 *
 * @param {VisioShapeNode} shapes - The activity shape XML object.
 * @param {BPMNPropertyMapType} propertyMap - Property map from shape.
 * @returns {BPMNActivityShapeResult} BPMN Activity shape definition.
 *
 * @example
 * const activity = getActivityShape(shapeObj, propMap);
 *
 * @private
 */
function getActivityShape(shapes: VisioShapeNode, propertyMap: BPMNPropertyMapType): BPMNActivityShapeResult {
    let activityType: string = 'Task';

    // ==================== Extract Activity Type ====================
    if (shapes.$.Name) {
        activityType = shapes.$.Name.replace(/[^a-zA-Z]/g, '');
    }

    const bpmnActivityType: string = propertyMap.get('BpmnActivityType');
    if (bpmnActivityType) {
        if (bpmnActivityType === 'Sub-Process') {
            activityType = 'SubProcess';
        } else if (bpmnActivityType === 'Task') {
            activityType = 'Task';
        }
    }

    // ==================== Delegate to Appropriate Handler ====================
    if (activityType === 'SubProcess' || activityType === 'CollapsedSubProcess') {
        return getSubProcessShape(shapes, propertyMap);
    } else {
        return getTaskShape(shapes, propertyMap);
    }
}

/**
 * Processes BPMN Task shapes.
 * Determines task type, loop type, compensation, and call flags.
 *
 * @param {VisioShapeNode} shapes - The task shape XML object.
 * @param {BPMNPropertyMapType} propertyMap - Property map from shape.
 * @returns {BPMNActivityShapeResult} BPMN Task activity definition.
 *
 * @example
 * const task = getTaskShape(shapeObj, propMap);
 *
 * @private
 */
function getTaskShape(shapes: VisioShapeNode, propertyMap: BPMNPropertyMapType): BPMNActivityShapeResult {
    const task: { type: string, loop: string, compensation: boolean, call: boolean } = {
        type: 'None',
        loop: 'None',
        compensation: false,
        call: false
    };

    // ==================== Loop Type Mapping ====================
    const loopTypeMap: { [key: string]: string } = {
        'none': 'None',
        'standard': 'Standard',
        'parallelmultiinstance': 'ParallelMultiInstance',
        'sequentialmultiinstance': 'SequenceMultiInstance'
    };

    // ==================== Extract Task Properties ====================
    task.type = propertyMap.get('BpmnTaskType') || 'None';
    task.compensation = propertyMap.get('BpmnIsForCompensation') === '1';
    task.call = propertyMap.get('BpmnBoundaryType') === 'Call';

    // ==================== Extract Loop Type ====================
    const visioLoopValue: string = propertyMap.get('BpmnLoopType') || 'none';
    const visioLoopKey: string = visioLoopValue.toLowerCase();
    task.loop = loopTypeMap[`${visioLoopKey}`] || visioLoopValue;

    return {
        type: 'Bpmn',
        shape: 'Activity',
        activity: {
            activity: 'Task',
            task: task
        }
    };
}

/**
 * Processes BPMN SubProcess shapes (collapsed).
 * Determines subprocess properties including loop, compensation, and boundary type.
 *
 * @param {VisioShapeNode} shapes - The subprocess shape XML object.
 * @param {BPMNPropertyMapType} propertyMap - Property map from shape.
 * @returns {BPMNActivityShapeResult} BPMN SubProcess activity definition.
 *
 * @example
 * const subProc = getSubProcessShape(shapeObj, propMap);
 *
 * @private
 */
function getSubProcessShape(shapes: VisioShapeNode, propertyMap: BPMNPropertyMapType): BPMNActivityShapeResult {
    const subProcess: {
        type: string, loop: string, compensation: boolean, adhoc: boolean,
        collapsed: boolean, boundary: string,
    } = {
        type: 'None', loop: 'None', compensation: false, adhoc: false,
        collapsed: true, boundary: 'Default'
    };

    // ==================== Loop Type Mapping ====================
    const loopTypeMap: { [key: string]: string } = {
        'none': 'None', 'standard': 'Standard', 'parallelmultiinstance': 'ParallelMultiInstance',
        'sequentialmultiinstance': 'SequenceMultiInstance'
    };

    // ==================== Extract SubProcess Properties ====================
    subProcess.type = 'None';
    subProcess.compensation = propertyMap.get('BpmnIsForCompensation') === '1';
    subProcess.adhoc = propertyMap.get('BpmnAdHoc') === '1';

    // ==================== Extract Collapse State ====================
    const isCollapsedValue: string = propertyMap.get('BpmnIsCollapsed');
    subProcess.collapsed = isCollapsedValue !== '0';

    // ==================== Extract Loop Type ====================
    const visioLoopValue: string = propertyMap.get('BpmnLoopType') || 'none';
    const visioLoopKey: string = visioLoopValue.toLowerCase();
    subProcess.loop = loopTypeMap[`${visioLoopKey}`] || visioLoopValue;

    // ==================== Extract Boundary Type ====================
    subProcess.boundary = propertyMap.get('BpmnBoundaryType') || 'Default';

    return {
        type: 'Bpmn',
        shape: 'Activity',
        activity: {
            activity: 'SubProcess',
            subProcess: subProcess
        }
    };
}

/**
 * Processes BPMN ExpandedSubProcess shapes.
 * Determines subprocess properties and extracts child process IDs.
 *
 * @param {VisioShapeNode} shapes - The expanded subprocess shape XML object.
 * @param {BPMNPropertyMapType} propertyMap - Property map from shape.
 * @param {VisioNodeInput} Node - The diagram node being processed.
 * @param {ParsingContext} context - Parser context for tracking expanded processes.
 * @returns {BPMNActivityShapeResult} BPMN ExpandedSubProcess activity definition.
 *
 * @example
 * const expandedSubProc = getExpandedSubProcessShape(shapeObj, propMap, node, context);
 *
 * @private
 */
function getExpandedSubProcessShape(shapes: VisioShapeNode, propertyMap: BPMNPropertyMapType,
                                    Node: VisioShape, context: ParsingContext): BPMNActivityShapeResult {
    const subProcess: BPMNSubProcessInput = {
        loop: 'None',
        compensation: false,
        adhoc: false,
        collapsed: false,
        boundary: 'Default',
        processes: []
    };

    // ==================== Loop Type Mapping ====================
    const loopTypeMap: { [key: string]: string } = {
        'none': 'None', 'standard': 'Standard', 'parallelmultiinstance': 'ParallelMultiInstance',
        'sequentialmultiinstance': 'SequenceMultiInstance'
    };

    // ==================== Extract SubProcess Properties ====================
    subProcess.compensation = propertyMap.get('BpmnIsForCompensation') === '1';
    subProcess.adhoc = propertyMap.get('BpmnAdHoc') === '1';
    subProcess.boundary = propertyMap.get('BpmnBoundaryType') || 'Default';

    // ==================== Extract Loop Type ====================
    const visioLoopValue: string = propertyMap.get('BpmnLoopType') || 'none';
    const visioLoopKey: string = visioLoopValue.toLowerCase();
    subProcess.loop = loopTypeMap[`${visioLoopKey}`] || visioLoopValue;

    // ==================== Mark as Drop Target ====================
    (Node as any).AllowDrop = true;

    // ==================== Extract Child Process IDs ====================
    const shapeCells: VisioCell[] = ensureArray(shapes.Cell);
    const relationshipCell: VisioCell = shapeCells.find((cell: VisioCell) => cell && cell.$ && cell.$.N === RELATIONSHIPS_CELL);
    if (relationshipCell && relationshipCell.$.F) {
        const processIDs: string[] = getProcessIDs(shapes);
        if (processIDs.length > 0) {
            subProcess.processes = processIDs;
        }
    }

    // ==================== Track Expanded Process ====================
    const shapeID: string = getShapeId(shapes);
    if (shapeID) {
        context.data.expandedSubprocessCollection.push(shapeID);
    }

    return {
        type: 'Bpmn',
        shape: 'Activity',
        activity: {
            activity: 'SubProcess',
            subProcess: subProcess as BPMNSubProcess
        }
    };
}

/**
 * Extracts shape ID from shape XML attributes.
 *
 * @param {VisioShapeNode} shapes - The shape XML object.
 * @returns {string} The shape ID or empty string.
 *
 * @example
 * const id = getShapeId(shapeObj);
 *
 * @private
 */
function getShapeId(shapes: VisioShapeNode): string {
    return shapes && shapes.$ && shapes.$.ID != null ? String(shapes.$.ID) : '';
}

/**
 * Processes BPMN Group shapes.
 * Returns a group shape definition.
 *
 * @param {VisioShapeNode} shapes - The group shape XML object.
 * @returns {BPMNSimpleShapeResult} BPMN Group shape definition.
 *
 * @example
 * const group = getGroupShape(shapeObj);
 *
 * @private
 */
function getGroupShape(shapes: VisioShapeNode): BPMNSimpleShapeResult {
    const shapeCells: VisioCell[] = ensureArray(shapes.Cell);
    const relationshipCell: VisioCell = shapeCells.find((cell: VisioCell) => cell && cell.$ && cell.$.N === RELATIONSHIPS_CELL);

    return {
        type: 'Bpmn',
        shape: 'Group'
    };
}

/**
 * Extracts child process IDs from a subprocess Relationships cell formula.
 * Parses complex DEPENDSON formulas to extract Sheet references.
 *
 * @param {VisioShapeNode} shape - The subprocess shape with Relationships cell.
 * @returns {string[]} Array of process IDs extracted from formula.
 *
 * @example
 * const processIds = getProcessIDs(subprocessShape);
 * // Returns ['1', '2', '3'] etc.
 *
 * @private
 */
function getProcessIDs(shape: VisioShapeNode): string[] {
    const processIDs: string[] = [];

    // ==================== Extract Relationships Cell ====================
    const relationsCell: VisioCell = ensureArray(shape.Cell).find((c: VisioCell) => c.$.N === RELATIONSHIPS_CELL);
    if (relationsCell && relationsCell.$.F) {
        const formula: string = relationsCell.$.F;

        // ==================== Parse SUM Formula ====================
        const sumArgsRegex: RegExp = /SUM\((.*)\)/;
        const sumMatch: RegExpMatchArray | null = formula.match(sumArgsRegex);
        if (sumMatch && sumMatch[1]) {
            const argsString: string = sumMatch[1];

            // ==================== Split by DEPENDSON Calls ====================
            const dependsonCallSplitter: RegExp = /,(?=\s*DEPENDSON\()/g;
            const individualDependsonCalls: string[] = argsString.split(dependsonCallSplitter);

            // ==================== Extract Sheet IDs ====================
            for (const call of individualDependsonCalls) {
                if (call.startsWith('DEPENDSON(1,')) {
                    const sheetIdExtractorRegex: RegExp = /Sheet\.(\d+)!SheetRef\(\)/g;
                    let sheetIdExtractMatch: RegExpExecArray | null;
                    sheetIdExtractMatch = sheetIdExtractorRegex.exec(call);
                    while (sheetIdExtractMatch !== null) {
                        if (sheetIdExtractMatch[1]) {
                            processIDs.push(sheetIdExtractMatch[1]);
                        }
                        sheetIdExtractMatch = sheetIdExtractorRegex.exec(call);
                    }
                }
            }
        }
    }

    return processIDs;
}

/**
 * Extracts target shape ID from a TextAnnotation Relationships formula.
 * Parses Sheet reference to identify the connected shape.
 *
 * @param {string} formula - The Relationships cell formula.
 * @returns {string | null} The target shape ID or null if not found.
 *
 * @example
 * const targetId = getTextAnnotationTargetID('DEPENDSON(1,Sheet.5!SheetRef())');
 * // Returns '5'
 *
 * @private
 */
function getTextAnnotationTargetID(formula: string): string | null {
    if (!formula) {
        return null;
    }

    // ==================== Extract Sheet ID ====================
    const match: RegExpMatchArray = formula.match(/Sheet\.(\d+)!/);
    if (match && match.length > 1) {
        return match[1];
    }
    return null;
}

/**
 * Converts a string to capitalized words format.
 * Capitalizes first letter of each word, lowercases the rest.
 *
 * @param {string} str - The input string.
 * @returns {string} The capitalized words string.
 *
 * @example
 * const result = toCapitalizedWords('hello world');
 * // Returns 'HelloWorld'
 *
 * @private
 */
function toCapitalizedWords(str: string): string {
    return str.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
}

/**
 * Retrieves the `__Index` value from a visio parsing context.
 * Returns `null` if no entries or index is found.
 *
 * @param {ParsingContext} context - Current parsing context containing entries
 * @returns {any} The index value if present, otherwise null
 */
function getIndex(context: ParsingContext): any {
    const entries: any = (context as any).entries;
    return entries && entries.__Index ? entries.__Index : null;
}

/**
 * Resolves the master source node for a given page shape.
 * Looks up the appropriate master or master-shape reference
 * from the parsing context and returns the corresponding node.
 *
 * @param {VisioShapeNode} pageNode - Current page shape node
 * @param {ParsingContext} context - Parsing context containing master maps
 * @param {string} [parentMasterId] - Optional parent master ID for nested shapes
 * @returns {VisioShapeNode|null} The resolved master node, or null if not found
 */
export function resolveMasterSourceForNode(
    pageNode: VisioShapeNode,
    context: ParsingContext,
    parentMasterId?: string
): VisioShapeNode | null {
    const attributes: Attributes = (pageNode && (pageNode as any).$) ? (pageNode as any).$ : ({} as any);
    const masterShapeId: string = (attributes && (attributes as any).MasterShape != null) ? String((attributes as any).MasterShape) : '';
    const masterId: string = (attributes && (attributes as any).Master != null) ? String((attributes as any).Master) : '';

    const idx: any = getIndex(context);
    if (!idx) {
        return null;
    }

    let owningMaster: string = '';
    if (masterShapeId && parentMasterId && parentMasterId.length > 0) {
        owningMaster = parentMasterId;
    } else if (masterId) {
        owningMaster = masterId;
    }
    else if (masterShapeId) {
        // Fallback: if the instance only specifies a MasterShape but no Master,
        // search masterChildByMasterId to find which master contains this child id.
        const masterChildIndex: Map<string, Map<string, any>> = idx.masterChildByMasterId;
        if (masterChildIndex && typeof masterChildIndex.forEach === 'function') {
            masterChildIndex.forEach((childMap: Map<string, any>, masterKey: string) => {
                if (!owningMaster && childMap && typeof childMap.has === 'function' && childMap.has(String(masterShapeId))) {
                    owningMaster = String(masterKey);
                }
            });
        }
    }

    if (masterShapeId && owningMaster) {
        const childMap: Map<string, any> = idx.masterChildByMasterId && idx.masterChildByMasterId.get
            ? idx.masterChildByMasterId.get(String(owningMaster)) : null;
        if (childMap && childMap.get) {
            const node: any = childMap.get(String(masterShapeId));
            if (node) {
                return node;
            }
        }
    }
    if (masterId) {
        const roots: string[] = idx.masterRootIdsByMasterId && idx.masterRootIdsByMasterId.get
            ? idx.masterRootIdsByMasterId.get(String(masterId)) : [];
        const childMap2: Map<string, any> = idx.masterChildByMasterId && idx.masterChildByMasterId.get
            ? idx.masterChildByMasterId.get(String(masterId)) : null;
        if (childMap2 && roots && roots.length > 0) {
            const rootNode: any = childMap2.get(String(roots[0]));
            if (rootNode) {
                return rootNode;
            }
        }
    }
    return null;
}

/**
 * Resolves the semantic shape name for mapping to EJ2 diagram nodes.
 * Checks instance attributes, master source attributes, and master index
 * definitions to determine the most appropriate shape name.
 *
 * @param {VisioShapeNode} pageNode - Current page shape node
 * @param {VisioShapeNode|null} masterSource - Master source node if available
 * @param {ParsingContext} context - Parsing context with master index
 * @param {string} [parentMasterId] - Optional parent master ID for nested shapes
 * @returns {string} Resolved shape name or empty string if not found
 */
export function resolveShapeNameForMapping(
    pageNode: VisioShapeNode,
    masterSource: VisioShapeNode | null,
    context: ParsingContext,
    parentMasterId?: string
): string {
    const attributes: any = pageNode && (pageNode as any).$ ? (pageNode as any).$ : {};
    // Foreign shapes must map to Image (existing behavior)
    const typeStr: string = getAttrString(attributes, 'Type');
    if (typeStr && typeStr.toLowerCase() === 'foreign') {
        return 'Image';
    }

    // 1) instance attributes
    const instNameU: string = getTrimmedOrEmpty(getAttrString(attributes, 'NameU'));
    if (instNameU) { return instNameU; }
    const instName: string = getTrimmedOrEmpty(getAttrString(attributes, 'Name'));
    if (instName) { return instName; }

    // Detect MasterShape-only child (do NOT use owning master semantic name for these)
    const hasMasterShape: boolean = getTrimmedOrEmpty(getAttrString(attributes, 'MasterShape')).length > 0;
    const hasMaster: boolean = getTrimmedOrEmpty(getAttrString(attributes, 'Master')).length > 0;

    // 2) master child/root node attributes (specific to that shape)
    if (masterSource && (masterSource as any).$) {
        const msAttrs: any = (masterSource as any).$;
        const msNameU: string = getTrimmedOrEmpty(getAttrString(msAttrs, 'NameU'));
        if (msNameU) { return msNameU; }
        const msName: string = getTrimmedOrEmpty(getAttrString(msAttrs, 'Name'));
        if (msName) { return msName; }
    }

    // If it's a MasterShape-only child and we couldn't get a specific name, stop here.
    // Falling back to the owning master's name would mislabel sub-shapes as "Task", etc.
    if (hasMasterShape && !hasMaster) {
        return '';
    }

    // 3) masters.xml index nameU (semantic name for top-level master instances)
    const masterId: string = hasMaster ? getTrimmedOrEmpty(getAttrString(attributes, 'Master'))
        : (parentMasterId ? getTrimmedOrEmpty(String(parentMasterId)) : '');

    if (!masterId) { return ''; }

    const idx: any = getIndex(context);
    if (!idx || !idx.mastersById || !idx.mastersById.get) { return ''; }

    const masterInfo: any = idx.mastersById.get(String(masterId));
    if (!masterInfo) { return ''; }

    const nameU: string = getTrimmedOrEmpty(masterInfo.nameU ? String(masterInfo.nameU) : '');
    if (nameU) { return nameU; }

    return '';
}

/**
 * Builds a path shape from Visio geometry sections.
 * Converts geometry rows into SVG path data, applying local scaling
 * to produce a path representation of the shape.
 *
 * @param {VisioSection[]} geomSections - Geometry sections of the shape
 * @param {VisioShape} node - Shape node with width and height
 * @returns {DetermineShapeResult} Path shape result with type and data
 */
function buildPathShapeFromGeometrySections(geomSections: VisioSection[], node: VisioShape): DetermineShapeResult {
    let finalPath: string = '';
    if (geomSections && geomSections.length > 1) {
        finalPath = formatPathData(
            createPathFromGeometrySections(
                geomSections,
                { pinX: 0, pinY: 0, Width: node.width, Height: node.height },
                { useLocalScaling: true }
            )
        );
    } else {
        let pathData: string = '';
        const sectionsArr: VisioSection[] = ensureArray(geomSections);
        for (const section of sectionsArr) {
            if (!section || !section.Row) { continue; }
            const part: string = createPathFromGeometry(
                { Row: ensureArray(section.Row), width: node.width, height: node.height } as any,
                { pinX: 0, pinY: 0, Width: node.width, Height: node.height },
                undefined,
                { useLocalScaling: true }
            );
            if (part && part.length > 0) {
                pathData += part.trim() + ' ';
            }
        }
        finalPath = formatPathData(pathData.trim());
    }
    return { type: 'Path', data: finalPath } as DetermineShapeResult;
}

/**
 * Determines the default EJ2 node shape for a Visio shape.
 * Resolves semantic name, attempts mapping to supported EJ2 types,
 * and falls back to geometry-based path if no supported type is found.
 *
 * @param {VisioShapeNode} pageNode - Current page shape node
 * @param {VisioShapeNode|null} masterSource - Master source node if available
 * @param {VisioSection[]} geomSections - Geometry sections of the shape
 * @param {VisioShape} node - Shape node with dimensions
 * @param {ParsingContext} context - Parsing context with master index
 * @param {string} [parentMasterId] - Optional parent master ID for nested shapes
 * @returns {DetermineShapeResult} Determined shape result (mapped or path)
 */
export function determineDefaultNodeShape(
    pageNode: VisioShapeNode,
    masterSource: VisioShapeNode | null,
    geomSections: VisioSection[],
    node: VisioShape,
    context: ParsingContext,
    parentMasterId?: string
): DetermineShapeResult {
    // Resolve the best semantic name
    const resolvedName: string = resolveShapeNameForMapping(pageNode, masterSource, context, parentMasterId);

    // Feed mapper with a stable Attributes object; keep empty string if unknown (do not use undefined)
    const attributes: any = pageNode && (pageNode as any).$ ? (pageNode as any).$ : {};
    const mappingAttrs: any = {
        Name: (resolvedName !== undefined && resolvedName !== null) ? String(resolvedName) : '',
        Type: getAttrString(attributes, 'Type')
    };

    // Let existing mapper decide if EJ2 already supports it (Basic/Flow/Bpmn/UML/Image)
    const mapped: DetermineShapeResult = determineShapeType(
        mappingAttrs as any,
        undefined as any,
        masterSource ? masterSource : pageNode,
        node,
        context
    ) as DetermineShapeResult;

    // If mapper produced a supported non-Path type, use it.
    if (mapped && (mapped as any).type && (mapped as any).type !== 'Path') {
        return mapped;
    }

    // Otherwise, fall back to geometry-based path
    return buildPathShapeFromGeometrySections(geomSections, node);
}

/**
 * Attempts to determine a semantic group shape for a Visio group node.
 * Resolves the group's name, runs the shape type mapper, and only collapses
 * into semantic families (BPMN, UML, Image) to avoid losing visuals for generic groups.
 *
 * @param {VisioShapeNode} groupNode - Current group shape node
 * @param {VisioShapeNode|null} groupMasterNode - Master source node for the group
 * @param {VisioShape} groupShape - Group shape with dimensions
 * @param {ParsingContext} context - Parsing context with master index
 * @param {string} [parentMasterId] - Optional parent master ID for nested groups
 * @returns {DetermineShapeResult|null} Semantic group shape result, or null if not applicable
 */
export function tryDetermineSemanticGroupShape(
    groupNode: VisioShapeNode,
    groupMasterNode: VisioShapeNode | null,
    groupShape: VisioShape,
    context: ParsingContext,
    parentMasterId?: string
): DetermineShapeResult | null {
    const attrs: any = groupNode && (groupNode as any).$ ? (groupNode as any).$ : {};
    // Collapse ONLY for true master instances (not MasterShape-only children)
    const masterId: string = getTrimmedOrEmpty(getAttrString(attrs, 'Master'));
    if (!masterId) {
        return null;
    }

    const resolvedName: string = resolveShapeNameForMapping(groupNode, groupMasterNode, context, parentMasterId);
    if (!resolvedName) {
        return null;
    }

    // Run mapper with resolved name; defaultData is not needed for BPMN/UML/Image.
    const mapped: DetermineShapeResult = determineShapeType(
        { Name: String(resolvedName), Type: 'Group' } as any,
        undefined as any,
        groupNode,
        groupShape,
        context
    ) as DetermineShapeResult;

    if (!mapped || !(mapped as any).type) {
        return null;
    }

    // Safety: only collapse semantic families (prevents losing visuals for generic grouped stencils)
    const t: string = String((mapped as any).type);
    if (t === 'Bpmn' || t === 'UmlClassifier' || t === 'UmlActivity' || t === 'Image') {
        // Never collapse if mapper still fell back to Path
        return mapped;
    }

    return null;
}

/**
 * Collects geometry sections from a Visio shape node, keyed by IX.
 * If IX is missing, generates a synthetic key to ensure uniqueness.
 * @param {VisioShapeNode} node - Shape node containing Section elements
 * @returns {Map<string, VisioSection>} Map of section keys to geometry sections
 */
function getGeometrySectionsByIX(node: VisioShapeNode): Map<string, VisioSection> {
    const geometrySectionsByIX: Map<string, VisioSection> = new Map<string, VisioSection>();
    if (!node) {
        return geometrySectionsByIX;
    }
    const sections: VisioSection[] = ensureArray(node.Section as VisioSection[]);
    let syntheticKeyCounter: number = 0;
    for (let sectionIndex: number = 0; sectionIndex < sections.length; sectionIndex += 1) {
        const section: VisioSection = sections[parseInt(sectionIndex.toString(), 10)];
        if (!section || !section.$ || section.$.N !== 'Geometry') {
            continue;
        }
        let sectionKey: string = '';
        const sectionAttributes: Record<string, unknown> = section.$ as Record<string, unknown>;
        const ixValue: unknown = sectionAttributes.IX;
        if (ixValue !== null && ixValue !== undefined) {
            sectionKey = String(ixValue);
        } else {
            sectionKey = 'g' + String(syntheticKeyCounter);
            syntheticKeyCounter += 1;
        }
        geometrySectionsByIX.set(sectionKey, section);
    }
    return geometrySectionsByIX;
}

/**
 * Merges Geometry sections by IX with Visio precedence (instance > master).
 * Instance values take baseline; master provides defaults for missing values.
 * When IX matches, cells merge with numeric-only override strategy.
 * @param {VisioShapeNode} masterNode - Master shape node with default geometry
 * @param {VisioShapeNode} instNode - Instance shape node with overrides
 * @returns {VisioSection[]} Deep-merged Geometry sections
 */
export function mergeGeometrySectionsByIndex(
    masterNode: VisioShapeNode,
    instNode: VisioShapeNode
): VisioSection[] {
    const masterSectionMap: Map<string, VisioSection> = getGeometrySectionsByIX(masterNode);
    const instanceSectionMap: Map<string, VisioSection> = getGeometrySectionsByIX(instNode);

    const resultSections: VisioSection[] = [];

    if (!instanceSectionMap || instanceSectionMap.size === 0) {
        masterSectionMap.forEach(function (section: VisioSection): void {
            resultSections.push(section);
        });
        return resultSections;
    }

    if (!masterSectionMap || masterSectionMap.size === 0) {
        instanceSectionMap.forEach(function (section: VisioSection): void {
            resultSections.push(section);
        });
        return resultSections;
    }

    const processedSectionKeys: Set<string> = new Set<string>();

    instanceSectionMap.forEach(function (instanceSection: VisioSection, sectionKey: string): void {
        const masterSection: VisioSection | undefined = masterSectionMap.get(sectionKey);
        if (masterSection) {
            resultSections.push(mergeOneSectionDeep(masterSection, instanceSection));
        } else {
            resultSections.push(instanceSection);
        }
        processedSectionKeys.add(sectionKey);
    });

    masterSectionMap.forEach(function (masterSection: VisioSection, sectionKey: string): void {
        if (!processedSectionKeys.has(sectionKey)) {
            resultSections.push(masterSection);
        }
    });

    return resultSections;

    /**
     * Merges one Geometry section from master and instance definitions.
     * Consolidates section-level and row-level cells with numeric precedence.
     * @param {VisioSection} masterSection - Master section with default cells and rows
     * @param {VisioSection} instanceSection - Instance section with overrides and additions
     * @returns {VisioSection} Merged section preserving master metadata
     */
    function mergeOneSectionDeep(masterSection: VisioSection, instanceSection: VisioSection): VisioSection {
        const masterSectionCells: VisioCell[] = masterSection && masterSection.Cell ? ensureArray(masterSection.Cell) : [];
        const instanceSectionCells: VisioCell[] = instanceSection && instanceSection.Cell ? ensureArray(instanceSection.Cell) : [];
        const mergedSectionCells: VisioCell[] = mergeCellsNumericOnly(masterSectionCells, instanceSectionCells);

        const masterRowArray: VisioRow[] = masterSection && masterSection.Row ? ensureArray(masterSection.Row) : [];
        const instanceRowArray: VisioRow[] = instanceSection && instanceSection.Row ? ensureArray(instanceSection.Row) : [];

        const instanceRowsByIX: Map<string, VisioRow> = new Map<string, VisioRow>();
        const instanceRowsByPosition: Map<string, VisioRow> = new Map<string, VisioRow>();
        let instancePositionCounter: number = 0;

        for (let instanceRowIndex: number = 0; instanceRowIndex < instanceRowArray.length; instanceRowIndex += 1) {
            const instanceRow: VisioRow = instanceRowArray[parseInt(instanceRowIndex.toString(), 10)];
            let rowIndexString: string = '';
            if (instanceRow && instanceRow.$) {
                const rowAttributes: Record<string, unknown> = instanceRow.$ as Record<string, unknown>;
                const ixAttribute: unknown = rowAttributes.IX;
                if (ixAttribute !== undefined && ixAttribute !== null) {
                    rowIndexString = String(ixAttribute);
                }
            }
            if (rowIndexString.length > 0) {
                instanceRowsByIX.set(rowIndexString, instanceRow);
            } else {
                const positionKey: string = 'pos_' + String(instancePositionCounter);
                instanceRowsByPosition.set(positionKey, instanceRow);
                instancePositionCounter += 1;
            }
        }

        const mergedRowArray: VisioRow[] = [];
        const masterKeySet: Set<string> = new Set<string>();
        let masterPositionCounter: number = 0;

        for (let masterRowIndex: number = 0; masterRowIndex < masterRowArray.length; masterRowIndex += 1) {
            const masterRow: VisioRow = masterRowArray[parseInt(masterRowIndex.toString(), 10)];

            let masterRowIndexString: string = '';
            if (masterRow && masterRow.$) {
                const masterRowAttributes: Record<string, unknown> = masterRow.$ as Record<string, unknown>;
                const masterIxAttribute: unknown = masterRowAttributes.IX;
                if (masterIxAttribute !== undefined && masterIxAttribute !== null) {
                    masterRowIndexString = String(masterIxAttribute);
                }
            }
            const masterPositionKey: string = resolveRowPositionKey(masterRow, masterPositionCounter);

            let mergedRow: VisioRow;
            if (masterRowIndexString.length > 0 && instanceRowsByIX.has(masterRowIndexString)) {
                const matchingInstanceRow: VisioRow | undefined = instanceRowsByIX.get(masterRowIndexString);
                mergedRow = mergeRowCellsNumericOnly(masterRow, matchingInstanceRow);
            } else {
                const fallbackInstanceRow: VisioRow | undefined = instanceRowsByPosition.get(masterPositionKey);
                mergedRow = mergeRowCellsNumericOnly(masterRow, fallbackInstanceRow);
            }

            mergedRowArray.push(mergedRow);
            masterKeySet.add(masterRowIndexString.length > 0 ? masterRowIndexString : masterPositionKey);
            masterPositionCounter += 1;
        }

        instanceRowsByIX.forEach(function (instanceRow: VisioRow, instanceRowIX: string): void {
            if (!masterKeySet.has(instanceRowIX)) {
                mergedRowArray.push(sanitizeRowShallow(instanceRow));
            }
        });

        instanceRowsByPosition.forEach(function (instanceRow: VisioRow, positionKey: string): void {
            if (!masterKeySet.has(positionKey)) {
                mergedRowArray.push(sanitizeRowShallow(instanceRow));
            }
        });

        const mergedSection: VisioSection = { $: masterSection.$ } as VisioSection;
        if (mergedSectionCells.length > 0) {
            (mergedSection as unknown as { Cell: VisioCell[] }).Cell = mergedSectionCells;
        }
        if (mergedRowArray.length > 0) {
            (mergedSection as unknown as { Row: VisioRow[] }).Row = mergedRowArray;
        }
        return mergedSection;

        /**
         * Resolves position key using IX if present, otherwise uses position index.
         * @param {VisioRow} row - Row to evaluate
         * @param {number} position - Fallback position index
         * @returns {string} Row key (IX or pos_N)
         */
        function resolveRowPositionKey(row: VisioRow, position: number): string {
            if (row && row.$) {
                const rowAttributes: Record<string, unknown> = row.$ as Record<string, unknown>;
                const ixAttribute: unknown = rowAttributes.IX;
                if (ixAttribute !== undefined && ixAttribute !== null) {
                    return String(ixAttribute);
                }
            }
            return 'pos_' + String(position);
        }

        /**
         * Merges row cells by name with numeric-only override from instance.
         * @param {VisioRow} masterRow - Master row providing defaults
         * @param {VisioRow|undefined} instanceRow - Instance row providing overrides
         * @returns {VisioRow} Merged row with combined cells
         */
        function mergeRowCellsNumericOnly(masterRow: VisioRow, instanceRow: VisioRow | undefined): VisioRow {
            const masterRowCells: VisioCell[] = masterRow && masterRow.Cell ? ensureArray(masterRow.Cell) : [];
            const instanceRowCells: VisioCell[] = instanceRow && instanceRow.Cell ? ensureArray(instanceRow.Cell) : [];
            const mergedCells: VisioCell[] = mergeCellsNumericOnly(masterRowCells, instanceRowCells);

            const resultRow: VisioRow = { $: masterRow.$ } as VisioRow;
            if (mergedCells.length > 0) {
                (resultRow as unknown as { Cell: VisioCell[] }).Cell = mergedCells;
            }
            return resultRow;
        }

        /**
         * Creates shallow copy of row with only N and V cell attributes.
         * @param {VisioRow} sourceRow - Row to sanitize
         * @returns {VisioRow} Sanitized row with minimal cell data
         */
        function sanitizeRowShallow(sourceRow: VisioRow): VisioRow {
            const sanitizedRow: VisioRow = { $: sourceRow.$ } as VisioRow;
            const sourceRowCells: VisioCell[] = sourceRow && sourceRow.Cell ? ensureArray(sourceRow.Cell) : [];
            const sanitizedCells: VisioCell[] = [];
            for (let cellIndex: number = 0; cellIndex < sourceRowCells.length; cellIndex += 1) {
                const currentCell: VisioCell = sourceRowCells[parseInt(cellIndex.toString(), 10)];
                sanitizedCells.push(cloneNameV(currentCell));
            }
            if (sanitizedCells.length > 0) {
                (sanitizedRow as unknown as { Cell: VisioCell[] }).Cell = sanitizedCells;
            }
            return sanitizedRow;
        }
    }

    /**
     * Maps cells by their N attribute.
     * @param {VisioCell[]} cells - Cell array to map
     * @returns {Map<string, VisioCell>} Cells keyed by name
     */
    function mapCellsByName(cells: VisioCell[]): Map<string, VisioCell> {
        const cellsByName: Map<string, VisioCell> = new Map<string, VisioCell>();
        for (let cellIndex: number = 0; cellIndex < cells.length; cellIndex += 1) {
            const cell: VisioCell = cells[parseInt(cellIndex.toString(), 10)];
            if (cell && cell.$ && cell.$.N) {
                cellsByName.set(String(cell.$.N), cell);
            }
        }
        return cellsByName;
    }

    /**
     * Checks if cell V attribute is numeric.
     * @param {VisioCell} cell - Cell to evaluate
     * @returns {boolean} True if V is numeric
     */
    function hasNumericV(cell: VisioCell): boolean {
        if (!cell || !cell.$) {
            return false;
        }
        const cellAttributes: Record<string, unknown> = cell.$ as Record<string, unknown>;
        const vAttribute: unknown = cellAttributes.V;
        if (vAttribute === undefined || vAttribute === null) {
            return false;
        }
        const numericValue: number = parseFloat(String(vAttribute));
        if (!isFinite(numericValue)) {
            return false;
        }
        return true;
    }

    /**
     * Creates shallow clone of cell with only N and V attributes.
     * @param {VisioCell} sourceCell - Cell to clone
     * @returns {VisioCell} Cloned cell with N and V
     */
    function cloneNameV(sourceCell: VisioCell): VisioCell {
        let cellName: string = '';
        if (sourceCell && sourceCell.$ && sourceCell.$.N) {
            cellName = String(sourceCell.$.N);
        }

        let cellValue: string | number | undefined;
        if (sourceCell && sourceCell.$) {
            const sourceAttributes: Record<string, unknown> = sourceCell.$ as Record<string, unknown>;
            const vAttribute: unknown = sourceAttributes.V;
            if (vAttribute !== undefined && vAttribute !== null) {
                if (typeof vAttribute === 'number') {
                    cellValue = vAttribute;
                } else {
                    cellValue = String(vAttribute);
                }
            }
        }

        interface CellNameValue {
            N: string;
            V?: string | number;
        }

        const clonedCell: { $: CellNameValue } = { $: { N: cellName } };
        if (cellValue !== undefined && cellValue !== null) {
            clonedCell.$.V = cellValue;
        }
        return clonedCell as unknown as VisioCell;
    }

    /**
     * Merges cells by name with numeric-only instance override.
     * @param {VisioCell[]} masterCells - Master cell array
     * @param {VisioCell[]} instanceCells - Instance cell array
     * @returns {VisioCell[]} Merged cell array
     */
    function mergeCellsNumericOnly(masterCells: VisioCell[], instanceCells: VisioCell[]): VisioCell[] {
        const masterCellsByName: Map<string, VisioCell> = mapCellsByName(masterCells);
        const instanceCellsByName: Map<string, VisioCell> = mapCellsByName(instanceCells);
        const mergedCells: VisioCell[] = [];

        masterCellsByName.forEach(function (masterCell: VisioCell, cellName: string): void {
            const instanceCell: VisioCell | undefined = instanceCellsByName.get(cellName);
            if (instanceCell) {
                if (hasNumericV(instanceCell)) {
                    mergedCells.push(cloneNameV(instanceCell));
                } else {
                    mergedCells.push(cloneNameV(masterCell));
                }
            } else {
                mergedCells.push(cloneNameV(masterCell));
            }
        });

        return mergedCells;
    }
}

/**
 * Checks if all geometry sections explicitly have NoFill=1.
 * Returns true only if every geometry section has the NoFill cell set to 1,
 * indicating that all geometry sections should not be filled.
 *
 * @param {VisioSection[]} sections - Array of Visio geometry sections to check
 * @returns {boolean} True if all sections have NoFill=1, false otherwise
 * @remarks
 * If any section is missing or has NoFill !== 1, returns false.
 * Empty array or undefined sections also return false.
 *
 * @example
 * // Check if all geometry sections have no fill
 * const hasNoFill = allGeometrySectionsNoFill(geometrySections);
 * // Result: true or false
 */
export function allGeometrySectionsNoFill(sections: VisioSection[]): boolean {
    const geometrySections: VisioSection[] = ensureArray(sections);
    if (!geometrySections || geometrySections.length === 0) { return false; }

    for (let sectionIndex: number = 0; sectionIndex < geometrySections.length; sectionIndex++) {
        const geometrySection: VisioSection = geometrySections[parseInt(sectionIndex.toString(), 10)];
        if (!geometrySection) { return false; }

        let noFillValue: number = 0; // default fill allowed
        if (geometrySection.Cell) {
            const cellMap: Map<string, CellMapValue> = createCellMap(ensureArray(geometrySection.Cell));
            const noFillCell: CellMapValue | undefined = cellMap.get('NoFill');
            noFillValue = safeNumber(noFillCell);
        }
        if (noFillValue !== 1) { return false; }
    }
    return true;
}

/**
 * Checks if all geometry sections explicitly have NoLine=1.
 * Returns true only if every geometry section has the NoLine cell set to 1,
 * indicating that all geometry sections should not have a border line.
 *
 * @param {VisioSection[]} sections - Array of Visio geometry sections to check
 * @returns {boolean} True if all sections have NoLine=1, false otherwise
 * @remarks
 * If any section is missing or has NoLine !== 1, returns false.
 * Empty array or undefined sections also return false.
 *
 * @example
 * // Check if all geometry sections have no line
 * const hasNoLine = allGeometrySectionsNoLine(geometrySections);
 * // Result: true or false
 */
export function allGeometrySectionsNoLine(sections: VisioSection[]): boolean {
    const geometrySections: VisioSection[] = ensureArray(sections);
    if (!geometrySections || geometrySections.length === 0) { return false; }

    for (let sectionIndex: number = 0; sectionIndex < geometrySections.length; sectionIndex++) {
        const geometrySection: VisioSection = geometrySections[parseInt(sectionIndex.toString(), 10)];
        if (!geometrySection) { return false; }

        let noLineValue: number = 0; // default line allowed
        if (geometrySection.Cell) {
            const cellMap: Map<string, CellMapValue> = createCellMap(ensureArray(geometrySection.Cell));
            const noLineCell: CellMapValue | undefined = cellMap.get('NoLine');
            noLineValue = safeNumber(noLineCell);
        }
        if (noLineValue !== 1) { return false; }
    }
    return true;
}

/**
 * Determines if a Geometry section is hidden by checking the section-level
 * NoShow cell (1 = hidden). Falls back to visible if the cell is not present.
 *
 * @param {VisioSection} section - The Geometry section to evaluate.
 * @returns {boolean} True if the section is hidden, otherwise false.
 */
export function isGeometrySectionHidden(section: VisioSection): boolean {
    // Guard: invalid section is not hidden
    if (!section) { return false; }
    // Build a cell map for section-level cells
    if (section.Cell) {
        const cellMap: Map<string, CellMapValue> = createCellMap(ensureArray(section.Cell));
        const noShowValue: CellMapValue | undefined = cellMap.get('NoShow');
        const hidden: boolean = safeNumber(noShowValue) === 1;
        if (hidden) { return true; }
    }
    // Default visible when NoShow is not set
    return false;
}

/**
 * Determines if a Geometry row is hidden by checking a row-level
 * NoShow cell (1 = hidden). If the row lacks NoShow, the row is
 * considered visible.
 *
 * @param {VisioRow} row - The Geometry row to evaluate.
 * @returns {boolean} True if the row is hidden, otherwise false.
 */
export function isGeometryRowHidden(row: VisioRow): boolean {
    // Guard: invalid row is not hidden
    if (!row) { return false; }
    // Build a cell map for row-level cells
    if (row.Cell) {
        const cellMap: Map<string, CellMapValue> = createCellMap(ensureArray(row.Cell));
        const noShowValue: CellMapValue | undefined = cellMap.get('NoShow');
        if (safeNumber(noShowValue) === 1) { return true; }
    }
    // Default visible when NoShow is not set
    return false;
}

/**
 * Returns true only if every Geometry section in the array
 * is hidden (NoShow = 1). Empty or invalid input returns false
 * (do not hide the whole shape by default).
 *
 * @param {VisioSection[]} sections - Geometry sections collection.
 * @returns {boolean} True if all sections are hidden, otherwise false.
 */
export function areAllGeometrySectionsHidden(sections: VisioSection[]): boolean {
    // Guard: no sections means do not hide the whole shape
    const allSections: VisioSection[] = ensureArray(sections);
    if (!allSections || allSections.length === 0) { return false; }

    // Check each section for NoShow=1
    for (let i: number = 0; i < allSections.length; i++) {
        const section: VisioSection = allSections[parseInt(i.toString(), 10)];
        if (!isGeometrySectionHidden(section)) {
            return false;
        }
    }
    return true;
}
