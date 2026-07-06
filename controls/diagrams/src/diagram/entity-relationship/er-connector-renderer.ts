/**
 * Er Connector Renderer
 * Renders Er Relationship connectors with orthogonal routing and Crow's Foot decorators.
 * Implements full connector rendering with decorators and line routing
 */

import { Diagram } from '..';
import { DiagramElement } from '../core/elements/diagram-element';
import { Connector } from '../objects/connector';
import { ConnectorModel, DecoratorModel, ErConnectorShapeModel } from '../objects/connector-model';
import { ErMultiplicityTypes } from '../objects/er-objects';
import { ErMultiplicityModel } from '../objects/er-objects-model';
import { PointModel } from '../primitives/point-model';

/**
 * ER Connector Renderer class.
 *
 * @constructor
 *
 * @private
 */
export class ErConnectorRenderer {
    /**
     * Renders the ER connector.
     *
     * @param {ConnectorModel} connector - Connector model.
     * @returns {void}
     *
     * @private
     */
    public render(connector: ConnectorModel): void {
        if (!connector.shape || connector.shape.type !== 'Er') {
            return;
        }

        const erConnector: ErConnectorShapeModel = connector.shape as ErConnectorShapeModel;
        this.applyRelationshipStyle(connector);

        connector.sourceDecorator = this.getDecoratorForCardinality(erConnector.sourceMultiplicity);
        connector.targetDecorator = this.getDecoratorForCardinality(erConnector.targetMultiplicity);
    }

    /**
     * Returns decorator configuration for the given ER cardinality.
     *
     * @param {ErMultiplicityModel} cardinality - ER cardinality.
     * @returns {DecoratorModel} Decorator model.
     *
     * @private
     */
    public getDecoratorForCardinality(cardinality: ErMultiplicityModel): DecoratorModel {
        return {
            shape: 'Custom',
            width: 14, //22
            height: 14,
            pivot: { x: 0, y: 0.5 },
            pathData: this.getPath(cardinality.type),
            style: {
                fill: 'transparent'
            }
        };
    }

    /**
     * updateCardinality method
     *
     * @returns {boolean} updateCardinality method.
     * @param {Connector} connector - provide the connector value (Connector type).
     * @param {ErConnectorShapeModel} erRelationship - provide the current relationship value.
     * @param {ErConnectorShapeModel} oldRelationship - provide the old relationship value.
     * @param {Diagram} diagram - provide the diagram instance for event firing.
     *
     * @private
     */
    public update(connector: ConnectorModel, erRelationship: ErConnectorShapeModel,
                  oldRelationship: ErConnectorShapeModel, diagram: Diagram): boolean {
        const hasCardinalityChanged: boolean = ((erRelationship.sourceMultiplicity && oldRelationship.sourceMultiplicity &&
            erRelationship.sourceMultiplicity.type !== oldRelationship.sourceMultiplicity.type) ||
            (erRelationship.targetMultiplicity && oldRelationship.targetMultiplicity &&
            erRelationship.targetMultiplicity.type !== oldRelationship.targetMultiplicity.type));
        const hasTypeChanged: boolean = erRelationship.relationship !== oldRelationship.relationship;

        if (!hasCardinalityChanged && !hasTypeChanged) {
            return false;
        }

        // Apply cardinality/decorator changes
        if (hasCardinalityChanged) {
            this.updateDecorators(connector);
        }

        // Apply relationship type styling
        if (hasTypeChanged) {
            this.applyRelationshipStyle(connector);
        }

        return true;
    }


    private updateDecorators(connector: ConnectorModel): void {
        const erConnector: ErConnectorShapeModel = connector.shape as ErConnectorShapeModel;
        const newSourceDecorator: DecoratorModel = this.getDecoratorForCardinality(erConnector.sourceMultiplicity);
        const newTargetDecorator: DecoratorModel = this.getDecoratorForCardinality(erConnector.targetMultiplicity);

        connector.sourceDecorator = newSourceDecorator;
        connector.targetDecorator = newTargetDecorator;

        const points: PointModel[] = (connector as Connector).intermediatePoints;
        if (connector.wrapper && connector.wrapper.children && connector.wrapper.children.length > 2 &&
            points && points.length > 1) {
            const srcElement: DiagramElement = connector.wrapper.children[1];
            const tarElement: DiagramElement = connector.wrapper.children[2];

            if (srcElement) {
                (connector as Connector).updateDecoratorElement(
                    srcElement,
                    points[0],
                    points[1],
                    newSourceDecorator
                );
            }

            if (tarElement) {
                (connector as Connector).updateDecoratorElement(
                    tarElement,
                    points[points.length - 1],
                    points[points.length - 2],
                    newTargetDecorator
                );
            }
        }
    }

    private applyRelationshipStyle(connector: ConnectorModel): void {
        const erConnector: ErConnectorShapeModel = connector.shape as ErConnectorShapeModel;
        connector.style = connector.style || {};
        connector.style.strokeDashArray = erConnector.relationship === 'Identifying' ? '' : '5,5';
    }

    private getPath(cardinality: ErMultiplicityTypes): string {
        const ER_PATHS: Record<string, string> = {
            // |  To one
            ONE: 'M7.5 0V5.5M7.5 11V5.5M7.5 5.5H0',
            // <  To many (proper crow�s foot � 3 prongs)
            MANY: 'M1.19067 11.3932L8.19067 5.89319L1.19067 0.393188M8.19067 5.89319H0.69067',
            // ||  To one and only one
            ONE_ONLY: 'M8.5 0V5.5M8.5 11V5.5M4.5 0V11M8.5 5.5H0',
            // |<  To one or many
            ONE_MANY: 'M0.5 0.393188L7.5 5.89319M0.5 11.3932L7.5 5.89319M7.5 5.89319V0.393188M7.5 5.89319V11.3932M7.5 5.89319H0',
            // O|  To zero or one (no overlap)
            ZERO_ONE: 'M5 0V5.5M5 5.5V11M5 5.5H10.5M5 5.5H0.5M10.5 5.5C10.5 8.26142 12.7386 10.5 15.5 10.5C18.2614 10.5 20.5 8.26142 20.5 5.5C20.5 2.73858 18.2614 0.5 15.5 0.5C12.7386 0.5 10.5 2.73858 10.5 5.5Z',
            // O<  To zero or many (circle + symmetric crow�s foot)
            ZERO_MANY: 'M0.5 0.393188L7.5 5.89319M7.5 5.89319L0.5 11.3932M7.5 5.89319H0M7.5 5.89319C7.5 8.65461 9.73858 10.8932 12.5 10.8932C15.2614 10.8932 17.5 8.65461 17.5 5.89319C17.5 3.13176 15.2614 0.893188 12.5 0.893188C9.73858 0.893188 7.5 3.13176 7.5 5.89319Z'
        };
        switch (cardinality) {
        case 'One':
            return ER_PATHS.ONE;
        case 'Many':
            return ER_PATHS.MANY;
        case 'OneAndOnlyOne':
            return ER_PATHS.ONE_ONLY;
        case 'ZeroOrOne':
            return ER_PATHS.ZERO_ONE;
        case 'OneOrMany':
            return ER_PATHS.ONE_MANY;
        case 'ZeroOrMany':
            return ER_PATHS.ZERO_MANY;
        default:
            return ER_PATHS.ONE;
        }
    }
}
