/**
 * MaskedTextBox module spec document
 */
import { select, selectAll } from '@syncfusion/ej2-base';
import * as classes from '../../src/inplace-editor/base/classes';
import { renderEditor, destroy } from './../render.spec';
import { profile, inMB, getMemoryProfile } from './../common.spec';
import { BeginEditEventArgs, ChangeEventArgs } from '../../src/inplace-editor/base/index';

describe('MaskedTextBox Control', () => {
    beforeAll(() => {
        const isDef = (o: any) => o !== undefined && o !== null;
        if (!isDef(window.performance)) {
            console.log("Unsupported environment, window.performance.memory is unavailable");
            this.skip(); //Skips test (in Chai)
            return;
        }
    });

    describe('MaskedTextBox render testing', () => {
        let editorObj: any;
        let ele: HTMLElement;
        let valueEle: HTMLElement;
        let valueWrapper: HTMLElement;
        beforeAll((done: Function): void => {
            editorObj = renderEditor({
                mode: 'Inline',
                type: 'Mask',
                value: '00000',
                model: {
                    cssClass: 'customCSS'
                }
            });
            ele = editorObj.element;
            done();
        });
        afterAll((): void => {
            destroy(editorObj);
        });
        it('Component render testing', (done: Function) => {
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            setTimeout(() => {
                expect(selectAll('.e-maskedtextbox', ele).length === 1).toEqual(true);
                done();
            }, 400);
        });
        it('element availability testing', () => {
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', ele).length === 1).toEqual(true);
        });
        it('Initial focus testing', () => {
            expect(document.activeElement.tagName === 'INPUT').toEqual(true);
        });
        it('Clear icon availability testing', () => {
            expect(editorObj.componentObj.showClearButton).toBe(true);
            expect(selectAll('.e-clear-icon', ele).length).toBe(1);
        });
        it('cssClass availability testing', () => {
            expect(editorObj.model.cssClass === 'customCSS e-editable-elements').toBe(true);
        });
        it('Clear icon availability testing for false', () => {
            editorObj.componentObj.showClearButton = false;
            editorObj.componentObj.dataBind();
            expect(editorObj.componentObj.showClearButton).toBe(false);
            expect(selectAll('.e-clear-icon', ele).length).toBe(0);
        });
        it('Clear icon availability testing for true', () => {
            editorObj.componentObj.showClearButton = true;
            editorObj.componentObj.dataBind();
            expect(editorObj.componentObj.showClearButton).toBe(true);
            expect(selectAll('.e-clear-icon', ele).length).toBe(1);
        });
        it('Value property testing', () => {
            expect(editorObj.componentObj.value === '00000').toEqual(true);
            expect(editorObj.value === editorObj.componentObj.value).toEqual(true);
            expect((<HTMLInputElement>select('input', ele)).value === '00000').toEqual(true);
        });
        it('save method with value property testing', () => {
            editorObj.componentObj.value = '98765';
            editorObj.componentObj.dataBind();
            editorObj.save();
            expect(valueEle.innerHTML === '98765').toEqual(true);
        });
    });
    describe('Duplicate ID availability testing', () => {
        let editorObj: any;
        let ele: HTMLElement;
        let valueEle: HTMLElement;
        let valueWrapper: HTMLElement;
        afterEach((): void => {
            destroy(editorObj);
        });
        it('Inline - ID testing', () => {
            editorObj = renderEditor({
                mode: 'Inline',
                type: 'Mask'
            });
            ele = editorObj.element;
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', ele).length === 1).toEqual(true);
            expect(selectAll('#' + ele.id, document.body).length === 1).toEqual(true);
        });
        it('Popup - ID testing', () => {
            editorObj = renderEditor({
                mode: 'Popup',
                type: 'Mask'
            });
            ele = editorObj.element;
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(selectAll('#' + ele.id, document.body).length === 1).toEqual(true);
        });
    });
    describe('Value formatting related testing', () => {
        let editorObj: any;
        let ele: HTMLElement;
        let valueEle: HTMLElement;
        let valueWrapper: HTMLElement;
        afterEach((): void => {
            destroy(editorObj);
        });
        it('Default value with initial render testing', () => {
            editorObj = renderEditor({
                type: 'Mask',
                mode: 'Inline',
                model: {
                    mask: '#####'
                }
            });
            ele = editorObj.element;
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            expect(editorObj.value).toEqual(null);
            expect(valueEle.innerHTML).toEqual('Empty');
            editorObj.emptyText = 'Enter some text';
            editorObj.dataBind();
            expect(editorObj.value).toEqual(null);
            expect(valueEle.innerHTML).toEqual('Enter some text');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual(null);
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('_____');
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            editorObj.value = '2';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('2');
            expect(valueEle.innerHTML).toEqual('2');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('2');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('2____');
            editorObj.save();
            expect(editorObj.value).toEqual('2');
            expect(valueEle.innerHTML).toEqual('2____');
            editorObj.value = '';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('_____');
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
        });
        it('Value as "null" with initial render testing', () => {
            editorObj = renderEditor({
                type: 'Mask',
                mode: 'Inline',
                model: {
                    mask: '#####'
                },
                value: null
            });
            ele = editorObj.element;
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            expect(editorObj.value).toEqual(null);
            expect(valueEle.innerHTML).toEqual('Empty');
            editorObj.emptyText = 'Enter some text';
            editorObj.dataBind();
            expect(editorObj.value).toEqual(null);
            expect(valueEle.innerHTML).toEqual('Enter some text');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual(null);
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('_____');
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            editorObj.value = '2';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('2');
            expect(valueEle.innerHTML).toEqual('2');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('2');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('2____');
            editorObj.save();
            expect(editorObj.value).toEqual('2');
            expect(valueEle.innerHTML).toEqual('2____');
            editorObj.value = '';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('_____');
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
        });
        it('Value as "undefined" string with initial render testing', () => {
            editorObj = renderEditor({
                type: 'Mask',
                mode: 'Inline',
                model: {
                    mask: '#####'
                },
                value: undefined
            });
            ele = editorObj.element;
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            expect(editorObj.value).toEqual(null);
            expect(valueEle.innerHTML).toEqual('Empty');
            editorObj.emptyText = 'Enter some text';
            editorObj.dataBind();
            expect(editorObj.value).toEqual(null);
            expect(valueEle.innerHTML).toEqual('Enter some text');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual(null);
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('_____');
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            editorObj.value = '2';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('2');
            expect(valueEle.innerHTML).toEqual('2');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('2');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('2____');
            editorObj.save();
            expect(editorObj.value).toEqual('2');
            expect(valueEle.innerHTML).toEqual('2____');
            editorObj.value = '';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('_____');
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
        });
        it('Value as empty string with initial render testing', () => {
            editorObj = renderEditor({
                type: 'Mask',
                mode: 'Inline',
                model: {
                    mask: '#####'
                },
                value: ''
            });
            ele = editorObj.element;
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Empty');
            editorObj.emptyText = 'Enter some text';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('_____');
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            editorObj.value = '2';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('2');
            expect(valueEle.innerHTML).toEqual('2');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('2');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('2____');
            editorObj.save();
            expect(editorObj.value).toEqual('2');
            expect(valueEle.innerHTML).toEqual('2____');
            editorObj.value = '';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('_____');
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
        });
        it('Defined value with initial render testing', () => {
            editorObj = renderEditor({
                type: 'Mask',
                mode: 'Inline',
                value: '000',
                model: {
                    mask: '#####'
                }
            });
            ele = editorObj.element;
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            expect(editorObj.value).toEqual('000');
            expect(valueEle.innerHTML).toEqual('000');
            editorObj.emptyText = 'Enter some text';
            editorObj.dataBind();
            expect(editorObj.value).toEqual('000');
            expect(valueEle.innerHTML).toEqual('000');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('000__');
            expect(editorObj.value).toEqual('000');
            editorObj.save();
            expect(editorObj.value).toEqual('000');
            expect(valueEle.innerHTML).toEqual('000__');
            editorObj.value = '';
            editorObj.dataBind();
            expect(valueEle.innerHTML).toEqual('Enter some text');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('_____');
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Enter some text');
            editorObj.value = '123';
            editorObj.dataBind();
            expect(valueEle.innerHTML).toEqual('123');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('123');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('123__');
            editorObj.save();
            expect(editorObj.value).toEqual('123');
            expect(valueEle.innerHTML).toEqual('123__');
        });
    });

    describe('Model - value child property update testing', () => {
        let editorObj: any;
        let ele: HTMLElement;
        let valueEle: HTMLElement;
        let valueWrapper: HTMLElement;
        afterEach((): void => {
            destroy(editorObj);
        });
        it('Default value with initial render testing', () => {
            editorObj = renderEditor({
                type: 'Mask',
                mode: 'Inline',
                value: '000',
                model: {
                    mask: '###'
                }
            });
            ele = editorObj.element;
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, valueWrapper);
            expect(editorObj.value).toEqual('000');
            expect(valueEle.innerHTML).toEqual('000');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('000');
            expect(editorObj.model.value).toEqual('000');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('000');
            (<HTMLInputElement>select('.e-maskedtextbox', document.body)).value = '';
            editorObj.setProperties({ value: '' }, true);
            editorObj.componentObj.value = '';
            editorObj.save();
            expect(editorObj.value).toEqual('');
            expect(valueEle.innerHTML).toEqual('Empty');
            valueEle.click();
            expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
            expect(selectAll('.e-maskedtextbox', document.body).length === 1).toEqual(true);
            expect(editorObj.value).toEqual('');
            expect((<HTMLInputElement>select('.e-maskedtextbox', document.body)).value).toEqual('___');
        });
    });

    describe('beginEdit event testing', () => {
        let editorObj: any;
        afterEach((): void => {
            destroy(editorObj);
        });
        it('Inline - Focus testing', (done: Function) => {
            let count: number = 0;
            editorObj = renderEditor({
                type: 'Mask',
                mode: 'Inline',
                value: '000',
                beginEdit: function(e: BeginEditEventArgs) {
                    count = count + 1;
                    e.cancelFocus = true
                }
            });
            (<HTMLElement>select('.' + classes.VALUE, editorObj.element)).click();
            setTimeout(() => {
                expect(document.activeElement.tagName === 'INPUT').not.toEqual(true);
                expect(count).toEqual(1);
                done();
            }, 400);
        });
        it('Popup - Focus testing', (done: Function) => {
            let count: number = 0;
            editorObj = renderEditor({
                type: 'Mask',
                mode: 'Popup',
                value: '000',
                beginEdit: function(e: BeginEditEventArgs) {
                    count = count + 1;
                    e.cancelFocus = true
                }
            });
            (<HTMLElement>select('.' + classes.VALUE, editorObj.element)).click();
            setTimeout(() => {
                expect(document.activeElement.tagName === 'INPUT').not.toEqual(true);
                expect(count).toEqual(1);
                done();
            }, 400);
        });
    });

    describe('BLAZ-4764 - New change event testing', () => {
        let editorObj: any;
        let ele: HTMLElement;
        let valueEle: HTMLElement;
        let changeArgs: any = {};
        afterEach((): void => {
            destroy(editorObj);
            changeArgs = {};
        });
        it('Without initial value - Check changed value', (done) => {
            editorObj = renderEditor({
                mode: 'Inline',
                type: 'Mask',
                model: {
                    mask: '#####'
                },
                change: function (e: ChangeEventArgs) {
                    changeArgs = e;
                }
            });
            ele = editorObj.element;
            valueEle = <HTMLElement>select('.' + classes.VALUE, ele);
            valueEle.click();
            setTimeout(() => {
                expect(editorObj.value).toEqual(null);
                editorObj.componentObj.value = "12345";
                (ele.querySelector('.e-editable-component') as HTMLElement).click();
                setTimeout(() => {
                    expect(changeArgs['name']).toEqual('change');
                    expect(changeArgs['previousValue']).toEqual(null);
                    expect(changeArgs['value']).toEqual('12345');
                    done();
                }, 1000);
            }, 1500);
        });
        it('Check changed value', (done) => {
            editorObj = renderEditor({
                mode: 'Inline',
                type: 'Mask',
                value: '000__',
                model: {
                    mask: '#####'
                },
                change: function (e: ChangeEventArgs) {
                    changeArgs = e;
                }
            });
            ele = editorObj.element;
            valueEle = <HTMLElement>select('.' + classes.VALUE, ele);
            valueEle.click();
            setTimeout(() => {
                expect(editorObj.value).toEqual('000__');
                editorObj.componentObj.value = "12345";
                (ele.querySelector('.e-editable-component') as HTMLElement).click();
                setTimeout(() => {
                    expect(changeArgs['name']).toEqual('change');
                    expect(changeArgs['previousValue']).toEqual('000__');
                    expect(changeArgs['value']).toEqual('12345');
                    done();
                }, 1000);
            }, 1500);
        });
    });

    describe('EJ2-48274 - New `enableHtmlParse` API testing', () => {
        let editorObj: any;
        let ele: HTMLElement;
        let valueEle: HTMLElement;
        let changeArgs: any = {};
        let valueWrapper: HTMLElement;
        let buttonEle: HTMLElement;
        afterEach((): void => {
            destroy(editorObj);
            changeArgs = {};
        });
        it('Editor DOM value testing', (done) => {
            editorObj = renderEditor({
                mode: 'Inline',
                enableHtmlParse: false,
                enableHtmlSanitizer: false,
                type: 'Mask',
                value: '<img src=x onerror=console.log("test")><script>alert("test")</script>'
            });
            ele = editorObj.element;
            valueWrapper = <HTMLElement>select('.' + classes.VALUE_WRAPPER, ele);
            valueEle = <HTMLElement>select('.' + classes.VALUE, ele);
            expect(valueEle.innerText).toEqual('<img src=x onerror=console.log("test")><script>alert("test")</script>');
            valueEle.click();
            setTimeout(() => {
                expect(valueWrapper.classList.contains(classes.OPEN)).toEqual(true);
                buttonEle = <HTMLElement>select('.' + classes.BTN_SAVE, ele);
                buttonEle.dispatchEvent(new MouseEvent('mousedown'));
                setTimeout(() => {
                    expect(valueEle.innerText).toEqual('<img src=x onerror=console.log("test")><script>alert("test")</script>');
                    done();
                }, 1000);
            }, 1500);
        });
    });

    it('memory leak', () => {
        profile.sample();
        let average: any = inMB(profile.averageChange)
        //Check average change in memory samples to not be over 10MB
        expect(average).toBeLessThan(10);
        let memory: any = inMB(getMemoryProfile())
        //Check the final memory usage against the first usage, there should be little change if everything was properly deallocated
        expect(memory).toBeLessThan(profile.samples[0] + 0.25);
    });
});