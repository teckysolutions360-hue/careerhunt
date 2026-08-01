import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveEmployerCompanyDetails, normalizeCompanyId, normalizeJobPayload } from '../controllers/jobController.js';
import Job from '../models/job.js';

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

test('returns null for malformed company ids', () => {
  assert.equal(normalizeCompanyId('not-a-valid-object-id'), null);
  assert.equal(normalizeCompanyId(''), null);
  assert.equal(normalizeCompanyId(undefined), null);
});

test('returns a valid company id unchanged', () => {
  const validId = '507f1f77bcf86cd799439011';
  assert.equal(normalizeCompanyId(validId), validId);
});

test('stores a per-job company name on the job schema', () => {
  assert.ok(Job.schema.paths.companyName);
});

test('stores market context on the job schema', () => {
  assert.ok(Job.schema.paths.marketContext);
});

test('preserves company website and company description on the normalized job payload', () => {
  const result = normalizeJobPayload(
    {
      title: 'Senior Software Engineer',
      companyName: 'Acme Studio',
      companyWebsite: 'https://acme.com',
      companyDescription: 'We build products for modern teams.'
    },
    { name: 'Alice Johnson' },
    { companyName: 'Acme Studio', companyWebsite: 'https://acme.com', companyDescription: 'We build products for modern teams.' }
  );

  assert.equal(result.companyName, 'Acme Studio');
  assert.equal(result.companyWebsite, 'https://acme.com');
  assert.equal(result.companyDescription, 'We build products for modern teams.');
});

test('preserves contact email and whatsapp number on the normalized job payload', () => {
  const result = normalizeJobPayload(
    {
      title: 'Senior Software Engineer',
      contactEmail: 'recruiter@example.com',
      whatsappNumber: '+971501234567'
    },
    { name: 'Alice Johnson' },
    { companyName: 'Acme Studio' }
  );

  assert.equal(result.contactEmail, 'recruiter@example.com');
  assert.equal(result.whatsappNumber, '+971501234567');
});
