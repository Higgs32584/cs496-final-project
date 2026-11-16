import { combineDateTime, imageSrc, toDateInput, toTimeInput } from './util';

describe('imageSrc', () => {
    test('uses the content type of the image', () => {
        expect(imageSrc({ data: 'abc123', contentType: 'image/png' })).toBe('data:image/png;base64,abc123');
    });

    test('assumes jpeg for images saved without a content type', () => {
        expect(imageSrc({ data: 'abc123' })).toBe('data:image/jpeg;base64,abc123');
    });

    test('returns null when there is no image', () => {
        expect(imageSrc(undefined)).toBeNull();
        expect(imageSrc({})).toBeNull();
    });
});

describe('date and time inputs', () => {
    test('a date and time survive being put into the inputs and read back', () => {
        let original = new Date(2023, 1, 8, 9, 5); // February 8 2023, 9:05 am, local time
        let date = toDateInput(original);
        let time = toTimeInput(original);

        expect(date).toBe('2023-02-08');
        expect(time).toBe('09:05');
        expect(combineDateTime(date, time).getTime()).toBe(original.getTime());
    });

    test('accepts the date text that the server sends', () => {
        let original = new Date(2024, 11, 31, 23, 59);
        expect(toDateInput(original.toISOString())).toBe('2024-12-31');
        expect(toTimeInput(original.toISOString())).toBe('23:59');
    });

    test('gives an empty value for something that is not a date', () => {
        expect(toDateInput('not a date')).toBe('');
        expect(toTimeInput(undefined)).toBe('');
    });
});
