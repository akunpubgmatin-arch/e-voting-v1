-- Create enum for roles
CREATE TYPE "Role" AS ENUM ('USER', 'TEACHER', 'COMMITTEE', 'ADMIN');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "hasVotedOsis" BOOLEAN NOT NULL DEFAULT false,
    "hasVotedMpk" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Periode table
CREATE TABLE "Periode" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Periode_pkey" PRIMARY KEY ("id")
);

-- Create Candidate table
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT,
    "visi" TEXT,
    "misi" TEXT,
    "type" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL DEFAULT 1,
    "periodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- Create Vote table
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on User username
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Create unique constraint on Vote
CREATE UNIQUE INDEX "Vote_userId_periodeId_candidateId_key" ON "Vote"("userId", "periodeId", "candidateId");

-- Create indexes for performance
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Periode_isActive_idx" ON "Periode"("isActive");
CREATE INDEX "Candidate_periodeId_idx" ON "Candidate"("periodeId");
CREATE INDEX "Candidate_type_idx" ON "Candidate"("type");
CREATE INDEX "Vote_periodeId_idx" ON "Vote"("periodeId");
CREATE INDEX "Vote_candidateId_idx" ON "Vote"("candidateId");

-- Add foreign key constraints
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "Periode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
