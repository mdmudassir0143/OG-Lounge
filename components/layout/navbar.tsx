import Link from "next/link";
import { EthereumChainDropdown } from "@/components/wallet/chain-dropdown";
import { MobileNav } from "@/components/layout/mobile-nav";
import BalanceBadge from "../wallet/balance";
import { EthereumConnectButton } from "../wallet/connect-button";
// Navigation items

export function Navbar({
  navItems,
}: {
  navItems: { title: string; href: string }[];
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6 md:px-8 lg:px-12">
      <div className="flex h-16 items-center justify-between">
        {/* Logo - Left */}
        <div className="flex items-center">
          <Link className="items-center space-x-2 md:flex" href="/">
            <span className="inline-block font-bold font-mono">Game Hub</span>
          </Link>
        </div>

        {/* Desktop navigation - Center */}
        <nav className="hidden justify-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              className="flex items-center font-medium text-lg transition-colors hover:text-foreground/80 sm:text-sm"
              href={item.href}
              key={item.href}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Theme toggle and mobile nav - Right */}
        <div className="flex items-center justify-end gap-2">
          {/* Desktop wallet controls */}
          <div className="hidden items-center gap-2 md:flex">
            <EthereumChainDropdown />
            <BalanceBadge />
            <EthereumConnectButton />
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden">
            <MobileNav navItems={navItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
