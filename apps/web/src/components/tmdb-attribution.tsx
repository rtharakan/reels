import Image from 'next/image';

interface TmdbAttributionProps {
  className?: string;
}

export function TmdbAttribution({ className = '' }: TmdbAttributionProps) {
  return (
    <div className={`flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] ${className}`}>
      <span>Film data powered by</span>
      <a
        href="https://www.themoviedb.org"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:text-[var(--text-secondary)] transition-colors"
      >
        <Image
          src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
          alt="TMDB logo"
          width={60}
          height={10}
          unoptimized
          className="inline-block"
        />
      </a>
    </div>
  );
}
