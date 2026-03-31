-- Migration: 0001_initial
-- Generated from prisma/schema.prisma

-- CreateEnum
CREATE TYPE "Intent" AS ENUM ('FRIENDS', 'DATING', 'BOTH');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'FAKE_PROFILE', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "BuddyRequestStatus" AS ENUM ('OPEN', 'FULL', 'CLOSED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "age" INTEGER,
    "location" TEXT,
    "bio" TEXT,
    "intent" "Intent",
    "timezone" TEXT,
    "letterboxdUsername" TEXT,
    "profilePhotos" TEXT[],
    "prompts" JSONB,
    "topFilmIds" TEXT[],
    "privacyPolicyConsentedAt" TIMESTAMP(3),
    "onboardingCompletedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Film" (
    "id" TEXT NOT NULL,
    "tmdbId" INTEGER,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "posterPath" TEXT,
    "genreIds" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchedEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchedEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatingEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatingEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikedEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filmId" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikedEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "sharedFilmIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "filmOverlap" DOUBLE PRECISION NOT NULL,
    "genreSimilarity" DOUBLE PRECISION NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "sharedFilmIds" TEXT[],
    "likedOverlap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratedOverlap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "watchedOverlap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "watchlistOverlap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sharedLikedIds" TEXT[],
    "sharedRatedIds" TEXT[],
    "sharedWatchedIds" TEXT[],
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeenUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seenUserId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeenUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAllocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allocatedDate" TIMESTAMP(3) NOT NULL,
    "cardCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'ios',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuddyRequest" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "filmTitle" TEXT NOT NULL,
    "filmYear" INTEGER,
    "posterUrl" TEXT,
    "cinemaName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "ticketUrl" TEXT,
    "maxBuddies" INTEGER NOT NULL DEFAULT 1,
    "status" "BuddyRequestStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuddyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuddyInterest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuddyInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuddyMessage" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuddyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_letterboxdUsername_key" ON "User"("letterboxdUsername");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "User_intent_idx" ON "User"("intent");
CREATE INDEX "User_onboardingCompletedAt_idx" ON "User"("onboardingCompletedAt");
CREATE INDEX "User_onboardingCompletedAt_deletedAt_idx" ON "User"("onboardingCompletedAt", "deletedAt");
CREATE INDEX "User_intent_onboardingCompletedAt_idx" ON "User"("intent", "onboardingCompletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Film_tmdbId_key" ON "Film"("tmdbId");
CREATE INDEX "Film_tmdbId_idx" ON "Film"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistEntry_userId_filmId_key" ON "WatchlistEntry"("userId", "filmId");
CREATE INDEX "WatchlistEntry_userId_idx" ON "WatchlistEntry"("userId");
CREATE INDEX "WatchlistEntry_filmId_idx" ON "WatchlistEntry"("filmId");

-- CreateIndex
CREATE UNIQUE INDEX "WatchedEntry_userId_filmId_key" ON "WatchedEntry"("userId", "filmId");
CREATE INDEX "WatchedEntry_userId_idx" ON "WatchedEntry"("userId");
CREATE INDEX "WatchedEntry_filmId_idx" ON "WatchedEntry"("filmId");

-- CreateIndex
CREATE UNIQUE INDEX "RatingEntry_userId_filmId_key" ON "RatingEntry"("userId", "filmId");
CREATE INDEX "RatingEntry_userId_idx" ON "RatingEntry"("userId");
CREATE INDEX "RatingEntry_filmId_idx" ON "RatingEntry"("filmId");

-- CreateIndex
CREATE UNIQUE INDEX "LikedEntry_userId_filmId_key" ON "LikedEntry"("userId", "filmId");
CREATE INDEX "LikedEntry_userId_idx" ON "LikedEntry"("userId");
CREATE INDEX "LikedEntry_filmId_idx" ON "LikedEntry"("filmId");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_fromUserId_toUserId_key" ON "Interest"("fromUserId", "toUserId");
CREATE INDEX "Interest_toUserId_idx" ON "Interest"("toUserId");
CREATE INDEX "Interest_toUserId_createdAt_idx" ON "Interest"("toUserId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Match_userAId_userBId_key" ON "Match"("userAId", "userBId");
CREATE INDEX "Match_userAId_idx" ON "Match"("userAId");
CREATE INDEX "Match_userBId_idx" ON "Match"("userBId");
CREATE INDEX "Match_userAId_userBId_idx" ON "Match"("userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedUserId_key" ON "Block"("blockerId", "blockedUserId");
CREATE INDEX "Block_blockerId_idx" ON "Block"("blockerId");
CREATE INDEX "Block_blockedUserId_idx" ON "Block"("blockedUserId");

-- CreateIndex
CREATE INDEX "Report_reportedUserId_idx" ON "Report"("reportedUserId");
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchScore_userId_candidateId_key" ON "MatchScore"("userId", "candidateId");
CREATE INDEX "MatchScore_userId_totalScore_idx" ON "MatchScore"("userId", "totalScore" DESC);
CREATE INDEX "MatchScore_userId_candidateId_idx" ON "MatchScore"("userId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "SeenUser_userId_seenUserId_key" ON "SeenUser"("userId", "seenUserId");
CREATE INDEX "SeenUser_userId_idx" ON "SeenUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAllocation_userId_allocatedDate_key" ON "DailyAllocation"("userId", "allocatedDate");
CREATE INDEX "DailyAllocation_userId_allocatedDate_idx" ON "DailyAllocation"("userId", "allocatedDate");

-- CreateIndex
CREATE INDEX "BuddyRequest_status_city_date_idx" ON "BuddyRequest"("status", "city", "date");
CREATE INDEX "BuddyRequest_creatorId_idx" ON "BuddyRequest"("creatorId");
CREATE INDEX "BuddyRequest_expiresAt_idx" ON "BuddyRequest"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "BuddyInterest_requestId_userId_key" ON "BuddyInterest"("requestId", "userId");
CREATE INDEX "BuddyInterest_userId_idx" ON "BuddyInterest"("userId");

-- CreateIndex
CREATE INDEX "BuddyMessage_requestId_createdAt_idx" ON "BuddyMessage"("requestId", "createdAt");
CREATE INDEX "BuddyMessage_senderId_idx" ON "BuddyMessage"("senderId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WatchlistEntry" ADD CONSTRAINT "WatchlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WatchlistEntry" ADD CONSTRAINT "WatchlistEntry_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WatchedEntry" ADD CONSTRAINT "WatchedEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WatchedEntry" ADD CONSTRAINT "WatchedEntry_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RatingEntry" ADD CONSTRAINT "RatingEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RatingEntry" ADD CONSTRAINT "RatingEntry_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LikedEntry" ADD CONSTRAINT "LikedEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LikedEntry" ADD CONSTRAINT "LikedEntry_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "Film"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeenUser" ADD CONSTRAINT "SeenUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SeenUser" ADD CONSTRAINT "SeenUser_seenUserId_fkey" FOREIGN KEY ("seenUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailyAllocation" ADD CONSTRAINT "DailyAllocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuddyRequest" ADD CONSTRAINT "BuddyRequest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuddyInterest" ADD CONSTRAINT "BuddyInterest_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BuddyRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuddyInterest" ADD CONSTRAINT "BuddyInterest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuddyMessage" ADD CONSTRAINT "BuddyMessage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BuddyRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BuddyMessage" ADD CONSTRAINT "BuddyMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
