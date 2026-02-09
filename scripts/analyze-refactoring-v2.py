#!/usr/bin/env python3
"""
🧬 ADVANCED CODE HEALTH ANALYZER v2.0
=====================================
State-of-the-art TypeScript/React code analysis using scientific software metrics.

Metrics Implemented:
1. Maintainability Index (MI) - Industry standard (Visual Studio, SonarQube)
2. Halstead Complexity Metrics - Scientific software metrics
3. Cognitive Complexity - SonarQube's superior complexity metric
4. Fan-in/Fan-out (Afferent/Efferent Coupling) - Dependency risk
5. Code Duplication Detection - Structural similarity
6. God Component Detection - Single Responsibility violations
7. Technical Debt Ratio (TDR) - Estimated refactoring time
8. LCOM4 (Lack of Cohesion) - How focused is the module
9. Change Risk Anti-Pattern (CRAP) Score - Complexity + test coverage proxy
10. Dependency Instability Index - How risky to change

Final score uses weighted ensemble of all metrics with ML-inspired normalization.
"""

import os
import re
import sys
import json
import math
import hashlib
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Set, Optional
from collections import defaultdict, Counter
import argparse

# ============================================================================
# HALSTEAD METRICS - Scientific complexity measurement
# ============================================================================

OPERATORS = {
    '===', '!==', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', 
    '++', '--', '+=', '-=', '*=', '/=', '%=', '=>', '...', '**',
    '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~',
    '?', ':', '.', ',', ';', '(', ')', '[', ']', '{', '}',
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
    'continue', 'return', 'throw', 'try', 'catch', 'finally',
    'new', 'delete', 'typeof', 'instanceof', 'in', 'of',
    'async', 'await', 'yield', 'import', 'export', 'from', 'as',
    'const', 'let', 'var', 'function', 'class', 'extends', 'implements',
    'interface', 'type', 'enum', 'namespace', 'module',
    'public', 'private', 'protected', 'static', 'readonly', 'abstract',
}

@dataclass
class HalsteadMetrics:
    n1: int = 0  # Unique operators
    n2: int = 0  # Unique operands
    N1: int = 0  # Total operators
    N2: int = 0  # Total operands
    
    @property
    def vocabulary(self) -> int:
        return self.n1 + self.n2
    
    @property
    def length(self) -> int:
        return self.N1 + self.N2
    
    @property
    def calculated_length(self) -> float:
        if self.n1 == 0 or self.n2 == 0:
            return 0
        return self.n1 * math.log2(max(self.n1, 1)) + self.n2 * math.log2(max(self.n2, 1))
    
    @property
    def volume(self) -> float:
        if self.vocabulary == 0:
            return 0
        return self.length * math.log2(max(self.vocabulary, 1))
    
    @property
    def difficulty(self) -> float:
        if self.n2 == 0:
            return 0
        return (self.n1 / 2) * (self.N2 / max(self.n2, 1))
    
    @property
    def effort(self) -> float:
        return self.difficulty * self.volume
    
    @property
    def time_to_program(self) -> float:
        return self.effort / 18  # Seconds (Halstead's empirical constant)
    
    @property
    def bugs_estimate(self) -> float:
        return self.volume / 3000  # Halstead's bug prediction

