---
name: deploy
description: Deploy the app using the last commit. Gathers the last git commit details, verifies it is pushed to GitHub origin, then checks and reports Vercel and Cloudflare deployment/build status for that commit.
---

## What I do
- Get the last commit details: hash, message, author, and date.
- Verify the commit is pushed to GitHub (`origin/main`) and list which remote branches contain it.
- Check the Vercel deployment status for the project (uptodate/error/ready) for that commit.
- Check Cloudflare Pages/deployment status for that commit.
- Report a concise summary of GitHub, Vercel, and Cloudflare state so the user knows what is live.

## When to use me
Use when the user says "deploy", "deploy it", "check deployment", or asks whether the latest changes are live.

## Steps

1. **Get last commit details**
   - Run `git log -1 --format="%H%n%h%n%an <%ae>%n%ad%n%s" --date=iso`
   - Also run `git status -sb` and `git rev-list --left-right --count origin/main...HEAD` to confirm the branch is up to date.

2. **Check GitHub**
   - Confirm the commit exists on origin: `git branch -r --contains <hash>`
   - If the branch is ahead of origin/main, the commit is NOT deployed. Do not proceed to check Vercel/Cloudflare as a deployable state; report "not pushed".

3. **Check Vercel**
   - Run `vercel list` (scoped to the project) to find the latest Production deployment.
   - For a failing deployment, run `vercel inspect <url>` to get details.
   - Attempt `vercel logs <url>` for build logs; if logs are unavailable for errored builds, note that and suggest reproducing the build locally with `npm run build`.

4. **Check Cloudflare**
   - If `wrangler` is available, check `wrangler pages deployment list`. If unavailable, note it.

5. **Report**
   - Summarize: last commit (hash, message), GitHub push state, Vercel build state (Ready/Error), Cloudflare state.
   - If any build is ERRORS/Error, mention it and offer to investigate the failure.

## Notes
- The project is a Next.js (16.x) app at `the-curve-work-activities-app` on Vercel. Do not confuse it with `the-curve-attendance`.
- Never create or force a commit just to trigger a deploy unless the user explicitly asks.
- Bind to the Supabase project `pxofmqorcpbnwapnzjkv` if any env/SQL work is needed; never touch `mjgneisuyrlvvcjtdaaz`.