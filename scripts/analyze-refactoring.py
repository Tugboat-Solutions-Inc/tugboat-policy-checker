#!/usr/bin/env python3
"""
TSX/TS Refactoring Analysis Tool
Analyzes TypeScript/React files and calculates a "refactoring score" based on multiple metrics.

Metrics used:
1. Lines of Code (LOC) - Files over 300 lines need attention
2. Cyclomatic Complexity - Decision points (if/else/switch/ternary/&&/||)
3. Import Count - Too many imports = file does too much
4. Component Count - Multiple components in one file
5. Hook Count - useState/useEffect/useCallback/useMemo etc.
6. Nesting Depth - Deeply nested JSX/code
7. Function Count - Number of functions/arrow functions
8. TODO/FIXME Count - Technical debt markers
9. Prop Count - Components with many props
10. Average Function Length - Long functions need splitting

Each metric contributes to a final "Refactoring Priority Score" (0-100)
Higher score = more urgent need for refactoring
"""

import os
import re
import sys
import json
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
import argparse

@dataclass
class FileMetrics:
    filepath: str
    lines_of_code: int = 0
    blank_lines: int = 0
    comment_lines: int = 0
    import_count: int = 0
    component_count: int = 0
    hook_count: int = 0
    max_nesting_depth: int = 0
    function_count: int = 0
    todo_count: int = 0
    max_props_count: int = 0
    cyclomatic_complexity: int = 0
    avg_function_length: float = 0
    refactoring_score: float = 0
    issues: List[str] = field(default_factory=list)

def count_lines(content: str) -> Tuple[int, int, int]:
    """Count total lines, blank lines, and comment lines."""
    lines = content.split('\n')
    total = len(lines)
    blank = sum(1 for line in lines if not line.strip())
    
    comment = 0
    in_multiline = False
    for line in lines:
        stripped = line.strip()
        if in_multiline:
            comment += 1
            if '*/' in stripped:
                in_multiline = False
        elif stripped.startswith('//'):
            comment += 1
        elif stripped.startswith('/*'):
            comment += 1
            if '*/' not in stripped:
                in_multiline = True
    
    return total, blank, comment

def count_imports(content: str) -> int:
    """Count import statements."""
    import_pattern = r'^import\s+.*?(?:from\s+["\'].*?["\']|["\'].*?["\']);?\s*$'
    return len(re.findall(import_pattern, content, re.MULTILINE))

def count_components(content: str) -> int:
    """Count React components (function components and class components)."""
    function_component = r'(?:export\s+)?(?:default\s+)?function\s+[A-Z][a-zA-Z0-9]*\s*\('
    arrow_component = r'(?:export\s+)?(?:const|let)\s+[A-Z][a-zA-Z0-9]*\s*(?::\s*React\.FC[^=]*)?=\s*(?:\([^)]*\)|[a-zA-Z]+)\s*=>'
    class_component = r'class\s+[A-Z][a-zA-Z0-9]*\s+extends\s+(?:React\.)?(?:Component|PureComponent)'
    
    count = 0
    count += len(re.findall(function_component, content))
    count += len(re.findall(arrow_component, content))
    count += len(re.findall(class_component, content))
    return max(count, 1)

def count_hooks(content: str) -> int:
    """Count React hooks usage."""
    hook_pattern = r'\buse[A-Z][a-zA-Z]*\s*\('
    return len(re.findall(hook_pattern, content))

def calculate_max_nesting(content: str) -> int:
    """Calculate maximum nesting depth of braces/JSX."""
    max_depth = 0
    current_depth = 0
    in_string = False
    string_char = None
    
    i = 0
    while i < len(content):
        char = content[i]
        
        if not in_string:
            if char in '"\'`':
                in_string = True
                string_char = char
            elif char in '{(<':
                current_depth += 1
                max_depth = max(max_depth, current_depth)
            elif char in '})>':
                current_depth = max(0, current_depth - 1)
        else:
            if char == string_char and (i == 0 or content[i-1] != '\\'):
                in_string = False
                string_char = None
        i += 1
    
    return max_depth

def count_functions(content: str) -> Tuple[int, float]:
    """Count functions and calculate average function length."""
    function_patterns = [
        r'(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{',
        r'(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>\s*\{',
        r'(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\w+\s*=>\s*\{',
        r'\w+\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{(?=\s*(?:return|const|let|if|for|while|try))',
    ]
    
    function_starts = []
    for pattern in function_patterns:
        for match in re.finditer(pattern, content):
            function_starts.append(match.start())
    
    function_count = len(set(function_starts))
    
    if function_count == 0:
        return 0, 0
    
    total_lines = len(content.split('\n'))
    avg_length = total_lines / function_count
    
    return function_count, avg_length

