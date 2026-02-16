Document 2: APP_FLOW.md (Application Flow & Navigation)
1. Entry Points
Primary Entry Points
Direct URL: User types https://your-app.vercel.app → Lands on authentication gate or dashboard (if logged in)

OAuth Callback: Google redirects to /auth/callback after successful authentication

Deep Links: None for MVP

Secondary Entry Points
Bookmark from Browser: User saves Vercel URL as browser bookmark → Returns to app directly

2. Core User Flows
Flow 1: User Authentication (Google OAuth)
Goal: Register or log in to access bookmark manager
Entry Point: Landing page
Frequency: Once per session/device

Happy Path
Page: Landing Page (/)

Elements: App logo, tagline, "Sign in with Google" button

User Action: Clicks "Sign in with Google"

Trigger: Initiate Supabase OAuth flow

Page: Google OAuth Consent

Elements: Google login form, permission scopes

User Action: Grants permissions, signs in

Validation: Google validates credentials

Trigger: Redirects to /auth/callback

System Action:

Supabase creates/updates user record

Generates JWT session token

Stores session in HTTP-only cookie

Page: Dashboard (/dashboard)

Elements: Header with user avatar, logout button, bookmark list (empty or populated), add bookmark form

Success State: User authenticated, can manage bookmarks

Error States
OAuth Cancelled

Display: Return to landing page with message "Sign-in cancelled. Please try again."

Action: User can retry sign-in

OAuth Failed

Display: Error message "Authentication failed. Please check your internet connection."

Action: Retry button

Invalid Permissions

Display: "Required permissions not granted. Please allow access to email and profile."

Action: Retry OAuth with correct permissions

Edge Cases
User already logged in → Skip landing page, redirect directly to dashboard

Session expired → Redirect to landing page with "Session expired" message

Multiple Google accounts → Google account chooser appears

Exit Points
Success: Dashboard (/dashboard)

Failure: Landing page with error message

Flow 2: Add Bookmark
Goal: Save new URL with title to bookmark collection
Entry Point: Dashboard
Frequency: Multiple times per session

Happy Path
Page: Dashboard (/dashboard)

Elements:

Add bookmark form (always visible at top)

URL input field (placeholder: "https://example.com")

Title input field (placeholder: "Bookmark title")

Submit button (disabled when invalid)

User Actions:

Enters URL in URL field

Enters title in title field

Validation:

