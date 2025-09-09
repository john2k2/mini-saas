"use client";
import Link from "next/link";
import Container from "@/app/components/container";
import Button from "@/app/components/ui/button";
import Spinner from "@/app/components/ui/spinner";
import NotificationDropdown from "@/app/components/notification-dropdown";
import { signOut, useSession } from "next-auth/react";
import { useSubscription } from "@/app/hooks/useSubscription";
import { useAnalytics } from "@/app/hooks/useAnalytics";
import { useState, useCallback, memo } from "react";

export default function Navbar() {
	const { data: session, status } = useSession();
	const { subscription } = useSubscription();
	const { trackActivity } = useAnalytics();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handlePremiumClick = () => {
		trackActivity('premium_navigation_click');
	};

	const handleDashboardClick = () => {
		trackActivity('dashboard_navigation_click');
	};

	const handleAccountClick = () => {
		trackActivity('account_navigation_click');
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<nav className="sticky top-0 z-50 backdrop-blur-md bg-[color:var(--background)]/90 border-b border-[color:var(--border)]">
			<Container className="h-16 flex items-center justify-between">
				<Link href="/" className="font-bold text-xl text-[color:var(--foreground)]" aria-label="Inicio Mini‑SaaS">
					mini‑saas
				</Link>
				
				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center gap-8">
					<Link href="/pricing" className="text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors font-medium">
						Precios
					</Link>
					{session && (
						<>
							<Link href="/dashboard" className="text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors font-medium" onClick={handleDashboardClick}>
								Dashboard
							</Link>
							<Link href="/account" className="text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors font-medium" onClick={handleAccountClick}>
								Cuenta
							</Link>
							{subscription?.isActive && (
								<Link href="/premium" className="text-[color:var(--accent)] hover:text-[color:var(--accent)]/80 font-semibold transition-colors" onClick={handlePremiumClick}>
									Premium ✨
								</Link>
							)}
						</>
					)}
				</div>

				{/* Desktop Auth Section */}
				<div className="hidden md:flex items-center gap-4">
					{status === "loading" ? (
						<Spinner size="sm" />
					) : session ? (
						<>
							<NotificationDropdown />
							<span className="text-[color:var(--muted)] text-sm font-medium">{session.user?.name ?? session.user?.email}</span>
							<Button onClick={() => signOut()} variant="outline" className="border-[color:var(--border)]">
								Cerrar sesión
							</Button>
						</>
					) : (
						<Button href="/login" className="bg-[color:var(--accent)] text-black hover:opacity-90">
							Iniciar sesión
						</Button>
					)}
				</div>

				{/* Mobile Menu Button */}
				<button
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className="md:hidden p-2 text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors"
					aria-label="Menú"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{isMobileMenuOpen ? (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>
			</Container>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-t border-[color:var(--border)] bg-[color:var(--background)]/95 backdrop-blur-md">
					<Container className="py-6 space-y-4">
						<Link 
							href="/pricing" 
							className="block text-[color:var(--foreground)] hover:text-[color:var(--accent)] transition-colors py-3 text-lg font-medium"
							onClick={closeMobileMenu}
						>
							Precios
						</Link>
						
						{session && (
							<>
								<Link 
									href="/dashboard" 
									className="block text-[color:var(--foreground)] hover:text-[color:var(--accent)] transition-colors py-3 text-lg font-medium"
									onClick={() => { handleDashboardClick(); closeMobileMenu(); }}
								>
									Dashboard
								</Link>
								<Link 
									href="/account" 
									className="block text-[color:var(--foreground)] hover:text-[color:var(--accent)] transition-colors py-3 text-lg font-medium"
									onClick={() => { handleAccountClick(); closeMobileMenu(); }}
								>
									Cuenta
								</Link>
								{subscription?.isActive && (
									<Link 
										href="/premium" 
										className="block text-[color:var(--accent)] hover:opacity-80 transition-opacity py-3 text-lg font-semibold"
										onClick={() => { handlePremiumClick(); closeMobileMenu(); }}
									>
										Premium ✨
									</Link>
								)}
								
								{/* Mobile Auth Section */}
								<div className="pt-4 border-t border-[color:var(--border)] space-y-4">
									<div className="text-[color:var(--muted)] text-sm font-medium">{session.user?.name ?? session.user?.email}</div>
									<div className="flex gap-3">
										<NotificationDropdown />
										<Button onClick={() => signOut()} variant="outline" className="flex-1 border-[color:var(--border)]">
											Cerrar sesión
										</Button>
									</div>
								</div>
							</>
						)}
						
						{!session && status !== "loading" && (
							<div className="pt-4 border-t border-[color:var(--border)]">
								<Button href="/login" className="w-full bg-[color:var(--accent)] text-black hover:opacity-90" onClick={closeMobileMenu}>
									Iniciar sesión
								</Button>
							</div>
						)}
						
						{status === "loading" && (
							<div className="pt-4 border-t border-[color:var(--border)]">
								<div className="flex items-center justify-center py-3">
									<Spinner className="w-6 h-6 text-[color:var(--accent)]" />
								</div>
							</div>
						)}
					</Container>
				</div>
			)}
		</nav>
	);
}

