import { Property, NotifyPropertyChanges, INotifyPropertyChanged, Event, KeyboardEventArgs } from '@syncfusion/ej2-base';
import { Base, EmitType } from '@syncfusion/ej2-base';
import { KeyboardEventsModel } from '@syncfusion/ej2-base';


const keyCode: { [key: string]: number } = {
    'backspace': 8,
    'tab': 9,
    'enter': 13,
    'shift': 16,
    'control': 17,
    'alt': 18,
    'pause': 19,
    'capslock': 20,
    'space': 32,
    'escape': 27,
    'pageup': 33,
    'pagedown': 34,
    'end': 35,
    'home': 36,
    'leftarrow': 37,
    'uparrow': 38,
    'rightarrow': 39,
    'downarrow': 40,
    'insert': 45,
    'delete': 46,
    'f1': 112,
    'f2': 113,
    'f3': 114,
    'f4': 115,
    'f5': 116,
    'f6': 117,
    'f7': 118,
    'f8': 119,
    'f9': 120,
    'f10': 121,
    'f11': 122,
    'f12': 123,
    'semicolon': 186,
    'plus': 187,
    'comma': 188,
    'minus': 189,
    'dot': 190,
    'forwardslash': 191,
    'graveaccent': 192,
    'openbracket': 219,
    'backslash': 220,
    'closebracket': 221,
    'singlequote': 222,
    ']': 221,
    '[': 219,
    '=': 187,
    '<': 188,
    '>': 190,
    '`': 192
};

/**
 * KeyboardEvents class enables you to bind key action desired key combinations for ex., Ctrl+A, Delete, Alt+Space etc.
 * ```html
 * <div id='testEle'>  </div>;
 * <script>
 *   let node: HTMLElement = document.querySelector('#testEle');
 *   let kbInstance = new KeyboardEvents({
 *       element: node,
 *       keyConfigs:{ selectAll : 'ctrl+a' },
 *       keyAction: function (e:KeyboardEvent, action:string) {
 *           // handler function code
 *       }
 *   });
 * </script>
 * ```
 *
 * @hidden
 * @deprecated
 */
@NotifyPropertyChanges
export class KeyboardEvents extends Base<HTMLElement> implements INotifyPropertyChanged {

    /**
     * Specifies key combination and it respective action name.
     *
     * @default null
     */
    @Property({})
    public keyConfigs: { [key: string]: string };

    /**
     * Specifies on which event keyboardEvents class should listen for key press. For ex., `keyup`, `keydown` or `keypress`
     *
     * @default 'keyup'
     */
    @Property('keyup')
    public eventName: string;

    /**
     * Specifies the listener when keyboard actions is performed.
     *
     * @event 'keyAction'
     */
    @Event()
    public keyAction: EmitType<KeyboardEventArgs>;

    /**
     * Initializes the KeyboardEvents
     *
     * @param {HTMLElement} element - specifies the elements.
     * @param {KeyboardEventsModel} options - specify the options
     */
    public constructor(element: HTMLElement, options?: KeyboardEventsModel) {
        super(options, element);
        this.bind();
    }

    /**
     * Unwire bound events and destroy the instance.
     *
     * @returns {void}
     */
    public destroy(): void {
        this.unwireEvents();
        super.destroy();
    }

    /**
     * Function can be used to specify certain action if a property is changed
     *
     * @param {KeyboardEventsModel} newProp - specifies the keyboard event.
     * @param {KeyboardEventsModel} oldProp - specifies the old property.
     * @returns {void}
     * @private
     */
    // eslint-disable-next-line
    public onPropertyChanged(newProp: KeyboardEventsModel, oldProp?: KeyboardEventsModel): void {
        // No code are needed
    }

    protected bind(): void {
        this.wireEvents();
    }

    /**
     * To get the module name, returns 'keyboard'.
     *
     * @returns {void}
     */
    public getModuleName(): string {
        return 'keyboard';
    }

    /**
     * Wiring event handlers to events
     *
     * @returns {void}
     */
    private wireEvents(): void {
        this.element.addEventListener(this.eventName, this.keyPressHandler);
    }

    /**
     * Unwiring event handlers to events
     *
     * @returns {void}
     */
    private unwireEvents(): void {
        this.element.removeEventListener(this.eventName, this.keyPressHandler);
    }

    /**
     * To handle a key press event returns null
     *
     * @param {KeyboardEventArgs} e - specifies the event arguments.
     * @returns {void}
     */
    private keyPressHandler: EventListener = (e: KeyboardEventArgs): void => {
        /* eslint-disable */
        const isAltKey: Boolean = e.altKey;
        const isCtrlKey: Boolean = e.ctrlKey;
        const isShiftKey: Boolean = e.shiftKey;
        const isMetaKey: Boolean = e.metaKey;
        /* eslint-enable */
        const curkeyCode: number = e.which;
        const keys: string[] = Object.keys(this.keyConfigs);
        for (const key of keys) {
            const configCollection: string[] = this.keyConfigs[`${key}`].split(',');
            for (const rconfig of configCollection) {
                const rKeyObj: KeyData = KeyboardEvents.getKeyConfigData(rconfig.trim());
                if (isAltKey === rKeyObj.altKey && (isCtrlKey === rKeyObj.ctrlKey || isMetaKey) &&
                    isShiftKey === rKeyObj.shiftKey && curkeyCode === rKeyObj.keyCode) {
                    e.action = key;
                }
            }
        }
        if (this.keyAction) {
            this.keyAction(e);
        }
    }

    private static configCache: { [key: string]: KeyData } = {};

    /**
     * To get the key configuration data
     *
     * @param {string} config - configuration data
     * @returns {KeyData} - specifies the key data
     */
    private static getKeyConfigData(config: string): KeyData {
        if (config in this.configCache) {
            return this.configCache[`${config}`];
        }
        const keys: string[] = config.toLowerCase().split('+');
        const keyData: KeyData = {
            altKey: (keys.indexOf('alt') !== -1 ? true : false),
            ctrlKey: (keys.indexOf('ctrl') !== -1 ? true : false),
            shiftKey: (keys.indexOf('shift') !== -1 ? true : false),
            keyCode: null
        };
        if (keys[keys.length - 1].length > 1 && !!Number(keys[keys.length - 1])) {
            keyData.keyCode = Number(keys[keys.length - 1]);

        } else {
            keyData.keyCode = KeyboardEvents.getKeyCode(keys[keys.length - 1]);
        }
        KeyboardEvents.configCache[`${config}`] = keyData;
        return keyData;
    }

    // Return the keycode value as string
    private static getKeyCode(keyVal: string): number {
        return keyCode[`${keyVal}`] || keyVal.toUpperCase().charCodeAt(0);
    }
}

interface KeyData {
    /* eslint-disable */
    altKey: Boolean
    ctrlKey: Boolean
    shiftKey: Boolean
    keyCode: number | string
    /* eslint-enable */
}
