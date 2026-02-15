const test = require('node:test');
const assert = require('node:assert');
const { stripSeason } = require('./script.js');

test('stripSeason - basic cases', (t) => {
    assert.strictEqual(stripSeason('Scale Score-FALL'), 'Scale Score');
    assert.strictEqual(stripSeason('Scale Score-Winter'), 'Scale Score');
    assert.strictEqual(stripSeason('Performance-fall'), 'Performance');
    assert.strictEqual(stripSeason('Performance-WINTER'), 'Performance');
});

test('stripSeason - casing', (t) => {
    assert.strictEqual(stripSeason('Header FALL'), 'Header');
    assert.strictEqual(stripSeason('Header Fall'), 'Header');
    assert.strictEqual(stripSeason('Header fall'), 'Header');
    assert.strictEqual(stripSeason('Header WINTER'), 'Header');
    assert.strictEqual(stripSeason('Header Winter'), 'Header');
    assert.strictEqual(stripSeason('Header winter'), 'Header');
});

test('stripSeason - whitespace and separators', (t) => {
    assert.strictEqual(stripSeason('Header  FALL'), 'Header');
    assert.strictEqual(stripSeason('Header-FALL'), 'Header');
    assert.strictEqual(stripSeason('Header - FALL'), 'Header');
    assert.strictEqual(stripSeason('Header--FALL'), 'Header');
    assert.strictEqual(stripSeason('Header- WINTER'), 'Header');
});

test('stripSeason - no separator', (t) => {
    assert.strictEqual(stripSeason('HeaderFALL'), 'Header');
    assert.strictEqual(stripSeason('Headerwinter'), 'Header');
});

test('stripSeason - edge cases', (t) => {
    // Season in the middle should not be stripped
    assert.strictEqual(stripSeason('FALL Score Header'), 'FALL Score Header');
    assert.strictEqual(stripSeason('Winter Performance Score'), 'Winter Performance Score');

    // Words ending with season name but not being the season name
    assert.strictEqual(stripSeason('FALLing'), 'FALLing');
    assert.strictEqual(stripSeason('Snowfall'), 'Snow'); // Wait, 'Snowfall' ends with 'fall'. Let's see if this is desired.
    // The regex is /[\s\-]*(FALL|...)$/i.
    // If it's 'Snowfall', it matches 'fall' at the end. [\s\-]* matches empty.
    // So 'Snowfall' becomes 'Snow'.

    assert.strictEqual(stripSeason('No Season'), 'No Season');
});

test('stripSeason - multiple seasons', (t) => {
    // Only the last one should be stripped if it matches the pattern
    assert.strictEqual(stripSeason('FALL WINTER'), 'FALL');
});

test('stripSeason - empty or null-like input', (t) => {
    assert.throws(() => stripSeason(null), TypeError);
    assert.strictEqual(stripSeason(''), '');
});
