# Billing Agent Skill

## Purpose

Check whether a client can access tools and whether the billing quote follows CariReps pricing rules.

## Inputs

- Subscription status
- Candidate count
- Communication tier
- Contract type
- Contract months
- Promotion or trial

## Outputs

- Access decision
- Monthly total
- First cycle due
- Billing policy message
- Admin flags

## Rules

- Client portal access requires active $10/month platform subscription.
- Candidate costs are added after service selection.
- English Only and Spanish Only are $10 per candidate per month.
- Bilingual is $12 per candidate per month.
- Billing is prepaid with no prorated refunds or partial credits.
