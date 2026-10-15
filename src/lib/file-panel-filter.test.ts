import { describe, expect, it } from 'vitest';
import { matchesFilePanel } from './file-panel-filter';

const file = { purpose: 'reference', offer_id: null, demand_id: null, item_id: null, spy_id: null, spy_offer_id: null, spy_section: 'ads' };
describe('creative attachment isolation', () => {
  it('shows the one attached reference, not unrelated files with no SPY source', () => {
    const files = [{ ...file, item_id: 'creative-1' }, { ...file, item_id: 'creative-2' }, { ...file, spy_offer_id: 'offer-2', spy_section: 'cover' }];
    expect(files.filter(f => matchesFilePanel(f, { item_id: 'creative-1', purpose: 'reference' }, null))).toEqual([files[0]]);
  });
  it('includes references only from an explicitly linked SPY ad', () => {
    expect(matchesFilePanel({ ...file, spy_id: 'source-1' }, { item_id: 'creative-1', purpose: 'reference' }, 'source-1')).toBe(true);
    expect(matchesFilePanel({ ...file, spy_id: 'source-2' }, { item_id: 'creative-1', purpose: 'reference' }, 'source-1')).toBe(false);
  });
  it('does not match unscoped files or inherit final files', () => {
    expect(matchesFilePanel(file, { purpose: 'reference' }, null)).toBe(false);
    expect(matchesFilePanel({ ...file, purpose: 'final', spy_id: 'source-1' }, { item_id: 'creative-1', purpose: 'final' }, 'source-1')).toBe(false);
  });
});