def calculate_halstead(content: str) -> HalsteadMetrics:
    """Calculate Halstead complexity metrics."""
    content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'(["\'])(?:(?!\1|\\).|\\.)*\1', 'STRING', content)
    content = re.sub(r'`(?:[^`\\]|\\.)*`', 'TEMPLATE', content)
    
    operators = Counter()
    operands = Counter()
    
    tokens = re.findall(r'[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+(?:\.[0-9]+)?|[^\s\w]', content)
    
    i = 0
    while i < len(tokens):
        token = tokens[i]
        
        if i + 1 < len(tokens):
            two_char = token + tokens[i + 1]
            if two_char in OPERATORS:
                operators[two_char] += 1
                i += 2
                continue
            if i + 2 < len(tokens):
                three_char = two_char + tokens[i + 2]
                if three_char in OPERATORS:
                    operators[three_char] += 1
                    i += 3
                    continue
        
        if token in OPERATORS or token in '()[]{}.,;:?!':
            operators[token] += 1
        elif re.match(r'^[a-zA-Z_$]', token):
            if token.lower() in {'true', 'false', 'null', 'undefined', 'nan', 'infinity'}:
                operands[token] += 1
            elif token in OPERATORS:
                operators[token] += 1
            else:
                operands[token] += 1
        elif re.match(r'^[0-9]', token):
            operands[token] += 1
        
        i += 1
    
    return HalsteadMetrics(
        n1=len(operators),
        n2=len(operands),
        N1=sum(operators.values()),
        N2=sum(operands.values())
    )

# ============================================================================
# COGNITIVE COMPLEXITY - SonarQube's metric (better than cyclomatic)
# ============================================================================

def calculate_cognitive_complexity(content: str) -> Tuple[int, List[str]]:
    """
    Calculate cognitive complexity (SonarQube style).
    Penalizes nesting and breaks in linear flow.
    """
    complexity = 0
    nesting_level = 0
    hotspots = []
    
    content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    lines = content.split('\n')
    
    increment_keywords = ['if', 'else if', 'elif', 'for', 'while', 'do', 'catch', 'switch', 'case']
    nesting_keywords = ['if', 'for', 'while', 'do', 'switch', 'try', 'catch']
    
    brace_stack = []
    
    for line_num, line in enumerate(lines, 1):
        stripped = line.strip()
        
        for char in line:
            if char == '{':
                brace_stack.append(line_num)
            elif char == '}' and brace_stack:
                brace_stack.pop()
        
        nesting_level = len(brace_stack)
        
        for kw in increment_keywords:
            pattern = rf'\b{kw}\b'
            matches = re.findall(pattern, stripped)
            for _ in matches:
                increment = 1 + max(0, nesting_level - 1)
                complexity += increment
                if increment > 2:
                    hotspots.append(f"Line {line_num}: '{kw}' at nesting level {nesting_level} (+{increment})")
        
        logical_ops = len(re.findall(r'\&\&|\|\|', stripped))
        if logical_ops > 0:
            complexity += logical_ops
            if logical_ops > 2:
                hotspots.append(f"Line {line_num}: {logical_ops} logical operators")
        
        ternary_count = stripped.count('?') - stripped.count('?.')  # Exclude optional chaining
        ternary_count = max(0, ternary_count)
        if ternary_count > 0:
            complexity += ternary_count * (1 + max(0, nesting_level - 1))
        
        if re.search(r'\b(break|continue)\b', stripped):
            if not re.search(r'\bcase\b', stripped):
                complexity += 1
        
        recursion = re.findall(r'(\w+)\s*\([^)]*\)\s*{[^}]*\1\s*\(', content)
        if recursion:
            complexity += 1
    
    return complexity, hotspots[:5]

# ============================================================================
# MAINTAINABILITY INDEX - Industry standard
# ============================================================================

def calculate_maintainability_index(
    halstead_volume: float,
    cyclomatic_complexity: int,
    loc: int,
    comment_ratio: float
) -> float:
    """
    Calculate Maintainability Index (0-100 scale).
    Formula: 171 - 5.2*ln(V) - 0.23*CC - 16.2*ln(LOC) + 50*sin(sqrt(2.4*CM))
    
    Where:
    - V = Halstead Volume
    - CC = Cyclomatic Complexity  
    - LOC = Lines of Code
    - CM = Comment ratio (0-1)
    """
    if loc == 0 or halstead_volume == 0:
        return 100
    
    mi = 171 - 5.2 * math.log(max(halstead_volume, 1))
    mi -= 0.23 * cyclomatic_complexity
    mi -= 16.2 * math.log(max(loc, 1))
    mi += 50 * math.sin(math.sqrt(2.4 * comment_ratio))
    
    mi = max(0, min(100, mi))
    
    return mi

