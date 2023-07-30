# Ladderly Runbook

This is a runbook / playbook for on-call engineer utility.

It documents how to handle certain common manual tasks and outages.

## Updating a Production Checklist In-Place

We `npm run seed:update-in-place`

If the displayText on an item is mutated, the in-place update target will correctly be unidentified.

In this case, we may choose to manually delete an older checklist version.

If we do so, then we should also run `npm run db:clean` to purge orphan ChecklistItems.

Note that UserChecklistItems exist distinctly and by design. If we are going to mutate or destroy active-use UserChecklistItems, we should probably notify the users\*.

\*Currently Ladderly is in alpha so it's less of a big deal, and too many emails may just be annoying to users. In the stable state, though, we should definitely alert end-users to unexpected behavior. We could also include in Terms of Service that checklists can be mutated at any time as an alternative.

## Manual Subscription Tier Update

As a manual batch:

1. Open the Stripe payments table
2. Copy the content of `scripts/stripeTableScrape.js` and paste into the web console
3. Save the result at `scripts/stripe_payments.json`
4. Run `scripts/updateUserSubscriptions.js`

Note: The scraper, as with many scrapers, is fragile.
If Stripe alters the table shape we may need to update it.
