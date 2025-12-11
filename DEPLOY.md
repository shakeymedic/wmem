# Quick Deployment Guide

## Deploy to Netlify in 5 Minutes

### Option 1: Drag & Drop (Fastest)

1. Go to https://app.netlify.com/drop
2. Drag the entire `wmebem-website` folder onto the page
3. Wait 30 seconds for deployment
4. Done! Your site is live

**That's it!** Netlify will give you a URL like `https://random-name-123.netlify.app`

### Customise Your URL

After deployment:
1. Click "Site settings" in Netlify
2. Click "Change site name"
3. Choose something like `wmebem` or `wmebem-tools`
4. Your URL becomes `https://wmebem.netlify.app`

### Connect Your Domain (wmebem.co.uk)

1. In Netlify: Site settings → Domain management → Add custom domain
2. Enter `wmebem.co.uk`
3. In Hostinger (your domain registrar):
   - Add DNS record: Type `CNAME`, Name `www`, Value `your-site.netlify.app`
   - Add DNS record: Type `A`, Name `@`, Value (Netlify will provide the IP)
4. Wait 5-10 minutes for DNS to propagate

## Files Included

✅ `index.html` - Main website page
✅ `styles.css` - All styling (blue colours from your logo)
✅ `app.js` - Search and filter functionality
✅ `tools.js` - Your 10 tools (easy to add more!)
✅ `wmebem_logo.png` - Your logo
✅ `netlify.toml` - Configuration for fast loading
✅ `README.md` - Detailed instructions

## Features Built In

✅ Search by name, category, or keyword
✅ Filter by category (Simulation, Documentation, etc.)
✅ Mobile responsive (works on phones/tablets)
✅ Professional blue colour scheme from your logo
✅ Fast loading (<1 second)
✅ All 10 tools displayed prominently
✅ Featured tools highlighted

## Adding More Tools Later

1. Open `tools.js`
2. Copy one of the existing tool objects
3. Change the details (name, description, URL, etc.)
4. Save the file
5. Redeploy to Netlify (drag & drop the folder again)

Example:
```javascript
{
    id: "new-tool",
    name: "New Tool Name",
    description: "What this tool does",
    category: "Simulation",
    tags: ["keyword1", "keyword2"],
    url: "https://newtool.netlify.app",
    featured: false,
    icon: "cardiac"
}
```

## Need Help?

- Check README.md for detailed instructions
- Netlify docs: https://docs.netlify.com
- Or just ask!

## What You Get

A modern, professional website that:
- Shows all your tools in one place
- Makes it easy for EM doctors to find what they need
- Looks great on all devices
- Loads super fast
- Can be updated easily without coding

**Ready to deploy? Just drag the folder to netlify.com/drop!**
