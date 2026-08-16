# Seed Scripts

One-time data seeding scripts for the Jamb Crash AI database.

## Question Seed Scripts

| Script | Questions | Subjects | Features |
|--------|-----------|----------|----------|
| `seed-consolidated-questions` | ~300 | All 14 JAMB subjects | Merged from multiple scripts, includes new questions for Accounting, Commerce, CRS, IRS, Agricultural Science |
| `seed-diagram-questions` | 9 | Physics, Math, Biology, Chemistry, Geography | SVG diagrams |
| `seed-jamb-questions` | ~626 | All 14 subjects | Years 2000-2025 |
| `seed-extra-questions` | ~210 | All 14 subjects | Year 2025 |
| `seed-thousand-questions` | 360 | English, Math, Physics, Chemistry, Biology, Government | Year 2025 |
| `seed-10000-questions` | 50/call | Any (AI-generated) | Uses GROQ API |
| `seed-myschool-questions` | ~436 | All 14 subjects | Fetches from myschool.ng API |

## How to Run

### Using Supabase CLI

```bash
# Run a specific seed script
supabase functions invoke seed-consolidated-questions --no-verify-jwt

# Run with specific parameters
supabase functions invoke seed-10000-questions --no-verify-jwt --body '{"subject":"physics","count":50}'
```

### Using curl

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/seed-consolidated-questions \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## Recommended Order

1. `seed-jamb-questions` - Core question bank (~626 questions)
2. `seed-consolidated-questions` - Additional questions (~300)
3. `seed-diagram-questions` - Visual questions (9)
4. `seed-10000-questions` - Fill gaps with AI-generated questions

## Subject Coverage (After Running All Scripts)

| Subject | Approximate Count |
|---------|-------------------|
| English | 200+ |
| Mathematics | 200+ |
| Physics | 200+ |
| Chemistry | 200+ |
| Biology | 200+ |
| Government | 150+ |
| Economics | 100+ |
| Literature | 100+ |
| Geography | 100+ |
| CRS | 50+ |
| IRS | 50+ |
| Accounting | 50+ |
| Commerce | 50+ |
| Agricultural Science | 50+ |

## Notes

- All scripts include deduplication logic to prevent duplicate questions
- Run scripts in the order listed above for best results
- The `seed-10000-questions` script requires a GROQ API key in your environment variables
