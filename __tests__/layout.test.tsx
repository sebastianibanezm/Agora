import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import es from '../messages/es.json';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

// Mock next/navigation for Sidebar (usePathname)
import { vi } from 'vitest';
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}));

const wrap = (ui: React.ReactNode) => (
  <NextIntlClientProvider locale="es" messages={es as any}>{ui}</NextIntlClientProvider>
);

describe('Sidebar', () => {
  it('renders 7 primary nav links + disabled Approval Queue', () => {
    render(wrap(<Sidebar />));
    expect(screen.getByRole('link', { name: /Operaciones/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Contenedores/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Órdenes de Compra/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Importadores/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Productores/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cumplimiento/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Rendimiento/i })).toBeInTheDocument();
    const approvalEl = screen.getByTitle(/Disponible en V3/i);
    expect(approvalEl).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('Header', () => {
  it('opens dropdown containing Settings link on avatar click', async () => {
    const user = userEvent.setup();
    render(wrap(<Header />));
    const trigger = screen.getByRole('button', { name: /Menú de usuario/i });
    await user.click(trigger);
    const settingsItem = await screen.findByRole('menuitem', { name: /Configuración/i });
    expect(settingsItem).toBeInTheDocument();
  });

  it('renders breadcrumb with Operations text', () => {
    render(wrap(<Header />));
    expect(screen.getByText('Operaciones')).toBeInTheDocument();
  });

  it('renders search icon button', () => {
    render(wrap(<Header />));
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
  });

  it('renders notification bell button', () => {
    render(wrap(<Header />));
    expect(screen.getByRole('button', { name: /notificaciones/i })).toBeInTheDocument();
  });
});
