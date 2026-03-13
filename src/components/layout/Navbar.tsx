
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, Wrench, Settings, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Logs', href: '/operations', icon: ClipboardList },
    { name: 'Loans', href: '/loans', icon: Wallet },
    { name: 'Service', href: '/service', icon: Wrench },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around md:justify-start md:gap-8 py-3">
          <div className="hidden md:flex items-center font-headline font-bold text-primary text-xl mr-8">
            TRACTOR PRO
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-1 rounded-md transition-colors",
                pathname === item.href 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-6 h-6 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
