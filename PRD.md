Document 1: PRD.md (Product Requirements Document)
1. Product Overview
Project Title: Smart Bookmark Manager

Version: 1.0

Last Updated: February 16, 2026

Owner: Development Team

2. Problem Statement
Users need a simple, real-time bookmark manager that allows them to save and organize URLs across multiple browser sessions without the complexity of traditional bookmark systems. Current solutions lack real-time synchronization and require manual page refreshes to see updates, creating a fragmented experience when working across multiple tabs or devices.
​

3. Goals & Objectives
Business Goals
Launch MVP within 72 hours with core bookmark management functionality
​

Achieve working production deployment on Vercel

Demonstrate technical proficiency in Next.js and Supabase integration

User Goals
Quickly save and organize bookmarks with titles and URLs

Access personal bookmarks from any browser tab instantly

Maintain privacy with user-specific bookmark collections

4. Success Metrics
User Registration Success Rate: >90% successful Google OAuth sign-ins

Real-time Sync Latency: <500ms for bookmark updates across tabs

Uptime: 99%+ availability on Vercel deployment

User Engagement: Average 5+ bookmarks created per user within first session

5. Target Users & Personas
Primary Persona: Alex - The Organized Professional
Demographics: 25-40 years old, knowledge worker, tech-savvy

Pain Points:

Browser bookmarks are cluttered and disorganized

Loses important links when switching devices

Existing bookmark tools are too complex

Goals: Quick access to frequently visited sites, organized personal collection

Technical Proficiency: High - comfortable with modern web apps

Secondary Persona: Sarah - The Research Student
Demographics: 18-25 years old, student, moderate tech skills

Pain Points:

Needs to save research materials quickly

Works across multiple browser tabs simultaneously

Wants simple organization without complicated folder structures

Goals: Save research links efficiently, access from library and dorm

Technical Proficiency: Moderate - uses common web applications

6. Features & Requirements
Must-Have Features (P0)
1. Google OAuth Authentication

Description: Users authenticate using Google OAuth 2.0 without traditional email/password

User Story: As a user, I want to sign up and log in using my Google account so that I can access the app securely without creating another password

Acceptance Criteria:

 "Sign in with Google" button displayed on landing page

 OAuth flow redirects to Google authentication

 Successful authentication creates user session

 User profile data (name, email, avatar) retrieved from Google

 Failed authentication shows clear error message

Success Metric: >90% authentication success rate

2. Add Bookmark

Description: Logged-in users can create bookmarks with URL and title

User Story: As a logged-in user, I want to add a bookmark with a URL and title so that I can save important links for later access

Acceptance Criteria:

 Add bookmark form visible only to authenticated users

 URL input field with validation (valid URL format)

 Title input field (required, max 100 characters)

 Submit button disabled until both fields valid

 Success confirmation after bookmark creation

 New bookmark appears in list immediately

Success Metric: <3 seconds average time to add bookmark

3. Private Bookmark Collections

Description: Each user sees only their own bookmarks

User Story: As a user, I want my bookmarks to be private so that other users cannot see my saved links

Acceptance Criteria:

 Database queries filter by authenticated user ID

 Bookmarks table has user_id foreign key

 API endpoints verify user ownership

 Unauthorized access returns 403 error

 User A cannot access User B's bookmarks via API

Success Metric: Zero unauthorized bookmark access incidents

4. Real-time Updates

Description: Bookmark changes reflect across all open tabs without page refresh

User Story: As a user with multiple tabs open, I want to see bookmark updates in all tabs automatically so that I don't have to manually refresh pages

Acceptance Criteria:

 Supabase Realtime subscription established on component mount

 New bookmark appears in all user's tabs within 500ms

 Deleted bookmark disappears from all tabs immediately

 Updated bookmark reflects changes in all tabs

 Realtime connection handles network interruptions gracefully

Success Metric: <500ms sync latency across tabs

5. Delete Bookmark

Description: Users can remove their own bookmarks

User Story: As a user, I want to delete bookmarks I no longer need so that I can keep my collection organized

Acceptance Criteria:

 Delete button/icon visible for each bookmark

 Confirmation prompt before deletion (optional but recommended)

 Bookmark removed from database

 Bookmark removed from UI immediately

 Real-time update removes bookmark from all tabs

 Cannot delete other users' bookmarks

Success Metric: <2 seconds average deletion time

6. Vercel Deployment

Description: Application deployed on Vercel with working live URL

User Story: As a stakeholder, I want the app deployed on Vercel so that I can access and test it via a public URL

Acceptance Criteria:

 Next.js app builds successfully on Vercel

 Environment variables configured in Vercel dashboard

 Supabase connection works in production

 OAuth callback URLs configured for production domain

 HTTPS enabled by default

 Live URL accessible and functional