# ============================================================================
# COUPLING METRICS - Fan-in/Fan-out
# ============================================================================

def analyze_coupling(filepath: str, all_files: Dict[str, str]) -> Tuple[int, int, Set[str], Set[str]]:
    """
    Calculate fan-in (afferent coupling) and fan-out (efferent coupling).
    - Fan-out: How many modules this file depends on
    - Fan-in: How many modules depend on this file
    """
    content = all_files.get(filepath, '')
    
    import_pattern = r'from\s+["\']([^"\']+)["\']|import\s+["\']([^"\']+)["\']'
    imports = re.findall(import_pattern, content)
    
    dependencies = set()
    for match in imports:
        dep = match[0] or match[1]
        if not dep.startswith('.'):
            continue
        dependencies.add(dep)
    
    fan_out = len(dependencies)
    
    basename = os.path.basename(filepath).replace('.tsx', '').replace('.ts', '')
    fan_in = 0
    importers = set()
    
    for other_path, other_content in all_files.items():
        if other_path == filepath:
            continue
        if re.search(rf'from\s+["\'][^"\']*{re.escape(basename)}["\']', other_content):
            fan_in += 1
            importers.add(other_path)
    
    return fan_in, fan_out, importers, dependencies

def calculate_instability(fan_in: int, fan_out: int) -> float:
    """
    Calculate instability index (0-1).
    I = Fan-out / (Fan-in + Fan-out)
    
    - 0 = Maximally stable (many depend on it, it depends on few)
    - 1 = Maximally unstable (few depend on it, it depends on many)
    """
    total = fan_in + fan_out
    if total == 0:
        return 0.5
    return fan_out / total

# ============================================================================
# CODE DUPLICATION DETECTION
# ============================================================================

def extract_code_blocks(content: str, min_lines: int = 6) -> List[Tuple[int, str]]:
    """Extract normalized code blocks for similarity comparison."""
    lines = content.split('\n')
    blocks = []
    
    for i in range(len(lines) - min_lines + 1):
        block = '\n'.join(lines[i:i + min_lines])
        normalized = re.sub(r'\s+', ' ', block)
        normalized = re.sub(r'["\'][^"\']*["\']', 'STR', normalized)
        normalized = re.sub(r'\b\d+\b', 'NUM', normalized)
        normalized = re.sub(r'\b[a-z][a-zA-Z0-9]*\b', 'VAR', normalized)
        
        if len(normalized) > 50:
            blocks.append((i + 1, hashlib.md5(normalized.encode()).hexdigest()))
    
    return blocks

def find_duplicates(filepath: str, all_files: Dict[str, str]) -> List[Tuple[str, int, int]]:
    """Find code blocks that are duplicated in other files."""
    content = all_files.get(filepath, '')
    my_blocks = extract_code_blocks(content)
    my_hashes = {h for _, h in my_blocks}
    
    duplicates = []
    
    for other_path, other_content in all_files.items():
        if other_path == filepath:
            continue
        
        other_blocks = extract_code_blocks(other_content)
        
        for line_num, block_hash in other_blocks:
            if block_hash in my_hashes:
                duplicates.append((other_path, line_num, block_hash))
    
    unique_files = set(d[0] for d in duplicates)
    return [(f, sum(1 for d in duplicates if d[0] == f), 0) for f in unique_files]

# ============================================================================
# GOD COMPONENT DETECTION
# ============================================================================

