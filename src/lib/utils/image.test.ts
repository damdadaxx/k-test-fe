import { describe, expect, it } from 'vitest';

import { base64ToBlob, blobToBase64 } from './image';

describe('base64ToBlob', () => {
  it('decodes a data URL into a Blob with the correct type and size', () => {
    const dataUrl = `data:image/png;base64,${btoa('hello')}`;

    const blob = base64ToBlob(dataUrl, 'image/png');

    expect(blob.type).toBe('image/png');
    expect(blob.size).toBe('hello'.length);
  });

  it('decodes a raw base64 string without a data URL prefix', () => {
    const raw = btoa('world');

    const blob = base64ToBlob(raw);

    expect(blob.type).toBe('image/jpeg');
    expect(blob.size).toBe('world'.length);
  });
});

describe('blobToBase64', () => {
  it('round-trips a Blob back into the same data URL base64 encodes', async () => {
    const original = 'round-trip';
    const blob = new Blob([original], { type: 'text/plain' });

    const result = await blobToBase64(blob);

    expect(result.startsWith('data:text/plain;base64,')).toBe(true);
    const decoded = atob(result.split(',')[1]);
    expect(decoded).toBe(original);
  });
});
