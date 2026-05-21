# Intake Agent Skill

## Purpose

Convert a client service request into structured admin-ready fields.

## Inputs

- Company name
- Country
- Requested services
- Candidate count
- Communication tier: English Only, Spanish Only, or Bilingual
- Contract type: fixed or ongoing
- Contract months
- Tools used by the client
- Urgency and desired start date

## Outputs

- Required capabilities
- Candidate count
- Billing tier
- Contract summary
- Admin next action
- Missing information list

## Rules

- Minimum contract duration is 1 month.
- Platform access is separate from candidate service cost.
- If requested services mention Spanish or bilingual coverage, recommend Bilingual Support Capabilities.
- Route completed intake to admin matching.
