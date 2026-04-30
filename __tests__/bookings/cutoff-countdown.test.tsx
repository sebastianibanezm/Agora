import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CutoffCountdown } from '@/components/bookings/CutoffCountdown';
import { getTodayDemo } from '@/lib/mock-data/today';
import en from '@/messages/en.json';

function renderAt(cutoff: string) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <CutoffCountdown cutoffIso={cutoff} />
    </NextIntlClientProvider>,
  );
}

describe('CutoffCountdown', () => {
  const today = getTodayDemo().getTime();

  it('renders red when cut-off is within 6 hours', () => {
    const cutoff = new Date(today + 4 * 3_600_000).toISOString();
    const { getByTestId } = renderAt(cutoff);
    expect(getByTestId('cutoff-countdown').dataset.state).toBe('crit');
  });

  it('renders amber when cut-off is within 24 hours', () => {
    const cutoff = new Date(today + 18 * 3_600_000).toISOString();
    const { getByTestId } = renderAt(cutoff);
    expect(getByTestId('cutoff-countdown').dataset.state).toBe('warn');
  });

  it('renders ok when cut-off is more than 24 hours away', () => {
    const cutoff = new Date(today + 72 * 3_600_000).toISOString();
    const { getByTestId } = renderAt(cutoff);
    expect(getByTestId('cutoff-countdown').dataset.state).toBe('ok');
  });

  it('renders passed when cut-off is in the past', () => {
    const cutoff = new Date(today - 4 * 3_600_000).toISOString();
    const { getByTestId } = renderAt(cutoff);
    expect(getByTestId('cutoff-countdown').dataset.state).toBe('passed');
  });
});
