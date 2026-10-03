# Titan Wave Media website

The website for Titan Wave Media LTD, an AI company in Lagos. It has every page of the design, a site assistant that answers questions, a contact form, a "Notify me" list for products, and everything search engines need to find it.

## Run it on your computer

You need Node.js 20.9 or newer. You can get it at nodejs.org.

1. Open a terminal in this folder.
2. Run `npm install`. You only need to do this once. It downloads what the site needs.
3. Run `npm run dev`, then open http://localhost:3000 in your browser.

While it runs, the page updates each time you save a file.

To see the site exactly as it will run online, stop it, run `npm run build`, then run `npm start`.

You do not need any keys to run it. Without them, the assistant answers from its own short list of answers, and the contact and notify forms print what was sent in the terminal and still show the thank you page.

## Where the words live

Every word on the site is in the `content` folder, one file per page:

* `site.js`: the company details used everywhere (email, WhatsApp number, RC number, prices), the main links in the header, the Menu panel on phones, the footer, the Cookie preferences dialog and the closing "Tell us what you need" block
* `home.js`: the home page
* `ai-setup.js`: AI Setup
* `products.js`: the list of products
* `product.js`: each product's own page
* `synthetic-data.js`: Synthetic Data
* `privacy.js`: Privacy
* `work.js`: the list of projects
* `project.js`: each project's own page
* `about.js`: About, including the founder: the story, the three parts that open and close, the working hours behind the line that says if he is online, and the photo once there is one
* `contact.js`: Contact
* `updates.js`: the list of updates
* `post.js`: each update's own page
* `terms.js`, `privacy-policy.js` and `refunds.js`: the three legal pages
* `thank-you.js`: the page people see after they send a message
* `not-found.js`: the page for an address that does not exist
* `assistant.js`: what the site assistant says, and the answers it gives when there is no AI key
* `assistant-rules.md`: the rules the AI follows when it answers

A few things to know when you edit them:

* Words in [square brackets] are placeholders. They show in grey on the site until you replace them. Type over the brackets too.
* Words in {curly brackets} are filled in from `site.js`: {email}, {rc}, {setupPrice}, {carePrice} and {location}. Change a value once in `site.js` and it changes on every page. {clock} shows the time in Lagos.
* The product, project and update pages called "example" are templates. To add a real one, copy the example entry in `product.js`, `project.js` or `post.js`, give the copy a short name of its own in small letters with no spaces (that name becomes its web address), fill in the words and set `published` to `true`. Then point its card in `products.js`, `work.js` or `updates.js` to the new name. Until a page is published, it stays out of the sitemap and out of search results.
* The legal pages still have placeholders such as [DATE] and [NUMBER]. Fill them in before launch, and it is worth having a lawyer read them.
* The assistant learns what it knows from these same files, so when you change the words, it knows the new ones too.

## How it looks

The look of the site is in `app/globals.css`. The colours sit at the top, named for what they do:

* `--action` is the red of the one main button in an area, and `--action-hover` is its colour under the pointer. Keep red for main buttons only, never more than two on screen at once.
* `--danger` is for error messages and things that failed.
* `--tint` is the warm light grey that marks something new, like a fresh row in a table.

Every pair of text and background reaches 4.6:1 contrast or more, and 3.1:1 for large text, borders and focus rings. Keep it that way when you change a colour.

The font is Open Sans, set in `app/layout.js`. Open Sans has no naira sign (₦), so that one sign comes from Noto Sans, the open family that grew out of Open Sans. Its small files are in `assets/fonts` and only load on pages that show the sign. The sharing image uses the Open Sans files in the same folder and the logo in `assets/brand`.

Nothing moves because a visitor scrolls. The only motion is the wave, the demos people play with, short colour changes under the pointer, the Menu panel sliding in on phones, and the back to top button. When a visitor asks their device for less motion, the wave is drawn once and stays still.

## Add the keys

The site reads its keys from settings called environment variables. Each feature switches on as soon as its key is added, and nothing breaks while a key is missing.

* On your computer: make a copy of `.env.example`, name it `.env.local`, fill in what you have, and restart `npm run dev`.
* Online: add the same names in Vercel, as explained further down.

Keep `.env.local` to yourself. It is already left out of git.

**`ANTHROPIC_API_KEY`** switches on the AI answers in the site assistant. Sign in at console.anthropic.com, open Settings, then API Keys, and create a key. The account needs some credit before the key works. Each answer writes its token use and a rough cost to the log, so you can keep an eye on spending.

