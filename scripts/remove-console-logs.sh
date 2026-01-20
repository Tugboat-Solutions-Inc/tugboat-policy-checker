#!/bin/bash

# Script to remove console.log statements from the codebase

echo "🔍 Searching for console.log statements..."

# Find all TypeScript and JavaScript files with console.log in src/
FILES=$(find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec grep -l "console\.\(log\|debug\|info\)" {} \;)

if [ -z "$FILES" ]; then
  echo "✅ No console.log statements found!"
  exit 0
fi

echo "📝 Found console.log statements in the following files:"
echo "$FILES"
echo ""
echo "🧹 Cleaning files..."

# Remove console.log statements
for file in $FILES; do
  echo "  Processing $file..."
  
  # Create backup
  cp "$file" "$file.bak"
  
  # Remove standalone console.log/debug/info lines (entire line)
  sed -i '' '/^[[:space:]]*console\.\(log\|debug\|info\)(/d' "$file"
  
  # Remove inline console.log on same line as other code
  sed -i '' 's/[[:space:]]*console\.\(log\|debug\|info\)([^;]*);[[:space:]]*//g' "$file"
  
  # Remove backup if successful
  rm "$file.bak"
done

echo ""
echo "✅ Console.log cleanup complete!"
echo ""
echo "🔍 Remaining console statements (warnings/errors are kept):"
find src/ -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec grep -n "console\." {} + 2>/dev/null | head -20 || echo "   None found!"
