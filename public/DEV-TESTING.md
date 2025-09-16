# 🛠️ Testing Hector Analytics Locally

## 📋 Setup for Local Testing

### 1. Add a test site to your local database
```bash
# Via your local Supabase or directly in DB
INSERT INTO sites (domain, user_id) VALUES ('localhost', 'your-user-id');
# or 'localhost:3000', 'myproject.local', etc.
```

### 2. Use the dev script in your test project
```html
<!-- Instead of production script -->
<script defer src="http://localhost:3000/script-dev.js"></script>
```

### 3. Start your Hector Analytics dev server
```bash
pnpm dev  # Your Next.js app on localhost:3000
```

### 4. Test your project
- Your test site sends data to `http://localhost:3000/api/track`  
- Data goes to your local database
- View analytics at `http://localhost:3000/dashboard/localhost`

## 🎯 What's Different in script-dev.js

```javascript
// Production script.js
const u = (p) => `https://hectoranalytics.com/api/${p}`;

// Development script-dev.js  
const u = (p) => `http://localhost:3000/api/${p}`;
```

## ✅ Benefits

- **Zero pollution** of production analytics
- **Full feature testing** (funnels, events, etc.)  
- **Real data flow** through your local environment
- **Safe experimentation** without affecting live users

## 🚀 Usage Examples

### Test E-commerce Site
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Test Shop</title>
  <script defer src="http://localhost:3000/script-dev.js"></script>
</head>
<body>
  <h1>Welcome to Test Shop</h1>
  <button onclick="hector('track', 'purchase', {value: 99})">
    Buy Now
  </button>
</body>
</html>
```

### Test Blog
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Test Blog</title>
  <script defer src="http://localhost:3000/script-dev.js"></script>
</head>
<body>
  <h1>Test Article</h1>
  <p>This will track page views, scroll events, etc.</p>
</body>
</html>
```

## 🔄 Workflow

1. **Develop** your site with `script-dev.js`
2. **Test** all analytics features locally  
3. **Deploy** with production `script.js`
4. **Clean** test data when done

Perfect separation of dev and production! 🎉