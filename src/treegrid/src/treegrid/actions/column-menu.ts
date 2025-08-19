import { TreeGrid } from '../base/treegrid';
import { Grid, ColumnMenu as GridColumnMenu  } from '@syncfusion/ej2-grids';

/**
 * TreeGrid ColumnMenu module
 *
 * @hidden
 */
export class ColumnMenu {
    private parent: TreeGrid;

    /**
     * Constructor for render module
     *
     * @param {TreeGrid} parent - Tree Grid instance
     */
    constructor(parent?: TreeGrid) {
        Grid.Inject(GridColumnMenu);
        this.parent = parent;
    }

    public getColumnMenu(): HTMLElement {
        return this.parent.grid.columnMenuModule.getColumnMenu();
    }

    public destroy(): void {
        //this.parent.grid.columnMenuModule.destroy();
    }

    /**
     * For internal use only - Get the module name.
     *
     * @private
     * @returns {string} Returns ColumnMenu module name
     */
    private getModuleName(): string {
        return 'columnMenu';
    }
}
