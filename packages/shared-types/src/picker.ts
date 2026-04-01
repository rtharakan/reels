// Picker types — platform-agnostic (no Prisma dependency)

export type PickerPathway = 'FILM_FIRST' | 'FULLY_SPECIFIED';

export type PickerPlanStatus = 'VOTING' | 'CONFIRMED' | 'EXPIRED' | 'ARCHIVED';

export type VoteStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE';

export interface PickerPlan {
  id: string;
  organizerId: string;
  filmTitle: string;
  filmTmdbId: number | null;
  filmPosterPath: string | null;
  filmYear: number | null;
  pathway: PickerPathway;
  city: string | null;
  cinema: string | null;
  targetDate: string | null;
  status: PickerPlanStatus;
  confirmedShowtimeId: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface PickerShowtime {
  id: string;
  planId: string;
  cinemaName: string;
  cinemaCity: string;
  date: string;
  time: string;
  ticketUrl: string | null;
  isManualEntry: boolean;
  createdAt: string;
}

export interface PickerVote {
  id: string;
  participantId: string;
  showtimeId: string;
  status: VoteStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PickerParticipant {
  id: string;
  planId: string;
  userId: string | null;
  displayName: string;
  sessionToken: string | null;
  isOrganizer: boolean;
  joinedAt: string;
}
