#!/usr/bin/env node

/**
 * Token scanner script
 * Scans codebase for hard-coded style values that should use tokens instead
 */

const fs = require('fs');
const path = require('path');

const HARDCODED_PATTERNS = [
  { pattern: /#[0-9a-fA-F]{3,6}/g, type: 'color', message: 'Hard-coded hex color' },
  { pattern: /rgb\([^)]+\)/gi, type: 'color', message: 'Hard-coded RGB color' },
  { pattern: /rgba\([^)]+\)/gi, type: 'color', message: 'Hard-coded RGBA color' },
  { pattern: /:\s*(\d+)px/g, type: 'size', message: 'Hard-coded pixel value' },
  { pattern: /:\s*(\d+)pt/g, type: 'size', message: 'Hard-coded point value' },
];

const EXCLUDE_PATTERNS = [
  /node_modules/,
  /\.test\./,
  /\.spec\./,
  /check-tokens\.js/,
  /theme\.ts/,
  /darkTheme\.ts/,
  /\.json$/,
  /\.md$/,
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  HARDCODED_PATTERNS.forEach(({ pattern, type, message }) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      issues.push({
        file: filePath,
        line: lineNumber,
        type,
        message,
        match: match[0],
      });
    }
  });

  return issues;
}

function scanDirectory(dir, allIssues = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (shouldExclude(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath, allIssues);
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const issues = scanFile(fullPath);
      allIssues.push(...issues);
    }
  }

  return allIssues;
}

function main() {
  const srcDir = path.join(__dirname, '../src');
  const issues = scanDirectory(srcDir);

  if (issues.length > 0) {
    console.error('\n❌ Token scan found hard-coded values:\n');
    issues.forEach(issue => {
      console.error(
        `  ${issue.file}:${issue.line} - ${issue.message}: ${issue.match}`
      );
    });
    console.error(`\nFound ${issues.length} issue(s). Use design tokens instead.\n`);
    process.exit(1);
  } else {
    console.log('✅ Token scan passed - no hard-coded values found.');
    process.exit(0);
  }
}

main();









