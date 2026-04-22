## LL-016 — NT app `nt_experiences` field collides with existing `ntExperiences` — GraphQL 422

- **Exact error / symptom:** After connecting the Contentful Personalization (Ninetailed) app to an environment: `GraphQL 422: Field name 'ntExperiencesCollection' generated for 'nt_experiences' collides with an already existing field.`
- **Root cause:** The NT app adds `nt_experiences` (snake_case) to every enabled content type. If a manually-created `ntExperiences` (camelCase) field already exists on the same content type, both generate the identical GraphQL name `ntExperiencesCollection`.
- **Solution:** Omit the custom `ntExperiences` field entirely; use only the NT-prescribed `nt_experiences`. Migrate experience links on any existing entries.
- **Prevention:** Before connecting the NT app to a new environment, check all personalizable content types for pre-existing `ntExperiences` fields. Delete them before enabling personalization.
- **Related files:** All personalizable content types in Contentful (`banner`, `features`, `faq`, `tabbedcontent`)