**`SUPABASE_URL`** is the address of your database. In the Supabase dashboard, open Project Settings, then Data API, and copy the Project URL.

**`SUPABASE_SERVICE_KEY`** lets the site save to the database. In the Supabase dashboard, open Project Settings, then API Keys, and copy the secret key. Older projects call it the service_role key. Keep it private. The site only uses it on the server, never in the browser.

**`RESEND_API_KEY`** sends you an email for each new contact message. Sign up at resend.com, open API Keys and create a key.

**`CONTACT_TO_EMAIL`** is the inbox those emails go to. The company address is titanwavemedia@proton.me. Until you verify a domain in Resend, this must be the email address you used to sign up to Resend, or the emails will not send.

**`NEXT_PUBLIC_WHATSAPP_NUMBER`** is the number behind every WhatsApp link, in digits only with the country code. The site already uses 2347064094004, so you only need this if the number changes. After you change it on Vercel, deploy again so the pages pick it up.

Two more are optional:

**`SITE_URL`** is the address used in shared links and in the sitemap. On Vercel the site works this out by itself, so only set it if you want a different address.

**`CONTACT_FROM_EMAIL`** is who the contact emails come from once your domain is verified in Resend, for example `Titan Wave Media <hello@yourdomain.com>`. Until then they come from onboarding@resend.dev.

## Set up the database

The database keeps contact messages, the notify list and the assistant's conversations. It runs on Supabase.

1. Create a free project at supabase.com. Pick a region close to Lagos, such as London or Frankfurt.
2. In the project, open SQL Editor and click New query. Paste in everything from `supabase/schema.sql` and click Run. You should see "Success. No rows returned". It is safe to run it again later.
3. Open Table Editor. You should see three empty tables: `messages` for the contact form, `notify_list` for people who asked to hear about launches, and `chat_logs` for conversations with the assistant.
4. Copy the Project URL and the secret key into `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`.
5. Restart the site, or deploy again on Vercel. Send a test message from the contact page and check that it shows up in `messages`.

The tables are locked, so nobody can read them from a browser. Only the site's server can write to them. Before a conversation is saved, the site takes out email addresses, phone numbers, account numbers and names. There is more about this, and about how long to keep data, in `supabase/README.md`.

## Put it online with Vercel

1. Put this folder in a GitHub repository. A private one is fine. Your keys and the design files are already left out.
2. Sign in at vercel.com with GitHub, click Add New, then Project, and import the repository. Vercel recognises the project, so leave the build settings as they are.
3. On the same screen, open Environment Variables and add your keys, one name and value at a time. Paste the value only, with no quotes.
4. Click Deploy. After a minute or two, the site is live on a vercel.app address.
5. To use your own domain, open the project, then Settings, then Domains, and follow the steps. The site uses that domain in its links and sitemap by itself.

From then on, every push to the main branch goes live on its own. If you add or change a key in Vercel, open Deployments, pick the latest one and click Redeploy, so the site picks up the change.

To send emails from your own domain, open Domains in Resend, add the domain, and add the records it shows where you bought the domain. Once it says Verified, set `CONTACT_FROM_EMAIL` to an address on that domain. After that, `CONTACT_TO_EMAIL` can be any inbox you like.

## Good to know

* Each visitor can send the assistant up to 30 messages an hour, and the forms up to 20 times an hour. This keeps spam and the AI bill down.
* If the AI cannot answer, for example because the key stopped working, the assistant answers from its own list instead and offers WhatsApp.
* If a message cannot be saved or emailed, it is written in full to the log, so it is not lost. On Vercel, open the project and then Logs.
* Cookie preferences in the footer has one switch, Remember my choices. When a visitor turns it on, the setup builder and the dataset builder keep their picks in that browser for the next visit. Nothing is sent anywhere, and turning it off deletes them.

## What Phase 2 adds

Phase 1 is the public website. Phase 2 adds three things:

* **Accounts.** Clients sign in with their email address. Supabase already keeps the site's data and can handle signing in too.
* **The client console.** A private page for each client once they sign in, where they can follow their AI setup, see their products and invoices, and ask for changes, all in one place.
* **Pay with Titan Wave.** Paying online, in naira, for products, setups and monthly care. Each product page already has a box with the price and a "Notify me" button, and that is where the pay button will go. The people on the notify list are the first to tell when buying opens. The terms and refund pages already describe paying through a payment partner.

None of Phase 2 is built yet.
