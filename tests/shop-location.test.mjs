import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shopLocation } from '../apps/web/lib/shop-location.js';

test('map embed, app link and directions use the same exact pin, including zero coordinates', () => {
  for (const mapLocation of [
    { latitude: 10.9413544, longitude: 106.9609977 },
    { latitude: 0, longitude: 0 },
  ]) {
    const location = shopLocation({ mapLocation, address: 'Ignored when coordinates exist' });
    const pin = `${mapLocation.latitude},${mapLocation.longitude}`;
    assert.equal(new URL(location.embedUrl).searchParams.get('q'), pin);
    assert.equal(new URL(location.openUrl).searchParams.get('query'), pin);
    assert.equal(new URL(location.directionsUrl).searchParams.get('destination'), pin);
    assert.equal(new URL(location.openUrl).searchParams.get('api'), '1');
  }
});
test('missing location uses the configured address or shared link, never a fake pin', () => {
  assert.equal(
    new URL(shopLocation({ address: 'Địa chỉ KIHA' }).embedUrl).searchParams.get('q'),
    'Địa chỉ KIHA',
  );
  const shared = 'https://maps.app.goo.gl/7b3bgs5L2yuCSvKK7';
  assert.deepEqual(shopLocation({ mapsUrl: shared }), {
    embedUrl: '',
    openUrl: shared,
    directionsUrl: shared,
  });
  assert.deepEqual(shopLocation({}), { embedUrl: '', openUrl: '', directionsUrl: '' });
});