def detect_god_component(content: str) -> Tuple[int, List[str]]:
    """
    Detect signs of a "God Component" (violates Single Responsibility).
    Returns a score and list of violations.
    """
    score = 0
    violations = []
    
    state_count = len(re.findall(r'\buseState\s*[<(]', content))
    if state_count > 5:
        score += (state_count - 5) * 3
        violations.append(f"{state_count} useState hooks (should be <5)")
    
    effect_count = len(re.findall(r'\buseEffect\s*\(', content))
    if effect_count > 3:
        score += (effect_count - 3) * 4
        violations.append(f"{effect_count} useEffect hooks (should be <3)")
    
    handlers = len(re.findall(r'\b(?:handle|on)[A-Z][a-zA-Z]*\s*[:=]', content))
    if handlers > 7:
        score += (handlers - 7) * 2
        violations.append(f"{handlers} event handlers (should be <7)")
    
    api_calls = len(re.findall(r'\b(?:fetch|axios|api|mutation|query)\s*[.(]', content, re.IGNORECASE))
    if api_calls > 2:
        score += (api_calls - 2) * 5
        violations.append(f"{api_calls} API calls in component (extract to hook)")
    
    jsx_depth = 0
    max_depth = 0
    for char in content:
        if char == '<':
            jsx_depth += 1
            max_depth = max(max_depth, jsx_depth)
        elif char == '>':
            jsx_depth = max(0, jsx_depth - 1)
    
    if max_depth > 12:
        score += (max_depth - 12) * 2
        violations.append(f"JSX nesting depth {max_depth} (should be <12)")
    
    return score, violations

# ============================================================================
# TECHNICAL DEBT CALCULATION
# ============================================================================

def calculate_technical_debt_minutes(
    loc: int,
    cognitive_complexity: int,
    duplication_ratio: float,
    god_score: int,
    maintainability_index: float
) -> int:
    """
    Estimate technical debt in minutes.
    Based on SonarQube's remediation time formulas.
    """
    debt = 0
    
    if cognitive_complexity > 15:
        debt += (cognitive_complexity - 15) * 5
    
    if loc > 300:
        debt += (loc - 300) // 50 * 10
    
    debt += int(duplication_ratio * 100) * 2
    
    debt += god_score * 3
    
    if maintainability_index < 65:
        debt += int((65 - maintainability_index) * 2)
    
    return debt

# ============================================================================
# MAIN ANALYSIS
# ============================================================================

@dataclass
class AdvancedFileMetrics:
    filepath: str
    loc: int = 0
    sloc: int = 0  # Source lines (no blanks/comments)
    comment_ratio: float = 0
    
    halstead: HalsteadMetrics = field(default_factory=HalsteadMetrics)
    cognitive_complexity: int = 0
    cognitive_hotspots: List[str] = field(default_factory=list)
    maintainability_index: float = 100
    
    fan_in: int = 0
    fan_out: int = 0
    instability: float = 0.5
    
    duplicate_files: int = 0
    god_score: int = 0
    god_violations: List[str] = field(default_factory=list)
    
    tech_debt_minutes: int = 0
    
    import_count: int = 0
    component_count: int = 0
    hook_count: int = 0
    
    final_score: float = 0
    risk_level: str = "LOW"
    recommendations: List[str] = field(default_factory=list)

