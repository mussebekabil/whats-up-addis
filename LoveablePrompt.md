# Lovable UI Generation Prompt — What's Up Addis

Build a modern event discovery web app called **"What's Up Addis"** — a platform for finding, creating, and managing events in Addis Ababa, Ethiopia. Use **Next.js App Router**, **TypeScript**, and **Tailwind CSS**. No component library — use plain Tailwind with custom components. Font: Inter.

---

## Brand & Colors

Primary color is green. Use this custom Tailwind palette:
rgb(250, 250, 249)
rgb(250, 207, 159)
rgb(25, 27, 29)
rgb(255, 97, 35)
rgb(13, 13, 13)

Come up with good modern fonts that match the above color palate and minimalist edgy design

Support full **dark mode** using Tailwind's `dark:` variant. All cards, inputs, and backgrounds should have dark mode variants.

---

## Layout & Navigation

**Desktop Navbar (sticky top):**

- Left: logo "What's Up Addis" linking to `/`
- Center links: Events (`/events?filter=upcoming`), Categories (`/categories`), Manage Events (`/admin/events`, admin only), Create Event (`/events/create`, admin only, styled as a green primary button)
- Right: Login + Sign Up buttons (unauthenticated) OR user avatar circle showing initials with a dropdown (authenticated)
- Dropdown shows: user full name, email, "View Profile" link, "Manage Events" link (admin only), red "Sign Out" button

**Mobile Navigation (fixed bottom bar):**

- 5 tabs with icon + label: Home (house), Events (calendar), Categories (grid), Create (plus, admin only), Profile (user avatar)
- Active tab highlighted with primary color
- Profile tab opens dropdown above the bar when logged in

**Footer:** Full-width `primary-600` background, white text, copyright line with auto-updating year, tagline "Discover events happening in Addis Ababa."

---

## Data Types

```ts
type Event = {
  id: string;
  title: string;
  description: string;
  location?: string;
  venue?: string;
  startDate: string;
  endDate?: string;
  price?: number;
  imageUrl?: string;
  videoUrl?: string;
  sourceUrl?: string;
  tags: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  category: { id: string; name: string; slug: string };
  creator: { id: string; name: string; email: string };
  createdAt: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ORGANIZER' | 'MODERATOR' | 'SUPPORT' | 'ADMIN';
  createdAt: string;
};

type Comment = {
  id: string;
  content: string;
  user: { id: string; name: string };
  createdAt: string;
  likeCount: number;
  replies: Comment[];
};

type Rating = { average: number; total: number; userRating?: number };
```

---

## Pages

### `/` — Home

- **Hero section**: Large heading "Discover Events in Addis Ababa", subtext, two CTA buttons: "Browse Events" (primary green, outlined) and "Create Event" (solid green, admin only)
- **Upcoming Events section**: "Upcoming Events" heading + grid of 6 EventCards (2 cols mobile, 3 cols desktop)
- **Featured Events section**: "Featured Events" heading + grid of 3 EventCards for events that have a `videoUrl`
- **Browse by Category section**: Grid of CategoryCards (2 cols mobile, 3 cols desktop)
- Each section has a loading skeleton state and an error state

### `/events` — Events Listing

- Page heading + description
- Filter tabs: "All Events" | "Upcoming" | "Past" — active tab has primary color underline/background
- Grid of 12 EventCards (2 cols mobile, 3 cols tablet, 4 cols desktop)
- Pagination: Previous / Next buttons, current page / total pages, first/last buttons, ellipsis for large ranges
- Empty state: icon + "No events found. Be the first to create one!" with CTA button

### `/events/[id]` — Event Detail

- "← Back to Events" link
- Admin-only action buttons top right: "Edit" (outline), "Duplicate" (outline), "Delete" (red outline)
- **Two-column layout on desktop** (sticky left column for media, scrollable right for details):
  - **Left**: Video player (autoplay, muted, loop, controls) OR image. On mobile, media sits above content.
  - **Right**:
    - Category badge (primary color pill) + Price badge ("Free" in green or "$X" in blue) side by side
    - Event title (large, bold)
    - Details grid (2 cols): Start Date (calendar icon), End Date (calendar icon), Venue (building icon), Location (pin icon) — each as a labeled field
    - "About This Event" section with description
    - Tags row (if any): small gray pill badges
    - Source URL link (hidden for Telegram sources unless admin)
- Below the two-column section: **EventEngagement** (ratings + comments — see component below)
- **Delete confirmation modal**: overlay, warning icon, "Delete Event" title, message with event title, Cancel + red Delete buttons

### `/events/create` and `/events/[id]/edit` — Event Form