URL format check (must start with http:// or https://)

Title required (1-100 characters)

Submit button enabled when both valid

User Action: Clicks "Add Bookmark" button

System Actions:

POST request to Supabase API

Insert bookmark with user_id, url, title, created_at

Supabase broadcasts INSERT event via Realtime

UI Update:

Form fields clear

New bookmark appears at top of list immediately

Success feedback (optional: brief green flash or checkmark)

Real-time Propagation:

All other open tabs receive INSERT event

New bookmark appears in all tabs

Error States
Invalid URL

Display: Red border on URL field, "Please enter a valid URL"

Action: User corrects URL format

Empty Title

Display: Red border on title field, "Title is required"

Action: User enters title

Duplicate URL (optional constraint)

Display: "This URL is already bookmarked"

Action: User modifies URL or cancels

Database Insert Fails

Display: Toast notification "Failed to save bookmark. Please try again."

Action: User can retry submission

Network Offline

Display: "You are offline. Bookmark will be saved when connection is restored."

Action: Queue bookmark, save when online

Edge Cases
User submits very long title (>100 chars) → Truncate or show validation error

User pastes malformed URL → Sanitize and validate

Multiple rapid submissions → Queue requests, process sequentially

Real-time connection dropped → Fallback to polling or prompt to refresh

Exit Points
Success: Bookmark added, form cleared, ready for next add

Abandon: User navigates away, unsaved data lost

Flow 3: Delete Bookmark
Goal: Remove unwanted bookmark from collection
Entry Point: Dashboard bookmark list
Frequency: Occasional

Happy Path
Page: Dashboard (/dashboard)

Elements:

Bookmark list (each item shows title, URL, delete icon/button)

User Action: Hovers over bookmark item

UI Feedback:

Delete icon/button becomes visible or highlighted

User Action: Clicks delete icon

Confirmation (Optional but Recommended):

Modal/dialog: "Delete this bookmark?"

Actions: "Cancel" or "Delete"

User clicks "Delete"

System Actions:

DELETE request to Supabase API

Remove bookmark row from database

Supabase broadcasts DELETE event via Realtime

UI Update:

Bookmark fades out and removes from list

List re-flows smoothly

Real-time Propagation:

All other open tabs receive DELETE event

Bookmark removed from all tabs

Error States
Delete Fails

Display: Toast notification "Failed to delete bookmark. Please try again."

Action: Bookmark remains in list, user can retry

Bookmark Already Deleted

Display: "This bookmark has already been deleted."

Action: Remove from UI silently

Network Offline

Display: "You are offline. Delete will be processed when connection is restored."

Action: Mark for deletion, process when online

Edge Cases
User deletes bookmark open in another tab → Tab shows message or refreshes list

Rapid multiple deletes → Queue and process sequentially

Delete during page load → Wait for list to load, then allow delete

User cancels confirmation → No action, bookmark remains

Exit Points
Success: Bookmark removed, list updated

Cancel: No change, bookmark remains

Flow 4: Real-time Synchronization
Goal: Keep bookmark list consistent across all open browser tabs
Entry Point: Any dashboard tab
Frequency: Continuous during session

Happy Path
Page: Dashboard Load

System establishes Supabase Realtime subscription

Filters: user_id = current_user.id

Listens for: INSERT, UPDATE, DELETE events

Event: INSERT (new bookmark added)

Trigger: Another tab adds bookmark

Action: Append to local bookmark list, animate in

Event: DELETE (bookmark removed)

Trigger: Another tab deletes bookmark

Action: Find by ID, remove from list, animate out

Event: UPDATE (bookmark edited) [P2 feature]

Trigger: Another tab edits bookmark

Action: Update local record in-place

Error States
Connection Lost

Display: Banner "Connection lost. Reconnecting..."

Action: Attempt reconnection with exponential backoff

Subscription Failed

Display: Warning "Real-time updates unavailable. Please refresh."

Action: Fallback to manual refresh or polling

Edge Cases
Tab in background → Events queued, applied when tab focused

Multiple events simultaneously → Process in order received

Conflicting changes → Last-write-wins (database authority)

3. Navigation Map
text
/ (Landing Page)
│
├── /auth/callback (OAuth redirect, no UI)
│   └── Redirects to /dashboard
│
└── /dashboard (Main App)
    ├── Header
    │   ├── Logo
    │   ├── User Avatar + Name
    │   └── Logout Button
    │
    ├── Add Bookmark Form
    │   ├── URL Input
    │   ├── Title Input
    │   └── Submit Button
    │
    └── Bookmark List
        └── Bookmark Item (N items)
            ├── Title
            ├── URL (clickable link)
            └── Delete Button
Navigation Rules
Authentication Required: /dashboard - redirects to / if not logged in

Redirect Logic:

IF user visits / AND is logged in THEN redirect to /dashboard

IF user visits /dashboard AND is NOT logged in THEN redirect to /

Back Button Behavior: Standard browser behavior (no special handling needed)

4. Screen Inventory
Screen: Landing Page
Route: /

Access: Public

Purpose: User authentication entry point

Key Elements:

App logo/branding

Tagline/description

"Sign in with Google" button

Footer (optional)

Actions Available:

Sign in → OAuth flow → Dashboard

State Variants:

Default (not logged in)

Loading (OAuth in progress)

Screen: Dashboard
Route: /dashboard

Access: Authenticated users only

Purpose: View and manage bookmarks

Key Elements:

Header with user info and logout

Add bookmark form

Bookmark list

Empty state (when no bookmarks)

Actions Available:

Add bookmark → Insert to database

Delete bookmark → Remove from database

Click bookmark URL → Open in new/same tab

Logout → Clear session, redirect to /

State Variants:

Loading (fetching bookmarks)

Empty (no bookmarks yet)

Populated (1+ bookmarks)

Error (failed to load)

5. Decision Points
Decision: User Authentication Status
text
IF user has valid session cookie
  THEN allow access to /dashboard
  AND display user-specific bookmarks
  AND show logout option

ELSE IF user does NOT have valid session
  THEN redirect to landing page (/)
  AND show "Sign in with Google" button
  AND disable bookmark features
Decision: Form Validation State
text
IF URL is valid format AND title is not empty
  THEN enable submit button
  AND remove error messages

ELSE IF URL is invalid OR title is empty
  THEN disable submit button
  AND show inline validation errors
Decision: Bookmark List State
text
IF bookmarks.length === 0
  THEN show empty state message: "No bookmarks yet. Add your first one above!"
  AND hide bookmark list container

ELSE IF bookmarks.length > 0
  THEN show bookmark list
  AND hide empty state message
Decision: Real-time Connection Status
text
IF realtime connection is active
  THEN show no indicator (normal operation)

ELSE IF realtime connection is lost
  THEN show warning banner: "Connection lost. Reconnecting..."
  AND attempt reconnection
6. Error Handling Flows
404 Not Found
Display: Custom 404 page with message "Page not found"

Actions: Link to Dashboard or Landing page

Log: Track 404s for debugging

500 Server Error
Display: "Something went wrong. Please try again."

Actions: Retry button, Contact support link

Fallback: Preserve form data if possible

Network Offline
Display: Persistent banner "You are offline. Changes will sync when connection is restored."

Actions: Queue bookmark adds/deletes, retry when online

Recovery: Auto-sync when connection restored

Unauthorized Access
Display: Redirect to landing page with message "Please sign in to continue"

Actions: Show sign-in button

Log: Track unauthorized attempts

7. Responsive Behavior
Mobile-Specific Flows
Navigation: Full-width header, hamburger menu not needed (simple app)

Forms: Stacked layout, full-width inputs

Bookmark List: Single column, larger touch targets

Desktop-Specific Flows
Navigation: Fixed header with user avatar inline

Forms: Inline layout (URL and title side-by-side optional)

Bookmark List: Potentially multi-column (optional enhancement)

8. Animation & Transitions
Page Transitions
Navigation: Instant (no animation for MVP)

Modal: Fade in (150ms) if confirmation dialogs added

Micro-interactions
Button Click: Scale(0.98) on press

Bookmark Add: Slide down from top (200ms)

Bookmark Delete: Fade out + slide up (200ms)

Form Validation: Error shake animation (optional)

Success: Brief green border flash on form (150ms)

Document 3: TECH_STACK.md (Technology Stack)
1. Stack Overview
Last Updated: February 16, 2026
Version: 1.0

Architecture Pattern
Type: Monolithic Full-Stack Application

Pattern: JAMstack (JavaScript, APIs, Markup)

Deployment: Serverless (Vercel Edge Functions)

2. Frontend Stack
Core Framework
Framework: Next.js

Version: 15.2.0 (App Router required)
​

Reason: Server-side rendering, file-based routing, API routes, Vercel optimization, React 19 support

Documentation: https://nextjs.org/docs

License: MIT

Configuration: App Router (not Pages Router as specified in requirements)

UI Library
Library: React

Version: 19.0.0

Reason: Component-based architecture, hooks for state management, large ecosystem

Documentation: https://react.dev

License: MIT

State Management
Approach: React useState + Supabase Realtime

Reason: Simple app with server-driven state, no complex client state needed

Alternatives Considered:

Zustand (rejected: overkill for MVP)

Redux (rejected: too complex for simple app)

Context API (sufficient for auth state only)

Styling
Framework: Tailwind CSS
​

Version: 3.4.1

Configuration: Custom config at tailwind.config.js

Reason: Utility-first, rapid development, consistent design system, no CSS files needed

Documentation: https://tailwindcss.com/docs

License: MIT

Type Safety
Language: TypeScript

Version: 5.6.3

tsconfig: Strict mode enabled

Reason: Type safety, better IDE support, catch errors at compile time

Documentation: https://www.typescriptlang.org/docs

Authentication Client
Library: @supabase/ssr
​

Version: 0.5.2

Reason: Supabase Auth for Next.js App Router with server-side rendering support

Documentation: https://supabase.com/docs/guides/auth/server-side

Supabase Client
Library: @supabase/supabase-js

Version: 2.47.10

Reason: Official Supabase SDK for database, auth, and real-time subscriptions
​

Documentation: https://supabase.com/docs/reference/javascript

3. Backend Stack
Backend-as-a-Service
Platform: Supabase
​

Version: Cloud-hosted (latest)

Services Used:

Authentication: Google OAuth provider

Database: PostgreSQL with Row-Level Security

Realtime: WebSocket subscriptions for live updates

Reason: Eliminates need for custom backend, built-in auth, real-time out of the box

Documentation: https://supabase.com/docs

Database
Primary: PostgreSQL (via Supabase)
​

Version: 15.x (Supabase managed)

Schema Management: Supabase SQL Editor + migrations

Connection: Pooled connections via Supabase API

Reason: ACID compliance, robust for production, row-level security, JSON support

Database Schema
sql
-- Users table (managed by Supabase Auth)
-- auth.users (built-in)

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX bookmarks_created_at_idx ON bookmarks(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only read their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
Real-time Subscriptions
Service: Supabase Realtime
​

Protocol: WebSocket

Events: INSERT, UPDATE, DELETE on bookmarks table

Filtering: Client-side subscription filtered by user_id

Reason: Required for real-time updates across tabs without page refresh
​

Authentication
Provider: Google OAuth 2.0
​

Strategy: Supabase Auth with Google provider

Token Storage: HTTP-only cookies (via @supabase/ssr)

Session Duration: 7 days (Supabase default)

Reason: No email/password allowed, Google OAuth only per requirements
​

4. DevOps & Infrastructure
Version Control
System: Git

Platform: GitHub (public repository)
​

Branch Strategy:

main (production, deployed to Vercel)

dev (development branch)

CI/CD
Platform: Vercel Git Integration
​

Workflows:

Automatic deploy on push to main

Preview deployments for pull requests

Build checks (TypeScript, ESLint)

Hosting
Frontend: Vercel
​

Backend/Database: Supabase (cloud-hosted)

Domain: [your-app].vercel.app (Vercel-provided)

Reason: Required by project specifications, seamless Next.js integration
​

Monitoring
Error Tracking: Console logs (MVP level)

Analytics: None for MVP

Uptime Monitoring: Vercel built-in status

5. Development Tools
Code Quality
Linter: ESLint

Config: next.config.js with recommended rules

Formatter: Prettier (optional for MVP)

IDE Recommendations
Editor: VS Code

Extensions:

ESLint

Tailwind CSS IntelliSense

Supabase (syntax highlighting for SQL)

6. Environment Variables
Required Variables
bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# No secrets needed in NEXT_PUBLIC_ vars for client-side Supabase
# Anon key is safe to expose (protected by RLS policies)
Setup Instructions
Create Supabase project at https://supabase.com

Enable Google OAuth provider in Supabase Auth settings

Configure OAuth callback URL: https://your-app.vercel.app/auth/callback

Copy Project URL and Anon Key from Supabase dashboard

Add environment variables to Vercel project settings

For local development, create .env.local:

bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
7. Package.json Scripts
json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
8. Dependencies Lock
Frontend Dependencies
json
{
  "next": "15.2.0",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "typescript": "5.6.3",
  "tailwindcss": "3.4.1",
  "@supabase/supabase-js": "2.47.10",
  "@supabase/ssr": "0.5.2"
}
Dev Dependencies
json
{
  "@types/node": "22.10.5",
  "@types/react": "19.0.6",
  "@types/react-dom": "19.0.2",
  "eslint": "9.18.0",
  "eslint-config-next": "15.2.0",
  "postcss": "8.4.49",
  "autoprefixer": "10.4.20"
}
9. Security Considerations
Authentication
Google OAuth tokens managed by Supabase

Session stored in HTTP-only cookies (not localStorage)

HTTPS enforced in production (Vercel default)

OAuth callback URL whitelist configured

Data Protection
Row-Level Security (RLS) enforces user isolation
​

All queries filtered by authenticated user ID

SQL injection prevented (Supabase parameterized queries)

XSS protection (React escapes output by default)

API Security
Supabase Anon Key safe for client-side use (protected by RLS)

No sensitive keys in frontend code

CORS handled by Supabase automatically

10. Version Upgrade Policy
During MVP Development (72 hours)
Lock all versions: No dependency updates during build

Testing: Test locally before every Vercel deployment

Post-Launch
Security Patches: Apply immediately if critical

Minor Updates: Review monthly

Major Updates: Plan and test before upgrading

Document 4: FRONTEND_GUIDELINES.md (Frontend Design System)
1. Design Principles
Core Principles
Simplicity: Minimal UI, focus on core task (bookmark management)

Clarity: Every action has clear visual feedback

Speed: Instant interactions, optimistic UI updates

Consistency: Reuse patterns across all components

2. Design Tokens
Color Palette
Primary Colors (Blue - for CTAs and links)
css
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6; /* Main brand color */
--color-primary-600: #2563eb; /* Hover state */
--color-primary-700: #1d4ed8; /* Active state */
Neutral Colors (Grays - for text and backgrounds)
css
--color-neutral-50: #f9fafb;   /* Light background */
--color-neutral-100: #f3f4f6;  /* Card background */
--color-neutral-200: #e5e7eb;  /* Borders */
--color-neutral-600: #4b5563;  /* Secondary text */
--color-neutral-900: #111827;  /* Primary text */
Semantic Colors
css
--color-success: #10b981;  /* Green - success feedback */
--color-error: #ef4444;    /* Red - errors, delete */
--color-warning: #f59e0b;  /* Amber - warnings */
Tailwind Usage
tsx
// Primary button
className="bg-blue-500 hover:bg-blue-600 text-white"

// Secondary text
className="text-neutral-600"

// Delete button
className="text-red-500 hover:text-red-600"
3. Typography
Font Family
css
--font-sans: 'Inter', system-ui, sans-serif;
Setup: Use Next.js next/font/google for Inter font:

tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      {children}
    </html>
  )
}
Font Sizes
css
--text-sm: 0.875rem;   /* 14px - labels, metadata */
--text-base: 1rem;      /* 16px - body text */
--text-lg: 1.125rem;    /* 18px - subheadings */
--text-2xl: 1.5rem;     /* 24px - page titles */
Font Weights
css
--font-normal: 400;     /* Body text */
--font-medium: 500;     /* Buttons, labels */
--font-semibold: 600;   /* Headings */
Tailwind Usage
tsx
// Page title
<h1 className="text-2xl font-semibold text-neutral-900">My Bookmarks</h1>

