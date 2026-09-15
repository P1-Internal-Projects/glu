# Translation glossary

`glossary.json` maps each English string on the site to its translations:

```json
"Academic Calendar": { "es": "Calendario académico", "fr": "Calendrier universitaire" }
```

439 entries, one per distinct translatable string rather than one per
occurrence, so a phrase repeated on eight pages is translated once and every
page agrees with every other. `scripts/i18n-strings.mjs` extracts the strings
and writes translations back; this file is the record of what was decided.

## Why the French column is still here

The French pages were backed out — the site publishes `en-US` and `es-US`. The
French wording stayed because the next French audience is Quebec, and Quebec
French is a revision of this text, not a fresh translation. Throwing the column
away would mean paying for the same 439 strings twice.

## Converting fr-FR to fr-CA

The two are the same language with different institutional vocabulary, and a
university site lands on almost every word where they differ. Counts are
occurrences in this file:

| France | Quebec | Strings |
| --- | --- | --- |
| licence | baccalauréat | 21 |
| semestre | session | 4 |
| frais de scolarité | droits de scolarité | 4 |
| parking | stationnement | 2 |
| lycée | cégep | 2 |
| stage | stage *(same word, different system)* | 1 |
| week-end | fin de semaine | 1 |

`licence` is the one that matters. In France it is the three-year first degree;
in Quebec the equivalent is a `baccalauréat`, and a reader in Montreal seeing
"licence" reads a foreign system. It is the same mistake `es-us-revisions.mjs`
fixes for Spanish, where Peninsular `grado` became `licenciatura`.

Three of these are more than vocabulary and need an editor rather than a
substitution rule:

- **cégep** is not a translation of *lycée*. A Quebec applicant arrives from
  two years of cégep after eleven years of school, so admissions copy written
  for a French *lycéen* describes a path that does not exist there.
- **Tuition** is tiered in Quebec — resident, out-of-province, international —
  so `frais de scolarité` sentences may need different numbers, not different
  words.
- **stage** survives untranslated but means a credit-bearing placement in
  Quebec, where the French sense is closer to an internship.

## Locale tags are immutable

A document's locale cannot be changed after it is created, so the archived
`fr-FR` pages cannot be relabelled `fr-CA`. Quebec French is created as a new
set of variants at the `fr-ca` prefix, seeded from this file's `fr` column.