- Requires authentication (redirect to login otherwise)
- Page title: "Create New Event" / "Duplicate Event" / "Edit Event"
- Form fields (all in a single-column max-w-2xl centered card):
  - Title (text, required)
  - Description (textarea 5 rows, required)
  - Location (text, optional)
  - Venue (text, optional)
  - Start Date & Time (datetime-local, required)
  - End Date & Time (datetime-local, optional)
  - Category (select dropdown, required)
  - Price (number with step 0.01, optional, placeholder "0.00 = Free")
  - Image upload: file button (JPEG/PNG/WebP, max 5MB) + OR divider + URL text input + preview thumbnail + remove button + upload progress bar
  - Video upload: file button (MP4/MOV/AVI/WebM, max 50MB) + OR divider + URL text input + video preview + remove button + upload progress bar
  - Source URL (url input, optional)
  - Tags (text input, placeholder "music, art, outdoor — comma separated", optional)
- Bottom: Cancel (outline) + Submit (primary green) buttons

### `/categories` — Categories

- "Event Categories" heading
- Grid of CategoryCards (1 col mobile, 2 col tablet, 3 col desktop)
- Empty state

### `/categories/[slug]` — Category Events

- "← Back to Home" link
- Category name heading + description
- Grid of 12 EventCards
- Pagination
- Empty state: "No events in this category yet." + "Browse all events" link

### `/profile` — User Profile (auth required)

- Centered card, max-w-md
- Avatar circle (initials, primary-600 background, white text, large)
- User full name (heading), email (subtext)
- "Account Information" section with labeled rows:
  - Full Name
  - Email Address
  - Role badge (colored pill: ADMIN=red, MODERATOR=blue, ORGANIZER=green, others=gray)
  - Member Since (formatted date)
- Red "Sign Out" button at bottom

### `/auth/login` — Login

- Centered card, max-w-md
- "Welcome Back" heading
- Email input
- Password input
- Error alert (red box with icon)
- "Sign In" submit button (full width, primary green, loading spinner state)
- "Don't have an account? Sign up" link

### `/auth/register` — Register

- Centered card, max-w-md
- "Create Account" heading
- Full Name input
- Email input
- Password input (min 8 chars)
- Confirm Password input
- Client-side validation: passwords must match, minimum length shown inline
- Error alert
- "Create Account" submit button (full width, primary green, loading spinner state)
- "Already have an account? Sign in" link

### `/admin/events` — Admin Event Management (ADMIN only)

- Redirect to home if not ADMIN
- "Event Management" heading
- Status filter tab buttons: "Pending" (yellow active), "Accepted" (green active), "Rejected" (red active) — currently active tab highlighted
- **Table** with columns: Event title+location (combined cell), Category, Start Date, Creator, Status badge, Actions
  - Sortable columns (Title, Category, Date, Creator) with ↑↓ sort icons
  - Status badges: yellow pill "Pending", green pill "Accepted", red pill "Rejected"
  - Action buttons (small, outline): "Accept" (green, hidden if already accepted), "Reject" (red, hidden if already rejected), "Reset" (gray, shown if not pending)
  - Clicking a row opens the EventDetailsDialog modal
- Pagination: Previous / Next + "Page X of Y"
- Loading and error states

---

## Existing Reusable Components

### EventCard

- Rounded card with hover shadow transition
- Top media area (fixed height ~160px): video (autoplay, muted, loop) OR image (object-cover) OR gray placeholder
- Content area:
  - Row: Category badge (primary-100 text-primary-800 pill) + Price badge (blue pill if paid, green pill "Free")
  - Title (semibold, 2-line clamp)
  - Description (gray, 2-line clamp)
  - Start date with calendar icon (small, gray)
  - Venue with location pin icon (small, gray, 1-line clamp)
- Full card is a clickable link to `/events/[id]`
- Dark mode variants for all background/text colors

### CategoryCard

- Rounded card, hover effect
- Category name (bold)
- Description (gray, 2-line clamp, shown if present)
- "View events →" link in primary color
- Clickable link to `/categories/[slug]`

### EventEngagement (Ratings + Comments)

**Ratings section:**

- Star display: 5 stars showing average (support half-star filled), total count, e.g. "4.2 (38 ratings)"
- Interactive star rating (1–5) for logged-in users — hoverable + clickable, shows user's existing rating
- "Please log in to rate this event" for unauthenticated users

**Comments section:**

- Comment count heading
- Textarea + "Post Comment" button (auth required — show "Please log in to comment" otherwise)
- Comment list:
  - Each comment: user initial avatar circle, user name (bold), relative timestamp (gray), comment content
  - Below each comment: Like button (heart icon + count), Reply button
  - Nested replies (indented, same structure, max 1 level of nesting)
  - Delete button (trash icon) — visible only to comment owner or ADMIN
  - Like button toggles liked/unliked state
