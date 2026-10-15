# CMS Body File Upload Design

Date: 2026-10-15  
Status: approved for implementation planning  
Context: Sveltia CMS Body toolbar currently exposes only the built-in image component; editors cannot attach general files.

## Goal

Let editors insert a downloadable file link into Markdown Body content from the CMS rich-text toolbar, without changing Hugo templates or the existing image upload flow.

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| UX | Toolbar「附件」button inside Body markdown editor |
| Output | Standard Markdown link: `[显示名](/files/uploads/filename.ext)` |
| Storage | `static/files/uploads` → public `/files/uploads/...` |
| Allowed types | `.pdf` `.doc` `.docx` `.xls` `.xlsx` `.ppt` `.pptx` `.zip` `.txt` `.md` |
| Scope | All Body markdown fields: 笔记 (`posts`), 摄影首页 (`photography_pages`), 摄影作品 (`photography`) |
| Images | Unchanged — still `static/images/uploads` |
| Hugo | No template/CSS changes; Markdown links render as normal anchors |

## Architecture

```
CMS (Sveltia)
├── static/admin/index.html
│   └── CMS.registerEditorComponent({ id: 'file-link', ... })
├── static/admin/config.yml
│   └── body.editor_components: [image, code-block, file-link]
└── static/files/uploads/
    └── <uploaded files>  →  served as /files/uploads/<name>
```

Flow:

1. Editor clicks「附件」in Body toolbar.
2. Dialog: pick/upload file (`widget: file`) + optional display text.
3. On insert, component writes `[text](publicPath)` into Markdown.
4. On save, GitHub backend commits the binary under `static/files/uploads/` and the Markdown change together.
5. Hugo serves the file from `static/`; published page shows a normal download link.

### Round-trip editing

`pattern` / `fromBlock` only match Markdown links whose URL starts with `/files/uploads/`, so ordinary links stay plain links, while previously inserted attachments reopen in the file-link dialog.

### Files

| Path | Action |
|------|--------|
| `static/admin/index.html` | Register `file-link` editor component (Chinese labels, `trigger: button`, `icon: attach_file`) |
| `static/admin/config.yml` | Set `editor_components` on each Body field to include `image`, `code-block`, and `file-link` |
| `static/files/uploads/.gitkeep` | Create — keep empty uploads dir in git |

### Component field config (locked)

```js
{
  name: 'file',
  label: '文件',
  widget: 'file',
  media_folder: 'static/files/uploads',
  public_folder: '/files/uploads',
  choose_url: false,
  accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.md',
}
```

Display text field defaults to the uploaded filename when empty (via component defaults / `toBlock` fallback).

### Markdown field config (locked)

```yaml
- label: Body
  name: body
  widget: markdown
  editor_components: [image, code-block, file-link]
```

Applied to every Body field listed in Scope.

## Out of scope

- Standalone front-matter attachment lists
- Changing global `media_folder` (images stay separate)
- Custom download styling or forced `download` attribute
- Video/audio or arbitrary binary types beyond the whitelist

## Acceptance criteria

1. Body toolbar shows an attachment control alongside image/code-block.
2. Uploading a whitelisted file stores it under `static/files/uploads/` and inserts a Markdown link to `/files/uploads/...`.
3. Non-whitelisted types are rejected by the file picker (`accept`).
4. Image upload path and behavior are unchanged.
5. Published pages render the link as a clickable download/open URL with no Hugo template changes.
6. Re-opening an entry: links under `/files/uploads/` can be edited via the attachment dialog; other links are unaffected.
