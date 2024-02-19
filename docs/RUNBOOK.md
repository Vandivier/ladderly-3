# Ladderly Runbook

This is a runbook / playbook for on-call engineer utility.

It documents how to handle certain common manual tasks and outages.

## Updating a Production Checklist In-Place

The base command is:
`npm run seed:update-in-place`

This will update all checklists in-place by mutating the most recently created version of each checklist. Checklist content will be mutated to match `db/checklists.json` and `db/premium-checklists.json`.

It is recommended to pass the `--name` flag to update a specific checklist is encouraged. You can run a command like the following:
`npm run seed:update-in-place -- --name="Programming Job Checklist"`

This script is idempotent. If you run into an issue, in many cases you can just run the script again to resolve the issue.

If the displayText on an item is mutated, the in-place update target will correctly be unidentified.

In this case, we may choose to manually delete an older checklist version.

If we do so, then we should also run `npm run db:clean` to purge orphan ChecklistItems.

Note that UserChecklistItems exist distinctly and by design. If we are going to mutate or destroy active-use UserChecklistItems, we should probably notify the users\*.

\*Currently Ladderly is in alpha so it's less of a big deal, and too many emails may just be annoying to users. In the stable state, though, we should definitely alert end-users to unexpected behavior. We could also include in Terms of Service that checklists can be mutated at any time as an alternative.

## Manual Subscription Tier Update

As a manual batch:

1. Open the Stripe payments table
2. Copy the content of `scripts/tableScraperStripe.js` and paste into the web console
3. Save the result at `scripts/stripe_payments.json`
4. Run `scripts/updateUserSubscriptions.js`

Note: The scraper, as with many scrapers, is fragile.
If Stripe alters the table shape we may need to update it.

## Minified React Error #426

This error has been seen as a result of a render occuring out of suspense.

Look for components that should be wrapped in `<Suspense>`.

Possible fixes include:

1. Adding the Suspense wrapper
2. Refactoring the component so that it doesn't need suspsense. For example, by passing in data from another location.

Ensure that this is pure a client-side error in your case by inspecting server logs (it probably is only on the client).

Keep an eye out for dynamically appended components, such as a component appended through state or context. The dynamic closure may not be suspended, and that could be the issue. The above mentioned fixes still apply.
