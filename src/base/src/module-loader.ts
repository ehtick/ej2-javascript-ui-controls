/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Module loading operations
 */
import { createInstance, setValue, getValue, deleteObject } from './util';
const MODULE_SUFFIX: string = 'Module';

/**
 * Interface for module declaration.
 */
export interface ModuleDeclaration {
    /**
     * Specifies the args for module declaration.
     */
    args: Object[];
    /**
     * Specifies the member for module declaration.
     */
    member: string;
    /**
     * Specifies the name for module declaration.
     */
    name?: string;
    /**
     * Specifies whether it is a property or not.
     */
    isProperty?: boolean;
}
export interface IParent {
    [key: string]: any;
}

export class ModuleLoader {
    private parent: any;
    private loadedModules: ModuleDeclaration[] = [];
    constructor(parent: IParent) {
        this.parent = parent;
    }

    /**
     * Inject required modules in component library
     *
     * @returns {void} ?
     * @param {ModuleDeclaration[]} requiredModules - Array of modules to be required
     * @param {Function[]} moduleList - Array of modules to be injected from sample side
     */
    public inject(requiredModules: ModuleDeclaration[], moduleList: Function[]): void {
        const reqLength: number = requiredModules.length;
        if (reqLength === 0) {
            this.clean();
            return;
        }
        if (this.loadedModules.length) {
            this.clearUnusedModule(requiredModules);
        }
        for (let i: number = 0; i < reqLength; i++) {
            const modl: ModuleDeclaration = requiredModules[parseInt(i.toString(), 10)];
            for (const module of moduleList) {
                const modName: string = modl.member;
                if ( module && module.prototype.getModuleName() === modl.member && !this.isModuleLoaded(modName)) {
                    const moduleObject: Object = createInstance(module, modl.args);
                    const memberName: string = this.getMemberName(modName);
                    if (modl.isProperty) {
                        setValue(memberName, module, this.parent);
                    } else {
                        setValue(memberName, moduleObject, this.parent);
                    }
                    const loadedModule: ModuleDeclaration = modl;
                    loadedModule.member = memberName;
                    this.loadedModules.push(loadedModule);
                }
            }
        }
    }

    /**
     * To remove the created object while destroying the control
     *
     * @returns {void}
     */
    public clean(): void {
        for (const modules of this.loadedModules) {
            if (!modules.isProperty) {
                getValue(modules.member, this.parent).destroy();
            }
        }
        this.loadedModules = [];
    }

    /**
     * Returns the array of modules that are not loaded in the component library.
     *
     * @param {ModuleDeclaration[]} requiredModules - Array of modules to be required
     * @returns {ModuleDeclaration[]} ?
     * @private
     */
    public getNonInjectedModules(requiredModules: ModuleDeclaration[]): ModuleDeclaration[] {
        return requiredModules.filter((module: ModuleDeclaration) => !this.isModuleLoaded(module.member));
    }

    /**
     * Removes all unused modules
     *
     * @param {ModuleDeclaration[]} moduleList ?
     * @returns {void} ?
     */

    private clearUnusedModule(moduleList: ModuleDeclaration[]): void {
        const usedModules: string[] = moduleList.map((arg: ModuleDeclaration) => { return this.getMemberName(arg.member); });
        const removableModule: ModuleDeclaration[] = this.loadedModules.filter((module: ModuleDeclaration) => {
            return usedModules.indexOf(module.member) === -1;
        });
        for (const mod of removableModule) {
            if (!mod.isProperty) {
                getValue(mod.member, this.parent).destroy();
            }
            this.loadedModules.splice(this.loadedModules.indexOf(mod), 1);
            deleteObject(this.parent, mod.member);
        }
    }

    /**
     * To get the name of the member.
     *
     * @param {string} name ?
     * @returns {string} ?
     */

    private getMemberName(name: string): string {
        return name[0].toLowerCase() + name.substring(1) + MODULE_SUFFIX;
    }

    /**
     * Returns boolean based on whether the module specified is loaded or not
     *
     * @param {string} modName ?
     * @returns {boolean} ?
     */

    private isModuleLoaded(modName: string): boolean {
        for (const mod of this.loadedModules) {
            if (mod.member === this.getMemberName(modName)) {
                return true;
            }
        }
        return false;
    }
}
