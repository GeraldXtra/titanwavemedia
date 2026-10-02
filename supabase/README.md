# The database

The website saves three things in a Supabase database:

| Table | What goes in it |
| --- | --- |
| `messages` | Every contact form message, and the name and email of anyone who asks the site assistant to be contacted (`source` is `contact` or `assistant`). |
| `notify_list` | Emails from the "Notify me" forms, one row per email (`source` says which form). |
| `chat_logs` | Site assistant conversations, one row per message, with names, phone numbers, account numbers and emails already replaced by `[NAME]`, `[PHONE]`, `[ACCOUNT]` and `[EMAIL]`. |

Until the database is connected, the site still works: messages and sign ups are written to the server log instead, and conversations are not saved.

## Set it up

1. Create a free project at [supabase.com](https://supabase.com). Pick a region close to Lagos, for example Europe (London or Frankfurt).
2. In the project, open **SQL Editor**, click **New query**, paste everything in `supabase/schema.sql` and click **Run**. You should see "Success. No rows returned". Running it again later does no harm.
3. Open **Table Editor**: the three tables are there, empty.
4. Copy two values into your settings (`.env.local` on your computer, and Vercel for the live site):
   - `SUPABASE_URL`: **Project Settings**, **Data API**, the Project URL (it looks like `https://abcd1234.supabase.co`).
   - `SUPABASE_SERVICE_KEY`: **Project Settings**, **API Keys**, the secret key (or, under the legacy keys, `service_role`). This key can read and write everything: keep it secret and never put it in a `NEXT_PUBLIC_` setting. The website only uses it on the server.
5. Restart the site (or redeploy on Vercel). Send a test message from the contact page and check the `messages` table.

## Who can see the data

Row level security is on for all three tables with no policies, so the public keys cannot read or write anything. Only the website's server, with the service key, and people you invite to the Supabase project can see the rows.

## Keeping data only as long as needed

The Privacy Policy says messages are kept for a set period. To delete older rows, run something like this in the SQL editor (change the periods to match your policy):

```sql
delete from public.chat_logs where created_at < now() - interval '90 days';
delete from public.messages where created_at < now() - interval '2 years';
```

Supabase can run this on a schedule with the `pg_cron` extension (**Database**, **Extensions**).
