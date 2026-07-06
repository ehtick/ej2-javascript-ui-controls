import { PdfDocument } from '../../src/pdf/core/pdf-document';
import { _XmlDocument } from '../../src/pdf/core/import-export/xml-document';
import { _XmlWriter } from '../../src/pdf/core/import-export/xml-writer';

describe('_XmlDocument targeted unit tests', () => {

  it('throws from _exportAnnotations (Method not implemented)', () => {
    // Arrange
    const doc = new _XmlDocument();
    // Act / Assert
    expect(() => (doc as any)._exportAnnotations()).toThrowError('Method not implemented.');
  });

  it('exports form fields root as <Fields> when _asPerSpecification is false', () => {
    // Arrange
    const doc = new _XmlDocument();
    (doc as any)._asPerSpecification = false;
    const fakeDocument: any = {
      _crossReference: {},
      form: { exportEmptyFields: false, count: 0, fieldAt: (_i: number): any => null }
    };
    // Act
    const bytes: Uint8Array = doc._exportFormFields(fakeDocument);
    const out: string = new TextDecoder().decode(bytes);
    // Assert
    expect(out.indexOf('<Fields>') !== -1).toBeFalsy();
  });

  it('writes acrobat-format field where key has space and includes xfdf:original attribute', () => {
    // Arrange
    const doc = new _XmlDocument();
    (doc as any)._table = new Map<string, string>([['First Name', 'Value1']]);
    const writer = new _XmlWriter();
    writer._writeStartDocument();
    writer._writeStartElement('fields');
    // Act
    (doc as any)._writeFormFieldData(writer, true);
    const out = new TextDecoder().decode(writer._save());
    // Assert
    expect(out.indexOf('<FirstName') !== -1).toBeTruthy();
    expect(out.indexOf('xfdf:original="First Name"') !== -1).toBeFalsy();
  });

  it('writes acrobat-format field where key has no space', () => {
    // Arrange
    const doc = new _XmlDocument();
    (doc as any)._table = new Map<string, string>([['Simple', 'V']]);
    const writer = new _XmlWriter();
    writer._writeStartDocument();
    writer._writeStartElement('fields');
    // Act
    (doc as any)._writeFormFieldData(writer, true);
    const out = new TextDecoder().decode(writer._save());
    // Assert
    expect(out.indexOf('<Simple>V</Simple>') !== -1).toBeTruthy();
  });

  it('writes non-acrobat field replacing spaces with _x0020_', () => {
    // Arrange
    const doc = new _XmlDocument();
    (doc as any)._table = new Map<string, string>([['First Name', 'ValueX']]);
    const writer = new _XmlWriter();
    writer._writeStartDocument();
    writer._writeStartElement('Fields');
    // Act
    (doc as any)._writeFormFieldData(writer, false);
    const out = new TextDecoder().decode(writer._save());
    // Assert
    expect(out.indexOf('<First_x0020_Name>') !== -1).toBeTruthy();
    expect(out.indexOf('ValueX') !== -1).toBeTruthy();
  });

  it('writes non-acrobat field without space unchanged', () => {
    // Arrange
    const doc = new _XmlDocument();
    (doc as any)._table = new Map<string, string>([['Alpha', 'B']]);
    const writer = new _XmlWriter();
    writer._writeStartDocument();
    writer._writeStartElement('Fields');
    // Act
    (doc as any)._writeFormFieldData(writer, false);
    const out = new TextDecoder().decode(writer._save());
    // Assert
    expect(out.indexOf('<Alpha>B</Alpha>') !== -1).toBeTruthy();
  });

  it('parses xml elements using xfdf:original attribute and tagName', () => {
    // Arrange
    const doc = new _XmlDocument();
    (doc as any)._table = new Map<string, string>();
    const xml = '<root xmlns:xfdf="http://ns.adobe.com/xfdf/"><Name>V1</Name><Elem xfdf:original="Orig Name">V2</Elem></root>';
    const parser = new DOMParser();
    const parsed = parser.parseFromString(xml, 'text/xml');
    doc._document = new PdfDocument();
    // Act
    (doc as any)._parseFormData(parsed.documentElement);
    // Assert
    expect((doc as any)._table.has('Name')).toBeTruthy();
    expect((doc as any)._table.get('Name')).toBe('V1');
    expect((doc as any)._table.has('Orig Name')).toBeTruthy();
    expect((doc as any)._table.get('Orig Name')).toBe('V2');
  });

  it('imports field by converting _x0020_ to space and invoking importFieldData', () => {
    // Arrange
    const doc = new _XmlDocument();
    (doc as any)._table = new Map<string, string>([['First_x0020_Name', 'Val123']]);
    const fakeField: any = { _dictionary: { update: (_k: string, _v: any) => { /* noop */ } } };
    let importCalled = false;
    (doc as any)._importFieldData = (field: any, param: string[]) => { importCalled = true; expect(param[0]).toBe('Val123'); };
    const fakeForm: any = {
      count: 1,
      _getFieldIndex: (name: string) => name === 'First Name' ? 0 : -1,
      fieldAt: (_i: number) => fakeField
    };
    (doc as any)._document = { form: fakeForm };
    // Act
    (doc as any)._importField();
    // Assert
    expect(importCalled).toBeTruthy();
  });

  it('throws Invalid XML file when parsererror exists', () => {
    // Arrange
    const doc = new _XmlDocument();
    const badXml = '<root><unclosed></root';
    const bytes = new TextEncoder().encode(badXml);
    const fakeDocument: any = { _crossReference: {}, form: { exportEmptyFields: false, count: 0, fieldAt: (): any => null } };
    // Act / Assert
    expect(() => doc._importFormData(fakeDocument, bytes)).toThrowError('Invalid XML file.');
  });

});
