import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:8080/api';
const APP = 'http://127.0.0.1:30401';
const USER = { email: 'qa-author@example.com', password: 'webqa-demo-1' };

// MAINT: the home route redirects with query params (e.g. /?limit=10&offset=0 per the app map),
// so an exact-string waitForURL(APP + '/') never matches and hangs until timeout.
const HOME_URL_PATTERN = new RegExp(`^${APP.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(\\?.*)?$`);

async function apiLogin(request: any, email: string, password: string): Promise<string> {
  const res = await request.post(`${API}/users/login`, {
    data: { user: { email, password } },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.user.token; // RealWorld: JWT lives at user.token
}

test('TC-G7: deleting an article redirects home and removes it everywhere', async ({ page, request }) => {
  const token = await apiLogin(request, USER.email, USER.password);

  const title = `QA-${Date.now()}`;
  const createRes = await request.post(`${API}/articles`, {
    headers: { Authorization: `Token ${token}` },
    data: {
      article: {
        title,
        description: 'QA delete test article',
        body: 'Body content for QA delete test',
        tagList: [],
      },
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  const slug: string = created.article.slug;

  let deleted = false;
  try {
    // Plant the token before any app code runs — the SPA reads it on boot.
    await page.addInitScript((t) => {
      window.localStorage.setItem('realworld-auth-token', t);
    }, token);

    await page.goto(`${APP}/article/${slug}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    // MAINT: RealWorld renders "Delete Article" twice (top banner + bottom actions bar) — disambiguate with .first()
    await page.getByRole('button', { name: 'Delete Article' }).first().click();
    deleted = true;

    await page.waitForURL(HOME_URL_PATTERN, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(HOME_URL_PATTERN);
    await expect(page.getByText(title)).not.toBeVisible();

    await page.goto(`${APP}/article/${slug}`, { waitUntil: 'domcontentloaded' });
    // MAINT: the SPA shows its error boundary for a deleted article, not the /404 page
    await expect(page.getByText('Could not load article')).toBeVisible();
  } finally {
    if (!deleted) {
      await request.delete(`${API}/articles/${slug}`, {
        headers: { Authorization: `Token ${token}` },
      });
    }
  }
});