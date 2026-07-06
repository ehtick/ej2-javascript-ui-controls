/**
 * Er Diagram Module - Injectable EJ2 Module
 * Handles Er entity and relationship rendering through delegated renderers
 */

import { Diagram, DiagramElement, ErConnectorShapeModel, HistoryEntry, NodeModel, PointModel, Rect } from '..';
import { Connector } from '../objects/connector';
import { ConnectorModel } from '../objects/connector-model';
import { Node } from '../objects/node';
import { State } from '../enum/enum';
import { IErEntityChangedEventArgs } from '../objects/interface/IElement';
import { ErFieldModel } from '../objects/er-objects-model';
import { ErShapeModel } from '../objects/node-model';
import { ErConnectorRenderer } from './er-connector-renderer';
import { getErShapes } from './er-util';
import { getErFieldIndexByNodeId, calculateFieldDropIndex, reorderErField as reorderErFieldUtil } from './er-field-reorder-util';

/**
 * EREventManager - Manages ER-specific event firing with proper context and state tracking
 * Prevents duplicate events, validates arguments, and ensures synchronous behavior for validation events
 *
 * @constructor EREventManager
 * @private
 */
export class EREventManager {

    /**
     * Fires the erEntityChanged event when an ER entity model changes.
     * Called with proper state by the caller (Start, Progress, or Completed).
     * Caller controls the lifecycle; this method fires once per call.
     * Returns a boolean indicating whether the update should proceed (not cancelled).
     *
     * @param {Diagram} diagram - The diagram instance.
     * @param {Node} entity - The entity node that changed.
     * @param {ErShapeModel} oldEntityState - Old entity state (only changed properties).
     * @param {ErShapeModel} newEntityState - New entity state (only changed properties).
     * @param {State} state - The current state (Start, Progress, or Completed).
     * @returns {boolean} `true` if update should proceed; `false` if cancelled by event handler.
     * @private
     */
    public fireEREntityChanged(
        diagram: Diagram,
        entity: Node,
        oldEntityState: ErShapeModel,
        newEntityState: ErShapeModel,
        state: State
    ): boolean {
        // Determine the type of change based on which properties are present
        const cause: string = this.determineEntityChangeType(oldEntityState, newEntityState);
        const element: NodeModel = entity as NodeModel;
        // Create event arguments with cancel flag
        const eventArgs: IErEntityChangedEventArgs = {
            diagram,
            element: element,
            oldValue: oldEntityState,
            newValue: newEntityState,
            cause,
            state,
            cancel: false
        };

        // Fire event once with the provided state
        diagram.trigger('erEntityChanged', eventArgs);

        // If cancelled during Start state, prevent update immediately
        if (state === 'Start' && eventArgs.cancel) {
            return false;
        }

        // Return whether update should proceed (not cancelled)
        return !eventArgs.cancel;
    }

    /**
     * Determines the type of entity change based on which properties have changed.
     * Identifies whether the change is to entityName, fields, collapsed state, or other properties.
     *
     * @param {ErShapeModel} oldState - Old entity state object with previous property values.
     * @param {ErShapeModel} newState - New entity state object with updated property values.
     * @returns {string} The type of change: 'EntityName', 'Fields', 'Collapsed', or 'Other'.
     * @private
     */
    private determineEntityChangeType(oldState: ErShapeModel, newState: ErShapeModel): string {
        if (oldState && newState) {
            const oldFields: ErFieldModel[] = (oldState && oldState.fields) as ErFieldModel[] || [];
            const newFields: ErFieldModel[] = (newState && newState.fields) as ErFieldModel[] || [];

            // If lengths differ, fields were added/removed
            if (oldFields.length !== newFields.length) {
                if (oldFields.length < newFields.length) {
                    return 'FieldsAdd';
                }
                if (oldFields.length > newFields.length) {
                    return 'FieldsRemove';
                }
            }
            if (!this.isFieldOrderEqual(oldFields, newFields)) {
                return 'FieldsReorder';
            }
            //if ((oldState && oldState.collapsed) !== (newState && newState.collapsed)) {
            //    return 'Collapsed';
            //}
        }
        return 'Other';
    }

    // Check if fields are in the same order by id
    private isFieldOrderEqual(fields1: ErFieldModel[], fields2: ErFieldModel[]): boolean {
        if (fields1.length !== fields2.length) {
            return false;
        }
        for (let i: number = 0; i < fields1.length; i++) {
            const field1: ErFieldModel = fields1[parseInt(i.toString(), 10)];
            const field2: ErFieldModel = fields2[parseInt(i.toString(), 10)];
            const idA: string = field1 && field1.id;
            const idB: string = field2 && field2.id;
            if (idA !== idB) { return false; }
        }
        return true;
    }
}

/**
 * Global ER Event Manager instance
 * Singleton to ensure consistent event state tracking
 * @private
 */
let erEventManager: EREventManager;

/**
 * Get or create the global ER Event Manager instance
 * @returns {EREventManager} The global event manager
 * @private
 */
export function getEREventManager(): EREventManager {
    if (!erEventManager) {
        erEventManager = new EREventManager();
    }
    return erEventManager;
}

