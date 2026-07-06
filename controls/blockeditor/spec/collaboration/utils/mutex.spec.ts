/* eslint-disable @typescript-eslint/no-explicit-any */

import { createMutex, throttle } from '../../../src/collaboration/y-blockeditor/utils/mutex';

describe('Mutex Utilities', () => {
    describe('createMutex', () => {
        it('should execute callback when not locked', () => {
            const mux = createMutex();
            const callback = jasmine.createSpy('callback').and.returnValue(42);
            
            const result = mux(callback);
            
            expect(callback).toHaveBeenCalled();
            expect(result).toBe(42);
        });

        it('should skip callback on re-entrant call', () => {
            const mux = createMutex();
            let innerExecuted = false;
            
            const result = mux(() => {
                mux(() => {
                    innerExecuted = true;
                });
                return 'outer';
            });
            
            expect(result).toBe('outer');
            expect(innerExecuted).toBe(false);
        });

        it('should release lock after callback completes', () => {
            const mux = createMutex();
            const callback1 = jasmine.createSpy('callback1');
            const callback2 = jasmine.createSpy('callback2');
            
            mux(callback1);
            mux(callback2);
            
            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should handle exceptions in callback without leaving lock held', () => {
            const mux = createMutex();
            const faultyCallback = () => { throw new Error('Test error'); };
            const normalCallback = jasmine.createSpy('normalCallback');
            
            expect(() => mux(faultyCallback)).toThrow();
            
            mux(normalCallback);
            expect(normalCallback).toHaveBeenCalled();
        });

        it('should return undefined when callback is skipped', () => {
            const mux = createMutex();
            let innerResult: any;
            
            mux(() => {
                innerResult = mux(() => 'should not execute');
            });
            
            expect(innerResult).toBeUndefined();
        });
    });

    describe('throttle', () => {
        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it('should call function immediately on first call', () => {
            const callback = jasmine.createSpy('callback');
            const throttled = throttle(callback, 100);
            
            throttled('first');
            
            expect(callback).toHaveBeenCalledWith('first');
        });

        it('should suppress intermediate calls within limit window', () => {
            const callback = jasmine.createSpy('callback');
            const throttled = throttle(callback, 100);
            
            throttled('first');
            throttled('second');
            throttled('third');
            
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('first');
        });

        it('should fire trailing call with latest args after window', () => {
            const callback = jasmine.createSpy('callback');
            const throttled = throttle(callback, 100);
            
            throttled('first');
            throttled('second');
            throttled('third');
            
            jasmine.clock().tick(100);
            
            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith('third');
        });

        it('should allow call after limit period expires', () => {
            const callback = jasmine.createSpy('callback');
            const throttled = throttle(callback, 100);
            
            throttled('first');
            jasmine.clock().tick(100);
            
            throttled('second');
            
            expect(callback).toHaveBeenCalledTimes(2);
            expect(callback).toHaveBeenCalledWith('first');
            expect(callback).toHaveBeenCalledWith('second');
        });

        it('should handle no calls during throttle period', () => {
            const callback = jasmine.createSpy('callback');
            const throttled = throttle(callback, 100);
            
            throttled('first');
            jasmine.clock().tick(150);
            
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
});
