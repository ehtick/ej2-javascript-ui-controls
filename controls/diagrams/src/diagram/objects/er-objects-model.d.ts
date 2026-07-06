import { ChildProperty, Complex, Property } from '@syncfusion/ej2-base';import { ShapeStyle } from '../core/appearance';import { ShapeStyleModel } from '../core/appearance-model';import { ShapeAnnotation } from './annotation';import { ShapeAnnotationModel } from './annotation-model';
import {ErFieldConstraint,ErMultiplicityTypes} from "./er-objects";

/**
 * Interface for a class ErHeader
 */
export interface ErHeaderModel {

    /**
     * Defines the annotation displayed in the ER entity header row.
     *
     * Use `annotation.content` to specify the entity or table name.
     *
     * @default { content: 'Entity' }
     */
    annotation?: ShapeAnnotationModel;

    /**
     * Defines the visual style of the ER entity header row.
     *
     * Supports standard shape style properties such as fill, stroke color,
     * stroke width, opacity, and other supported diagram style values.
     *
     * @default { fill: 'none', strokeColor: 'none', strokeWidth: 0 }
     */
    style?: ShapeStyleModel;

    /**
     * Defines the height of the ER entity header row.
     *
     * @default 30
     */
    height?: number;

}

/**
 * Interface for a class ErField
 */
export interface ErFieldModel {

    /**
     * Defines the unique identifier of the field within its parent entity.
     *
     * This identifier is used by runtime APIs such as `removeErField`. The value
     * must be unique within the parent ER entity.
     *
     * @default ''
     */
    id?: string;

    /**
     * Defines the display name of the field.
     *
     * This typically represents the database column name or logical attribute
     * name shown in the ER entity field row.
     *
     * @default ''
     */
    name?: string;

    /**
     * Defines the data type label displayed for the field.
     *
     * This value is treated as display text by the diagram component. Examples
     * include `INT`, `VARCHAR(255)`, and `DECIMAL(10,2)`.
     *
     * @default ''
     */
    dataType?: string;

    /**
     * Indicates whether the field is a primary key.
     *
     * When enabled, a primary key indicator is rendered for the field. A field
     * can be both a primary key and a foreign key.
     *
     * @default false
     */
    isPrimaryKey?: boolean;

    /**
     * Indicates whether the field is a foreign key.
     *
     * When enabled, a foreign key indicator is rendered for the field. A field
     * can be both a primary key and a foreign key.
     *
     * @default false
     */
    isForeignKey?: boolean;

    /**
     * Defines additional constraints applied to the field.
     *
     * Accepts one or more `ErFieldConstraint` values.
     *
     * @default []
     */
    constraints?: ErFieldConstraint[];

    /**
     * Defines the visual style of the ER field row.
     *
     * Supports standard shape style properties such as fill, stroke color,
     * stroke width, opacity, and other supported diagram style values.
     * Field-level style values override applicable values from field defaults.
     *
     * @default { fill: 'none', strokeColor: 'none', strokeWidth: 0 }
     */
    style?: ShapeStyleModel;

    /**
     * Defines text styling for the ER field row.
     *
     * Only `annotation.style` is applicable. The `annotation.content`
     * property is ignored — the `name` property is always used as the
     * field display text.
     *
     * @default {}
     */
    annotation?: ShapeAnnotationModel;

}

/**
 * Interface for a class ErFieldDefaults
 */
export interface ErFieldDefaultsModel {

    /**
     * Defines exactly two colors cycled across field rows in alternating order.
     *
     * Row 0 uses `alternateRowColors[0]`, row 1 uses
     * `alternateRowColors[1]`, row 2 uses `alternateRowColors[0]`, and so on.
     *
     * @default []
     */
    alternateRowColors?: [string, string];

    /**
     * Defines the default height of each ER entity field row.
     *
     * @default 25
     */
    height?: number;

}

/**
 * Interface for a class ErMultiplicity
 */
export interface ErMultiplicityModel {

    /**
     * Defines the Crow's Foot cardinality notation rendered at an ER connector
     * endpoint.
     *
     * @default 'One'
     */
    type?: ErMultiplicityTypes;

}