Success Metric: 99%+ uptime

Should-Have Features (P1)
None for MVP - focus on core functionality within 72-hour timeframe

Nice-to-Have Features (P2)
Search bookmarks by title or URL

Edit bookmark title/URL

Tag/categorize bookmarks

Sort bookmarks (date, alphabetical)

Bookmark folders/collections

Export bookmarks to file

Browser extension integration

7. Explicitly OUT OF SCOPE
User profile editing (beyond Google-provided data)

Password authentication (Google OAuth only)

Bookmark sharing between users

Public bookmark collections

Mobile native apps (web-only)

Bookmark import from browser

Rich text notes on bookmarks

Bookmark preview/thumbnails

Analytics dashboard

Third-party integrations (Pocket, Instapaper, etc.)

8. User Scenarios
Scenario 1: First-Time User Registration
Context: New user visits app for first time

Steps:

User navigates to landing page

User clicks "Sign in with Google" button

Google OAuth consent screen appears

User grants permissions

User redirected back to app

App creates user record in database

User sees empty bookmark dashboard

Expected Outcome: User successfully authenticated and sees empty state with prompt to add first bookmark

Edge Cases:

User cancels OAuth → Returns to landing page with message

OAuth fails → Shows error with retry option

User already registered → Logs in to existing account

Scenario 2: Adding Multiple Bookmarks Across Tabs
Context: User has app open in two browser tabs

Steps:

Tab A: User adds bookmark "GitHub" with URL

Tab A: Bookmark appears in list

Tab B: Bookmark appears automatically without refresh

Tab B: User adds bookmark "Stack Overflow"

Tab A: New bookmark appears automatically

Expected Outcome: Both tabs show identical bookmark lists with real-time synchronization

Edge Cases:

Network disconnection → Queue changes, sync when reconnected

Tab B closed during Tab A add → Tab B shows update on reopen

Simultaneous adds → Both bookmarks saved, no conflicts

Scenario 3: Bookmark Management
Context: User wants to clean up bookmark collection

Steps:

User views bookmark list (10 items)

User clicks delete icon on outdated bookmark

Confirmation prompt appears (optional)

User confirms deletion

Bookmark removed from list immediately

All other open tabs reflect deletion

Expected Outcome: Bookmark successfully deleted, UI updated across all tabs

Edge Cases:

Delete fails → Shows error, bookmark remains

User cancels confirmation → No action taken

Bookmark already deleted in another tab → Shows "already deleted" message

9. Dependencies & Constraints
Technical Constraints
Must use Next.js App Router (not Pages Router)
​

Authentication limited to Google OAuth only (no email/password)
​

Supabase must handle Auth, Database, and Realtime
​

Deployment restricted to Vercel platform
​

Must use Tailwind CSS for styling
​

Business Constraints
Timeline: 72-hour development deadline
​

Budget: Free tier services (Supabase free, Vercel hobby)

Team: Single developer build

External Dependencies
Supabase: Database, authentication, real-time subscriptions

Google OAuth: Identity provider for authentication

Vercel: Hosting and deployment platform

10. Timeline & Milestones
Hour 0-8: Setup (Next.js project, Supabase, Google OAuth)

Hour 8-24: Authentication implementation and testing

Hour 24-48: Bookmark CRUD + Real-time functionality

Hour 48-60: UI polish with Tailwind CSS

Hour 60-68: Vercel deployment and testing

Hour 68-72: Bug fixes, README documentation, final submission

11. Risks & Assumptions
Risks
OAuth Configuration Complexity: Mitigation → Follow Supabase OAuth documentation precisely

Real-time Performance: Mitigation → Test with multiple tabs early, implement connection monitoring

Vercel Environment Variables: Mitigation → Document all required env vars, test production build locally first

72-Hour Time Constraint: Mitigation → Focus strictly on P0 features, no scope creep

Assumptions
Developer has Next.js and Supabase experience

Google OAuth credentials can be obtained within timeline

Vercel deployment will be straightforward

No unexpected Supabase API breaking changes during development

12. Non-Functional Requirements
Performance
Initial page load: <3 seconds

Bookmark add/delete: <2 seconds

Real-time sync: <500ms latency

Supports 10+ concurrent tabs per user

Security
HTTPS only in production

OAuth tokens stored in HTTP-only cookies

Row-level security in Supabase database

No sensitive data in client-side storage

CORS configured for production domain only

Accessibility
Semantic HTML elements

Keyboard navigation support

Focus indicators visible

Alt text for icons

ARIA labels for interactive elements

Scalability
Database designed for 1000+ bookmarks per user

Efficient queries with proper indexing

Real-time subscriptions filtered by user