/**
 * ErDiagrams - Injectable module for Er diagram support
 *
 * Simple class (no Base inheritance) matching BpmnDiagrams architecture.
 * Renders Er entities and relationships with specialized decorators.
 * Called via diagram.erModule when injected.
 *
 * @example
 * import { Diagram, ErDiagrams } from '@syncfusion/ej2-diagrams';
 *
 * Diagram.Inject(ErDiagrams);
 * const diagram = new Diagram({
 *   nodes: [{ id: 'entity', shape: { type: 'Er', entityName: 'Customer' } }]
 * });
 *
 * @public
 */
export class ErDiagrams {
    /** @private */
    public connectorRenderer: ErConnectorRenderer = new ErConnectorRenderer();
    /** @private */
    public eventManager: EREventManager = getEREventManager();

    /**
     * initErContent method
     *
     * @returns { DiagramElement } initErContent method.
     * @param {DiagramElement} content - provide the content value.
     * @param {Node} node - provide the node value.
     * @param {Diagram} diagram - provide the diagram value.
     *
     * @private
     */
    public initErContent(content: DiagramElement, node: Node, diagram: Diagram): DiagramElement {
        return getErShapes(content, node, diagram);
    }

    /**
     * initErConnector method
     *
     * @returns { void } initErConnector method.
     * @param { ConnectorModel } connector - provide the connector value.
     *
     * @private
     */
    public initErConnector(connector: ConnectorModel): void {
        this.connectorRenderer.render(connector);
    }

    /**
     * Updates the ER connector when relationship changes occur.
     *
     * @param {ConnectorModel} connector - The connector model to update.
     * @param {ErConnectorShapeModel} erRelationship - The new ER relationship configuration.
     * @param {ErConnectorShapeModel} oldRelationship - The previous ER relationship configuration.
     * @param {Diagram} diagram - The diagram instance containing the connector.
     * @returns {boolean} `true` if the connector was successfully updated; otherwise, `false`.
     *
     * @private
     */
    public updateErConnector(connector: ConnectorModel, erRelationship: ErConnectorShapeModel,
                             oldRelationship: ErConnectorShapeModel, diagram: Diagram): boolean {
        return this.connectorRenderer.update(connector, erRelationship, oldRelationship, diagram);
    }

    /**
     * Validates whether a field reorder operation is valid based on source/target nodes and cursor position.
     *
     * @param {Node} source - The source node.
     * @param {Node} target - The target node.
     * @param {PointModel} cursorPosition - The cursor position during reorder.
     * @param {Diagram} diagram - The diagram instance.
     * @returns {boolean} `true` if the reorder is valid; otherwise, `false`.
     *
     * @private
     */
    public validateFieldReorder(source: Node, target: Node, cursorPosition: PointModel, diagram: Diagram): boolean {
        const sourceEntity: Node = diagram.getObject(source.parentId) as Node;
        const targetEntity: Node = diagram.getObject(target.parentId) as Node;

        if (sourceEntity && targetEntity && sourceEntity.id === targetEntity.id &&
            sourceEntity.container && sourceEntity.container.type === 'Stack') {

            // Get field indices to validate insertion position (match swimlane logic)
            const sourceIndex: number = getErFieldIndexByNodeId(source.id, sourceEntity, diagram);
            const targetIndex: number = getErFieldIndexByNodeId(target.id, sourceEntity, diagram);

            // Calculate the insertion position to validate it
            const insertionIndex: number = calculateFieldDropIndex(sourceEntity, source, target, cursorPosition.y || 0, diagram);

            // Only render indicator if:
            // 1. Indices are valid (source and target both found)
            // 2. Insertion would change the field position (not same as source)
            // 3. Insertion position is at or after the first field (not before position 0)
            // 4. Not inserting at first position when source is already first (no reorder)
            const isValidInsertion: boolean = sourceIndex >= 0 && targetIndex >= 0 &&
                insertionIndex !== sourceIndex &&
                (insertionIndex > 0 || (insertionIndex === 0 && sourceIndex > 0));

            return isValidInsertion;
        }

        return false;
    }

    /**
     * Perform field reordering when drop occurs
     *
     * PRESERVES existing child nodes and only reorders them.
     *
     * @param {any} entityNode - ER entity parent node
     * @param {number} sourceFieldIndex - Current field index in shape.fields[]
     * @param {number} targetFieldIndex - Target insertion index in shape.fields[]
     * @param {Diagram} diagram - Diagram instance
     * @returns {HistoryEntry | null} History entry for undo/redo
     * @private
     */
    public reorderErField(
        entityNode: any,
        sourceFieldIndex: number,
        targetFieldIndex: number,
        diagram: Diagram
    ): HistoryEntry | null {
        return reorderErFieldUtil(entityNode, sourceFieldIndex, targetFieldIndex, diagram);
    }

    /**
     * getModuleName method
     *
     * @returns { string } getModuleName method.
     * @private
     */
    public getModuleName(): string {
        return 'ErDiagrams';
    }

    /**
     * destroy method
     *
     * @returns { void } destroy method.
     * @private
     */

    public destroy(): void {
        /**
         * Destroys the ErDiagrams module
         */
        this.connectorRenderer = null;
    }
}