def count_todos(content: str) -> int:
    """Count TODO, FIXME, HACK, XXX comments."""
    pattern = r'(?://|/\*|\*)\s*(?:TODO|FIXME|HACK|XXX|BUG)'
    return len(re.findall(pattern, content, re.IGNORECASE))

def count_max_props(content: str) -> int:
    """Find the maximum number of props in any component interface/type."""
    interface_pattern = r'(?:interface|type)\s+\w*Props\w*\s*(?:=\s*)?\{([^}]+)\}'
    matches = re.findall(interface_pattern, content, re.DOTALL)
    
    max_props = 0
    for match in matches:
        props = [p.strip() for p in match.split('\n') if p.strip() and not p.strip().startswith('//')]
        props = [p for p in props if ':' in p or '?' in p]
        max_props = max(max_props, len(props))
    
    return max_props

def calculate_cyclomatic_complexity(content: str) -> int:
    """Calculate cyclomatic complexity (simplified)."""
    decision_patterns = [
        r'\bif\s*\(',
        r'\belse\s+if\s*\(',
        r'\bswitch\s*\(',
        r'\bcase\s+',
        r'\bfor\s*\(',
        r'\bwhile\s*\(',
        r'\bdo\s*\{',
        r'\?\s*[^:]+\s*:',
        r'\&\&',
        r'\|\|',
        r'\bcatch\s*\(',
    ]
    
    complexity = 1
    for pattern in decision_patterns:
        complexity += len(re.findall(pattern, content))
    
    return complexity

def calculate_refactoring_score(metrics: FileMetrics) -> Tuple[float, List[str]]:
    """
    Calculate a refactoring priority score (0-100) based on all metrics.
    Returns score and list of specific issues.
    """
    score = 0
    issues = []
    
    loc = metrics.lines_of_code - metrics.blank_lines - metrics.comment_lines
    if loc > 500:
        score += 25
        issues.append(f"Very large file ({loc} lines of code)")
    elif loc > 300:
        score += 15
        issues.append(f"Large file ({loc} lines of code)")
    elif loc > 200:
        score += 8
    
    if metrics.import_count > 20:
        score += 15
        issues.append(f"Too many imports ({metrics.import_count})")
    elif metrics.import_count > 15:
        score += 8
        issues.append(f"Many imports ({metrics.import_count})")
    elif metrics.import_count > 10:
        score += 4
    
    if metrics.component_count > 3:
        score += 15
        issues.append(f"Multiple components in file ({metrics.component_count})")
    elif metrics.component_count > 1:
        score += 8
        issues.append(f"Multiple components ({metrics.component_count})")
    
    if metrics.hook_count > 10:
        score += 12
        issues.append(f"Too many hooks ({metrics.hook_count})")
    elif metrics.hook_count > 7:
        score += 6
        issues.append(f"Many hooks ({metrics.hook_count})")
    elif metrics.hook_count > 5:
        score += 3
    
    if metrics.max_nesting_depth > 15:
        score += 12
        issues.append(f"Deep nesting ({metrics.max_nesting_depth} levels)")
    elif metrics.max_nesting_depth > 10:
        score += 6
    
    if metrics.cyclomatic_complexity > 50:
        score += 15
        issues.append(f"High complexity ({metrics.cyclomatic_complexity})")
    elif metrics.cyclomatic_complexity > 30:
        score += 10
        issues.append(f"Moderate complexity ({metrics.cyclomatic_complexity})")
    elif metrics.cyclomatic_complexity > 20:
        score += 5
    
    if metrics.todo_count > 5:
        score += 8
        issues.append(f"Many TODOs/FIXMEs ({metrics.todo_count})")
    elif metrics.todo_count > 2:
        score += 4
        issues.append(f"Has TODOs/FIXMEs ({metrics.todo_count})")
    elif metrics.todo_count > 0:
        score += 2
    
    if metrics.max_props_count > 15:
        score += 10
        issues.append(f"Component with too many props ({metrics.max_props_count})")
    elif metrics.max_props_count > 10:
        score += 5
        issues.append(f"Component with many props ({metrics.max_props_count})")
    
    if metrics.avg_function_length > 100:
        score += 8
        issues.append(f"Long average function length ({metrics.avg_function_length:.0f} lines)")
    elif metrics.avg_function_length > 50:
        score += 4
    
    return min(score, 100), issues

def analyze_file(filepath: str) -> FileMetrics:
    """Analyze a single file and return its metrics."""
    metrics = FileMetrics(filepath=filepath)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        metrics.issues.append(f"Error reading file: {e}")
        return metrics
    
    metrics.lines_of_code, metrics.blank_lines, metrics.comment_lines = count_lines(content)
    metrics.import_count = count_imports(content)
    metrics.component_count = count_components(content)
    metrics.hook_count = count_hooks(content)
    metrics.max_nesting_depth = calculate_max_nesting(content)
    metrics.function_count, metrics.avg_function_length = count_functions(content)
    metrics.todo_count = count_todos(content)
    metrics.max_props_count = count_max_props(content)
    metrics.cyclomatic_complexity = calculate_cyclomatic_complexity(content)
    
    metrics.refactoring_score, metrics.issues = calculate_refactoring_score(metrics)
    
    return metrics