// Bookmark title
<h3 className="text-base font-medium text-neutral-900">GitHub</h3>

// Bookmark URL
<a className="text-sm text-blue-500 hover:underline">https://github.com</a>
4. Spacing Scale
css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
Usage Rules
Component padding: spacing-4 (16px)

Section spacing: spacing-6 to spacing-8

Inline spacing (between elements): spacing-2 to spacing-3

Tailwind Usage
tsx
// Card padding
<div className="p-4">

// Vertical spacing between sections
<div className="space-y-6">

// Button padding
<button className="px-4 py-2">
5. Component Library
Component: Button
Purpose: Primary and secondary actions

Variants:

Primary Button (Add Bookmark)

tsx
<button 
  className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 
             text-white font-medium px-4 py-2 rounded-md 
             transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={!isValid}
>
  Add Bookmark
</button>
Secondary Button (Cancel)

tsx
<button 
  className="bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 
             text-neutral-900 font-medium px-4 py-2 rounded-md 
             transition-colors"
>
  Cancel
</button>
Danger Button (Delete)

tsx
<button 
  className="bg-red-500 hover:bg-red-600 active:bg-red-700 
             text-white font-medium px-4 py-2 rounded-md 
             transition-colors"
>
  Delete
</button>
Icon Button (Delete icon only)

