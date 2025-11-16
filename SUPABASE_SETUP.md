# Supabase Setup for MAGIE Companion

This guide will help you set up Supabase for user authentication and data storage.

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" (free, no credit card required)
3. Sign up with GitHub (recommended) or email

## Step 2: Create New Project

1. Click "New Project"
2. Choose an organization (or create one)
3. Fill in project details:
   - **Name:** `magie-companion` (or your choice)
   - **Database Password:** Generate a strong password and **save it somewhere safe**
   - **Region:** Choose closest to your users (e.g., US East, EU West)
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 3: Get Your API Keys

1. In your Supabase dashboard, click the **Settings** icon (gear) in the sidebar
2. Go to **API** section
3. You'll see two important values:
   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...` (long string)
4. **Keep these handy** - you'll need them in the next step

## Step 4: Set Up Database Tables

1. In Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **New Query**
3. Copy and paste this SQL code:

```sql
-- Create primers table
CREATE TABLE primers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  intro TEXT,
  themes JSONB DEFAULT '[]'::jsonb,
  themes_other TEXT,
  style JSONB DEFAULT '[]'::jsonb,
  communication TEXT,
  goals TEXT,
  selected_ai TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  show_crisis_banner BOOLEAN DEFAULT true,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE primers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies so users can only access their own data

-- Primers policies
CREATE POLICY "Users can view their own primers"
  ON primers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own primers"
  ON primers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own primers"
  ON primers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own primers"
  ON primers FOR DELETE
  USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_primers_updated_at
  BEFORE UPDATE ON primers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. Click **Run** (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned"

## Step 5: Configure Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Scroll down to **Email Templates** if you want to customize signup/reset emails (optional)

## Step 6: Add Your API Keys to GitHub Secrets

**IMPORTANT**: Don't put your keys directly in the code! Instead, add them as GitHub Secrets:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add `SUPABASE_URL` with your Project URL from Step 3
5. Add `SUPABASE_ANON_KEY` with your anon key from Step 3

The GitHub Actions workflow will automatically inject these into your site when it deploys.

See **GETTING_STARTED.md** for detailed step-by-step instructions.

## Step 7: Test It Out

1. Open your MAGIE site
2. Try creating an account
3. Build your primer
4. Sign out and sign back in
5. Your data should persist!

## Security Notes

- Your Supabase keys are stored as GitHub Secrets and automatically injected during deployment
- The `anon` key is protected by Row Level Security (RLS) - users can only access their own data
- All connections use HTTPS encryption
- User data is isolated and private

## Troubleshooting

**"Failed to fetch" errors:**
- Check that your Supabase URL and anon key are correct
- Make sure your project is active in Supabase dashboard

**Can't sign up/sign in:**
- Check Authentication is enabled in Supabase
- Check browser console for error messages

**Data not saving:**
- Verify SQL tables were created successfully
- Check RLS policies are in place
- Look at browser console for errors

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
