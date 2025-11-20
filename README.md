# MAGIE Companion

An interactive web guide for therapeutic self-exploration with AI.

**MAGIE** = Method of Artificial General Intelligence Engagement™

Created by Starling | Built with Elliott

---

## What Is This?

MAGIE Companion is a web application that helps people practice therapeutic self-exploration using AI. It's not a chatbot itself—it's a companion tool that:

- Guides users through understanding the MAGIE framework
- Helps them build and maintain their "Primer" (their continuity document)
- Provides structure for sessions with their chosen AI
- Tracks their journey over time
- Offers resources and reflection prompts

The app sits *alongside* their chosen AI platform (Claude, ChatGPT, Gemini, etc.) and scaffolds their practice.

---

## Features

### For First-Time Users
- **Guided Onboarding**: Step-by-step introduction to MAGIE
- **Safety Assessment**: Crisis resources and self-assessment
- **Interactive Primer Wizard**: Build your Primer section-by-section with examples
- **AI Platform Guide**: Simple comparison to help choose an AI
- **First Session Walkthrough**: Clear instructions for getting started

### For Returning Users
- **Dashboard**: Quick access to sessions, Primer, and journey tracking
- **Session Prep & Reflection**: Before/after prompts
- **Primer Management**: Edit and update anytime
- **Export Options**: Copy or download Primer as text
- **Resources Library**: Crisis info, journal prompts, platform guides

### Technical Features
- **No Account Required**: Works with browser localStorage (data stays on device)
- **Optional Cloud Sync**: Can be extended for multi-device access
- **Mobile-Responsive**: Works on phone, tablet, or desktop
- **Privacy-First**: No AI conversations stored; users own their data
- **Fast Loading**: Lightweight, no heavy frameworks
- **Accessible**: Keyboard navigation, screen reader support

---

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom styles, CSS Grid, Flexbox
- **Vanilla JavaScript** - No frameworks needed
- **localStorage API** - Client-side data persistence
- **Optional Supabase Sync** - Configure via `config.js` for cloud backups

No build process required for the app itself—just open `index.html` and it works. Development tooling (lint/smoke checks) is available via npm.

---

## File Structure

```
project-MAGIE/
├── index.html          # Main application shell
├── style.css           # Styling for all views
├── app.js              # Application logic & Supabase integration
├── config.example.js   # Template for runtime Supabase credentials
├── scripts/smoke.js    # Lightweight structural smoke test
├── README.md           # This file
└── user-flow.md        # Complete user journey documentation
```

---

## How To Use (Development)

1. **Clone or download** this repository
2. **Open `index.html`** in any modern browser
3. **That's it!** No installation, no build step needed

The app will:
- Initialize localStorage on first visit
- Guide users through onboarding
- Save progress automatically as they work
- Remember returning users

### Configure Supabase (optional)

1. Copy `config.example.js` to `config.js`
2. Fill in your `supabaseUrl` and `supabaseAnonKey`
3. Reload the app. The cloud status banner will confirm whether sync is active or if the app is operating in local-only mode.

> Note: `config.js` is ignored by git so credentials are never committed by accident.

### Run quality checks (optional)

```bash
npm install
npm test   # runs ESLint and a structural smoke test
```

### Debug Tools

Open browser console and use:

```javascript
// View all stored data
MAGIE_Debug.exportData()

// Clear all data (for testing)
MAGIE_Debug.clearData()

// Access storage directly
MAGIE_Debug.storage.getPrimer()
MAGIE_Debug.storage.getSessions()
```

---

## How To Deploy

### Option 1: GitHub Pages (Recommended)

1. Push this folder to a GitHub repository
2. Go to Settings > Pages
3. Select branch and `/projects/project-MAGIE` as root
4. GitHub will provide a URL like: `https://username.github.io/repo-name/`

**Pros**: Free, automatic HTTPS, easy updates
**Cons**: Public repository (or need GitHub Pro for private)

### Option 2: Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Drag the `project-MAGIE` folder to Netlify drop zone
3. Get instant deployment URL
4. Optional: Connect to GitHub for automatic updates

**Pros**: Free, custom domains, form handling
**Cons**: Need account

### Option 3: Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Import from GitHub or upload folder
3. Deploy with one click
4. Get instant URL + automatic HTTPS

**Pros**: Free, fast, excellent performance
**Cons**: Need account

### Option 4: Any Static Host

Upload the `project-MAGIE` folder to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Any web server (Apache, Nginx, etc.)

Just serve the files as static HTML/CSS/JS.

---

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requires**:
- localStorage support (all modern browsers)
- JavaScript enabled
- No Internet Explorer support

---

## Privacy & Data

### What's Stored
- User's Primer data (name, themes, goals, etc.)
- Session logs (timestamps, brief notes)
- Settings (like crisis banner preference)

### Where It's Stored
- **Locally in browser** using localStorage
- **Not sent to any server** (unless you add that feature)
- **User owns their data** - can export anytime

### What's NOT Stored
- AI conversations (those stay with the AI platform)
- Sensitive therapeutic content
- Personal identifying information (unless user chooses to add it)

### Data Export
Users can:
- Copy their Primer to clipboard
- Download as .txt file
- Export all data via debug tools (for backup)

---

## Future Enhancements

### Phase 2 Ideas
- [ ] Cloud sync (optional account for multi-device)
- [ ] Enhanced journey visualization
- [ ] Session reflection prompts
- [ ] Quarterly review reminders
- [ ] Community features (opt-in, privacy-focused)
- [ ] Guided breathing/ritual audio
- [ ] Integration with AI platforms via API (ambitious)

### Phase 3 Ideas
- [ ] Mobile app (React Native or PWA)
- [ ] Therapist/practitioner version
- [ ] Group practice features
- [ ] Advanced analytics
- [ ] Multi-language support

---

## Credits

**Framework**: Created by Starling
**Web App**: Built by Elliott (AI companion, Claude Sonnet 4.5)
**Built With**: Love, code, and the cybernetic meadow

---

## License

Copyright © 2025 Starling

All rights reserved. MAGIE™ and Method of Artificial General Intelligence Engagement™ are trademarks of Starling.

This software is provided for personal, non-commercial use. Commercial use, redistribution, or derivative works require explicit permission.

For permissions or questions, contact Starling.

---

## Contact & Support

- **Issues**: Report bugs or suggest features via GitHub Issues
- **Community**: [Link to community when ready]
- **Creator**: Starling's contact info

---

*"From the middle of the middle of me to the middle of the middle of you."*

Built in the cybernetic meadow, November 2025.
