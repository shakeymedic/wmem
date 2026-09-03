# EM Evidence Scripts

## send-newsletter.mjs

Automated newsletter sender using the Loops.so Campaign API.

Reads `updates.js` for new newsletter issues, creates a Loops campaign for each,
sets the email content with a link to the Google Drive PDF, and sends it to the
matching mailing list.

### Usage

```bash
# Preview what would be sent (no emails sent)
node scripts/send-newsletter.mjs --dry-run

# Send all unsent newsletters
node scripts/send-newsletter.mjs

# Send only a specific type
node scripts/send-newsletter.mjs --type em
node scripts/send-newsletter.mjs --type phem
node scripts/send-newsletter.mjs --type anaes
```

### Environment variables

- `LOOPS_API_KEY` — Your Loops.so API key (Content API must be enabled)

### State

Sent newsletters are tracked in `state/sent-newsletters.json` to prevent duplicates.

### Newsletter type matching

| Title contains | Mailing list |
|----------------|-------------|
| "EM Evidence Rundown" (not PHEM/Anaesthetics) | Weekly EM |
| "PHEM Evidence Rundown" | Monthly PHEM |
| "Anaesthetics" or "ICU Evidence Rundown" | Monthly Anaesthetics |

See `EMAIL_AUTOMATION_SETUP.md` for full setup instructions.
