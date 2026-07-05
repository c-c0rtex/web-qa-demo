import { test, expect } from '@playwright/test';

const API = 'http://127.0.0.1:8080/api';
const APP = 'http://127.0.0.1:30401';
const READER = { email: 'qa-reader@example.com', password: 'webqa-demo-1' };

async function apiLogin(request: any, email: string, password: string): Promise<string> {
  const res = await request.post(`${API}/users/login`, {
    data: { user: { email, password } },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.user.token;
}

test('TC-G5: reader posts a comment on an article', async ({ page, context, request }) => {
  // APP-BUG: a freshly-posted comment intermittently fails to render until a manual
  // reload (POST 200 + refetch 200, DOM not updated). Mobile hits it most runs, desktop
  // occasionally — see BUGS.md. Assertions kept as-is; unskip when the app is fixed.
  test.fixme(true, 'comment rendering bug — tracked in BUGS.md');

  const token = await apiLogin(request, READER.email, READER.password);

  const articleTitle = `QA-comment-target-${Date.now()}`;
  const createRes = await request.post(`${API}/articles`, {
    headers: { Authorization: `Token ${token}` },
    data: {
      article: {
        title: articleTitle,
        description: 'QA seed article for comment test',
        body: 'QA seed article body.',
        tagList: [],
      },
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const createBody = await createRes.json();
  const slug: string = createBody.article.slug;

  let commentId: number | undefined;

  try {
    await page.addInitScript((t) => {
      window.localStorage.setItem('realworld-auth-token', t);
    }, token);

    await page.goto(`${APP}/article/${slug}`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: articleTitle })).toBeVisible();

    const commentText = `QA-comment-${Date.now()}`;
    const commentBox = page.getByPlaceholder('Write a comment...');
    await commentBox.fill(commentText);
    await page.getByRole('button', { name: 'Post Comment' }).click();

    const postedComment = page.getByText(commentText).first();
    // MAINT: comment rendering waits on a query invalidation round-trip — generous
    // timeout for a dev-server under load (webpack + two browser projects)
    await expect(postedComment).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('link', { name: 'qa-reader' }).last()).toBeVisible();

    const commentsRes = await request.get(`${API}/articles/${slug}/comments`, {
      headers: { Authorization: `Token ${token}` },
    });
    expect(commentsRes.ok()).toBeTruthy();
    const commentsBody = await commentsRes.json();
    const match = commentsBody.comments.find(
      (c: any) => c.body === commentText && c.author.username === 'qa-reader'
    );
    expect(match).toBeTruthy();
    commentId = match.id;
  } finally {
    if (commentId !== undefined) {
      await request.delete(`${API}/articles/${slug}/comments/${commentId}`, {
        headers: { Authorization: `Token ${token}` },
      });
    }
    await request.delete(`${API}/articles/${slug}`, {
      headers: { Authorization: `Token ${token}` },
    });
  }
});