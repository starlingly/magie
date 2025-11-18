# Getting Started with MAGIE - Complete Setup Guide

Don't worry if you're not a coder! Follow these steps exactly and you'll be up and running.

## Part 1: Set Up Supabase (10 minutes)

### Step 1: Create Supabase Account

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign up with your GitHub account (easiest option)

### Step 2: Create Your Project

1. Click **"New Project"**
2. Fill in these fields:
   - **Name**: `magie-companion`
   - **Database Password**: Click "Generate a password" and **SAVE IT SOMEWHERE SAFE** (you might need it later)
   - **Region**: Choose the one closest to you (e.g., "US East" if you're in the US)
3. Click **"Create new project"**
4. Wait 2-3 minutes while it sets up (you'll see a loading screen)

### Step 3: Get Your API Keys

1. When the project is ready, click the **⚙️ Settings** icon on the left sidebar
2. Click **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public**: A very long string starting with `eyJ...`

4. **IMPORTANT**: Copy both of these somewhere safe (a notes app). You'll need them in a minute!

### Step 4: Create Database Tables

1. Click **"SQL Editor"** in the left sidebar (looks like `</>`symbol)
2. Click **"+ New query"**
3. Go to the file `SUPABASE_SETUP.md` in your GitHub repo
4. Copy the entire SQL code (starts with `-- Create primers table` and ends with `EXECUTE FUNCTION update_updated_at_column();`)
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter on Windows, Cmd+Enter on Mac)
7. You should see **"Success. No rows returned"** - that's good!

### Step 5: Configure Email Authentication

**IMPORTANT**: This prevents 404 errors when users confirm their email!

1. In Supabase, click **"Authentication"** in the left sidebar
2. Click **"URL Configuration"**
3. Find the **"Site URL"** field and enter: `https://starlingly.github.io/magie`
   - (Replace `starlingly` with your GitHub username if you forked this repo)
4. Scroll down to **"Redirect URLs"**
5. Click **"Add URL"** and enter the same URL: `https://starlingly.github.io/magie`
6. Click **"Save"** at the bottom

✅ Supabase is now set up!

---

## Part 2: Add Secrets to GitHub (5 minutes)

Now we need to tell GitHub your Supabase keys WITHOUT putting them in your code.

### Step 1: Go to Your GitHub Repository

1. Go to **github.com** and sign in
2. Go to your `magie` repository

### Step 2: Add Secrets

1. Click **"Settings"** tab at the top of your repo
2. On the left sidebar, click **"Secrets and variables"** → **"Actions"**
3. Click the green **"New repository secret"** button

4. Add your first secret:
   - **Name**: `SUPABASE_URL` (type this exactly)
   - **Secret**: Paste the Project URL you saved earlier (the `https://xxxxx.supabase.co` one)
   - Click **"Add secret"**

5. Click **"New repository secret"** again

6. Add your second secret:
   - **Name**: `SUPABASE_ANON_KEY` (type this exactly)
   - **Secret**: Paste the long anon key you saved earlier (the `eyJ...` one)
   - Click **"Add secret"**

You should now see two secrets listed: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

✅ Your secrets are safely stored in GitHub!

---

## Part 3: Set Up GitHub Pages (3 minutes)

### Step 1: Enable GitHub Actions

1. In your repo, click **"Settings"** tab
2. On the left sidebar, click **"Pages"**
3. Under **"Build and deployment"**, find **"Source"**
4. Change it from **"Deploy from a branch"** to **"GitHub Actions"**

That's it! GitHub will now use the workflow file we created.

### Step 2: Commit and Push the Workflow File

The workflow file is already created at `.github/workflows/deploy.yml`. Now we just need to commit it:

1. You should see this file in your changes
2. Commit it with a message like "Add GitHub Actions deployment"
3. Push to your main branch

---

## Part 4: Deploy Your Site (2 minutes)

### Option A: Merge Your Branch (Recommended)

1. Go to your GitHub repo
2. You'll see a notification about your branch - click **"Compare & pull request"**
3. Click **"Create pull request"**
4. Click **"Merge pull request"**
5. Click **"Confirm merge"**

GitHub Actions will automatically deploy your site!

### Option B: Manual Trigger

1. Go to the **"Actions"** tab in your GitHub repo
2. Click on **"Deploy to GitHub Pages"** on the left
3. Click **"Run workflow"** button
4. Select your branch
5. Click the green **"Run workflow"** button

---

## Part 5: Check If It Worked (1 minute)

1. Go to the **"Actions"** tab in your repo
2. You should see a workflow running (yellow dot) or completed (green checkmark)
3. Once it's green, go to your GitHub Pages URL: `https://starlingly.github.io/magie`
4. Try creating an account!

---

## Troubleshooting

### "Failed to fetch" errors
- Check that your secrets in GitHub are named exactly: `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Make sure you copied the full keys (no spaces before/after)

### Workflow fails
- Go to Actions tab → Click on the failed workflow → Read the error message
- Most common issue: Secrets not set correctly

### Can't create account
- Open browser console (F12) and check for errors
- Make sure the workflow ran successfully
- Check that Supabase tables were created (go to Supabase dashboard → Table Editor)

---

## What Happens Next?

Once this is set up:
- Users can create accounts on your MAGIE site
- Their Primers and sessions save to Supabase
- They can access their data from any device/browser
- Everything is secure and private

Your Supabase keys stay SECRET in GitHub and never appear in your public code!

---

## Need Help?

If you get stuck, share:
1. Which step you're on
2. What error message you're seeing (if any)
3. Screenshot if helpful

You've got this! 💜
