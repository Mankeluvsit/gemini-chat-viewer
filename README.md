# GitHub Repos Dashboard

A personal dashboard to view and manage your GitHub repositories. Built with Next.js 15, shadcn/ui, and the GitHub REST API.

## Features

- **Repository overview** with search, filter by language/visibility, and sort
- **Stats cards** showing total repos, stars, forks, and open issues
- **Repo detail pages** with tabbed navigation:
  - Overview with recent commits and language breakdown
  - Issues management (view, create, close/reopen)
  - Pull requests list
  - Commit activity chart (52 weeks)
  - Settings (edit description, topics, visibility, archive, delete)
- **Create and delete repositories** from the dashboard
- **Dark/light theme** toggle
- **Responsive design** for mobile and desktop

## Getting Started

### Prerequisites

- Node.js 18+
- A GitHub Personal Access Token with `repo` and `delete_repo` scopes

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
4. Add your GitHub PAT to `.env.local`:
   ```
   GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxx
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Icons**: @tabler/icons-react
- **Charts**: Recharts (via shadcn/ui chart)
- **API**: GitHub REST API v3

## Project Structure

```
app/
  dashboard/
    page.tsx              # Repos overview with stats, grid, search/filter
    settings/page.tsx     # App settings, PAT status, rate limits
    repos/[owner]/[repo]/
      page.tsx            # Repo overview (commits, languages)
      issues/page.tsx     # Issues management
      pulls/page.tsx      # Pull requests
      activity/page.tsx   # Commit activity chart
      settings/page.tsx   # Repo settings, danger zone
  api/github/             # Route handlers proxying GitHub API
components/               # Reusable UI components
lib/
  github.ts               # GitHub API client
  language-colors.ts      # Language color mapping
```
