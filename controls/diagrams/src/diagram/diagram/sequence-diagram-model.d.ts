import { Diagram } from '../diagram';import { ConnectorConstraints, NodeConstraints, PortVisibility} from '../enum/enum';import { Rect } from '../primitives/rect';import { Node } from '../objects/node';import { Connector } from '../objects/connector';import { ShapeAnnotationModel } from '../objects/annotation-model';import { ShapeStyleModel, ShapeAnnotation, PathPortModel, PathPort, PathModel, PointPort, PointPortModel, StrokeStyleModel, randomId, DecoratorModel } from '../index';import { ChildProperty, Collection, Property } from '@syncfusion/ej2-base';import { PointModel } from '../../diagram/primitives/point-model';
import {UmlSequenceParticipantStereotype,UmlSequenceMessageType,UmlSequenceFragmentType} from "./sequence-diagram";

/**
 * Interface for a class UmlSequenceActivationBox
 */
export interface UmlSequenceActivationBoxModel {

    /**
     * A unique identifier for the activation box.
     * @default undefined
     */
    id?: string | number;

    /**
     * The ID of the message that marks the start of the activation.
     * This must match the `id` of a message defined in the model.
     *
     * @default undefined
     */
    startMessageID?: string | number;

    /**
     * The ID of the message that marks the end of the activation.
     * This must match the `id` of a message defined in the model.
     *
     * @default undefined
     */
    endMessageID?: string | number;

}

/**
 * Interface for a class UmlSequenceParticipant
 */
export interface UmlSequenceParticipantModel {

    /**
     * A unique identifier for this participant.
     *
     * Used to reference this participant from messages, activation boxes, and fragments.
     * Must be unique within the diagram.
     *
     * @default undefined
     */
    id?: string | number;

    /**
     * The display label shown in the participant's header box.
     *
     * Corresponds to the `as <content>` clause in Mermaid syntax.
     * When omitted, the `id` value is used as the display label.
     *
     * @default ''
     */
    content?: string;

    /**
     * Indicates whether this participant is rendered as a stick-figure actor.
     *
     * @deprecated Use `stereotype = UmlSequenceParticipantStereotype.Actor` instead.
     * This property is maintained for backward compatibility and will be removed in a future release.
     * When `stereotype` is defined, this property is ignored.
     *
     * @default false
     */
    isActor?: boolean;

    /**
     * The visual stereotype that determines how this participant is rendered.
     *
     * When specified, this property takes precedence over the legacy `isActor`
     * property. To render a participant as an actor, use
     * `UmlSequenceParticipantStereotype.Actor` instead of setting `isActor` to `true`.
     *
     * If this property is not set, rendering falls back to `isActor`. If neither
     * `stereotype` nor `isActor` is set, the participant is rendered as a standard
     * rectangular lifeline header.
     *
     * @default undefined
     *
     * @example
     * ```typescript
     * // Render the participant as a database stereotype.
     * {
     *   id: 'DB',
     *   content: 'UserStore',
     *   stereotype: UmlSequenceParticipantStereotype.Database
     * }
     * ```
     */
    stereotype?: UmlSequenceParticipantStereotype;

    /**
     * Specifies whether to show a destruction marker (X) at the end of the participant's lifeline.
     *
     * When `true`, a destruction marker (×) is rendered at the bottom of this lifeline,
     * indicating the participant is terminated during the sequence.
     *
     * @default false
     */
    showDestructionMarker?: boolean;

    /**
     * The activation boxes (focus-of-control rectangles) drawn on this participant's lifeline.
     *
     * Each entry defines a time range during which the participant is actively processing a message.
     *
     * @default []
     *
     * @example
     * ```typescript
     * activationBoxes: [
     *   { id: 'act1', startMessageID: 'msg1', endMessageID: 'msg3' }
     * ]
     * ```
     */
    activationBoxes?: UmlSequenceActivationBoxModel[];

}

/**
 * Interface for a class UmlSequenceMessage
 */
export interface UmlSequenceMessageModel {

    /**
     * A unique identifier for the message.
     *
     * @default undefined
     */
    id?: string | number;

    /**
     * The ID of the participant that sends the message.
     *
     * This should match the `id` of a participant defined in the model.
     *
     * @default undefined
     */
    fromParticipantID?: string | number;

    /**
     * The ID of the participant that receives the message.
     *
     * This should match the `id` of a participant defined in the model.
     *
     * @default undefined
     */
    toParticipantID?: string | number;

    /**
     * Defines the text content or label displayed for the message in the sequence diagram.
     * This typically represents a operation name, or descriptive response.
     *
     * @default ''
     */
    content?: string;

    /**
     * The semantic type of this message.
     *
     * Determines the default line style and arrowhead unless overridden by
     * `lineStyle`, `sourceArrow`, or `targetArrow`.
     *
     * | Type          | Default line | Default target arrow |
     * |---------------|--------------|----------------------|
     * | Synchronous   | Solid        | Arrow (`>>`)         |
     * | Asynchronous  | Solid        | OpenArrow (`)`)      |
     * | Reply         | Dashed       | Arrow (`>>`)         |
     * | Create        | Solid        | OpenArrow (`)`)      |
     * | Delete        | Solid        | Arrow (`>>`)         |
     * | Self          | Solid        | Arrow (`>>`)         |
     *
     * @default UmlSequenceMessageType.Synchronous
     */
    type?: UmlSequenceMessageType;

}

