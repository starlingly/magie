# MAGIE PWA Setup Guide

Great! Your MAGIE app is now a Progressive Web App (PWA). Here's what that means and how to use it.

## What's New

✅ **Service Worker** - Caches your app for offline use
✅ **Web App Manifest** - Tells phones it's installable
✅ **App Icons** - Shows up on home screen
✅ **Offline Support** - Works without internet

## How Users Install MAGIE

### **iOS (iPhone/iPad)**
1. Open MAGIE in Safari
2. Tap the Share button (bottom right)
3. Scroll down and tap "Add to Home Screen"
4. Name it and add it

### **Android**
1. Open MAGIE in Chrome (or any browser)
2. Tap the menu (three dots, top right)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

The app will appear on their home screen and can be opened like any other app!

---

## Upgrading the Icons (Optional but Recommended)

The placeholder icons work, but you'll want better ones. Here's how to generate them for free:

### **Option 1: Using Favicon.io** (Easiest)
1. Go to https://favicon.io/favicon-generator/
2. Upload or create your MAGIE logo/icon
3. Download as PNG in these sizes:
   - 192x192 (for Android)
   - 512x512 (for splash screens)
4. Replace the files in your project:
   - `icon-192.png`
   - `icon-512.png`
   - `icon-maskable-192.png`
   - `icon-maskable-512.png`

### **Option 2: Using PWA Asset Generator** (Advanced)
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your icon
3. Download all generated assets
4. Replace the icon files

### **Option 3: DIY with Design Tool**
Create a 512x512px PNG:
- Use a tool like Canva, Figma, or GIMP
- Keep it simple and bold (scales down well)
- Use your brand colors (purple #6366f1, accent #a855f7)
- Save as PNG
- Generate other sizes by resizing

---

## Testing Your PWA

### **Desktop Testing**
1. Open https://yoursite.com in Chrome
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Application** tab
4. Click **Manifest** - should show your app details
5. Click **Service Workers** - should be active

### **Mobile Testing**
1. Visit your site on phone
2. You should see "Install" or "Add to Home Screen" prompt
3. Tap it and add to home screen
4. Open the app - should look native!
5. Turn off WiFi/data and refresh - should still work!

---

## What Works Offline

✅ Existing site data (HTML, CSS, JS)
✅ Any data cached during online session
✅ Local storage (your primer, reflections)

❌ Supabase sync (needs internet)
❌ Real-time features (need connection)

When offline, users can still:
- View their Primer
- Use breathing exercises
- Edit local notes
- Everything syncs when back online

---

## Monitoring the PWA

Check browser console for messages like:
- `[PWA] Service Worker registered successfully` - Good!
- `[Service Worker] Serving from cache` - Working offline!
- `[Service Worker] Fetch failed` - No internet (expected offline)

---

## Next Steps

1. **Test on real devices** - Try iOS and Android
2. **Upgrade icons** - Use one of the tools above
3. **Monitor usage** - See if users are installing
4. **Gather feedback** - Use your feedback form!

---

## Troubleshooting

**"Install button not showing"**
- Clear browser cache and cookies
- Try a different browser
- Make sure HTTPS is enabled (required for PWA)

**"Offline mode not working"**
- Check Service Worker tab in DevTools
- Make sure it says "active"
- Try uninstalling and reinstalling

**"Icons not showing"**
- Replace icon files with proper PNGs
- Clear app cache/storage
- Restart the app

---

## Learn More

- [Web.dev - PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN - Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Builder](https://www.pwabuilder.com/)

---

Questions? Check your site's console (F12) for any errors!
