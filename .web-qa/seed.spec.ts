// Human-verified seed spec for the RealWorld demo — spec-gen reuses these auth/setup
// patterns verbatim. The SPA keeps its JWT in localStorage ('realworld-auth-token'),
// so the token must be planted BEFORE the app boots (addInitScript), not after goto.
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
  return body.user.token; // RealWorld: JWT lives at user.token
}

test('seed: authenticated home shows the personal feed', async ({ page, request }) => {
  const token = await apiLogin(request, USER.email, USER.password);
  // Plant the token before any app code runs — the SPA reads it on boot.
  await page.addInitScript((t) => {
    window.localStorage.setItem('realworld-auth-token', t);
  }, token);

  await page.goto(APP + '/', { waitUntil: 'domcontentloaded' });
  // Authenticated nav shows the username instead of Sign in/Sign up
  await expect(page.getByRole('link', { name: 'qa-author' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Your Feed' })).toBeVisible();
});
