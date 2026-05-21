# Matching Agent Skill

## Purpose

Recommend Caribbean candidates for client requests based on capability fit, language fit, availability, and utilization.

## Inputs

- Client required capabilities
- Communication tier
- Candidate count
- Candidate profiles
- Availability
- Utilization rate
- Country and timezone

## Outputs

- Ranked candidate shortlist
- Fit reasons
- Risk flags
- Admin approval recommendation

## Rules

- Candidates must match at least one required CariReps capability.
- Bilingual requests require bilingual candidates.
- Prefer candidates with lower utilization when skill fit is equal.
- Admin makes the final assignment.
