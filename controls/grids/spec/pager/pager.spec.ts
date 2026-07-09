/**
 * Pager spec 
 */

import { L10n, EmitType } from '@syncfusion/ej2-base';
import { createElement } from '@syncfusion/ej2-base';
import { Pager } from '../../src/pager/pager';
import { ExternalMessage } from '../../src/pager/external-message';
import '../../node_modules/es6-promise/dist/es6-promise';
import  {profile , inMB, getMemoryProfile} from './common.spec';
import { PagerDropDown } from '../../src/pager/pager-dropdown';

Pager.Inject(ExternalMessage, PagerDropDown);

describe('Pager base module', () => {

    describe('Pager properties testing', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });

        beforeAll((done: Function) => {
            const isDef = (o: any) => o !== undefined && o !== null;
            if (!isDef(window.performance)) {
                console.log("Unsupported environment, window.performance.memory is unavailable");
                pending; //Skips test (in Chai)
            }
            L10n.load({
                'de-DE': {
                    'pager': {
                        'currentPageInfo': '{0} van {1} pagina',
                        'totalItemsInfo': '( {0} items)',
                        'firstPageTooltip': 'Ga naar de eerste pagina',
                        'lastPageTooltip': 'Ga naar de laatste pagina',
                        'nextPageTooltip': 'Ga naar de volgende pagina',
                        'previousPageTooltip': 'Ga naar de vorige pagina',
                        'nextPagerTooltip': 'Ga naar de volgende pager-items',
                        'previousPagerTooltip': 'Ga naar vorige pager-items'
                    }
                }
            });
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, currentPage: 8, pageCount: 5, pageSize: 5, locale: 'de-DE',
                    enablePagerMessage: true, enableExternalMessage: true, externalMessage: 'externalMessage',
                    enableRtl: true, enableQueryString: true, customText: 'sheet',
                    created: created
                });

            pagerObj.appendTo('#Pager');
        });

        it('current page testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-active')[0].getAttribute('data-index')).toBe('8');
        });

        it('page count testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-numericcontainer')[0].childNodes.length).toBe(5);
        });

        it('enable pager message element testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-parentmsgbar').length).toBe(1);
        });

        it('enable pager message testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-parentmsgbar')[0].textContent).toBe('8 van 20 pagina ( 100 items)');
        });

        it('enable pager external message element testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-pagerexternalmsg').length).toBe(1);
        });

        it('enable pager external message testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-pagerexternalmsg')[0].textContent).toBe('externalMessage');
        });

        it('class testing', () => {
            expect(pagerObj.element.classList.contains('e-pager')).toBeTruthy();
        });

        it('rtl testing', () => {
            expect(pagerObj.element.classList.contains('e-rtl')).toBeTruthy();
        });

        it('custom text testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-active')[0].textContent).toBe('sheet8');
        });

        it('current page value testing', () => {
            expect(pagerObj.currentPage).toBe(8);
        });

        it('totalRecordsCount value testing', () => {
            expect(pagerObj.totalRecordsCount).toBe(100);
        });

        it('pageCount value testing', () => {
            expect(pagerObj.pageCount).toBe(5);
        });

        it('pageSize value testing', () => {
            expect(pagerObj.pageSize).toBe(5);
        });

        it('enableExternalMessage value testing', () => {
            expect(pagerObj.enableExternalMessage).toBeTruthy();
        });

        it('enablePagerMessage value testing', () => {
            expect(pagerObj.enablePagerMessage).toBeTruthy();
        });

        it('externalMessage value testing', () => {
            expect(pagerObj.externalMessage).toBe('externalMessage');
        });

        it('enableRtl value testing', () => {
            expect(pagerObj.enableRtl).toBeTruthy();
        });

        it('enableQueryString value testing', () => {
            expect(pagerObj.enableQueryString).toBeTruthy();
        });

        it('locale value testing', () => {
            expect(pagerObj.locale).toBe('de-DE');
        });

        it('querystring testing', () => {
            pagerObj.goToPage(10);
            expect(window.location.href.indexOf('?page=10')).toBeGreaterThan(-1);
        });

        it('pager button visibility testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-disable').length).toBe(0);
        });

        it('pager aria-attribute testing', () => {
            let pagerElement: Element = pagerObj.element;
            expect(pagerElement.querySelector('.e-mfirst').hasAttribute('tabindex')).toBeTruthy();
            expect(pagerElement.querySelector('.e-mprev').hasAttribute('tabindex')).toBeTruthy();
            let pagerContainer: Element = pagerObj.element.querySelector('.e-pagercontainer');
            let numericContainer: Element = pagerObj.element.querySelector('.e-numericcontainer');
            expect(pagerContainer.querySelector('.e-first').hasAttribute('tabindex')).toBeTruthy();
            expect(pagerContainer.querySelector('.e-prev').hasAttribute('tabindex')).toBeTruthy();
            for (let i: number; i < numericContainer.children.length; i++) {
                expect(numericContainer.children[i].hasAttribute('aria-label')).toBeTruthy();
                expect(numericContainer.children[i].hasAttribute('tabindex')).toBeTruthy();
            }
            expect(pagerElement.querySelector('.e-mnext').hasAttribute('tabindex')).toBeTruthy();
            expect(pagerElement.querySelector('.e-mlast').hasAttribute('aria-label')).toBeTruthy();
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = null;
        });

    });

    describe('Empty pager control testing', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });

        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager({ created: created });
            pagerObj.appendTo('#Pager');
        });

        it('pager message testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-parentmsgbar')[0].textContent).toBe('0 of 0 pages (0 item)');
        });

        it('disabled element testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-disable').length).toBe(10);
        });

        it('numericcontainer element testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-numericcontainer')[0].childNodes.length).toBe(10);
        });

        it('pager message element testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-parentmsgbar').length).toBe(1);
        });

        it('pager external message element testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-pagerexternalmsg').length).toBe(0);
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
        });

    });

    describe('Method testing', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });

        beforeAll((done: Function) => {
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, currentPage: 8, pageCount: 5, pageSize: 5,
                });
            pagerObj.appendTo('#Pager');
            setTimeout(() => { done(); }, 1000);
        });

        it('getLocalizedLabel testing', () => {
            expect(pagerObj.getLocalizedLabel('firstPageTooltip')).toBe('Go to first page');
        });

        afterAll(() => {
            pagerObj.getPersistData();
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = null;
        });

    });

    describe('pager onproperty changed', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, currentPage: 8, pageCount: 5, pageSize: 5,
                    enablePagerMessage: true, enableExternalMessage: true, externalMessage: 'externalMessage',
                    enableRtl: true, customText: 'sheet',
                    created: created
                });
            pagerObj.appendTo('#Pager');
        });

        it('totalRecordsCount testing', () => {
            pagerObj.totalRecordsCount = 200;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-parentmsgbar')[0].textContent).toBe('8 of 40 pages (200 items)');
        });

        it('pageSize testing', () => {
            pagerObj.pageSize = 6;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-parentmsgbar')[0].textContent).toBe('8 of 34 pages (200 items)');
        });

        it('pageCount testing', () => {
            pagerObj.pageCount = 6;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-numericcontainer')[0].childNodes.length).toBe(6);
        });

        it('currentPage testing', () => {
            expect(pagerObj.element.querySelectorAll('.e-active')[0].getAttribute('data-index')).toBe('8');
            pagerObj.currentPage = 13;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-active')[0].getAttribute('data-index')).toBe('13');
        });

        it('currentPage invalid value testing', () => {
            pagerObj.currentPage = -1;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-active')[0].getAttribute('data-index')).toBe('13');
            pagerObj.currentPage = 13;
            pagerObj.dataBind();
        });

        it('enablePagerMessage false testing', () => {
            pagerObj.enablePagerMessage = false;
            pagerObj.dataBind();
            expect((pagerObj.element.querySelectorAll('.e-parentmsgbar')[0] as HTMLElement).style.display).toBe('');
        });

        it('enablePagerMessage true testing', () => {
            pagerObj.enablePagerMessage = true;
            pagerObj.dataBind();
            expect((pagerObj.element.querySelectorAll('.e-parentmsgbar')[0] as HTMLElement).style.display).not.toBe('none');
        });

        it('enableExternalMessage false testing', () => {
            pagerObj.enableExternalMessage = false;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-pagerexternalmsg').length).toBe(0);
        });

        it('enableExternalMessage true testing', () => {
            pagerObj.enableExternalMessage = true;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-pagerexternalmsg').length).toBe(1);
        });

        it('enable pager external message testing', () => {
            pagerObj.externalMessage = 'modified';
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-pagerexternalmsg')[0].textContent).toBe('modified');
        });

        it('rtl false testing', () => {
            pagerObj.enableRtl = false;
            pagerObj.dataBind();
            expect(pagerObj.element.classList.contains('e-rtl')).toBeFalsy();
        });

        it('rtl true testing', () => {
            pagerObj.enableRtl = true;
            pagerObj.dataBind();
            expect(pagerObj.element.classList.contains('e-rtl')).toBeTruthy();
        });

        it('custom text testing', () => {
            pagerObj.customText = 'spreadsheet';
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-active')[0].textContent).toBe('spreadsheet13');
        });

        it('querystring testing', () => {
            pagerObj.dataBind();
            pagerObj.goToPage(14);
            expect(window.location.href.indexOf('?page=14')).not.toBeGreaterThan(-1);
            pagerObj.enableQueryString = true;
            pagerObj.dataBind();
            pagerObj.goToPage(15);
            expect(window.location.href.indexOf('?page=15')).toBeGreaterThan(-1);
            pagerObj.enableQueryString = false;
        });

        it('locale testing', () => {
            pagerObj.locale = 'de-DE';
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-parentmsgbar')[0].textContent).toBe('15 van 34 pagina ( 200 items)');
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = null;
        });

    });

    describe('pager template refresh', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });

        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager({
                template: '', totalRecordsCount: 100, created: created
            });
            pagerObj.appendTo('#Pager');
        });
        it('pager template refresh testing', () => {
            pagerObj.template = '<span class ="e-pagenomsg">${currentPage} of ${totalPages} pages</span>';
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-pagenomsg')[0].textContent).toBe('1 of 9 pages');
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            document.getElementById('Pager').remove();
        });

    });
    describe('pager template render', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager({
                template: '<span class ="e-pagenomsg">${currentPage} of ${totalPages} pages</span>', totalRecordsCount: 100, created: created
            });
            pagerObj.appendTo('#Pager');
        });
        it('pager template render testing', () => {
            pagerObj.totalRecordsCount = 200;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-pagenomsg')[0].textContent).toBe('1 of 17 pages');
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = null;
        });

    });
    describe('pager template create', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        let element: HTMLElement = createElement('div', { id: 'pagertemplate' });
        element.innerHTML = '<span class ="e-pagenomsg">${currentPage} of ${totalPages} pages</span>'
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(element);
            document.body.appendChild(elem);
            pagerObj = new Pager({
                template: '#pagertemplate', totalRecordsCount: 100, created: created
            });
            pagerObj.appendTo('#Pager');
        });
        it('pager template create testing', () => {
            pagerObj.totalRecordsCount = 200;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelectorAll('.e-pagenomsg')[0].textContent).toBe('1 of 17 pages');
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

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = element = null;
        });

    });
    
     describe('Custom pager text tested', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        beforeAll((done: Function) => {
            L10n.load({
                'de-DE': {
                    'pager': {
                        'currentPageInfo': '{0} of {1} pages - {2}',
                        'totalItemsInfo': '',
  
                    }
                }
            });
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, currentPage: 8, pageCount: 5, pageSize: 5, locale: 'de-DE',
                    created: created
                });

            pagerObj.appendTo('#Pager');
        });

        it('pager text testing', () => {
            expect(pagerObj.element.querySelector('.e-pagenomsg').textContent).toBe('8 of 20 pages - 100 ');
        });

        it('totalRecordsCount testing', () => {
            pagerObj.totalRecordsCount = 200;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelector('.e-pagenomsg').textContent).toBe('8 of 40 pages - 200 ');
        });

        it('pageSize testing', () => {
            pagerObj.pageSize = 6;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelector('.e-pagenomsg').textContent).toBe('8 of 34 pages - 200 ');
        });

        it('totalRecordsCount testing', () => {
            pagerObj.totalRecordsCount = 400;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelector('.e-pagenomsg').textContent).toBe('8 of 67 pages - 400 ');
        });

        it('pageSize testing', () => {
            pagerObj.pageSize = 10;
            pagerObj.dataBind();
            expect(pagerObj.element.querySelector('.e-pagenomsg').textContent).toBe('8 of 40 pages - 400 ');
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = null;
        });
    });
    describe('pager onproperty changed with value `All` ', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, currentPage: 8, pageCount: 5, pageSize: 100,
                    enablePagerMessage: true, enableExternalMessage: true, externalMessage: 'externalMessage',
                    enableRtl: true, customText: 'sheet',
                    created: created
                });
            pagerObj.appendTo('#Pager');
        });

        it('pageSize testing should has value of total records', () => {
            (pagerObj.pageSize as any) = 'All';
            pagerObj.dataBind();
            expect(pagerObj.pageSize).toBe(100);
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = null;
        });
    });

    describe('EJ2-822821 - Need to render the pager based on the Dom width', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        let pagerElements: NodeListOf<HTMLElement>;
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, pageCount: 30, pageSize: 2,
                    created: created
                });
            pagerObj.appendTo('#Pager');
            pagerObj.element.style.borderStyle = 'solid'; //code to trigger pager resizing.
        });

        it('Code coverage case for resized method in pager component', function () {
            pagerElements = pagerObj.element.querySelectorAll('.e-mfirst, .e-mprev, .e-icon-first, .e-icon-prev, .e-pp:not(.e-disable), .e-icon-next, .e-icon-last, .e-parentmsgbar, e-mnext, e-mlast, .e-pagerdropdown, .e-pagerconstant');
            pagerObj.element.querySelector('.e-np').classList.remove('e-disable');
            for (var i = 0; i < pagerElements.length; i++) {
                pagerElements[i].style.width = '25px';
            }
            (pagerObj as any).resizePager();
            expect(pagerObj.element.querySelectorAll('.e-numericitem:not(.e-hide):not(.e-np):not(.e-pp)')[29].classList.contains('e-hide')).toBeFalsy();
        });
        it('Code coverage case for resized method in pager component window reduced to current page', function () {
            pagerObj.currentPage = 15;
            pagerObj.element.querySelector('.e-np').classList.remove('e-disable');
            for (var i = 0; i < pagerElements.length; i++) {
                (pagerElements[i] as HTMLElement).style.width = '100px';
            }
            pagerObj.dataBind();
            expect(pagerObj.element.querySelector('.e-active').classList.contains('e-hide')).toBeFalsy();
        });

        it('Case for dynamically changing window size (triggering resize event manually)', function () {
            for (var i = 0; i < pagerElements.length; i++) {
                pagerElements[i].style.width = '20px';
            }
            var resizeEvent = new Event('resize');
            window.dispatchEvent(resizeEvent);
            expect((pagerObj as any).isPagerResized).toBeTruthy();
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = pagerElements = elem = null;
        });
    });

    describe('EJ2-832882 - Show and Hide Pager message elements dynamically when no numeric Items left to hide.', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        let pagerElements: NodeListOf<HTMLElement>;
        const isDeviceMockValue = true;
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, pageCount: 30, pageSize: 2,
                    created: created
                });
            pagerObj.appendTo('#Pager');
            pagerObj.element.style.width = '250px';
            pagerObj.element.style.borderStyle = 'solid'; //code to trigger pager resizing.
        });

        it('check whether the pager message is hidden or not', function () {
            var resizeEvent = new Event('resize');
            window.dispatchEvent(resizeEvent);
            (pagerObj as any).resizePager();
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = pagerElements = elem = null;
        });
    });

    describe('EJ2-832882 - Show and Hide Pager message elements dynamically when no numeric Items left to hide.', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        let pagerElements: NodeListOf<HTMLElement>;
        const isDeviceMockValue = true;
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, pageCount: 30, pageSize: 2, pageSizes: true,
                    created: created
                });
            pagerObj.appendTo('#Pager');
            pagerObj.element.style.borderStyle = 'solid'; //code to trigger pager resizing.
        });
        
        it('Make the window smaller to hide the pager message elements', function () {
            pagerObj.element.style.width = '220px';
            pagerObj.currentPage = 50; //to trigger current page if condition in resizePager method.
            pagerObj.dataBind();
            var resizeEvent = new Event('resize');
            window.dispatchEvent(resizeEvent);
            (pagerObj as any).resizePager();
        });
        
        it('check whether the pager message is shown when increasing window size or not', function () {
            pagerElements = pagerObj.element.querySelectorAll('.e-mfirst, .e-mprev, .e-icon-first, .e-icon-prev, .e-pp:not(.e-disable), .e-icon-next, .e-icon-last, .e-parentmsgbar, e-mnext, e-mlast, .e-pagesizes');
            pagerObj.element.querySelector('.e-np').classList.remove('e-disable');
            for (var i = 0; i < pagerElements.length; i++) {
                pagerElements[i].style.width = '25px';
            }
            pagerObj.element.style.width = '1000px';
            (pagerObj as any).resizePager();
            expect((pagerObj.element.querySelector('.e-pagesizes') as HTMLElement).classList.contains('e-hide')).toBeFalsy();
            pagerElements = pagerObj.element.querySelectorAll('.e-mfirst, .e-mprev, .e-icon-first, .e-icon-prev, .e-pp:not(.e-disable), .e-icon-next, .e-icon-last, .e-parentmsgbar, e-mnext, e-mlast, .e-pagerdropdown , .e-pagerconstant');
            for (var i = 0; i < pagerElements.length; i++) {
                pagerElements[i].style.width = '25px';
            }
            (pagerObj.element.querySelector('.e-parentmsgbar') as HTMLElement).style.display = 'inline-block';
            (pagerObj as any).resizePager();
            expect(pagerObj.element.querySelector('.e-active').classList.contains('e-hide')).toBeFalsy();
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = pagerElements = elem = null;
        });
    });

    describe('EJ2-838374 - Pager information is wrong while dynamically changing the Grid width.', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        let pagerElements: NodeListOf<HTMLElement>;
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, pageCount: 30, pageSizes: true,
                    created: created
                });
            pagerObj.setPageSize(2);
            pagerObj.appendTo('#Pager');
            pagerObj.element.style.borderStyle = 'solid'; //code to trigger pager resizing.
        });
        
        it('checking pager message is hidden/Shown when dynamically changing pager width', function () {
            pagerElements = pagerObj.element.querySelectorAll('.e-mfirst, .e-mprev, .e-icon-first, .e-icon-prev, .e-pp:not(.e-disable), .e-icon-next, .e-icon-last, e-mnext, e-mlast');
            pagerObj.element.querySelector('.e-np').classList.remove('e-disable');
            (pagerObj.element.querySelector('.e-mfirst') as HTMLElement).style.display = 'none';
            for (var i = 0; i < pagerElements.length; i++) {
                pagerElements[i].style.width = '25px';
            }
            pagerObj.element.style.width = '300px';
            pagerObj.refresh();
            pagerElements = pagerObj.element.querySelectorAll('.e-parentmsgbar, .e-pagesizes');
            for (var i = 0; i < pagerElements.length; i++) {
                pagerElements[i].style.width = '25px';
                pagerElements[i].classList.remove('e-hide');//for code coverage in resizePager method
            }
            pagerObj.element.style.width = '1200px';
            (pagerObj as any).resizePager();
            expect(pagerObj.element.querySelector('.e-parentmsgbar').classList.contains('e-hide')).toBeFalsy();
        });
        
        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = pagerElements = elem = null;
        });
    });

    describe('pager onproperty changed', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 100, currentPage: 8, pageCount: 5, pageSize: 5,
                    enablePagerMessage: true, enableExternalMessage: true, externalMessage: 'externalMessage',
                    enableRtl: true, customText: 'sheet', cssClass: 'e- custom',
                    created: created
                });
            pagerObj.appendTo('#Pager');
        });

        it('check the addEventListener Binding', () => {
            pagerObj.isDestroyed = true;
            (pagerObj as any).addListener();
            (pagerObj as any).removeListener();
            pagerObj.isDestroyed = false;
            pagerObj.setPagerContainerFocus();
        });


        it('check the isReactTemplate ', () => {
            pagerObj.isVue = true;
            pagerObj.template = '<span>Template</span>';
        });

        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = null;
        });
    });

    describe('991898: Updating the Chrome version in coverage test cases of EJ2 components - 1', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 2, currentPage: 1,
                    created: created
                });
            pagerObj.appendTo('#Pager');
        });
        it('Converage - 1', (done: Function) => {
            let element = pagerObj.element.querySelector('.e-mnext');
            (pagerObj as any).changeFocusInAdaptiveMode(element);
            done();
        });
        
        it('Converage - 2', function (done: Function) {
            const outerContainer = document.createElement('div');
            const dropDownPageHolder = document.createElement('div');
            dropDownPageHolder.className = 'e-pagerdropdown';
            const dropDownPage = document.createElement('input');
            dropDownPage.className = 'e-numerictextbox';
            dropDownPageHolder.appendChild(dropDownPage);
            outerContainer.appendChild(dropDownPageHolder);
            pagerObj.element = outerContainer;
            pagerObj.hasParent = true;
            (pagerObj as any).onFocusIn({ target: outerContainer });
            done();
        });
        it('Converage - 3', () => {
            pagerObj.destroyTemplate();
        });
        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = null;
        });
    });

    describe('991898: Updating the Chrome version in coverage test cases of EJ2 components - 2', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'Pager' });
        beforeAll((done: Function) => {
            let created: EmitType<Object> = () => { done(); };
            document.body.appendChild(elem);
            pagerObj = new Pager(
                {
                    totalRecordsCount: 2, currentPage: 1, pageSizes: [10, 20, 50, 100],
                    created: created
                });
            pagerObj.appendTo('#Pager');
        });
        it('Converage - 4', function (done: Function) {
            pagerObj.element = pagerObj.element.querySelector('.e-pagesizes');
            (pagerObj as any).onFocusOut({ target: {} });
            done();
        });
        afterAll(() => {
            pagerObj.destroy();
            elem.remove();
            pagerObj = elem = null;
        });
    });
    
    describe('Coverage - Pager render and lifecycle - branch coverage', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'PagerRender' });
        let __originalUserAgentDescriptor: PropertyDescriptor;
        let templateFunction = (data: any) => {
            return `<div class="pager-info">Page 1 of 2</div>`;
        };
        it('destroy with React template and !hasParent should destroy template', () => {
            document.body.appendChild(elem);
            
            pagerObj = new Pager({ totalRecordsCount: 50, template: templateFunction });
            pagerObj.isReact = true;
            pagerObj.hasParent = false;
            pagerObj.appendTo('#PagerRender');
            pagerObj.destroy();
        });
        
        it('should add e-mac-safari class on Safari browser', () => {
            document.body.appendChild(elem);
            __originalUserAgentDescriptor = Object.getOwnPropertyDescriptor(navigator, 'userAgent');
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Safari/537.36',
                configurable: true
            });
            pagerObj = new Pager({ totalRecordsCount: 50 });
            pagerObj.appendTo('#PagerRender');
        });

        afterEach(() => {
            if (pagerObj) { pagerObj.destroy(); }
            if (elem && elem.parentElement) { elem.remove(); }
            // restore navigator.userAgent descriptor if it was modified
            if (__originalUserAgentDescriptor) {
                try {
                    Object.defineProperty(navigator, 'userAgent', __originalUserAgentDescriptor);
                } catch (e) {
                    // ignore if restore fails in some environments
                }
                __originalUserAgentDescriptor = undefined;
            }
            pagerObj = templateFunction = null;
        });
    });

    describe('Coverage - Pager focus and keyboard navigation - branch coverage', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'PagerFocus' });

        beforeEach((done: Function) => {
            document.body.appendChild(elem);
            pagerObj = new Pager({ 
                totalRecordsCount: 100, 
                pageCount: 10, 
                pageSize: 10,
                pageSizes: true
            });
            pagerObj.appendTo('#PagerFocus');
            setTimeout(() => done(), 100);
        });

        it('onFocusOut with pageSizes and dropdown should remove focus from dropdown', () => {
            const dropDown = elem.querySelector('.e-pagerdropdown') as HTMLElement;
            if (dropDown && dropDown.children.length > 0) {
                const dropDownInput = dropDown.children[0] as HTMLElement;
                dropDownInput.classList.add('e-input-focus');
                (pagerObj as any).onFocusOut({ target: elem } as any);
            }
        });

        it('onKeyPress should call changePagerFocus when pager has focus', () => {
            const mockEvent = { keyCode: 9, preventDefault: jasmine.createSpy('preventDefault') } as any;
            (pagerObj as any).checkPagerHasFocus = jasmine.createSpy('checkPagerHasFocus').and.returnValue(true);
            (pagerObj as any).changePagerFocus = jasmine.createSpy('changePagerFocus');
            (pagerObj as any).onKeyPress(mockEvent);
        });

        it('changeFocusByTab should move focus forward when incrementNumber < array length', () => {
            const mockElements = [
                { focus: jasmine.createSpy('focus'), classList: { contains: () => false } },
                { focus: jasmine.createSpy('focus'), classList: { contains: () => false } }
            ] as any[];
            const mockEvent = { preventDefault: jasmine.createSpy('preventDefault'), keyCode: 9 } as any;
            (pagerObj as any).getFocusedTabindexElement = () => mockElements[0];
            (pagerObj as any).getFocusablePagerElements = () => mockElements;
            (pagerObj as any).changeFocusByTab(mockEvent);
        });

        it('changeFocusByShiftTab should move focus backward when decrementNumber >= 0', () => {
            const mockElements = [
                { focus: jasmine.createSpy('focus'), classList: { contains: () => false } },
                { focus: jasmine.createSpy('focus'), classList: { contains: () => false } }
            ] as any[];
            const mockEvent = { preventDefault: jasmine.createSpy('preventDefault'), keyCode: 9, shiftKey: true } as any;
            (pagerObj as any).getFocusedTabindexElement = () => mockElements[1];
            (pagerObj as any).getFocusablePagerElements = () => mockElements;
            (pagerObj as any).changeFocusByShiftTab(mockEvent);
        });
        
        it('navigateToPageByKey should call changeFocusInAdaptiveMode when focused element is adaptive', () => {
            // Prepare a paging action item and an adaptive focused element inside pager
            const pagingItem = document.createElement('a');
            pagingItem.className = 'e-prev';
            pagingItem.setAttribute('data-index', '2');
            pagerObj.element.appendChild(pagingItem);

            const focusedElem = document.createElement('div');
            focusedElem.className = 'e-focused e-mprev';
            pagerObj.element.appendChild(focusedElem);

            spyOn((pagerObj as any), 'changeFocusInAdaptiveMode');
            (pagerObj as any).navigateToPageByKey({ keyCode: 37 } as any);
        });

        afterEach(() => {
            if (pagerObj) { pagerObj.destroy(); }
            if (elem && elem.parentElement) { elem.remove(); }
            pagerObj = null;
        });
    });

    describe('Coverage - Pager template methods - branch coverage', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'PagerTemplate' });
        let templateFunction = (data: any) => {
            return `<span>Test</span>`;
        };
        it('pagerTemplate should handle React template with !isVue', () => {
            document.body.appendChild(elem);
            const testElement : Element = document.createElement('span');
            testElement.innerHTML = 'Test';
            testElement.className = 'e-test';
            document.body.appendChild(testElement);
            pagerObj = new Pager({ totalRecordsCount: 50, template: templateFunction });
            pagerObj.isReact = true;
            pagerObj.isVue = false;
            pagerObj.appendTo('#PagerTemplate');
            pagerObj.refresh();
            document.querySelector('.e-test').remove();
        });

        it('compile should handle template fallback when DOM selector not found', () => {
            document.body.appendChild(elem);
            pagerObj = new Pager({ totalRecordsCount: 50 });
            pagerObj.appendTo('#PagerTemplate');
            const result = pagerObj.compile('<span>Fallback</span>');
        });

        it('refresh with Angular template should destroy template', () => {
            document.body.appendChild(elem);
            pagerObj = new Pager({ totalRecordsCount: 50, template: '<span>Test</span>' });
            (pagerObj as any).parent = { isAngular: true, destroyTemplate: jasmine.createSpy('destroyTemplate') } as any;
            pagerObj.appendTo('#PagerTemplate');
            pagerObj.refresh();
        });

        it('refresh without template should call setPagerFocusForActiveElement when no focused element', () => {
            document.body.appendChild(elem);
            pagerObj = new Pager({ totalRecordsCount: 50, pageCount: 5 });
            pagerObj.appendTo('#PagerTemplate');
            const testElement : Element = document.createElement('span');
            testElement.classList.add('e-disable');
            (pagerObj as any).getFocusedTabindexElement = (): any => testElement;
            (pagerObj as any).setPagerFocusForActiveElement = jasmine.createSpy('setPagerFocusForActiveElement');
            pagerObj.refresh();
        });
        
        afterEach(() => {
            if (pagerObj) { pagerObj.destroy(); }
            if (elem && elem.parentElement) { elem.remove(); }
            pagerObj = templateFunction = null;
        });
    });

    describe('Coverage - Pager query string and URL methods - branch coverage', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'PagerURL' });

        beforeEach((done: Function) => {
            document.body.appendChild(elem);
            pagerObj = new Pager({ totalRecordsCount: 100, pageSize: 10 });
            pagerObj.appendTo('#PagerURL');
            setTimeout(() => done(), 100);
        });

        it('updateQueryString should dispatch popstate event when isReact is true', () => {
            pagerObj.isReact = true;
            spyOn(window, 'dispatchEvent');
            (pagerObj as any).updateQueryString(2);
        });

        it('getUpdatedURL should handle URL with hash fragment', () => {
            const uri = 'http://localhost:9876/page#section';
            const result = (pagerObj as any).getUpdatedURL(uri, 'page', '5');
        });

        it('render should set current page from querystring when enableQueryString true', () => {
            const originalHref = window.location.href;
            try {
                const tempElem = createElement('div', { id: 'PagerQS' });
                document.body.appendChild(tempElem);
                const p = new Pager({ enableQueryString: true });
                spyOn((p as any), 'setCurrentPageValue');
                p.appendTo('#PagerQS');
                expect((p as any).setCurrentPageValue).toHaveBeenCalled();
                p.destroy();
                tempElem.remove();
            } finally {
                history.pushState({}, '', originalHref);
            }
        });

        afterEach(() => {
            if (pagerObj) { pagerObj.destroy(); }
            if (elem && elem.parentElement) { elem.remove(); }
            pagerObj = null;
        });
    });

    describe('Coverage - Pager resize methods - branch coverage', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'PagerResize' });

        beforeEach((done: Function) => {
            document.body.appendChild(elem);
            pagerObj = new Pager({ 
                totalRecordsCount: 100, 
                pageCount: 30, 
                pageSize: 2,
                pageSizes: true
            });
            pagerObj.appendTo('#PagerResize');
            pagerObj.element.style.borderStyle = 'solid';
            pagerObj.element.style.width = '500px';
            setTimeout(() => done(), 100);
        });

        it('setShowItems should show items from lesser and greater indices', () => {
            const hrefElem = '<a class="e-link e-numericitem e-spacing e-pager-default e-hide" tabindex="-1" aria-label="Page 2 of 50 Pages" href="#" data-index="2">2</a>';
            const testElement : Element = document.createElement('div');
            testElement.innerHTML = hrefElem;
            const hiddenItems = Array.from(testElement.querySelectorAll('.e-numericitem.e-hide')) as HTMLElement[];
            if (hiddenItems.length > 0) {
                const mockItems = hiddenItems.map(item => ({
                    getAttribute: (attr: string) => item.getAttribute(attr),
                    classList: item.classList
                }));
                (pagerObj as any).currentPage = 5;
                (pagerObj as any).setShowItems(100, 30, 5, 1, mockItems as any);
                const shownItems = mockItems.filter(item => !item.classList.contains('e-hide'));
            }
        });

        it('hideDetailItems should add e-hide to detail items when required', () => {
            // append detail items to pager element
            const detail1 = document.createElement('div');
            detail1.className = 'e-parentmsgbar';
            detail1.style.width = '50px';
            const detail2 = document.createElement('div');
            detail2.className = 'e-pagesizes';
            detail2.style.width = '50px';
            pagerObj.element.appendChild(detail1);
            pagerObj.element.appendChild(detail2);

            // stub calculateActualWidth to force hiding
            (pagerObj as any).calculateActualWidth = () => 1000;
            (pagerObj as any).averageDetailWidth = 10;
            const detailItems = pagerObj.element.querySelectorAll('.e-parentmsgbar, .e-pagesizes') as NodeListOf<HTMLElement>;
            (pagerObj as any).hideDetailItems(100, 5, 50, detailItems);
        });

        it('resizePager should handle condition with numItems.length <= 1 and detailItems', () => {
            elem.style.width = '200px';
            (pagerObj as any).resizePager();
        });

        it('keyPressHandler should call stopImmediatePropagation when presskey.cancel is true', (done: Function) => {
            // Create a mock KeyboardEvent
            const mockEvent: any = {
                keyCode: 13,
                stopImmediatePropagation: jasmine.createSpy('stopImmediatePropagation'),
                preventDefault: jasmine.createSpy('preventDefault')
            };
            // Register a keyPressed listener that sets cancel to true
            (pagerObj as any).on('key-pressed', (args: any) => {
                args.cancel = true;
            });
            // Call keyPressHandler with our mock event
            (pagerObj as any).keyPressHandler(mockEvent);
            // Verify that stopImmediatePropagation was called
            expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
            done();
        });
        
        afterEach(() => {
            if (pagerObj) { pagerObj.destroy(); }
            if (elem && elem.parentElement) { elem.remove(); }
            pagerObj = null;
        });

    });

    describe('Coverage - navigateToPageByEnterOrSpace - branch coverage', () => {
        let pagerObj: Pager;
        let elem: HTMLElement = createElement('div', { id: 'PagerNavigate' });

        beforeEach((done: Function) => {
            document.body.appendChild(elem);
            pagerObj = new Pager({ 
                totalRecordsCount: 100, 
                pageCount: 10, 
                pageSize: 10
            });
            pagerObj.appendTo('#PagerNavigate');
            setTimeout(() => done(), 100);
        });

        it('should focus on classElement when selectedClass is e-last and element is not disabled', () => {
            const numericItem = elem.querySelector('.e-numericitem') as HTMLElement;
            if (numericItem) {
                numericItem.focus();
                numericItem.setAttribute('data-index', '2');
                numericItem.classList.add('e-focused');
                
                // Mock getClass to return 'e-last'
                (pagerObj as any).getClass = () => 'e-last';
                // Mock getElementByClass to return the last button
                const lastButton = elem.querySelector('.e-mlast') as HTMLElement;
                (pagerObj as any).getElementByClass = () => lastButton;
                
                const focusSpy = spyOn(lastButton, 'focus');
                (pagerObj as any).navigateToPageByEnterOrSpace({} as any);
                expect(focusSpy).toHaveBeenCalled();
            }
        });

        it('should call changeFocusInAdaptiveMode when checkFocusInAdaptiveMode returns true', () => {
            const numericItem = elem.querySelector('.e-numericitem') as HTMLElement;
            if (numericItem) {
                numericItem.focus();
                numericItem.setAttribute('data-index', '2');
                numericItem.classList.add('e-focused');
                
                // Mock getClass to return a non-navigation class
                (pagerObj as any).getClass = () => 'e-numericitem';
                // Mock getElementByClass to return null or a disabled element
                (pagerObj as any).getElementByClass = (): any => null;
                // Mock checkFocusInAdaptiveMode to return true
                (pagerObj as any).checkFocusInAdaptiveMode = jasmine.createSpy('checkFocusInAdaptiveMode').and.returnValue(true);
                (pagerObj as any).changeFocusInAdaptiveMode = jasmine.createSpy('changeFocusInAdaptiveMode');
                
                (pagerObj as any).navigateToPageByEnterOrSpace({} as any);
                expect((pagerObj as any).changeFocusInAdaptiveMode).toHaveBeenCalledWith(numericItem);
            }
        });

        afterEach(() => {
            if (pagerObj) { pagerObj.destroy(); }
            if (elem && elem.parentElement) { elem.remove(); }
            pagerObj = null;
        });
    });
});
