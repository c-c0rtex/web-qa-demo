import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:8080/api';
const APP = 'http://127.0.0.1:30401';
const USER = { email: 'qa-author@example.com', password: 'webqa-demo-1' };

async function apiLogin(request: any, email: string, password: string): Promise<string> {
  const res = await request.post(`${API}/users/login`, {
    data: { user: { email, password } },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.user.token;
}

test('TC-G2: create a new article via the editor', async ({ page, request }) => {
  // MAINT: multi-step flow (API login + navigate + fill + publish + verify + cleanup)
  // exceeded the default 30s test timeout with no single failing step; give it headroom.
  test.slow();

  const token = await apiLogin(request, USER.email, USER.password);
  await page.addInitScript((t) => {
    window.localStorage.setItem('realworld-auth-token', t);
  }, token);

  const title = `QA-${Date.now()}`;
  const description = 'QA test article description';
  const body = 'QA test article body written in markdown.';
  const tag = 'qa-tag';
  const expectedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  let slug: string | null = null;

  try {
    await page.goto(APP + '/editor', { waitUntil: 'domcontentloaded' });

    await page.getByRole('textbox', { name: 'Article Title' }).fill(title);
    await page.getByRole('textbox', { name: "What's this article about?" }).fill(description);
    await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill(body);
    await page.getByRole('textbox', { name: 'Enter tags' }).fill(tag);

    await page.getByRole('button', { name: 'Publish Article' }).click();

    await page.waitForURL(/\/article\//, { timeout: 20000 });

    const url = page.url();
    const match = url.match(/\/article\/([^/?#]+)/);
    slug = match ? decodeURIComponent(match[1]) : null;
    expect(slug).toBeTruthy();
    expect(slug).toContain(expectedSlug);

    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.getByText(body)).toBeVisible();
    await expect(page.getByText(tag)).toBeVisible();
    await expect(page.getByRole('link', { name: 'qa-author' }).first()).toBeVisible();
  } finally {
    if (slug) {
      const delRes = await request.delete(`${API}/articles/${slug}`, {
        headers: { Authorization: `Token ${token}` },
      });
      expect([200, 204, 404]).toContain(delRes.status());
    }
  }
});