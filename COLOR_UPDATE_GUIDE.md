# Admin Panel Theme Update

## Quick Color Update Script

To batch-replace all "lagoon" (blue) colors with "orange" brand colors in the admin panel:

### Option 1: Python Script (Recommended)

```bash
cd c:\Users\moamal\myProjects\athbat-store
python scripts\update-admin-colors.py
```

### Option 2: VS Code Find & Replace

1. Open VS Code
2. Press `Ctrl+Shift+H` (Find and Replace in Files)
3. Enable "Use Regular Expression" (.\*) button
4. Set "files to include": `admin/src/**/*.{ts,tsx}`
5. Run these replacements in order:

```
Find: lagoon-500  → Replace: orange-500
Find: lagoon-600  → Replace: orange-600
Find: lagoon-400  → Replace: orange-400
Find: lagoon-300  → Replace: orange-300
Find: lagoon-200  → Replace: orange-200
Find: lagoon-100  → Replace: orange-100
Find: lagoon-50   → Replace: orange-50
Find: lagoon-700  → Replace: navy-700
Find: lagoon-800  → Replace: navy-800
Find: lagoon-900  → Replace: navy-900
```

### Option 3: Manual PowerShell (Windows)

```powershell
cd admin\src
Get-ChildItem -Recurse -Include *.tsx,*.ts | ForEach-Object {
    $content = Get-Content $_.FullName
    $content = $content -replace 'lagoon-500','orange-500' `
                        -replace 'lagoon-600','orange-600' `
                        -replace 'lagoon-700','navy-700' `
                        -replace 'lagoon-800','navy-800'
    Set-Content $_.FullName $content
}
```

## What Gets Updated

- **Primary buttons**: `bg-lagoon-500` → `bg-orange-500`
- **Hover states**: `hover:bg-lagoon-600` → `hover:bg-orange-600`
- **Sidebar**: `bg-lagoon-800` → `bg-navy-800`
- **Borders**: `border-lagoon-700` → `border-navy-700`
- **Focus rings**: `ring-lagoon-500/30` → `ring-orange-500/30`
- **Accents**: All lagoon shades → orange/navy equivalents

## Color Scheme

### Orange (Primary Brand)

- `orange-50`: #fff4e6 (lightest backgrounds)
- `orange-500`: #fb8500 (primary buttons, links)
- `orange-600`: #f57c00 (hover states)

### Navy (Dark UI Elements)

- `navy-700`: #023047 (borders, dividers)
- `navy-800`: #011d29 (sidebar background)

## After Running

Check these files were updated:

- `admin/src/components/sidebar.tsx`
- `admin/src/components/header.tsx`
- `admin/src/app/dashboard/**/*.tsx`

The admin panel will now match the mobile app's orange brand (#fb8500).
