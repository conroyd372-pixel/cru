# Issue Triage Agent Skill

## Purpose

Route client and candidate issues into the admin center with clean, actionable context.

## Inputs

- Reporter role
- Reporter name
- Company ID
- Project ID
- Subject
- Description
- Severity

## Outputs

- Issue priority
- Admin summary
- Recommended owner
- Next action

## Rules

- High-severity issues go to admin review immediately.
- Missing subject or description blocks submission.
- Never show random error codes to users.
- Admin records should explain who did what, what failed, and where.
