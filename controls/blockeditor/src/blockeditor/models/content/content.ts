import { ChildProperty, Property } from '@syncfusion/ej2-base';
import { ContentType } from '../../base/enums';
import { ContentProperties } from './content-props';

/**
 * Defines the properties of block.
 */
export class Content extends ChildProperty<Content> {

    /**
     * Specifies the unique identifier for the block.
     *
     * For standard types, this acts as the unique identifier of the content.
     * For special types like `Label` or `Mention`, this should be set to the corresponding item ID
     * from the datasource to render the resolved content.
     *
     * @default ''
     */
    @Property('')
    public id: string;

    /**
     * Defines the type of content for the block.
     * It can be text, link, code, mention, or label.
     *
     * @isenumeration true
     * @default ContentType.Text
     * @asptype ContentType
     */
    @Property(ContentType.Text)
    public type: ContentType | string;

    /**
     * Specifies the actual content of the block.
     *
     * @default ''
     */
    @Property('')
    public content: string;

    /**
     * Specifies the type specific properties for the content.
     *
     * @default null
     * @asptype object
     * @aspDefaultValueIgnore
     */
    @Property(null)
    public props: ContentProperties;
}
