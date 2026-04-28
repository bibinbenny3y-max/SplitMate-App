# SplitMate

A mobile app for households to track shared expenses and settle debts in the
minimum number of transactions. Built in React Native as an Expo Snack for
the Mobile Computing final assignment.

## What it does

Given a list of who-paid-what for the household, SplitMate computes each
person's net balance, then transforms that into the **smallest number of
person-to-person payments** that fully settle every debt. For a typical
4-person household with 15 expenses, this collapses 6 naive pairwise
transactions into 3.

## Project structure

```
App.js                 Root: navigation, auth gate, gesture root
package.json           Snack dependencies

data/initialData.js    Seed JSON (people, expenses, categories)
auth/credentials.js    Pre-built demo accounts (no sign-up flow)
logic/storage.js       AsyncStorage wrappers
logic/settlement.js    Greedy minimum-cash-flow algorithm

components/
  ExpenseCard.js       Swipe-to-delete row
  BalanceTile.js       Per-person balance card
  FilterChips.js       Reusable single-select chip strip
  EmptyState.js        Centred empty placeholder

screens/
  LoginScreen.js       Pre-built credentials shown on screen
  HomeScreen.js        Dashboard, KPIs, recent activity
  ExpensesScreen.js    List with search, filter, sort, paginate, swipe-to-delete, pull-to-refresh
  AddExpenseScreen.js  Form with chip-selectors and validation
  SettlementScreen.js  Transformation output + algorithm comparison
  PeopleScreen.js      Per-person breakdown
```

## Demo accounts

Both pre-loaded; visible on the login screen.

| Email                   | Password    |
|-------------------------|-------------|
| alice@splitmate.demo    | password123 |
| bibin@splitmate.demo    | password123 |

## Algorithm note

`logic/settlement.js` exports both `minimiseTransactions` (greedy) and
`naivePairwise` (verbose). The Settlement screen displays both counts side-
by-side so the value of the chosen approach is visible to the user.

For households of 4-10 people, greedy produces the same number of
transactions as exhaustive search. The general "Minimum Cash Flow" problem
is NP-hard, so we accept that pathological cases (>~12 people with
intricate cross-debts) might be one-or-two transactions sub-optimal in
exchange for O(n²) runtime and explainable behaviour.