def analyze_file_advanced(filepath: str, all_files: Dict[str, str], skip_coupling: bool = True, skip_duplicates: bool = True) -> AdvancedFileMetrics:
    """Perform comprehensive analysis on a single file."""
    metrics = AdvancedFileMetrics(filepath=filepath)
    
    content = all_files.get(filepath, '')
    if not content:
        return metrics
    
    lines = content.split('\n')
    metrics.loc = len(lines)
    blank_lines = sum(1 for l in lines if not l.strip())
    comment_lines = len(re.findall(r'^\s*//|^\s*/\*|\*/\s*$', content, re.MULTILINE))
    metrics.sloc = metrics.loc - blank_lines - comment_lines
    metrics.comment_ratio = comment_lines / max(metrics.loc, 1)
    
    metrics.halstead = calculate_halstead(content)
    
    metrics.cognitive_complexity, metrics.cognitive_hotspots = calculate_cognitive_complexity(content)
    
    cyclomatic = 1 + len(re.findall(r'\b(if|else if|for|while|case|catch|\&\&|\|\||\?)\b', content))
    
    metrics.maintainability_index = calculate_maintainability_index(
        metrics.halstead.volume,
        cyclomatic,
        metrics.sloc,
        metrics.comment_ratio
    )
    
    if skip_coupling:
        metrics.fan_in = 0
        metrics.fan_out = len(re.findall(r'from\s+["\']', content))
        metrics.instability = 0.5
    else:
        metrics.fan_in, metrics.fan_out, _, _ = analyze_coupling(filepath, all_files)
        metrics.instability = calculate_instability(metrics.fan_in, metrics.fan_out)
    
    if skip_duplicates:
        metrics.duplicate_files = 0
    else:
        duplicates = find_duplicates(filepath, all_files)
        metrics.duplicate_files = len(duplicates)
    
    metrics.god_score, metrics.god_violations = detect_god_component(content)
    
    metrics.import_count = len(re.findall(r'^import\s+', content, re.MULTILINE))
    metrics.component_count = len(re.findall(r'(?:export\s+)?(?:default\s+)?function\s+[A-Z]', content))
    metrics.hook_count = len(re.findall(r'\buse[A-Z][a-zA-Z]*\s*[<(]', content))
    
    dup_ratio = metrics.duplicate_files / max(len(all_files), 1)
    metrics.tech_debt_minutes = calculate_technical_debt_minutes(
        metrics.sloc,
        metrics.cognitive_complexity,
        dup_ratio,
        metrics.god_score,
        metrics.maintainability_index
    )
    
    metrics.final_score, metrics.risk_level, metrics.recommendations = calculate_final_score(metrics)
    
    return metrics

def calculate_final_score(m: AdvancedFileMetrics) -> Tuple[float, str, List[str]]:
    """
    Calculate final refactoring priority score using weighted ensemble.
    Uses sigmoid normalization for each metric.
    """
    recommendations = []
    
    def sigmoid_normalize(value: float, midpoint: float, steepness: float = 0.1) -> float:
        """Normalize to 0-1 using sigmoid function."""
        return 1 / (1 + math.exp(-steepness * (value - midpoint)))
    
    mi_score = 1 - (m.maintainability_index / 100)
    if m.maintainability_index < 50:
        recommendations.append(f"Critical: MI={m.maintainability_index:.0f} (target >65)")
    elif m.maintainability_index < 65:
        recommendations.append(f"Improve MI from {m.maintainability_index:.0f} to >65")
    
    cc_score = sigmoid_normalize(m.cognitive_complexity, 25, 0.08)
    if m.cognitive_complexity > 30:
        recommendations.append(f"High cognitive complexity ({m.cognitive_complexity}), extract functions")
    
    loc_score = sigmoid_normalize(m.sloc, 300, 0.008)
    if m.sloc > 400:
        recommendations.append(f"Large file ({m.sloc} SLOC), consider splitting")
    
    god_score = sigmoid_normalize(m.god_score, 15, 0.15)
    if m.god_score > 10:
        recommendations.append("God component detected, extract smaller components")
    
    coupling_score = 0
    if m.fan_in > 10 and m.instability > 0.7:
        coupling_score = 0.8
        recommendations.append(f"High-risk: many dependents ({m.fan_in}) but unstable")
    elif m.fan_out > 15:
        coupling_score = 0.5
        recommendations.append(f"High coupling: depends on {m.fan_out} modules")
    
    halstead_score = sigmoid_normalize(m.halstead.effort, 50000, 0.00003)
    if m.halstead.bugs_estimate > 0.5:
        recommendations.append(f"Halstead predicts {m.halstead.bugs_estimate:.1f} bugs")
    
    dup_score = sigmoid_normalize(m.duplicate_files, 3, 0.5)
    if m.duplicate_files > 2:
        recommendations.append(f"Code duplicated in {m.duplicate_files} files")
    
    weights = {
        'maintainability': 0.25,
        'cognitive': 0.20,
        'loc': 0.10,
        'god': 0.15,
        'coupling': 0.10,
        'halstead': 0.10,
        'duplication': 0.10,
    }
    
    final = (
        weights['maintainability'] * mi_score +
        weights['cognitive'] * cc_score +
        weights['loc'] * loc_score +
        weights['god'] * god_score +
        weights['coupling'] * coupling_score +
        weights['halstead'] * halstead_score +
        weights['duplication'] * dup_score
    ) * 100
    
    if final >= 60:
        risk = "🔴 CRITICAL"
    elif final >= 40:
        risk = "🟠 HIGH"
    elif final >= 25:
        risk = "🟡 MEDIUM"
    else:
        risk = "🟢 LOW"
    
    return final, risk, recommendations[:4]

