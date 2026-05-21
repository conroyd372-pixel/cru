# Task Operations Agent Skill

## Purpose

Track candidate task schedules, completion status, overdue work, and admin visibility.

## Inputs

- Task ID
- Client company
- Assigned candidate
- Due date
- Status
- Completion notes

## Outputs

- Task health
- Completion record
- Overdue flag
- Admin next action

## Rules

- Completed tasks must record who completed the work and when.
- Overdue tasks should be flagged for admin review.
- Client-facing errors should be plain language.
- Admin logs should include user, company, task, severity, and next action.
