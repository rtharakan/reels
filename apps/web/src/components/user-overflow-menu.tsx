'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ReportDialog } from './report-dialog';

interface UserOverflowMenuProps {
  targetUserId: string;
  targetUserName: string;
}

export function UserOverflowMenu({ targetUserId, targetUserName }: UserOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const blockMutation = trpc.safety.block.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      window.location.reload();
    },
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          ref={triggerRef}
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
          aria-label={`More options for ${targetUserName}`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <MoreVertical className="h-4 w-4" aria-hidden="true" />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] py-1 shadow-soft-lg"
            role="menu"
            aria-label={`Actions for ${targetUserName}`}
          >
            <button
              onClick={(e) => { e.stopPropagation(); blockMutation.mutate({ userId: targetUserId }); }}
              disabled={blockMutation.isPending}
              className="flex w-full items-center px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors disabled:opacity-50"
              role="menuitem"
            >
              {blockMutation.isPending ? 'Blocking...' : 'Block'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowReportDialog(true); setIsOpen(false); }}
              className="flex w-full items-center px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--bg-accent)] transition-colors"
              role="menuitem"
            >
              Report
            </button>
          </div>
        )}
      </div>

      {showReportDialog && (
        <ReportDialog
          targetUserId={targetUserId}
          targetUserName={targetUserName}
          onClose={() => setShowReportDialog(false)}
        />
      )}
    </>
  );
}