/**
 * Interface for a class UmlSequenceFragmentCondition
 */
export interface UmlSequenceFragmentConditionModel {

    /**
     * The textual description of the condition (e.g., a Boolean expression or case label).
     *
     * @default ''
     */
    content?: string;

    /**
     * The IDs of messages that are included under this condition.
     *
     * @default []
     */
    messageIds?: (string | number)[];

    /**
     * The IDs of nested fragments that are included under this condition.
     *
     * @default undefined
     */
    fragmentIds?: string[];

}

/**
 * Interface for a class UmlSequenceFragment
 */
export interface UmlSequenceFragmentModel {

    /**
     * A unique identifier for the fragment.
     *
     * @default undefined
     */
    id?: string | number;

    /**
     * Specifies the type of the fragment, such as 'Alternative', 'Loop', or 'Optional'.
     *
     * Determines how the fragment is interpreted and rendered in the diagram.
     *
     * @default UmlSequenceFragmentType.Optional
     */
    type?: UmlSequenceFragmentType;

    /**
     * Defines the conditions and corresponding message/fragment references associated with this fragment.
     *
     * Each condition can represent a branch or case in the fragment (e.g., if-else, loop iteration).
     *
     * ```typescript
     * conditions: [
     *   {
     *     content: 'Condition 1',
     *     messageIds: ['MSG1', 'MSG2'],
     *     fragmentIds: ['frag2']
     *   }
     * ]
     * ```
     *
     * @default []
     */
    conditions?: UmlSequenceFragmentConditionModel[];

}

/**
 * Interface for a class UmlSequenceDiagram
 */
export interface UmlSequenceDiagramModel {

    /**
     * Defines the list of participants involved in the UML sequence diagram.
     * Each participant represents a lifeline, such as an actor or an object, that sends or receives messages.
     *
     * ```typescript
     * participants: [
     *     {
     *         id: 'User',
     *         content: 'User',
     *         width: 100,
     *         height: 50,
     *         showDestructionMarker: true,
     *         isActor: true,
     *         activationBoxes: [
     *             { id: 'act1', startMessageID: 'MSG1', endMessageID: 'MSG3' }
     *         ]
     *     },
     *     {
     *         id: 'Server',
     *         content: 'Server',
     *         width: 100,
     *         height: 50,
     *         showDestructionMarker: true,
     *         isActor: false,
     *         activationBoxes: [
     *             { id: 'act2', startMessageID: 'MSG1', endMessageID: 'MSG3' }
     *         ]
     *     }
     * ]
     * ```
     *
     * @aspDefaultValueIgnore
     * @default []
     */
    participants?: UmlSequenceParticipantModel[];

    /**
     * Defines the list of messages exchanged between participants in the UML sequence diagram.
     * Messages represent interactions such as method calls or responses between lifelines.
     *
     * ```typescript
     * messages: [
     *     {
     *         id: 'MSG1',
     *         content: 'User sends request',
     *         fromParticipantID: 'User',
     *         toParticipantID: 'Server'
     *     },
     *     {
     *         id: 'MSG2',
     *         content: 'Processing',
     *         fromParticipantID: 'Server',
     *         toParticipantID: 'Server'
     *     },
     *     {
     *         id: 'MSG3',
     *         content: 'Server sends response',
     *         fromParticipantID: 'Server',
     *         toParticipantID: 'User'
     *     }
     * ]
     * ```
     *
     * @aspDefaultValueIgnore
     * @default []
     */
    messages?: UmlSequenceMessageModel[];

    /**
     * Defines the interaction fragments in the UML sequence diagram.
     * Fragments are used to group messages under specific control structures such as loops, alternatives, or options.
     *
     * ```typescript
     * fragments: [
     *     {
     *         id: 'frag1',
     *         type: 'Optional',
     *         conditions: [
     *             {
     *                 content: 'Interactions',
     *                 messageIds: ['MSG1', 'MSG2', 'MSG3']
     *             }
     *         ]
     *     }
     * ]
     * ```
     *
     * @aspDefaultValueIgnore
     * @default []
     */
    fragments?: UmlSequenceFragmentModel[];

    /**
     * Defines the horizontal spacing between each participant (lifeline) in the UML sequence diagram.
     *
     * This spacing determines how far apart the participant boxes are placed,
     * which affects the overall layout and readability of the diagram.
     *
     * ```typescript
     * const model: UmlSequenceDiagramModel = {
     *     spaceBetweenParticipants: 120,
     *     participants: [ ... ],
     *     messages: [ ... ],
     *     fragments: [ ... ]
     * };
     * ```
     *
     * - A higher value increases the distance between participants.
     * - A lower value makes participants appear closer together.
     *
     * @default 100
     */
    spaceBetweenParticipants?: number;

}