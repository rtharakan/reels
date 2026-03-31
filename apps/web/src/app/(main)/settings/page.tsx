'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { authClient } from '@/lib/auth-client';
import { useI18n } from '@/lib/i18n';
import {
  User, Shield, Bell, Globe, Moon, LogOut, ChevronRight,
  Trash2, Lock, FileText, HelpCircle, Info, Eye, Download,
} from 'lucide-react';

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const { data: user, isLoading } = trpc.user.me.useQuery();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const deleteMutation = trpc.user.deleteAccount.useMutation({
    onSuccess: () => router.push('/'),
  });

  const exportMutation = trpc.user.exportData.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reels-my-data.json';
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="skeleton h-6 w-24 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: t.settings?.account ?? 'Account',
      items: [
        { icon: User, label: t.settings?.editProfile ?? 'Edit Profile', href: '/profile/edit' },
        { icon: Shield, label: t.settings?.blockedUsers ?? 'Blocked Users', href: '/profile/blocked' },
        { icon: Eye, label: t.settings?.privacy ?? 'Privacy Settings', href: '/privacy' },
      ],
    },
    {
      title: t.settings?.preferences ?? 'Preferences',
      items: [
        {
          icon: Globe,
          label: t.settings?.language ?? 'Language',
          value: locale === 'nl' ? 'Nederlands' : 'English',
          action: () => setLocale(locale === 'nl' ? 'en' : 'nl'),
        },
      ],
    },
    {
      title: t.settings?.support ?? 'Support & Legal',
      items: [
        { icon: HelpCircle, label: t.settings?.help ?? 'Help & FAQ', href: '/about' },
        { icon: FileText, label: t.settings?.termsOfService ?? 'Terms of Service', href: '/terms' },
        { icon: Lock, label: t.settings?.privacyPolicy ?? 'Privacy Policy', href: '/privacy' },
        { icon: Info, label: t.settings?.about ?? 'About Reels', href: '/about' },
      ],
    },
    {
      title: t.settings?.data ?? 'Your Data',
      items: [
        {
          icon: Download,
          label: t.settings?.exportData ?? 'Export My Data',
          action: () => exportMutation.mutate(),
          loading: exportMutation.isPending,
        },
        {
          icon: Trash2,
          label: t.settings?.deleteAccount ?? 'Delete Account',
          danger: true,
          action: () => setShowDeleteConfirm(true),
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      <h1 className="mb-6 text-lg font-semibold text-[var(--text-primary)]">
        {t.settings?.title ?? 'Settings'}
      </h1>

      {/* User card */}
      {user && (
        <Link href="/profile" className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-soft mb-6 hover:bg-[var(--bg-accent)] transition-colors">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg font-semibold text-[var(--accent)]">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{user.location}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </Link>
      )}

      {/* Settings sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-2 px-1 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {section.title}
            </h2>
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-soft overflow-hidden divide-y divide-[var(--border-default)]">
              {section.items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-accent)] transition-colors cursor-pointer">
                    <Icon className={`h-4.5 w-4.5 ${(item as { danger?: boolean }).danger ? 'text-red-500' : 'text-[var(--text-muted)]'}`} />
                    <span className={`flex-1 text-sm ${(item as { danger?: boolean }).danger ? 'text-red-500 font-medium' : 'text-[var(--text-primary)]'}`}>
                      {(item as { loading?: boolean }).loading ? 'Exporting...' : item.label}
                    </span>
                    {(item as { value?: string }).value && (
                      <span className="text-xs text-[var(--text-muted)]">{(item as { value?: string }).value}</span>
                    )}
                    {(item as { href?: string }).href && <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />}
                  </div>
                );

                if ((item as { href?: string }).href) {
                  return (
                    <Link key={item.label} href={(item as { href: string }).href}>
                      {content}
                    </Link>
                  );
                }
                return (
                  <button key={item.label} onClick={(item as { action?: () => void }).action} className="w-full text-left">
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout button */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-3.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors shadow-soft"
      >
        <LogOut className="h-4 w-4" />
        {t.settings?.logout ?? 'Log Out'}
      </button>

      {/* App info */}
      <p className="mt-4 text-center text-xs text-[var(--text-muted)]">Reels v1.0 — Film-Driven Social Matching</p>

      {/* Logout confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-soft-lg">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t.settings?.logoutConfirm ?? 'Log out?'}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{t.settings?.logoutConfirmDesc ?? 'You can always log back in with your email.'}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors">
                {t.settings?.cancel ?? 'Cancel'}
              </button>
              <button onClick={handleLogout} className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-colors">
                {t.settings?.logout ?? 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-soft-lg">
            <h2 id="delete-title" className="text-lg font-semibold text-[var(--text-primary)]">
              {t.settings?.deleteConfirm ?? 'Delete your account?'}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              {t.settings?.deleteConfirmDesc ?? 'This will permanently delete your profile, watchlist, matches, and all data. This cannot be undone.'}
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors">
                {t.settings?.cancel ?? 'Cancel'}
              </button>
              <button
                onClick={() => { deleteMutation.mutate(); setShowDeleteConfirm(false); }}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                {t.settings?.deleteForever ?? 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
