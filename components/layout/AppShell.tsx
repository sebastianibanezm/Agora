import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="ml-14 mt-14 min-h-screen p-6 relative z-10">
        {children}
      </main>
    </>
  );
}
