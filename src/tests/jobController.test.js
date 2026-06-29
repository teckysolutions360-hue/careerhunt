import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEmployerCompanyDetails } from '../controllers/jobController.js';

test('uses the authenticated employer name when no company name is provided', () => {
  const result = resolveEmployerCompanyDetails({ name: 'Alice Johnson', email: 'alice@example.com' }, {});

  assert.equal(result.companyName, 'Alice Johnson');
  assert.equal(result.companyDescription, 'Company profile for Alice Johnson');
});

test('prefers an explicit company name when one is supplied', () => {
  const result = resolveEmployerCompanyDetails(
    { name: 'Alice Johnson', email: 'alice@example.com' },
    { companyName: 'Acme Studio' },
  );

  assert.equal(result.companyName, 'Acme Studio');
});
