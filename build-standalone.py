#!/usr/bin/env python3
# Quick script to build standalone HTML with embedded CSS and JS

with open('index.html', 'r') as f:
    html = f.read()

with open('css/style.css', 'r') as f:
    css = f.read()

with open('js/storage.js', 'r') as f:
    storage_js = f.read()

with open('js/app.js', 'r') as f:
    app_js = f.read()

# Replace the external CSS link with embedded style
html = html.replace(
    '<link rel="stylesheet" href="css/style.css">',
    f'<style>\n{css}\n</style>'
)

# Replace the external JS scripts with embedded scripts
html = html.replace(
    '<script src="js/storage.js"></script>\n    <script src="js/app.js"></script>',
    f'<script>\n{storage_js}\n</script>\n    <script>\n{app_js}\n</script>'
)

# Write the standalone file
with open('MAGIE-Companion-Standalone.html', 'w') as f:
    f.write(html)

print("✓ Created MAGIE-Companion-Standalone.html")
