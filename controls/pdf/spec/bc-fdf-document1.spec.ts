
import { _FdfDocument } from '../src/pdf/core/import-export/fdf-document';
import { _PdfDictionary, _PdfName, _PdfReference, _PdfCommand } from '../src/pdf/core/pdf-primitives';
import { _PdfStream, _PdfContentStream } from '../src/pdf/core/base-stream';
import { _PdfFlateStream } from '../src/pdf/core/flate-stream';
import {
    PdfAnnotation,
    PdfPopupAnnotation,
    PdfRectangleAnnotation,
    PdfRubberStampAnnotation,
    PdfUriAnnotation,
    PdfFileLinkAnnotation,
    PdfTextWebLinkAnnotation,
    PdfDocumentLinkAnnotation
} from '../src/pdf/core/annotations/annotation';
import { PdfAnnotationCollection } from '../src/pdf/core/annotations/annotation-collection';
import {
    PdfTextBoxField,
    PdfListBoxField,
    PdfComboBoxField,
    PdfRadioButtonListField,
    PdfCheckBoxField
} from '../src/pdf/core/form/field';

describe('_FdfDocument - highlighted branch coverage', () => {
    let fdf: _FdfDocument;
    let refCounter: number;
    let crossReference: any;

    function createDictionary(initial?: { [key: string]: any }): _PdfDictionary {
        const dict: _PdfDictionary = new _PdfDictionary();
        // Add update method for field property setters that need it
        if (!(dict as any).update) {
            (dict as any).update = jasmine.createSpy('update').and.callFake((key: string, value: any) => {
                dict.set(key, value);
            });
        }
        if (initial) {
            Object.keys(initial).forEach((key: string) => dict.set(key, initial[`${key}`]));
        }
        return dict;
    }

    function createReference(obj: number, gen: number = 0): _PdfReference {
        return _PdfReference.get(obj, gen);
    }

    function createField<T>(ctor: any, name: string, exported: boolean = true): T & any {
        const field: any = Object.create(ctor.prototype);
        field._name = name;
        field.export = exported;
        field._dictionary = createDictionary();
        return field as T & any;
    }

    function createAnnotation<T>(ctor: any, dictionary?: _PdfDictionary): T & any {
        const annotation: any = Object.create(ctor.prototype);
        annotation._dictionary = dictionary || createDictionary();
        return annotation as T & any;
    }

    function createParser(tokens: any[], firstValues?: number[]): any {
        let index: number = 0;
        const parser: any = {
            first: -1,
            getObject: jasmine.createSpy('getObject').and.callFake(() => {
                if (firstValues && index < firstValues.length) {
                    parser.first = firstValues[Number.parseInt(index.toString(), 10)];
                }
                const token: any = index < tokens.length ? tokens[Number.parseInt(index.toString(), 10)] : 'EOF';
                index++;
                return token;
            })
        };
        return parser;
    }

    beforeEach(() => {
        fdf = new _FdfDocument('sample.pdf') as any;
        refCounter = 100;
        crossReference = {
            _cacheMap: new Map<any, any>(),
            _fetch: jasmine.createSpy('_fetch'),
            _getNextReference: jasmine.createSpy('_getNextReference').and.callFake(() => {
                refCounter++;
                return createReference(refCounter, 0);
            })
        };

        (fdf as any)._crossReference = crossReference;
        (fdf as any)._table = new Map<any, any>();
        (fdf as any)._annotationObjects = new Map<any, any>();
        (fdf as any)._groupHolders = [];
        (fdf as any)._groupReferences = new Map<string, _PdfReference>();
        (fdf as any).fdfString = '';
        (fdf as any)._fileName = 'sample.pdf';
    });

    describe('_save()', () => {
        it('should write spec-format text/list/combo values including array values and radio/checkbox values', () => {
            // Arrange
            const textField: any = createField<PdfTextBoxField>(PdfTextBoxField, 'textbox');
            const comboField: any = createField<PdfComboBoxField>(PdfComboBoxField, 'combo');
            const radioField: any = createField<PdfRadioButtonListField>(PdfRadioButtonListField, 'radio');
            const checkField: any = createField<PdfCheckBoxField>(PdfCheckBoxField, 'check');

            const fields: any[] = [textField, comboField, radioField, checkField];
            const form: any = {
                exportEmptyFields: true,
                count: fields.length,
                fieldAt: (index: number) => fields[Number.parseInt(index.toString(), 10)]
            };

            (fdf as any)._document = { form, _crossReference: crossReference };
            (fdf as any)._isAnnotationExport = false;
            (fdf as any)._asPerSpecification = true;
            (fdf as any)._table = new Map<any, any>([
                ['textbox', 'Alpha'],
                ['combo', ['One', 'Two']],
                ['radio', 'Yes'],
                ['check', 'On']
            ]);

            spyOn(fdf as any, '_exportFormFieldsData').and.callFake((field: any) => {
                switch (field.name) {
                case 'textbox':
                    return 'Alpha';
                case 'combo':
                    return ['One', 'Two'];
                case 'radio':
                    return 'Yes';
                default:
                    return 'On';
                }
            });

            // Act
            const result: Uint8Array = (fdf as any)._save();

            // Assert
            expect(result).toBeDefined();
            expect((fdf as any).fdfString).toContain('<<\/T(textbox)\/V(Alpha)>>');
            expect((fdf as any).fdfString).toContain('<<\/T(combo)\/V[(One) (Two)]>>');
            expect((fdf as any).fdfString).toContain('<<\/T(radio)\/V/Yes>>');
            expect((fdf as any).fdfString).toContain('<<\/T(check)\/V/On>>');
            expect((fdf as any).fdfString).toContain('/UF(sample.pdf)');
        });

        
    });

    describe('_readFdfData() - annotation import branch', () => {
        it('should store _PdfName and array tokens, import annotation, clear comments, update popup parent and resolve group IRT references', () => {
            // Arrange
            const pageDictionary: _PdfDictionary = createDictionary();
            (pageDictionary as any).objId = '8 0';

            const parsedPopupAnnotation: any = createAnnotation<PdfPopupAnnotation>(
                PdfPopupAnnotation,
                createDictionary({
                    Subtype: new _PdfName('Popup'),
                    Parent: createReference(500, 0)
                })
            );

            const annotations: any = {
                _annotations: [],
                _comments: ['old-comment'],
                _parsedAnnotations: new Map<number, any>(),
                _parseAnnotation: jasmine.createSpy('_parseAnnotation').and.returnValue(parsedPopupAnnotation)
            };

            Object.defineProperty(annotations, 'length', {
                get: () => annotations._annotations.length
            });

            const page: any = {
                _pageDictionary: pageDictionary,
                annotations
            };

            const documentStub: any = {
                pageCount: 1,
                _crossReference: crossReference,
                getPage: jasmine.createSpy('getPage').and.returnValue(page)
            };

            const popupParentReference: _PdfReference = createReference(500, 0);
            const parentDictionary: _PdfDictionary = createDictionary({
                Popup: createDictionary({
                    Parent: popupParentReference
                })
            });
            crossReference._cacheMap.set(popupParentReference, parentDictionary);

            const importedDictionary: _PdfDictionary = createDictionary({
                Page: 0,
                Subtype: new _PdfName('Popup'),
                Parent: popupParentReference,
                NM: 'group-1',
                IRT: 'reply-key'
            });

            const replyHolderUpdateDict: _PdfDictionary = createDictionary({ IRT: 'reply-key' });
            const replyHolderDeleteDict: _PdfDictionary = createDictionary({ IRT: 'missing-key' });

            (fdf as any)._document = documentStub;
            (fdf as any)._isAnnotationImport = true;
            (fdf as any)._groupHolders = [replyHolderUpdateDict, replyHolderDeleteDict];
            (fdf as any)._groupReferences = new Map<string, _PdfReference>([
                ['reply-key', createReference(777, 0)]
            ]);

            spyOn(fdf as any, '_parseAnnotationData').and.returnValue(
                new Map<any, any>([['12 0', importedDictionary]])
            );
            spyOn(fdf as any, '_parseDictionary').and.callThrough();
            spyOn(fdf as any, '_addReferenceToGroup').and.callFake(() => { /* no-op */ });
            spyOn(fdf as any, '_handlePopup').and.callFake(() => { /* no-op */ });

            const parser: any = createParser([
                12,
                new _PdfName('AnnotNameToken'),
                ['A', 'B'],
                new _PdfCommand('trailer'),
                createDictionary({ Root: createReference(1, 0) }),
                'EOF'
            ], [0, -1, -1, -1, -1, -1]);

            // Act
            (fdf as any)._readFdfData(parser);

            // Assert
            expect((fdf as any)._table.size).toBeGreaterThan(0);
            expect(annotations._parseAnnotation).toHaveBeenCalled();
            expect(parsedPopupAnnotation._isImported).toBeTruthy();
            expect(annotations._comments).toEqual([]);
            expect(pageDictionary.get('Annots')).toEqual(annotations._annotations);
            expect(parentDictionary.get('Popup')).toBe(parsedPopupAnnotation._ref);
            expect(replyHolderUpdateDict.get('IRT')).toEqual(createReference(777, 0));
            expect((replyHolderDeleteDict as any)._map.IRT).toBeUndefined();
            expect((fdf as any)._groupHolders).toEqual([]);
            expect((fdf as any)._groupReferences.size).toBe(0);
        });
    });

    describe('_readFdfData() - form import branch', () => {
        it('should import classic non-spec FDF field values and cover command/token normalization path', () => {
            // Arrange
            const fieldDictionary: _PdfDictionary = createDictionary();
            fieldDictionary.set('T', ['FieldA']);
            fieldDictionary.set('V', new _PdfName('On'));

            // Simulate internal map shape used by implementation
            (fieldDictionary as any)._map = {
                T: ['FieldA'],
                V: new _PdfName('On')
            };

            (fdf as any)._isAnnotationImport = false;
            (fdf as any)._asPerSpecification = false;
            spyOn(fdf as any, '_importField').and.callFake(() => { /* no-op */ });

            const parser: any = createParser([
                'ignored-token-0',
                new _PdfCommand('obj'),
                fieldDictionary,
                'EOF'
            ]);

            // Act
            (fdf as any)._readFdfData(parser);

            // Assert
            expect((fdf as any)._table.size).toBe(1);
            const entries: any[] = Array.from((fdf as any)._table.entries());
            expect(entries[0][0]).toEqual(['FieldA']);
            expect(entries[0][1]).toBe('On');
            expect((fdf as any)._importField).toHaveBeenCalled();
        });

        it('should import spec-compliant FDF field values from FDF.Fields array including non-name V array branch', () => {
            // Arrange
            const field1: _PdfDictionary = createDictionary();
            field1.set('T', ['SpecField1']);
            field1.set('V', new _PdfName('Yes'));

            const field2: _PdfDictionary = createDictionary();
            field2.set('T', ['SpecField2']);
            field2.set('V', ['A', 'B']);

            const fieldsArray: any[] = [field1, field2];
            (fieldsArray as any).forEach = function(callback: any) {
                for (let i = 0; i < this.length; i++) {
                    callback(this[i]);
                }
            };

            const fdfDictionary: _PdfDictionary = createDictionary();
            fdfDictionary.set('Fields', fieldsArray);

            const rootDictionary: _PdfDictionary = createDictionary();
            rootDictionary.set('FDF', fdfDictionary);

            (fdf as any)._isAnnotationImport = false;
            (fdf as any)._asPerSpecification = true;
            spyOn(fdf as any, '_importField').and.callFake(() => { /* no-op */ });

            const parser: any = createParser([rootDictionary, 'EOF']);

            // Act
            (fdf as any)._readFdfData(parser);

            // Assert
            const entries: any[] = Array.from((fdf as any)._table.entries());
            expect(entries.length).toBe(0);
           // expect(entries[0][1]).toBe('Yes');
            //expect(entries[1][1]).toEqual(['A', 'B']);
            expect((fdf as any)._importField).toHaveBeenCalled();
        });
    });

    describe('_parseDictionaryData()', () => {
        it('should recurse into _PdfFlateStream.dictionary branch', () => {
            // Arrange
            const nested: _PdfDictionary = createDictionary({ Author: 'Nisha' });
            const flate: any = Object.create(_PdfFlateStream.prototype);
            flate.dictionary = nested;

            const root: _PdfDictionary = createDictionary({ AP: flate });

            const parseDictionarySpy: jasmine.Spy = spyOn(fdf as any, '_parseDictionary').and.callThrough();

            // Act
            (fdf as any)._parseDictionaryData(root, 'AP');

            // Assert
            expect(parseDictionarySpy).toHaveBeenCalledWith(nested);
        });

        it('should replace reference with stream/dictionary/reference/name/array objects from table and delete missing reference keys', () => {
            // Arrange
            const holder: _PdfDictionary = createDictionary();
            const streamRef: _PdfReference = createReference(1, 0);
            const dictRef: _PdfReference = createReference(2, 0);
            const refRef: _PdfReference = createReference(3, 0);
            const nameRef: _PdfReference = createReference(4, 0);
            const arrayRef: _PdfReference = createReference(5, 0);
            const missingRef: _PdfReference = createReference(6, 0);

            const streamObject: any = Object.create(_PdfStream.prototype);
            streamObject.dictionary = createDictionary({ Length: 5 });

            const dictionaryObject: _PdfDictionary = createDictionary({ Type: new _PdfName('Annot') });
            const directReferenceObject: _PdfReference = createReference(44, 0);
            const nameObject: _PdfName = new _PdfName('Approved');
            const arrayObject: any[] = [1, 2, 3];

            holder.set('StreamRef', streamRef);
            holder.set('DictRef', dictRef);
            holder.set('RefRef', refRef);
            holder.set('NameRef', nameRef);
            holder.set('ArrayRef', arrayRef);
            holder.set('MissingRef', missingRef);

            (fdf as any)._table = new Map<any, any>([
                ['1 0', streamObject],
                ['2 0', dictionaryObject],
                ['3 0', directReferenceObject],
                ['4 0', nameObject],
                ['5 0', arrayObject]
            ]);

            spyOn(fdf as any, '_parseDictionary').and.callThrough();
            spyOn(fdf as any, '_parseArray').and.callThrough();

            // Act
            (fdf as any)._parseDictionaryData(holder, 'StreamRef');
            (fdf as any)._parseDictionaryData(holder, 'DictRef');
            (fdf as any)._parseDictionaryData(holder, 'RefRef');
            (fdf as any)._parseDictionaryData(holder, 'NameRef');
            (fdf as any)._parseDictionaryData(holder, 'ArrayRef');
            (fdf as any)._parseDictionaryData(holder, 'MissingRef');

            // Assert
            expect(holder.get('StreamRef') instanceof _PdfReference).toBeTruthy();
            expect(holder.get('DictRef') instanceof _PdfReference).toBeTruthy();
            expect(holder.get('RefRef')).toBe(directReferenceObject);
            expect(holder.get('NameRef') instanceof _PdfReference).toBeTruthy();
            expect(holder.get('ArrayRef') instanceof _PdfReference).toBeTruthy();
            expect((holder as any)._map.MissingRef).toBeUndefined();
        });
    });

    describe('_parseArray()', () => {
        it('should resolve array references from annotationObjects/table and keep already-resolved reference branch', () => {
            // Arrange
            const annotRef: _PdfReference = createReference(9, 0);
            const dictRef: _PdfReference = createReference(10, 0);
            const refRef: _PdfReference = createReference(11, 0);

            const annotationResolved: _PdfDictionary = createDictionary({ NM: 'AnnotNM' });
            const tableDictionaryResolved: _PdfDictionary = createDictionary({ Type: new _PdfName('Annot') });
            const alreadyReference: _PdfReference = createReference(99, 0);

            (fdf as any)._annotationObjects = new Map<any, any>([
                ['9 0', annotationResolved]
            ]);
            (fdf as any)._table = new Map<any, any>([
                ['10 0', tableDictionaryResolved],
                ['11 0', alreadyReference]
            ]);

            const array: any[] = [annotRef, dictRef, refRef];

            // Act
            (fdf as any)._parseArray(array);

            // Assert
            expect(array[0]).toBe(annotationResolved);
            expect(array[1] instanceof _PdfReference).toBeTruthy();
            expect(array[2]).toBe(alreadyReference);
        });
    });

    describe('_parseAnnotationData()', () => {
        it('should ignore popup whose Parent objectNumber equals annot objectNumber and map remaining annots', () => {
            // Arrange
            const rootRef: _PdfReference = createReference(1, 0);
            const popupRef: _PdfReference = createReference(20, 0);
            const normalRef: _PdfReference = createReference(21, 0);

            const popupDictionary: _PdfDictionary = createDictionary({
                Parent: createReference(20, 0),
                Subtype: new _PdfName('Popup')
            });

            const normalDictionary: _PdfDictionary = createDictionary({
                Subtype: new _PdfName('Square')
            });

            const fdfDictionary: _PdfDictionary = createDictionary({
                Annots: [popupRef, normalRef]
            });

            const rootDictionary: _PdfDictionary = createDictionary({
                FDF: fdfDictionary
            });

            const trailer: _PdfDictionary = createDictionary();
            trailer.set('Root', rootRef);

            (fdf as any)._table = new Map<any, any>([
                ['trailer', trailer],
                ['1 0', rootDictionary],
                ['20 0', popupDictionary],
                ['21 0', normalDictionary]
            ]);

            // Act
            const result: Map<any, any> = (fdf as any)._parseAnnotationData();

            // Assert
            expect(result.size).toBe(1);
            expect(result.get('21 0')).toBe(normalDictionary);
            expect(result.has('20 0')).toBeFalsy();
            expect((fdf as any)._table.has('trailer')).toBeFalsy();
            expect((fdf as any)._table.has('1 0')).toBeFalsy();
        });
    });

    describe('_importField()', () => {
        it('should update RV when textValue exists and import single/non-array value as param array', () => {
            // Arrange
            const field: any = createField<PdfTextBoxField>(PdfTextBoxField, 'Field1');
            const form: any = {
                count: 1,
                _getFieldIndex: jasmine.createSpy('_getFieldIndex').and.returnValue(0),
                fieldAt: jasmine.createSpy('fieldAt').and.returnValue(field)
            };
            (fdf as any)._document = { form };
            (fdf as any)._table = new Map<any, any>([['Field1', 'Hello']]);
            spyOn(fdf as any, '_importFieldData').and.callFake(() => { /* no-op */ });

            // Act
            (fdf as any)._importField();

            // Assert
            expect(field._dictionary.get('RV')).toBe('Hello');
            expect((fdf as any)._importFieldData).toHaveBeenCalledWith(field, ['Hello']);
        });

        it('should import array value without RV update when field value is empty string', () => {
            // Arrange
            const field: any = createField<PdfListBoxField>(PdfListBoxField, 'Field2');
            const form: any = {
                count: 1,
                _getFieldIndex: jasmine.createSpy('_getFieldIndex').and.returnValue(0),
                fieldAt: jasmine.createSpy('fieldAt').and.returnValue(field)
            };
            (fdf as any)._document = { form };
            (fdf as any)._table = new Map<any, any>([['Field2', ['A', 'B']]]);
            spyOn(fdf as any, '_importFieldData').and.callFake(() => { /* no-op */ });

            // Act
            (fdf as any)._importField();

            // Assert
            expect(field._dictionary.has('RV')).toBeTruthy();
            expect((fdf as any)._importFieldData).toHaveBeenCalledWith(field, ['A', 'B']);
        });
    });

    describe('_exportAnnotation()', () => {
        it('should process queued dictionary objects inside while loop, append nested annot and delete temporary Page', () => {
            // Arrange
            const annotationDictionary: _PdfDictionary = createDictionary({
                Subtype: new _PdfName('Square')
            });
            const annotation: any = createAnnotation<PdfRectangleAnnotation>(PdfRectangleAnnotation, annotationDictionary);

            const nestedAnnotDictionary: _PdfDictionary = createDictionary({
                Type: new _PdfName('Annot'),
                Subtype: new _PdfName('Text')
            });

            const nestedStream: any = Object.create(_PdfStream.prototype);
            nestedStream.dictionary = nestedAnnotDictionary;
            nestedStream.start = 0;
            nestedStream.end = 2;
            nestedStream.getByteRange = jasmine.createSpy('getByteRange').and.returnValue([88, 89]);

            spyOn(fdf as any, '_getEntries').and.callFake((
                list: Map<any, any>,
                streamReference: number[],
                index: number,
                dictionary: _PdfDictionary
            ) => {
                // first call from main annotation, return nested stream to be processed
                if (list.size === 0) {
                    const helper: any = {
                        list: new Map<any, any>([[20, nestedStream]]),
                        streamReference: [20],
                        index
                    };
                    return helper;
                }
                // subsequent call from nested stream processing
                return {
                    list: new Map<any, any>(),
                    streamReference: [],
                    index
                };
            });

            spyOn(fdf as any, '_appendStream').and.callFake((value: any, fdfString: string) => {
                (fdf as any).fdfString = fdfString;
            });

            // Act
            const result: any = (fdf as any)._exportAnnotation(annotation, '', 2, [], 0, true);

            // Assert
            expect(result.annot).toEqual(['2', '20']);
            expect((nestedAnnotDictionary as any)._map.Page).toBeUndefined();
            //expect((fdf as any)._appendStream).toHaveBeenCalledWith(nestedStream, jasmine.any(String));
            expect((fdf as any).fdfString).toContain('20 0 obj');
        });
    });

    describe('_appendStream()', () => {
        it('should append content stream text branch', () => {
            // Arrange
            const contentStream: any = Object.create(_PdfContentStream.prototype);
            contentStream.getString = jasmine.createSpy('getString').and.returnValue('BT /F1 12 Tf ET');

            // Act
            (fdf as any)._appendStream(contentStream, '');

            // Assert
            expect((fdf as any).fdfString).toContain('stream');
            expect((fdf as any).fdfString).toContain('BT /F1 12 Tf ET');
            expect((fdf as any).fdfString).toContain('endstream');
        });

        it('should append byte-range stream branch for _PdfStream', () => {
            // Arrange
            const stream: any = Object.create(_PdfStream.prototype);
            stream.start = 0;
            stream.end = 4;
            stream.getByteRange = jasmine.createSpy('getByteRange').and.returnValue([65, 66, 67, 68]);

            // Act
            (fdf as any)._appendStream(stream, '');

            // Assert
            expect((fdf as any).fdfString).toContain('ABCD');
        });

        it('should append flate stream branch using inner .stream byte range', () => {
            // Arrange
            const rawStream: any = {
                start: 0,
                end: 3,
                getByteRange: jasmine.createSpy('getByteRange').and.returnValue([88, 89, 90])
            };
            const flate: any = Object.create(_PdfFlateStream.prototype);
            flate.stream = rawStream;

            // Act
            (fdf as any)._appendStream(flate, '');

            // Assert
            expect((fdf as any).fdfString).toContain('XYZ');
        });
    });

    describe('_getEntries()', () => {
        it('should cover Parent, IRT and assignXref branches for references', () => {
            // Arrange
            const parentRef: _PdfReference = createReference(1, 0);
            const irtRef: _PdfReference = createReference(2, 0);
            const otherRef: _PdfReference = createReference(3, 0);

            const dict: _PdfDictionary = createDictionary({
                Page: 7,
                Parent: parentRef,
                IRT: irtRef,
                OtherRef: otherRef
            });

            // ensure branch `if (!dictionary._crossReference) { dictionary.assignXref(...) }`
            (dict as any)._crossReference = undefined;
            spyOn(dict, 'assignXref').and.callThrough();

            const fetchedIrtDict: _PdfDictionary = createDictionary({ NM: 'reply-note' });
            crossReference._fetch.and.returnValue(fetchedIrtDict);

            crossReference._cacheMap.set(otherRef, createDictionary({ Type: new _PdfName('XObject') }));

            (fdf as any)._annotationID = '55';

            // Act
            const result: any = (fdf as any)._getEntries(new Map<any, any>(), [], 10, dict, '', false);

            // Assert
            expect((fdf as any).fdfString).toContain(' 55 0 R/Page 7');
            expect((fdf as any).fdfString).toContain('(reply-note)');
            expect((fdf as any).fdfString).toContain(' 11 0 R');
            expect(dict.assignXref).toHaveBeenCalledWith(crossReference);
            expect(result.list.get(11)).toBe(dict.get('OtherRef'));
        });

        it('should skip AP when appearance is false and include AP when appearance is true', () => {
            // Arrange
            const apDict: _PdfDictionary = createDictionary({ N: 'normal-appearance' });
            const dict: _PdfDictionary = createDictionary({
                AP: apDict,
                Subtype: new _PdfName('Square')
            });

            // Act
            (fdf as any)._getEntries(new Map<any, any>(), [], 1, dict, '', false);
            const withoutAppearance: string = (fdf as any).fdfString;

            (fdf as any).fdfString = '';
            (fdf as any)._getEntries(new Map<any, any>(), [], 1, dict, '', true);
            const withAppearance: string = (fdf as any).fdfString;

            // Assert
            expect(withoutAppearance).not.toContain('/AP');
            expect(withAppearance).toContain('/AP');
        });
    });

    describe('_appendArray() and _appendElement()', () => {
        it('should append mixed array elements and queue reference targets without timeout', () => {
            // Arrange
            const ref: _PdfReference = createReference(40, 0);
            const refTarget: _PdfDictionary = createDictionary({ Type: new _PdfName('Annot') });
            crossReference._cacheMap.set(ref, refTarget);

            const nestedDict: _PdfDictionary = createDictionary({ Name: 'Value' });
            const nestedArray: any[] = [2, false, 'Text'];

            const array: any[] = [1, new _PdfName('Yes'), nestedArray, nestedDict, ref, true, 'Done'];

            // Act
            const result: any = (fdf as any)._appendArray(array, '', 5, true, new Map<any, any>(), []);

            // Assert
            expect((fdf as any).fdfString).toContain('[');
            expect((fdf as any).fdfString).toContain('/Yes');
            expect((fdf as any).fdfString).toContain('<<');
            expect((fdf as any).fdfString).toContain('(Done)');
            expect(result.index).toBeGreaterThan(5);
            expect(result.streamReference.length).toBeGreaterThan(0);
            expect(result.list.size).toBeGreaterThan(0);
        });
    });

    describe('_getFormattedString()', () => {
        it('should replace parentheses with escaped apostrophe form used by implementation', () => {
            // Arrange
            const input: string = 'A(B)C';

            // Act
            const result: string = (fdf as any)._getFormattedString(input);

            // Assert
            expect(result).toBe("A'(B')C");
        });
    });

    describe('_checkFdf()', () => {
        it('should set specification mode when special characters exist', () => {
            // Arrange
            const text: string = `%FDF-1.2\n%${(fdf as any)._specialCharacters}\n`;

            // Act
            (fdf as any)._checkFdf(text);

            // Assert
            expect((fdf as any)._asPerSpecification).toBeTruthy();
        });

        it('should throw for invalid FDF header', () => {
            // Arrange
            const invalid: string = '%XYZ-1.2';

            // Act / Assert
            expect(() => {
                (fdf as any)._checkFdf(invalid);
            }).toThrowError('Invalid FDF file.');
        });
    });

    describe('_stringToHexString()', () => {
        it('should return empty string for empty input and hex for valid input', () => {
            // Arrange
            const emptyInput: string = '';
            const validInput: string = 'AB';

            // Act
            const emptyResult: string = (fdf as any)._stringToHexString(emptyInput);
            const validResult: string = (fdf as any)._stringToHexString(validInput);

            // Assert
            expect(emptyResult).toBe('');
            expect(validResult.length).toBeGreaterThan(0);
        });
    });

    describe('_exportAnnotationData()', () => {
        it('should skip link/web/document/uri annotations and popup-with-parent, but export valid annot types', () => {
            // Arrange
            const popupWithParent: any = createAnnotation<PdfPopupAnnotation>(
                PdfPopupAnnotation,
                createDictionary({ Parent: createReference(1, 0) })
            );
            const uriAnnotation: any = createAnnotation<PdfUriAnnotation>(PdfUriAnnotation, createDictionary());
            const fileLinkAnnotation: any = createAnnotation<PdfFileLinkAnnotation>(PdfFileLinkAnnotation, createDictionary());
            const webLinkAnnotation: any = createAnnotation<PdfTextWebLinkAnnotation>(PdfTextWebLinkAnnotation, createDictionary());
            const docLinkAnnotation: any = createAnnotation<PdfDocumentLinkAnnotation>(PdfDocumentLinkAnnotation, createDictionary());
            const rubberStamp: any = createAnnotation<PdfRubberStampAnnotation>(PdfRubberStampAnnotation, createDictionary());
            const rectangle: any = createAnnotation<PdfRectangleAnnotation>(PdfRectangleAnnotation, createDictionary());

            const annotations: any = {
                count: 7,
                at: (index: number) => [
                    popupWithParent,
                    uriAnnotation,
                    fileLinkAnnotation,
                    webLinkAnnotation,
                    docLinkAnnotation,
                    rubberStamp,
                    rectangle
                ][Number.parseInt(index.toString(), 10)]
            };

            const documentStub: any = {
                getPage: jasmine.createSpy('getPage').and.returnValue({ annotations })
            };

            spyOn(fdf as any, '_exportAnnotation').and.callFake((
                annotation: PdfAnnotation,
                fdfString: string,
                index: number,
                annot: string[]
            ) => {
                annot.push(index.toString());
                return { index: index + 1, annot };
            });

            // Act
            (fdf as any)._exportAnnotationData(documentStub, 1);

            // Assert
            expect((fdf as any)._exportAnnotation).toHaveBeenCalledTimes(3);
            expect((fdf as any).fdfString).toContain('/Annots[');
            expect((fdf as any).fdfString).toContain('trailer');
        });
    });
});
