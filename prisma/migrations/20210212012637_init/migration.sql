-- CreateEnum
CREATE TYPE "UserKind" AS ENUM ('user');

-- CreateEnum
CREATE TYPE "WorkspaceKind" AS ENUM ('workspace');

-- CreateEnum
CREATE TYPE "WorkspaceMembershipKind" AS ENUM ('workspaceMembership');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('admin', 'developer');

-- CreateEnum
CREATE TYPE "ProjectRole" AS ENUM ('admin', 'developer');

-- CreateEnum
CREATE TYPE "ProjectKind" AS ENUM ('project');

-- CreateEnum
CREATE TYPE "ProjectMembershipKind" AS ENUM ('projectMembership');

-- CreateTable
CREATE TABLE "User" (
    "kind" "UserKind" NOT NULL DEFAULT E'user',
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "image" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "kind" "WorkspaceKind" NOT NULL DEFAULT E'workspace',
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMembership" (
    "kind" "WorkspaceMembershipKind" NOT NULL DEFAULT E'workspaceMembership',
    "id" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "kind" "ProjectKind" NOT NULL DEFAULT E'project',
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMembership" (
    "kind" "ProjectMembershipKind" NOT NULL DEFAULT E'projectMembership',
    "id" TEXT NOT NULL,
    "role" "ProjectRole" NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace.name_unique" ON "Workspace"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembership.userId_workspaceId_unique" ON "WorkspaceMembership"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Project.name_unique" ON "Project"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMembership.userId_projectId_unique" ON "ProjectMembership"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "WorkspaceMembership" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembership" ADD FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMembership" ADD FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMembership" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