tsx
<button 
  className="text-red-500 hover:text-red-600 active:text-red-700 
             p-2 rounded-md hover:bg-red-50 transition-colors"
  aria-label="Delete bookmark"
>
  <TrashIcon className="w-5 h-5" />
</button>
Accessibility:

Disabled state visible (opacity-50)

Focus ring: focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2

Aria-label for icon-only buttons

Component: Input Field
Purpose: Text input for URL and title

Variants:

Default State

tsx
<input
  type="text"
  placeholder="https://example.com"
  className="w-full px-4 py-2 border border-neutral-200 rounded-md 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
             text-neutral-900 placeholder:text-neutral-400"
/>
Error State

tsx
<input
  type="text"
  className="w-full px-4 py-2 border-2 border-red-500 rounded-md 
             focus:outline-none focus:ring-2 focus:ring-red-500
             text-neutral-900"
/>
<p className="text-sm text-red-500 mt-1">Please enter a valid URL</p>
Success State (optional feedback)

tsx
<input
  type="text"
  className="w-full px-4 py-2 border-2 border-green-500 rounded-md 
             focus:outline-none focus:ring-2 focus:ring-green-500
             text-neutral-900"
/>
Accessibility:

Associated label: <label htmlFor="url">URL</label>

Error message: aria-describedby="url-error"

