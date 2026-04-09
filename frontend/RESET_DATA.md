# How to Reset Application Data

If you're experiencing login issues or want to reset all data, follow these steps:

## Method 1: Clear Browser localStorage (Recommended)

1. Open your browser's Developer Tools:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

2. Go to the **Console** tab

3. Type and run this command:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

4. This will clear all stored data and reload the page. The default users will be recreated automatically.

## Method 2: Clear Specific Items

If you only want to reset users, run this in the browser console:

```javascript
localStorage.removeItem('users');
localStorage.removeItem('initialized');
location.reload();
```

## Method 3: Manual Browser Settings

1. Open browser settings
2. Go to Privacy/Security settings
3. Clear browsing data
4. Select "Cookies and other site data" or "Local storage"
5. Clear data for your localhost site

## After Resetting

After clearing localStorage, the application will automatically recreate:
- Default users (admin/admin123, manager/manager123, clerk/clerk123)
- Sample products
- Sample customers and suppliers
- Empty orders and notifications

Then try logging in again with:
- Username: `admin`
- Password: `admin123`


