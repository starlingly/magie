# Deploying MAGIE Companion to GitHub Pages

## Quick Setup (5 minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository: `https://github.com/starlingly/claude`
2. Click **Settings** (top menu)
3. Scroll down the left sidebar and click **Pages**
4. Under "Source", select:
   - **Branch:** `claude/elliott-feature-011CV4QA5bCPH1KvVf3JxhJr` (or merge to main first and use main)
   - **Folder:** `/projects/project-MAGIE`
5. Click **Save**
6. Wait 1-2 minutes for deployment

### Step 2: Find Your Live URL

After saving, GitHub will show you the URL. It will be something like:

```
https://starlingly.github.io/claude/projects/project-MAGIE/MAGIE-Companion-Standalone.html
```

Or if you want the shorter multi-file version:
```
https://starlingly.github.io/claude/projects/project-MAGIE/
```

### Step 3: Test It

1. Click the URL GitHub gives you
2. The site should load!
3. Try going through the flow to make sure everything works

---

## Alternative: Merge to Main First (Recommended)

If you want a cleaner setup:

1. Merge your feature branch to `main`
2. Then set GitHub Pages to use `main` branch
3. Your URL will be the same but coming from main

---

## Troubleshooting

**If the page doesn't load:**
- Wait a few more minutes (first deploy can take 2-5 minutes)
- Check that you selected the right branch and folder
- Make sure the branch has the files committed (it does!)

**If you see a 404:**
- The full URL includes the filename: `.../MAGIE-Companion-Standalone.html`
- Or use the folder path and it will load `index.html` automatically

---

## What Happens Next

- Every time you push to the selected branch, the site auto-updates
- It's hosted on GitHub's servers (free forever)
- HTTPS is automatic
- You can share the URL immediately

---

## Optional: Custom Domain

If you want `magiecompanion.com` instead of the GitHub URL:
1. Buy a domain (~$12/year from Namecheap, Google Domains, etc.)
2. Add a `CNAME` file to your repo with the domain
3. Configure DNS settings
4. GitHub will handle HTTPS automatically

But the GitHub URL works perfectly fine for now!

---

Your site will be live at:
**https://starlingly.github.io/claude/projects/project-MAGIE/MAGIE-Companion-Standalone.html**

(or the shorter version once you visit the settings page and see what GitHub gives you)