Required fields: required attribute

Component: Bookmark Card
Purpose: Display single bookmark with title, URL, and delete action

Structure:

tsx
<div className="bg-white border border-neutral-200 rounded-lg p-4 
                hover:shadow-md transition-shadow">
  <div className="flex items-start justify-between gap-4">
    <div className="flex-1 min-w-0">
      <h3 className="text-base font-medium text-neutral-900 truncate">
        {bookmark.title}
      </h3>
      <a 
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-500 hover:underline break-all"
      >
        {bookmark.url}
      </a>
      <p className="text-xs text-neutral-500 mt-2">
        {formatDate(bookmark.created_at)}
      </p>
    </div>
    <button
      onClick={handleDelete}
      className="text-red-500 hover:text-red-600 p-2 rounded-md 
                 hover:bg-red-50 transition-colors flex-shrink-0"
      aria-label={`Delete ${bookmark.title}`}
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  </div>
</div>
States:

Default: White background, subtle border

Hover: Elevated shadow

Deleting: Fade-out animation (opacity-0, transition)

Component: Empty State
Purpose: Show when user has no bookmarks yet

tsx
<div className="text-center py-12">
  <svg 
    className="w-24 h-24 mx-auto text-neutral-300 mb-4"
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor"
  >
    {/* Bookmark icon */}
  </svg>
  <h3 className="text-lg font-medium text-neutral-900 mb-2">
    No bookmarks yet
  </h3>
  <p className="text-sm text-neutral-600">
    Add your first bookmark using the form above
  </p>
