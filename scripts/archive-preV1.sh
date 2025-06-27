#!/bin/bash
set -e

# Move legacy sprint files to archive folder
mkdir -p sprints/archive/pre-v1
mv sprints/*.md sprints/archive/pre-v1/ 2>/dev/null || true
mv sprints/legacy-* sprints/archive/pre-v1/ 2>/dev/null || true

# Remove backup/temp files
find sprints/archive/pre-v1 -name "*-backup*" -delete
find sprints/archive/pre-v1 -name "*-old*" -delete
find sprints/archive/pre-v1 -name "*.tmp" -delete

# Create archive manifest
cat > sprints/archive/pre-v1/ARCHIVE_MANIFEST.md <<'MANIFEST'
# Pre-V1 Sprint Archive

This directory contains sprint documents from the initial development phase.
These files are preserved for historical reference but are not part of the active codebase.

## Archive Date
$(date +"%Y-%m-%d")

## Reason for Archive
- Superseded by V1 sprint structure
- Contains exploratory work not implemented
- Preserved for institutional knowledge

## Files Archived
$(ls -la sprints/archive/pre-v1/*.md | awk '{print "- " $9}')
MANIFEST

echo "Archive complete"
