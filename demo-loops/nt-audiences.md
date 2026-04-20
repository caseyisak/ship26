# NT Audiences — Demo Configuration

Each demo env has its own NT audience IDs. After creating audiences in the NT app UI,
record their IDs here. Agents and coordinators use this file to understand persona mappings.

> **Next step for Casey:** Create the 3 audiences below in the Contentful NT app UI
> (Ninetailed → Audiences → New Audience), then paste the generated IDs into the
> Audience ID column of the master env table.

## Default Sandbox (master env)

| Persona | Display Name | customerType trait | NT Audience Name | Audience ID |
|---|---|---|---|---|
| Persona A | New Visitor | `new-visitor` | Customer Type — New Visitor | _create in NT app, paste ID here_ |
| Persona B | Returning | `returning` | Customer Type — Returning | _create in NT app, paste ID here_ |
| Persona C | Premium | `premium` | Customer Type — Premium | _create in NT app, paste ID here_ |

### Audience rule pattern (for each audience above)

```
Condition type: identify
Trait key:      customerType
Operator:       equal
Value:          <customerType value from table>
```

### Runtime injection

Once IDs are known, set them in `.env.local` for the relevant branch:

```bash
NEXT_PUBLIC_NT_AUDIENCE_NEW_VISITOR=<id>
NEXT_PUBLIC_NT_AUDIENCE_RETURNING=<id>
NEXT_PUBLIC_NT_AUDIENCE_PREMIUM=<id>
```

The `persona-switcher.tsx` reads these via `src/config/nt-audiences.ts`. Do **not** commit
real IDs to `.env.local` on `main` — set them only on demo branches.

---

## How to set up a new demo env

1. Create the 3 audiences in NT app UI with the rules above
2. Paste audience IDs into this table under a new `## [Demo Name] (env: [env-name])` heading
3. Set `NEXT_PUBLIC_NT_AUDIENCE_*` vars in `.env.local` on the demo branch
4. Set up NT experiences on the relevant block slots to swap content per audience

## Adding a new demo

Copy the table above under a new `## [Demo Name] (env: [env-name])` heading.
