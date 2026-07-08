# School Solutions Redesign

Static one-page redesign for School Solutions.

Open `index.html` directly in a browser for a visual preview.

The contact popup posts to `send-contact.php`, so use a PHP-capable server for live form delivery:

```bash
php -S localhost:8000
```

Messages are sent with PHP `mail()` to `contact@schoolsolutions.com`. The host must have outbound mail configured.
