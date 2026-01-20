---
name: Implement Collection Export Functionality
overview: Implement export functionality for collections to PDF, CSV, and XLS formats. The export will include all items from selected collections with all available fields. This will replace the current console.log placeholder with actual file generation and download.
todos: []
---

# Implement Collection Export Functionality

## Overview

Replace the placeholder export functionality in the Export button with actual file generation for PDF, CSV, and XLS formats. The export will include all items from selected collections with complete item data.

## Packages to Install

1. **jspdf** + **jspdf-autotable** - For PDF generation with tables
2. **xlsx** (SheetJS) - For Excel (.xls/.xlsx) file generation

## Implementation Steps

### 1. Install Required Packages

- Add `jspdf` and `jspdf-autotable` for PDF generation
- Add `xlsx` for Excel file generation
- CSV will use existing `papaparse` package

### 2. Create Export Utility Functions

Create `src/utils/export/collection-export.utils.ts` with:

- `fetchItemsForCollections()` - Fetch all items for selected collections (since collections.items may be null)
- `prepareExportData()` - Transform items into export-friendly format with all fields
- `exportToCSV()` - Generate CSV using papaparse
- `exportToXLS()` - Generate Excel file using xlsx
- `exportToPDF()` - Generate PDF using jspdf with autoTable plugin

### 3. Update ExportButton Component

Modify `src/components/common/header/export-button.tsx`:

- Replace console.log with actual export logic
- Add loading state during export
- Handle async item fetching for each collection
- Call appropriate export function based on selected format
- Show success/error toasts

### 4. Export Data Structure

Each exported item should include:

- Collection name (grouping)
- Item name, description, model_nr
- Brand name, Category name
- Condition, Age, Quantity
- Estimated cost/value
- Photo URL
- Created/Updated dates
- Additional metadata

### 5. File Naming

- Format: `inventory-export-YYYY-MM-DD-HHMMSS.{ext}`
- Include timestamp to avoid overwrites

## Files to Modify

1. `package.json` - Add dependencies
2. `src/utils/export/collection-export.utils.ts` - New export utilities
3. `src/components/common/header/export-button.tsx` - Implement export logic
4. `src/features/collection-details/api/item.actions.ts` - May need to add bulk fetch function

## Considerations

- Collections may not have items pre-loaded, so we'll need to fetch items for each selected collection
- Large exports may take time - consider showing progress or chunking
- PDF should handle pagination for large datasets
- Excel should create separate sheets per collection if multiple collections selected
- CSV should include collection name as first column for grouping
