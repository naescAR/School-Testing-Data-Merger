const test = require('node:test');
const assert = require('node:assert');
const { mergeData, OUTPUT_HEADERS } = require('./script.js');

test('CSV Injection Prevention', async (t) => {
    // Helper to extract value from result
    const getVal = (result, header, studentId) => {
        const headerRow = result[0];
        const colIndex = headerRow.indexOf(header);
        const row = result.find(r => r && r.includes(studentId));
        return row ? row[colIndex] : undefined;
    };

    const targetHeader = 'ATLAS Grade 3 ELA Interim ELA Scale Score-FALL';
    const inputHeader = 'ATLAS Grade 3 ELA Interim ELA Scale Score';

    await t.test('Sanitizes values starting with =', () => {
        const val = '=cmd|...';
        const sources = [{
            data: [['Student ID', inputHeader], ['1', val]],
            subject: 'ela', season: 'fall'
        }];
        const result = mergeData(sources, 'new', null);
        assert.strictEqual(getVal(result, targetHeader, '1'), "'" + val);
    });

    await t.test('Sanitizes values starting with +', () => {
        const val = '+cmd|...';
        const sources = [{
            data: [['Student ID', inputHeader], ['2', val]],
            subject: 'ela', season: 'fall'
        }];
        const result = mergeData(sources, 'new', null);
        assert.strictEqual(getVal(result, targetHeader, '2'), "'" + val);
    });

    await t.test('Sanitizes values starting with -', () => {
        const val = '-cmd|...';
        const sources = [{
            data: [['Student ID', inputHeader], ['3', val]],
            subject: 'ela', season: 'fall'
        }];
        const result = mergeData(sources, 'new', null);
        assert.strictEqual(getVal(result, targetHeader, '3'), "'" + val);
    });

    await t.test('Sanitizes values starting with @', () => {
        const val = '@cmd|...';
        const sources = [{
            data: [['Student ID', inputHeader], ['4', val]],
            subject: 'ela', season: 'fall'
        }];
        const result = mergeData(sources, 'new', null);
        assert.strictEqual(getVal(result, targetHeader, '4'), "'" + val);
    });

    await t.test('Does not sanitize safe values', () => {
        const val = 'Safe Value';
        const sources = [{
            data: [['Student ID', inputHeader], ['5', val]],
            subject: 'ela', season: 'fall'
        }];
        const result = mergeData(sources, 'new', null);
        assert.strictEqual(getVal(result, targetHeader, '5'), val);
    });

    await t.test('Does not sanitize numbers', () => {
        const val = 123;
        const sources = [{
            data: [['Student ID', inputHeader], ['6', val]],
            subject: 'ela', season: 'fall'
        }];
        const result = mergeData(sources, 'new', null);
        assert.strictEqual(getVal(result, targetHeader, '6'), val);
    });

    await t.test('Sanitizes existing data too', () => {
        const val = '=existing_malicious';
        // Mock existing data: Header row + Data row
        // Note: OUTPUT_HEADERS contains 'Student ID'
        const existingData = [
            ['Student ID', targetHeader],
            ['7', val]
        ];

        const result = mergeData([], 'existing', existingData);
        assert.strictEqual(getVal(result, targetHeader, '7'), "'" + val);
    });
});