- Comment delete confirmation modal: overlay, "Delete Comment" title, Cancel + Delete buttons
- Empty state: "No comments yet. Be the first to comment!"

### EventDetailsDialog (Admin modal)

- Full-screen overlay with semi-transparent black background
- Large centered scrollable card, max-w-2xl
- Sticky header: event title + X close button
- Event media (video or image, tall aspect ratio)
- Status badge (large pill)
- 2-column details grid: Category, Price, Start Date, End Date, Location, Venue, Creator
- "Description" section with full text
- Tags row (pills)
- Source URL link
- Bottom action buttons: "Accept" (green), "Reject" (red), "Reset to Pending" (gray) — shown conditionally based on current status

## Future Planned Reusable Components

### Search and filter events

- Free text search to find events easily
- Filter components based on event metadata, for example, event category, or happening date

### Static Must visit places

- Places to visit in addis which are opened for visitors in all time

### Blogs section

- Blog to share post event experience by the people attended the event

---

## UX Details

- All buttons have disabled + loading states (spinner icon replaces text, cursor-not-allowed)
- File upload areas show a progress bar (thin, primary color) during upload
- All forms show inline field-level validation errors in red below each field
- All pages have a page-level error alert (red box) and loading spinner
- Images use Next.js `<Image>` with `fill` layout and `object-cover`
- All API calls go through a central `lib/api.ts` that attaches `Authorization: Bearer <token>` header from localStorage
- The app reads auth state from a context/hook (`useAuth`) that exposes `{ user, login, logout, isLoading }`
- Protect admin routes by checking `user?.role === 'ADMIN'` and redirecting otherwise

---

## API Integration

The app connects to an existing Express REST API at `NEXT_PUBLIC_API_URL`. All endpoints are prefixed `/api`. Key endpoints to wire up:

| Method | Endpoint                                                     | Description                      |
| ------ | ------------------------------------------------------------ | -------------------------------- |
| GET    | `/api/events?page=&limit=&filter=&categoryId=&sort=&status=` | Paginated events                 |
| GET    | `/api/events/:id`                                            | Single event                     |
| POST   | `/api/events`                                                | Create event (auth)              |
| PUT    | `/api/events/:id`                                            | Update event (auth)              |
| DELETE | `/api/events/:id`                                            | Delete event (auth)              |
| PATCH  | `/api/events/:id/status`                                     | Change status (admin)            |
| GET    | `/api/categories`                                            | All categories                   |
| GET    | `/api/categories/:slug/events`                               | Events by category               |
| POST   | `/api/auth/login`                                            | Returns `{ token, user }`        |
| POST   | `/api/auth/register`                                         | Returns `{ token, user }`        |
| GET    | `/api/comments/:eventId`                                     | Comments for event               |
| POST   | `/api/comments/:eventId`                                     | Post comment (auth)              |
| DELETE | `/api/comments/:id`                                          | Delete comment (auth)            |
| POST   | `/api/comments/:id/like`                                     | Toggle like (auth)               |
| GET    | `/api/ratings/:eventId`                                      | Ratings for event                |
| POST   | `/api/ratings/:eventId`                                      | Submit rating (auth)             |
| POST   | `/api/upload/image`                                          | Upload image → returns `{ url }` |
| POST   | `/api/upload/video`                                          | Upload video → returns `{ url }` |

---

## File / Folder Structure to Generate

```
app/
  page.tsx
  events/page.tsx
  events/[id]/page.tsx
  events/create/page.tsx
  events/[id]/edit/page.tsx
  categories/page.tsx
  categories/[slug]/page.tsx
  profile/page.tsx
  auth/login/page.tsx
  auth/register/page.tsx
  admin/events/page.tsx
components/
  Navbar.tsx
  Footer.tsx
  EventCard.tsx
  CategoryCard.tsx
  EventEngagement.tsx
  EventDetailsDialog.tsx
  ImageUpload.tsx
  VideoUpload.tsx
lib/
  api.ts
hooks/
  useAuth.ts
```

---

## Notes for Plugging Back into the Existing Next.js Project

1. **`lib/api.ts`** — Replace Lovable's generated version with your existing one, or align the base URL and auth header logic to match.
2. **`useAuth` hook** — Match the shape to your current JWT/localStorage session handling.
3. **Tailwind config** — Add the `primary` color scale to `tailwind.config.ts` in your existing project if not already present.
4. **Images domain** — `next.config.ts` already allows all remote hostnames, so Cloudinary URLs will work without changes.
