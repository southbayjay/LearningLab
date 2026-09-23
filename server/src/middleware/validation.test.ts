import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { worksheetRequestSchema } from './validation.js';

const valid = { gradeLevel: '3rd Grade', topic: 'Volcanoes' };

describe('worksheetRequestSchema', () => {
  it('accepts every grade label the UI sends', () => {
    const labels = [
      'Kindergarten',
      ...[
        '1st',
        '2nd',
        '3rd',
        '4th',
        '5th',
        '6th',
        '7th',
        '8th',
        '9th',
        '10th',
        '11th',
        '12th',
      ].map(g => `${g} Grade`),
    ];
    for (const gradeLevel of labels) {
      assert.ok(worksheetRequestSchema.safeParse({ ...valid, gradeLevel }).success, gradeLevel);
    }
  });

  it('accepts bare grades and school bands', () => {
    for (const gradeLevel of ['K', '7', 'Elementary', 'Middle School', 'High School']) {
      assert.ok(worksheetRequestSchema.safeParse({ ...valid, gradeLevel }).success, gradeLevel);
    }
  });

  it('rejects unknown grade levels', () => {
    for (const gradeLevel of ['13th Grade', '99th', 'College', '']) {
      assert.equal(
        worksheetRequestSchema.safeParse({ ...valid, gradeLevel }).success,
        false,
        gradeLevel
      );
    }
  });

  it('enforces topic length bounds', () => {
    assert.equal(worksheetRequestSchema.safeParse({ ...valid, topic: 'ab' }).success, false);
    assert.equal(
      worksheetRequestSchema.safeParse({ ...valid, topic: 'a'.repeat(101) }).success,
      false
    );
    assert.ok(worksheetRequestSchema.safeParse({ ...valid, topic: 'The Water Cycle' }).success);
  });

  it('rejects inappropriate and spam-like topics', () => {
    for (const topic of ['weapons of the civil war', 'Gambling odds', 'aaaaaaaa']) {
      assert.equal(worksheetRequestSchema.safeParse({ ...valid, topic }).success, false, topic);
    }
  });

  it('accepts only known complexity values', () => {
    for (const complexity of ['easy', 'medium', 'hard']) {
      assert.ok(worksheetRequestSchema.safeParse({ ...valid, complexity }).success, complexity);
    }
    assert.equal(
      worksheetRequestSchema.safeParse({ ...valid, complexity: 'extreme' }).success,
      false
    );
    assert.ok(worksheetRequestSchema.safeParse(valid).success);
  });

  it('rejects unknown properties', () => {
    assert.equal(worksheetRequestSchema.safeParse({ ...valid, model: 'gpt-4o' }).success, false);
  });
});
