import { PdfListItem, PdfListItemCollection } from "../src/pdf/core/list/pdf-list-item";

describe('PdflistItem and PdfListCollection behvaiour check', () => {
    it('Constructor error check', () => {
        try {
            const listItem = new PdfListItem(null);
            fail('Failed to toThrowError in the constructor');
        } catch (error) {
            expect(error.message).toEqual('Text cannot be null or undenfied.');
        }
    });
    it('at method error check', () => {
        try {
            const listItem = new PdfListItemCollection([]);
            listItem.at(null);
            fail('Failed to toThrowError in the at method');
        } catch (error) {
            expect(error.message).toEqual('index should not be null');
        }
    });
    it('removeAt method error check', () => {
        try {
            const listItem = new PdfListItemCollection([]);
            listItem.removeAt(-1);
            fail('Failed to toThrowError in the removeAt method');
        } catch (error) {
            expect(error.message).toEqual('The index should be less than items count or equal to 0');
        }
    });
    it('indexOf  method behvaiour check', () => {
        const listItem = new PdfListItemCollection([]);
        const item = new PdfListItem('text');
        listItem._listItems = [item];
        const result = listItem.indexOf(item);
        expect(result).toEqual(0);
    });
});