</div>
Component: Loading State
Purpose: Show while fetching bookmarks

tsx
<div className="space-y-4">
  {[1, 2, 3].map(i => (
    <div key={i} className="bg-neutral-100 rounded-lg p-4 animate-pulse">
      <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
    </div>
  ))}
</div>
Component: Header/Navbar
Purpose: Show user info and logout

tsx
<header className="bg-white border-b border-neutral-200">
  <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
    <h1 className="text-xl font-semibold text-neutral-900">
      Smart Bookmarks
    </h1>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <img 
          src={user.avatar_url} 
          alt={user.name}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm font-medium text-neutral-900">
          {user.name}
        </span>
      </div>
      <button 
        onClick={handleLogout}
        className="text-sm text-neutral-600 hover:text-neutral-900"
      >
        Logout
      </button>
    </div>
  </div>
</header>
6. Layout Guidelines
Page Container
tsx
<main className="min-h-screen bg-neutral-50">
  <Header />
  <div className="max-w-4xl mx-auto px-4 py-8">
    {/* Page content */}
  </div>
</main>
Form Layout (Add Bookmark)
tsx
<form className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
  <h2 className="text-lg font-semibold text-neutral-900 mb-4">
    Add Bookmark
  </h2>
  <div className="space-y-4">
    <div>
      <label htmlFor="url" className="block text-sm font-medium text-neutral-700 mb-1">
        URL
      </label>
      <input id="url" type="url" {...} />
    </div>
    <div>
      <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
        Title
      </label>
      <input id="title" type="text" {...} />
    </div>
    <button type="submit" {...}>
      Add Bookmark
    </button>
  </div>
