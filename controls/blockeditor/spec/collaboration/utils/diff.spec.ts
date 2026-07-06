/* eslint-disable @typescript-eslint/no-explicit-any */

import { simpleDiff } from '../../../src/collaboration/y-blockeditor/utils/diff';

describe('simpleDiff Utility', () => {
    it('should return no change for identical strings', () => {
        const result = simpleDiff('hello', 'hello');
        
        expect(result.index).toBe(5);
        expect(result.remove).toBe(0);
        expect(result.insert).toBe('');
    });

    it('should return correct diff when only an insertion is made in the middle', () => {
        const result = simpleDiff('hello', 'hel123lo');
        
        expect(result.index).toBe(3);
        expect(result.remove).toBe(0);
        expect(result.insert).toBe('123');
    });

    it('should return correct diff when only a deletion is made', () => {
        const result = simpleDiff('hello world', 'hello');
        
        expect(result.index).toBe(5);
        expect(result.remove).toBe(6);
        expect(result.insert).toBe('');
    });

    it('should return correct diff for a replacement (different characters at same index)', () => {
        const result = simpleDiff('hello', 'hallo');
        
        expect(result.index).toBe(1);
        expect(result.remove).toBe(1);
        expect(result.insert).toBe('a');
    });

    it('should handle insertion into empty string', () => {
        const result = simpleDiff('', 'hello');
        
        expect(result.index).toBe(0);
        expect(result.remove).toBe(0);
        expect(result.insert).toBe('hello');
    });

    it('should handle deletion of full string', () => {
        const result = simpleDiff('hello', '');
        
        expect(result.index).toBe(0);
        expect(result.remove).toBe(5);
        expect(result.insert).toBe('');
    });

    it('should handle insertion at the beginning', () => {
        const result = simpleDiff('world', 'hello world');
        
        expect(result.index).toBe(0);
        expect(result.remove).toBe(0);
        expect(result.insert).toBe('hello ');
    });

    it('should handle insertion at the end', () => {
        const result = simpleDiff('hello', 'hello world');
        
        expect(result.index).toBe(5);
        expect(result.remove).toBe(0);
        expect(result.insert).toBe(' world');
    });

    it('should handle deletion from the beginning', () => {
        const result = simpleDiff('hello world', 'world');
        
        expect(result.index).toBe(0);
        expect(result.remove).toBe(6);
        expect(result.insert).toBe('');
    });

    it('should handle deletion from the end', () => {
        const result = simpleDiff('hello world', 'hello');
        
        expect(result.index).toBe(5);
        expect(result.remove).toBe(6);
        expect(result.insert).toBe('');
    });

    it('should handle complex replacement in the middle', () => {
        const result = simpleDiff('hello world', 'hello beautiful world');
        
        expect(result.index).toBe(6);
        expect(result.remove).toBe(0);
        expect(result.insert).toBe('beautiful ');
    });

    it('should handle single character insertion', () => {
        const result = simpleDiff('helo', 'hello');
        
        expect(result.index).toBe(3);
        expect(result.remove).toBe(0);
        expect(result.insert).toBe('l');
    });

    it('should handle single character deletion', () => {
        const result = simpleDiff('hello', 'helo');
        
        expect(result.index).toBe(3);
        expect(result.remove).toBe(1);
        expect(result.insert).toBe('');
    });

    it('should handle both strings being empty', () => {
        const result = simpleDiff('', '');
        
        expect(result.index).toBe(0);
        expect(result.remove).toBe(0);
        expect(result.insert).toBe('');
    });

    it('should optimize by finding common prefix', () => {
        const result = simpleDiff('prefix_old_suffix', 'prefix_new_suffix');
        
        expect(result.index).toBe(7); // After 'prefix_'
        expect(result.remove).toBe(3); // 'old'
        expect(result.insert).toBe('new');
    });

    it('should optimize by finding common suffix', () => {
        const result = simpleDiff('old_suffix', 'new_suffix');
        
        expect(result.index).toBe(0);
        expect(result.remove).toBe(3); // 'old'
        expect(result.insert).toBe('new');
    });
});
