import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import { CommandPaletteProvider } from '@/components/search/CommandPaletteProvider';
import { CommandPalette } from '@/components/search/CommandPalette';

vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return { ...actual, useLocale: () => 'en' };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <CommandPaletteProvider>
        {children}
        <CommandPalette />
      </CommandPaletteProvider>
    </NextIntlClientProvider>
  );
}

describe('CommandPalette', () => {
  it('is not visible by default', () => {
    render(<Wrapper><div /></Wrapper>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens when ⌘K is pressed', async () => {
    render(<Wrapper><div /></Wrapper>);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the search input when open', async () => {
    render(<Wrapper><div /></Wrapper>);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('shows results matching a query', async () => {
    render(<Wrapper><div /></Wrapper>);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'Comfrut');
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
  });

  it('closes on Escape', async () => {
    render(<Wrapper><div /></Wrapper>);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
