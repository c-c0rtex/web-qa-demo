# Article Lifecycle — Create, View, Comment, Favorite, Delete

## TC-G1 — Verify signed-in state on home page
**Type:** passive
**Steps:**
1. Navigate to `/?limit=10&offset=0`.
2. Observe the navigation bar.
**Expected:**
- Navigation bar shows "New Article", "Settings", and "qa-author qa-author" links (signed-in state).
- Heading "conduit" and the "Global Feed" tab are visible.

## TC-G2 — Create a new article via the editor
**Type:** mutating
**Steps:**
1. Navigate to `/editor`.
2. Fill in "Article Title", "What's this article about?", "Write your article (in markdown)", and "Enter tags" with test data.
3. Click "Publish Article".
**Expected:**
- The app navigates to the new article's page (`/article/{slug}`) showing the entered title, body, and tag.
- The author byline shows "qa-author".

## TC-G3 — New article appears in the Global Feed
**Type:** passive
**Steps:**
1. Navigate to `/?limit=10&offset=0`.
2. Confirm the "Global Feed" tab is selected.
**Expected:**
- The article created in TC-G2 is listed with its title, tag, and author "qa-author".

## TC-G4 — New article appears on its own article page
**Type:** passive
**Steps:**
1. From the Global Feed, click the title of the article created in TC-G2.
**Expected:**
- The article page displays the same title, body, and tag entered during creation.
- Author "qa-author" and a "Delete Article" button are visible.

## TC-G5 — Reader adds a comment on the article
**Type:** mutating
**Role:** reader
**Steps:**
1. Sign in as reader and navigate to the article page created in TC-G2.
2. Enter text in the comment textbox.
3. Click "Post Comment".
**Expected:**
- The new comment appears in the comments list with the reader's username and the entered text.

## TC-G6 — Reader favorites the article
**Type:** mutating
**Role:** reader
**Steps:**
1. Sign in as reader and navigate to the article page created in TC-G2.
2. Click the "Favorite Article" button.
**Expected:**
- The favorite button switches to its "favorited" state and the favorites count increments by 1.
- Reloading the page shows the article still marked as favorited.

## TC-G7 — Author deletes the article
**Type:** mutating
**Steps:**
1. Sign in as qa-author and navigate to the article page created in TC-G2.
2. Click "Delete Article".
**Expected:**
- The app redirects to the home page `/`.
- The article no longer appears in the Global Feed.
- Navigating directly to the article's former URL shows the "Could not load article" error state.
