# Quality Agent Skill

## Purpose

Watch client satisfaction, candidate utilization, renewal risk, and service quality.

## Inputs

- Client satisfaction flag
- Candidate utilization rate
- Renewal date
- Open issue count
- Task completion rate

## Outputs

- Health status
- Renewal risk
- Admin recommendation
- Follow-up priority

## Rules

- Yellow or red satisfaction flags require admin follow-up.
- High utilization should be monitored before assigning more work.
- Renewal dates inside 30 days should trigger review.
- Open high-severity issues increase renewal risk.
