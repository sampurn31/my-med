# PWA Icons Setup

## Required Icons

You need to create the following icon files for the PWA:

1. **pwa-192x192.png** - 192x192 pixels
2. **pwa-512x512.png** - 512x512 pixels
3. **apple-touch-icon.png** - 180x180 pixels
4. **favicon.ico** - 32x32 pixels (optional, using SVG currently)

## How to Create Icons

### Option 1: Use a Design Tool

1. Create a 512x512 pixel image with your app icon
2. Use tools like:
   - Figma
   - Adobe Illustrator
   - Canva
   - GIMP (free)

### Option 2: Use an Online Generator

1. Create a single 512x512 PNG
2. Use https://realfavicongenerator.net/
3. Upload your image
4. Download all generated icons
5. Place them in the `public/` folder

### Option 3: Use the Placeholder SVG

The current `favicon.svg` is a simple pill icon. You can:
1. Open it in a vector editor
2. Customize colors and design
3. Export as PNG in required sizes

## Design Guidelines

### Icon Design Best Practices

- **Simple**: Clear and recognizable at small sizes
- **Memorable**: Unique and distinctive
- **Relevant**: Represents medication/health
- **Scalable**: Works at all sizes (192px to 512px)

### Color Scheme

Current app colors:
- Primary: `#4F46E5` (Indigo)
- Background: `#FFFFFF` (White)
- Text: `#111827` (Dark Gray)

### Suggested Icon Ideas

1. **Pill Icon** (current) - Simple and clear
2. **Medicine Bottle** - Classic medication symbol
3. **Clock + Pill** - Emphasizes scheduling
4. **Calendar + Pill** - Emphasizes reminders
5. **Heart + Pill** - Emphasizes health

## Current Placeholder

The app currently uses `favicon.svg` as a placeholder. This works but PNG icons are recommended for better compatibility.

## Testing Icons

After adding icons:

1. **Desktop**: 
   - Clear browser cache
   - Reload app
   - Check browser tab icon

2. **Android**:
   - Install PWA
   - Check home screen icon
   - Check splash screen

3. **iOS**:
   - Add to Home Screen
   - Check icon on home screen

## Icon Checklist

- [ ] Create 512x512 master icon
- [ ] Generate pwa-192x192.png
- [ ] Generate pwa-512x512.png
- [ ] Generate apple-touch-icon.png
- [ ] Generate favicon.ico (optional)
- [ ] Test on desktop browser
- [ ] Test PWA installation on Android
- [ ] Test Add to Home Screen on iOS

## Tools & Resources

- **Favicon Generator**: https://realfavicongenerator.net/
- **PWA Icon Generator**: https://www.pwabuilder.com/imageGenerator
- **Free Icons**: https://www.flaticon.com/
- **Design Tool**: https://www.figma.com/ (free)
- **Image Editor**: https://www.photopea.com/ (free, online)

---

**Note**: The app will work without custom icons, but they significantly improve the user experience and brand recognition.