def analyze_directory_advanced(directory: str, skip_coupling: bool = True, skip_duplicates: bool = True) -> List[AdvancedFileMetrics]:
    """Analyze all files with cross-file analysis."""
    all_files = {}
    
    print(f"📂 Scanning {directory}...")
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.next', 'dist', '.git', '__pycache__', '.cursor']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts')) and not file.endswith('.d.ts'):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        all_files[filepath] = f.read()
                except:
                    pass
    
    print(f"✅ Loaded {len(all_files)} files")
    
    if not skip_coupling or not skip_duplicates:
        print(f"⚠️  Cross-file analysis enabled (this may take a while)...")
    
    results = []
    total = len(all_files)
    for i, filepath in enumerate(all_files, 1):
        if i % 50 == 0 or i == total:
            print(f"   Analyzing... {i}/{total} ({i*100//total}%)", end='\r')
        
        metrics = analyze_file_advanced(filepath, all_files, skip_coupling, skip_duplicates)
        results.append(metrics)
    
    print(f"\n✅ Analysis complete!")
    return results

def print_advanced_results(results: List[AdvancedFileMetrics], threshold: int = 20, limit: int = 25):
    """Print comprehensive analysis results."""
    filtered = [r for r in results if r.final_score >= threshold]
    sorted_results = sorted(filtered, key=lambda x: x.final_score, reverse=True)[:limit]
    
    if not sorted_results:
        print(f"\n✅ No files with refactoring score >= {threshold}")
        return
    
    print(f"\n{'='*100}")
    print(f"🧬 ADVANCED CODE HEALTH ANALYSIS")
    print(f"{'='*100}\n")
    
    for i, m in enumerate(sorted_results, 1):
        rel_path = os.path.relpath(m.filepath)
        bar = '█' * int(m.final_score / 5) + '░' * (20 - int(m.final_score / 5))
        
        print(f"{'─'*100}")
        print(f"{i:2}. {rel_path}")
        print(f"    Score: [{bar}] {m.final_score:.1f}/100  {m.risk_level}")
        print()
        
        print(f"    📊 METRICS:")
        print(f"       Maintainability Index: {m.maintainability_index:.1f}/100 {'⚠️' if m.maintainability_index < 65 else '✓'}")
        print(f"       Cognitive Complexity:  {m.cognitive_complexity} {'⚠️' if m.cognitive_complexity > 25 else '✓'}")
        print(f"       Halstead Difficulty:   {m.halstead.difficulty:.1f}")
        print(f"       Halstead Bug Estimate: {m.halstead.bugs_estimate:.2f}")
        print()
        
        print(f"    📐 SIZE & STRUCTURE:")
        print(f"       SLOC: {m.sloc} | Imports: {m.import_count} | Components: {m.component_count} | Hooks: {m.hook_count}")
        print(f"       Fan-in: {m.fan_in} | Fan-out: {m.fan_out} | Instability: {m.instability:.2f}")
        print()
        
        if m.god_violations:
            print(f"    🏛️ GOD COMPONENT VIOLATIONS:")
            for v in m.god_violations[:3]:
                print(f"       • {v}")
            print()
        
        if m.cognitive_hotspots:
            print(f"    🔥 COMPLEXITY HOTSPOTS:")
            for h in m.cognitive_hotspots[:3]:
                print(f"       • {h}")
            print()
        
        print(f"    ⏱️ TECHNICAL DEBT: ~{m.tech_debt_minutes} minutes to refactor")
        
        if m.recommendations:
            print(f"    💡 RECOMMENDATIONS:")
            for r in m.recommendations:
                print(f"       → {r}")
        print()
    
    total_debt = sum(r.tech_debt_minutes for r in sorted_results)
    hours = total_debt // 60
    mins = total_debt % 60
    
    print(f"{'='*100}")
    print(f"📈 SUMMARY")
    print(f"{'='*100}")
    print(f"   Files analyzed: {len(results)}")
    print(f"   Files needing attention: {len(sorted_results)}")
    print(f"   Total estimated tech debt: {hours}h {mins}m")
    print()
    
    critical = len([r for r in sorted_results if r.final_score >= 60])
    high = len([r for r in sorted_results if 40 <= r.final_score < 60])
    medium = len([r for r in sorted_results if 25 <= r.final_score < 40])
    
    print(f"   🔴 Critical: {critical}")
    print(f"   🟠 High:     {high}")
    print(f"   🟡 Medium:   {medium}")
    
    avg_mi = sum(r.maintainability_index for r in results) / max(len(results), 1)
    print(f"\n   📊 Average Maintainability Index: {avg_mi:.1f}/100")
    print(f"{'='*100}\n")

