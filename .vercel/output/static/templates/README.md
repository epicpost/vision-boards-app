# Template Assets

Static files in this directory are served from the site root by Vite.

Use one folder per post template:

```text
public/templates/<template-id>/preview.webp
public/templates/<template-id>/asset-01.webp
public/templates/<template-id>/asset-02.mp4
```

Reference them with root-relative URLs:

```ts
"/templates/<template-id>/preview.webp"
```

Use `public/templates/shared/` for reusable assets that are not owned by a
single template.
