import {
    _validateDateTimeComponent,
    _isGeneralCharacter,
    _isGraphicCharacter,
    _isPrintableCharacter,
    _validateDate,
    _validateTime,
    _validateDateTime,
    isNumericString
} from '../src/pdf/core/security/digital-signature/asn1/syntax-verifier';

describe('syntax-verifier tests', () => {

    it('validateDateTimeComponent: accepts integer in range and rejects bad values', () => {
        const validateDay = _validateDateTimeComponent('day', 1, 31);

        // valid case: should not throw
        expect(() => validateDay('testData', 15)).not.toThrow();

        // non-integer -> throws with Non-integral message
        expect(() => validateDay('myType', 3.14)).toThrowError('Non-integral day supplied to myType.');

        // below min -> throws
        expect(() => validateDay('myType', 0)).toThrowError('Encountered day less than 1 in myType.');

        // above max -> throws
        expect(() => validateDay('myType', 32)).toThrowError('Encountered day greater than 31 in myType.');
    });

    it('character classification helpers return correct booleans', () => {
        // _isGeneralCharacter: true for 0x7F, false for 0x80
        expect(_isGeneralCharacter(0x7F)).toBeTruthy();
        expect(_isGeneralCharacter(0x80)).toBeFalsy();

        // _isGraphicCharacter: true for 0x20 and 0x7E, false for 0x1F
        expect(_isGraphicCharacter(0x20)).toBeTruthy();
        expect(_isGraphicCharacter(0x7E)).toBeTruthy();
        expect(_isGraphicCharacter(0x1F)).toBeFalsy();

        // _isPrintableCharacter: allowed values
        expect(_isPrintableCharacter(0x27)).toBeTruthy(); // ')
        expect(_isPrintableCharacter(0x41)).toBeTruthy(); // A
        expect(_isPrintableCharacter(0x61)).toBeTruthy(); // a
        expect(_isPrintableCharacter(0x20)).toBeTruthy(); // space

        // excluded '*' (0x2A)
        expect(_isPrintableCharacter(0x2A)).toBeFalsy();

        // a non-printable within nearby range
        expect(_isPrintableCharacter(0x26)).toBeFalsy();
    });

    it('validateDate: valid and invalid date edge cases', () => {
        // valid 31-day month
        expect(() => _validateDate('dt', 2021, 0, 31)).not.toThrow(); // Jan 31

        // 31 in 30-day month -> throws
        expect(() => _validateDate('dt', 2021, 3, 31)).toThrowError('Day > 31 encountered in dt with 30-day month.');

        // Feb leap year: 2000 is leap -> 29 allowed, 30 not
        expect(() => _validateDate('dt', 2000, 1, 29)).not.toThrow();
        expect(() => _validateDate('dt', 2000, 1, 30)).toThrowError('Day > 29 encountered in dt with month of February in leap year.');

        // Feb non-leap: 29 throws
        expect(() => _validateDate('dt', 2001, 1, 29)).toThrowError('Day > 28 encountered in dt with month of February and non leap year.');

        // invalid month (outside 0-11)
        expect(() => _validateDate('dt', 2021, 12, 1)).toThrowError('Invalid month in dt');

        // non-integer year/month/date and date < 1 cases
        expect(() => _validateDate('dt', 2021.5, 0, 1)).toThrowError('Invalid year in dt');
        expect(() => _validateDate('dt', 2021, 0.9, 1)).toThrowError('Invalid month in dt');
        expect(() => _validateDate('dt', 2021, 0, 0)).toThrowError('Invalid day in dt');
    });

    it('validateDate: day > 31 in 31-day month throws', () => {
        // Arrange
        const dataType = 'dt';
        const year = 2021;
        const month = 11; // December (31-day month)
        const invalidDay = 32; // > 31 to trigger branch

        // Act & Assert
        expect(() => _validateDate(dataType, year, month, invalidDay)).toThrowError(
            'Day > 31 encountered in dt with 31-day month.'
        );
    });

    it('validateDate: valid 30-day month does not throw', () => {
        // November (month 10) has 30 days
        expect(() => _validateDate('dt', 2021, 10, 30)).not.toThrow();
    });

    it('validateTime: valid and invalid time edge cases', () => {
        // valid minimal time
        expect(() => _validateTime('t', 0, 0, 0)).not.toThrow();

        // hours > 23
        expect(() => _validateTime('t', 24, 0, 0)).toThrowError('Hours > 23 encountered in t.');

        // minutes > 59
        expect(() => _validateTime('t', 0, 60, 0)).toThrowError('Minutes > 60 encountered in t.');

        // seconds > 59
        expect(() => _validateTime('t', 0, 0, 60)).toThrowError('Seconds > 60 encountered in t.');

        // non-integer hours/minutes/seconds and negative seconds
        expect(() => _validateTime('t', 1.1, 0, 0)).toThrowError('Invalid hours in t');
        expect(() => _validateTime('t', 0, 2.5, 0)).toThrowError('Invalid minutes in t');
        expect(() => _validateTime('t', 0, 0, -1)).toThrowError('Invalid seconds in t');
        expect(() => _validateTime('t', 0, 0, 1.2)).toThrowError('Invalid seconds in t');
    });

    it('validateDateTime: composes date and time validators', () => {
        // valid composite
        expect(() => _validateDateTime('dt', 2020, 0, 1, 12, 30, 30)).not.toThrow();

        // invalid date should cause overall throw
        expect(() => _validateDateTime('dt', 2021, 12, 1, 12, 30, 30)).toThrowError('Invalid month in dt');

        // invalid time should cause overall throw
        expect(() => _validateDateTime('dt', 2020, 0, 1, 24, 0, 0)).toThrowError('Hours > 23 encountered in dt.');
    });

    it('isNumericString returns true for digits and space, false otherwise', () => {
        expect(isNumericString(0x30)).toBeTruthy(); // '0'
        expect(isNumericString(0x39)).toBeTruthy(); // '9'
        expect(isNumericString(0x20)).toBeTruthy(); // space
        expect(isNumericString(0x2F)).toBeFalsy(); // '/'
    });

});