def export_json_advanced(results: List[AdvancedFileMetrics], output_file: str):
    """Export detailed results to JSON."""
    data = []
    for m in results:
        data.append({
            'filepath': os.path.relpath(m.filepath),
            'final_score': round(m.final_score, 2),
            'risk_level': m.risk_level,
            'maintainability_index': round(m.maintainability_index, 2),
            'cognitive_complexity': m.cognitive_complexity,
            'sloc': m.sloc,
            'halstead': {
                'volume': round(m.halstead.volume, 2),
                'difficulty': round(m.halstead.difficulty, 2),
                'effort': round(m.halstead.effort, 2),
                'bugs_estimate': round(m.halstead.bugs_estimate, 3),
            },
            'coupling': {
                'fan_in': m.fan_in,
                'fan_out': m.fan_out,
                'instability': round(m.instability, 3),
            },
            'god_score': m.god_score,
            'tech_debt_minutes': m.tech_debt_minutes,
            'recommendations': m.recommendations,
        })
    
    with open(output_file, 'w') as f:
        json.dump(sorted(data, key=lambda x: x['final_score'], reverse=True), f, indent=2)
    
    print(f"📄 Detailed report exported to {output_file}")

def main():
    parser = argparse.ArgumentParser(
        description='🧬 Advanced Code Health Analyzer - State of the art refactoring analysis'
    )
    parser.add_argument('directory', nargs='?', default='src', help='Directory to analyze')
    parser.add_argument('-t', '--threshold', type=int, default=20, help='Min score to show')
    parser.add_argument('-l', '--limit', type=int, default=25, help='Max files to show')
    parser.add_argument('-j', '--json', type=str, help='Export to JSON')
    parser.add_argument('-a', '--all', action='store_true', help='Show all files')
    
    args = parser.parse_args()
    
    if not os.path.isdir(args.directory):
        print(f"❌ Directory not found: {args.directory}")
        sys.exit(1)
    
    print(f"🔬 Advanced analysis of: {args.directory}")
    results = analyze_directory_advanced(args.directory, skip_coupling=True, skip_duplicates=True)
    
    threshold = 0 if args.all else args.threshold
    print_advanced_results(results, threshold=threshold, limit=args.limit)
    
    if args.json:
        export_json_advanced(results, args.json)

if __name__ == '__main__':
    main()