</form>
Bookmark List Layout
tsx
<div className="space-y-4">
  {bookmarks.map(bookmark => (
    <BookmarkCard key={bookmark.id} bookmark={bookmark} />
  ))}
</div>
7. Responsive Design
Breakpoints (Tailwind defaults)
sm: 640px

md: 768px

lg: 1024px

Mobile-First Approach
tsx
// Stack on mobile, inline on desktop
<div className="flex flex-col md:flex-row gap-4">
  <input className="w-full md:w-2/3" />
  <button className="w-full md:w-auto" />
</div>
Max Width Container
tsx
<div className="max-w-4xl mx-auto px-4">
  {/* Content centered with padding on sides */}
</div>
8. Animation & Transitions
Transition Classes
tsx
// Standard transitions
className="transition-colors duration-200"  // For color changes
className="transition-shadow duration-200"  // For shadow changes
className="transition-opacity duration-300" // For fade in/out
Bookmark Add Animation
tsx
// Slide down from top
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bookmark-enter {
  animation: slideDown 200ms ease-out;
}
Bookmark Delete Animation
tsx
// Fade out and shrink
@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.bookmark-exit {
  animation: fadeOut 200ms ease-in;
}
9. Accessibility Requirements
WCAG 2.1 Level AA Compliance
Color Contrast

Text: 4.5:1 minimum ratio

Large text: 3:1 minimum ratio

Use tools like WebAIM Contrast Checker

Keyboard Navigation

All interactive elements focusable via Tab

Focus indicators visible (ring-2 ring-blue-500)

Logical tab order

Screen Reader Support

Semantic HTML (<button>, <form>, <nav>)

Alt text for images

ARIA labels for icon buttons

Error messages associated with inputs

Focus Management

Focus trap in modals (if confirmation dialogs added)

Return focus after actions

Skip to main content link (optional)

10. Icon System
Library: Heroicons (free, Tailwind-compatible)

bash
npm install @heroicons/react
Usage:

tsx
import { TrashIcon, PlusIcon, BookmarkIcon } from '@heroicons/react/24/outline'

<TrashIcon className="w-5 h-5" />
Common Icons:

TrashIcon: Delete bookmark

PlusIcon: Add bookmark

BookmarkIcon: Empty state, logo

XMarkIcon: Close modal

ExclamationTriangleIcon: Error state