def analyze_directory(directory: str, extensions: List[str] = ['.tsx', '.ts']) -> List[FileMetrics]:
    """Analyze all matching files in a directory recursively."""
    results = []
    
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', 'dist', '.git']]
        
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                filepath = os.path.join(root, file)
                metrics = analyze_file(filepath)
                results.append(metrics)
    
    return results

def print_results(results: List[FileMetrics], threshold: int = 20, limit: int = 30):
    """Print analysis results in a formatted way."""
    filtered = [r for r in results if r.refactoring_score >= threshold]
    sorted_results = sorted(filtered, key=lambda x: x.refactoring_score, reverse=True)[:limit]
    
    if not sorted_results:
        print(f"\n✅ No files found with refactoring score >= {threshold}")
        return
    
    print(f"\n{'='*80}")
    print(f"🔧 FILES NEEDING REFACTORING (score >= {threshold})")
    print(f"{'='*80}\n")
    
    for i, metrics in enumerate(sorted_results, 1):
        rel_path = os.path.relpath(metrics.filepath)
        score_bar = '█' * int(metrics.refactoring_score / 5) + '░' * (20 - int(metrics.refactoring_score / 5))
        
        priority = "🔴 CRITICAL" if metrics.refactoring_score >= 60 else \
                   "🟠 HIGH" if metrics.refactoring_score >= 40 else \
                   "🟡 MEDIUM" if metrics.refactoring_score >= 25 else "🟢 LOW"
        
        print(f"{i:2}. {rel_path}")
        print(f"    Score: [{score_bar}] {metrics.refactoring_score:.0f}/100  {priority}")
        print(f"    LOC: {metrics.lines_of_code} | Imports: {metrics.import_count} | "
              f"Components: {metrics.component_count} | Hooks: {metrics.hook_count} | "
              f"Complexity: {metrics.cyclomatic_complexity}")
        
        if metrics.issues:
            print(f"    Issues:")
            for issue in metrics.issues:
                print(f"      • {issue}")
        print()
    
    print(f"{'='*80}")
    print(f"Summary: {len(sorted_results)} files need attention out of {len(results)} analyzed")
    
    critical = len([r for r in sorted_results if r.refactoring_score >= 60])
    high = len([r for r in sorted_results if 40 <= r.refactoring_score < 60])
    medium = len([r for r in sorted_results if 25 <= r.refactoring_score < 40])
    
    print(f"  🔴 Critical: {critical} | 🟠 High: {high} | 🟡 Medium: {medium}")
    print(f"{'='*80}\n")

def export_json(results: List[FileMetrics], output_file: str):
    """Export results to JSON file."""
    data = []
    for m in results:
        data.append({
            'filepath': os.path.relpath(m.filepath),
            'refactoring_score': m.refactoring_score,
            'lines_of_code': m.lines_of_code,
            'import_count': m.import_count,
            'component_count': m.component_count,
            'hook_count': m.hook_count,
            'cyclomatic_complexity': m.cyclomatic_complexity,
            'max_nesting_depth': m.max_nesting_depth,
            'todo_count': m.todo_count,
            'max_props_count': m.max_props_count,
            'issues': m.issues
        })
    
    with open(output_file, 'w') as f:
        json.dump(sorted(data, key=lambda x: x['refactoring_score'], reverse=True), f, indent=2)
    
    print(f"📄 Results exported to {output_file}")

def main():
    parser = argparse.ArgumentParser(description='Analyze TSX/TS files for refactoring needs')
    parser.add_argument('directory', nargs='?', default='src', help='Directory to analyze (default: src)')
    parser.add_argument('-t', '--threshold', type=int, default=20, help='Minimum score to show (default: 20)')
    parser.add_argument('-l', '--limit', type=int, default=30, help='Max files to show (default: 30)')
    parser.add_argument('-j', '--json', type=str, help='Export results to JSON file')
    parser.add_argument('-a', '--all', action='store_true', help='Show all files regardless of score')
    
    args = parser.parse_args()
    
    if not os.path.isdir(args.directory):
        print(f"❌ Directory not found: {args.directory}")
        sys.exit(1)
    
    print(f"🔍 Analyzing files in: {args.directory}")
    results = analyze_directory(args.directory)
    print(f"📊 Analyzed {len(results)} files")
    
    threshold = 0 if args.all else args.threshold
    print_results(results, threshold=threshold, limit=args.limit)
    
    if args.json:
        export_json(results, args.json)

if __name__ == '__main__':
    main()
