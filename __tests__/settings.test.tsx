import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import es from '../messages/es.json';
import { LanguageToggle } from '@/components/settings/LanguageToggle';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock('next-intl/server', async () => {
  const messages = (await import('../messages/es.json')).default as any;
  return {
    getLocale: async () => 'es',
    getTranslations: async (ns: string) => (key: string) => messages[ns]?.[key] ?? key,
  };
});

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>
);

describe('LanguageToggle', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: async () => ({ ok: true }) } as Response)) as any;
  });

  it('renders both language options', () => {
    render(wrap(<LanguageToggle currentLocale="es" />));
    expect(screen.getByRole('button', { name: /Español/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /English/i })).toBeInTheDocument();
  });

  it('clicking English POSTs to /api/locale with locale=en', async () => {
    const user = userEvent.setup();
    render(wrap(<LanguageToggle currentLocale="es" />));
    await user.click(screen.getByRole('button', { name: /English/i }));
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/locale',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ locale: 'en' }),
      }),
    );
  });
});

describe('Settings page', () => {
  it('renders title, language section, and "more soon" placeholder', async () => {
    const SettingsPage = (await import('@/app/settings/page')).default;
    const ui = await SettingsPage();
    render(wrap(ui));
    expect(screen.getByRole('heading', { name: /Configuración/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Idioma/i)).toBeInTheDocument();
    expect(screen.getByText(/Más ajustes próximamente/i)).toBeInTheDocument();
  });
});
