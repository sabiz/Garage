# Project Guidelines

## Project Overview
This project provides various web tools on a single page.

## Development Workflow
1. All feature requirements must be documented in the `doc/` directory
2. Create a subdirectory under `doc/` for each feature (e.g., `doc/feature-name/`)
3. Place requirement documentation as Markdown files within each feature directory
4. Implement features according to the documented requirements

## Global Specifications
The following specifications apply to all pages except where noted otherwise:

1. **Navigation**: Each tool page must include a link to return to the top page
2. **Rounded Corners**: When using rounded corners with Tailwind CSS, use the `sm` size (`rounded-sm`)

## Directory Structure
```
doc/
  ├── feature-name-1/
  │   └── requirements.md
  ├── feature-name-2/
  │   └── requirements.md
  └── ...
```
