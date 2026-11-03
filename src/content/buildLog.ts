import type { Entry, Inline } from './types'
// Code samples live in their own files (build-log/<post>/), so they're shown exactly as written.
import textCurl from './build-log/text-to-post/curl.sh.txt?raw'
import textFormat from './build-log/text-to-post/format.txt?raw'
import textFunction from './build-log/text-to-post/function.ts.txt?raw'
import textHandler from './build-log/text-to-post/handler.ts.txt?raw'
import textParse from './build-log/text-to-post/parse-note.ts.txt?raw'
import textPreview from './build-log/text-to-post/preview.ts.txt?raw'
import textPublish from './build-log/text-to-post/publish.ts.txt?raw'
import textSignature from './build-log/text-to-post/signature.ts.txt?raw'
import textSiteReads from './build-log/text-to-post/site-reads.ts.txt?raw'

// Build log: how the things on this site are made, step by step, with the code. Bodies are blocks like the
// other posts (see types.ts), plus `code` blocks. Never put a real phone number, token or account ID here.

/** Inline code, like a command or a setting name. */
const c = (text: string): Inline => ({ text, code: true })

export const buildLogPosts: Entry[] = [
  {
    slug: 'text-to-post',
    title: 'How I post wine tasting notes by text message',
    date: '2026-11-03',
    summary: 'Step by step, with the code: texting a tasting note to my site, getting a preview back, and publishing it with a YES.',
    tags: ['Netlify', 'Twilio', 'GitHub API', 'security'],
    body: [
      {
        type: 'p',
        text: 'Whenever I have a good wine, I take a picture of the bottle so I can remember it later. I also save the corks, in a fun holder I thrifted that looks like a cute cartoon waiter!',
      },
      {
        type: 'image',
        src: 'images/build-log/cork-waiter.jpg',
        alt: 'Me in heart-shaped glasses, smiling and holding my thrifted cork holder: a metal cartoon waiter with a bow tie, a round head and a body full of holes for corks.',
        caption: 'My thrifted cork holder, the cutest little cartoon waiter. He keeps all my corks!',
      },
      {
        type: 'p',
        text: 'But I ended up with a camera roll full of wine bottles and no idea what any of them actually tasted like, where I got them, or literally anything else about them. They got lost in my photo library, and I never looked back at them.',
      },
      {
        type: 'p',
        text: 'So I built a way to post tasting notes to my wine blog straight from my phone, while the wine is still in front of me! Now I text a note to a phone number, get a preview back, reply YES, and a few minutes later it’s live on the site. It’s such a fun little system, and it turned out to be a great excuse to think carefully about security, since anything that publishes to your website from a text message needs to be locked down.',
      },
      {
        type: 'p',
        text: 'Here’s how it works, step by step, with the code, in case you want to build something similar for your own site (a reading log, a plant journal, anything you’d like to update on the go!).',
      },

      { type: 'h', text: 'What you’ll need' },
      {
        type: 'list',
        items: [
          'A site built from files in a GitHub repo. Mine is a React site, and the tasting notes live in a JSON file that the site reads when it builds.',
          'Netlify, to host the site, rebuild it whenever the repo changes, and run a serverless function.',
          'A Twilio account and phone number, to receive the texts.',
        ],
      },
      { type: 'p', text: 'Here’s the whole flow:' },
      {
        type: 'list',
        items: [
          'I text a note to my Twilio number.',
          'Twilio sends it to a Netlify Function.',
          'The function checks the text is really from me, saves it, and texts back a preview.',
          'I reply YES, and the function commits the note to GitHub.',
          'Netlify sees the commit and rebuilds the site, with the new post on it.',
        ],
      },

      { type: 'h', text: 'Step 1: Decide what a text looks like' },
      { type: 'p', text: 'Before writing any code, I decided on a format that’s easy to type on a phone. Only the first line is required:' },
      { type: 'code', label: 'A tasting note, by text', text: textFormat },
      { type: 'p', text: ['Everything else is an optional label. Texting ', c('wine help'), ' sends back the full list, so I never have to remember it!'] },
      {
        type: 'image',
        src: 'images/build-log/wine-help-text.jpg',
        alt: 'A text conversation. I text “wine help”, and the reply lists the tasting note format: the required first line (wine name, grape and year), then optional labels for producer, region, where I bought it, style, price, rating, buy again, verdict, flavors, sweetness, body, acidity, tannin, what I paired it with, and notes.',
        caption: 'Texting “wine help” sends back every label I can use.',
      },
      {
        type: 'p',
        text: ['The parser reads the first line with a regular expression, then each ', c('label: value'), ' line after it. The important part is that it checks values instead of guessing. A rating of 11 gets a helpful error back, not a broken post:'],
      },
      { type: 'code', label: 'TypeScript', text: textParse },
      {
        type: 'p',
        text: ['My real parser also checks every label against a list, handles a multi-line ', c('notes:'), ' section, and limits how long a text can be, but this is the core of it.'],
      },

      { type: 'h', text: 'Step 2: Get a phone number, and register it' },
      { type: 'p', text: 'In Twilio, buy a number that can send and receive SMS. It costs about a dollar a month, plus around a cent per text.' },
      {
        type: 'p',
        text: [
          'The step that surprised me the most: in the US, carriers require you to register a number before it can send texts. A toll-free number needs ',
          { text: 'toll-free verification', em: true },
          ', and a local number needs ',
          { text: 'A2P 10DLC', em: true },
          ' registration. Both take a few days, so start this early! While you wait, a trial account can still text your own verified number.',
        ],
      },

      { type: 'h', text: 'Step 3: Write a function that receives texts' },
      {
        type: 'p',
        text: [
          'When your number gets a text, Twilio sends an HTTP POST to a URL you choose. It isn’t JSON: it’s a form (',
          c('application/x-www-form-urlencoded'),
          '), with the sender in ',
          c('From'),
          ' and the message in ',
          c('Body'),
          '. Your function answers with TwiML, a tiny bit of XML that tells Twilio what to text back.',
        ],
      },
      { type: 'p', text: 'Here’s the skeleton as a Netlify Function, which lives right next to the site and deploys with it:' },
      { type: 'code', label: 'netlify/functions/sms.ts', text: textFunction },
      { type: 'p', text: ['Escaping matters here, because a wine name with an ', c('&'), ' in it would otherwise break the XML.'] },

      { type: 'h', text: 'Step 4: Lock it down' },
      {
        type: 'p',
        text: 'This is the most important step! Anyone can find a URL and send it requests, so the function has to be sure every text really came from Twilio and from me.',
      },
      {
        type: 'p',
        text: [
          'First, check Twilio’s signature. Twilio signs every request with your account’s auth token. The signature is an HMAC-SHA1 of the webhook URL plus every form field (sorted by name, each name followed by its value), base64-encoded, sent in the ',
          c('X-Twilio-Signature'),
          ' header. The function recomputes it and compares the two:',
        ],
      },
      { type: 'code', label: 'TypeScript', text: textSignature },
      {
        type: 'p',
        text: [
          'One gotcha: sign with the exact URL you typed into Twilio, saved as a setting, not ',
          c('request.url'),
          '. Behind a host like Netlify, the URL your function sees can differ slightly, and then every real text fails the check.',
        ],
      },
      { type: 'p', text: 'Then, only accept your own number, add limits, and add a kill switch. Here’s the top of the handler with all of it in place:' },
      { type: 'code', label: 'netlify/functions/sms.ts', text: textHandler },
      {
        type: 'p',
        text: 'Notes are also stored as plain data and shown as plain text on the site, never as HTML, so nothing in a text can turn into code on the page.',
      },

      { type: 'h', text: 'Step 5: Preview before anything publishes' },
      {
        type: 'p',
        text: 'I didn’t want a typo to go straight to the site, so nothing publishes on the first text. The function saves the note for an hour and texts back a preview. Replying YES publishes it, and NO throws it away.',
      },
      {
        type: 'p',
        text: ['To hold the note between texts, I used Netlify Blobs, a small key-value store that comes with Netlify. It’s the same ', c('store'), ' from step 4:'],
      },
      { type: 'code', label: 'TypeScript', text: textPreview },
      { type: 'p', text: 'Two details I’m glad I thought about:' },
      {
        type: 'list',
        items: [
          'The preview only ever goes to my own number. Even if someone managed to fake the sender, they’d never see the preview, so they couldn’t confirm a post.',
          'The preview is deleted only after publishing works. If GitHub has a hiccup, the preview is still there, and I can just reply YES again.',
        ],
      },
      {
        type: 'p',
        text: [
          c('slugFor'),
          ' builds the post’s link from the wine name and vintage, with the same rules the site uses, so the link in the reply is the one that will actually exist.',
        ],
      },

      { type: 'h', text: 'Step 6: Publish by committing to GitHub' },
      {
        type: 'p',
        text: [
          'When I reply YES, the function adds the note to the site’s tasting notes file with a commit, using GitHub’s contents API. Reading the file gives its contents (base64-encoded) and its ',
          c('sha'),
          '. Writing it back with that ',
          c('sha'),
          ' tells GitHub which version you started from:',
        ],
      },
      { type: 'code', label: 'TypeScript', text: textPublish },
      {
        type: 'p',
        text: [
          'For the token, make a ',
          { text: 'fine-grained personal access token', em: true },
          ' that can only touch this one repo, with Contents: read and write and nothing else, and give it an expiration date. That way, even in the worst case, the token can’t do anything beyond editing files in this repo.',
        ],
      },

      { type: 'h', text: 'Step 7: Let the site rebuild itself' },
      {
        type: 'p',
        text: 'Because the note is now in the repo, Netlify sees the commit and rebuilds the site, the same way it would if I had edited the file myself. On the site’s side, the build imports the JSON file, checks that each entry has the shape of a note, and quietly skips anything malformed, so one bad entry can never break the whole site:',
      },
      { type: 'code', label: 'TypeScript', text: textSiteReads },
      { type: 'p', text: 'From there, a texted note is just like one I wrote by hand: it gets its own page, its tasting card, and its spot on the wine rack!' },

      { type: 'h', text: 'Step 8: Connect everything' },
      { type: 'p', text: 'With the code deployed, the last pieces are settings.' },
      {
        type: 'p',
        text: ['In Twilio, open your number’s Messaging configuration. Under “A message comes in”, choose Webhook, enter ', c('https://your-site.com/api/sms'), ', and pick HTTP POST.'],
      },
      { type: 'p', text: 'In Netlify, go to Site configuration → Environment variables and add these:' },
      {
        type: 'list',
        items: [
          'TWILIO_AUTH_TOKEN: from the Twilio console (mark it secret)',
          'SMS_WEBHOOK_URL: the webhook URL, exactly as you typed it in Twilio',
          'SMS_ALLOWED_FROM: your own number, like +1XXXXXXXXXX',
          'GITHUB_TOKEN: the fine-grained token (mark it secret)',
          'GITHUB_REPO: your-name/your-site',
          'SMS_PUBLISHING: on',
        ],
      },
      { type: 'p', text: 'Then redeploy, so the function picks up the new settings.' },

      { type: 'h', text: 'Step 9: Test it' },
      { type: 'p', text: 'You can check the lock from your own laptop first. A request without Twilio’s signature should be turned away:' },
      { type: 'code', label: 'Terminal', text: textCurl },
      { type: 'p', text: 'Then I tested it from my phone, in order, from safest to real:' },
      {
        type: 'list',
        items: [
          'Texting “wine help”, which should send back the format.',
          'Sending a broken note, like “wine: Just a name”, which should get a helpful error.',
          'A full note, replying NO, which should be discarded.',
          'A real note, replying YES.',
        ],
      },
      { type: 'p', text: 'The first time “wine help” texted me back, I was genuinely so excited!' },

      { type: 'h', text: 'Why I love this' },
      {
        type: 'p',
        text: 'The best part is how little friction there is now. Instead of a bottle photo I’ll never look at again, I get a real tasting note while the details are still fresh: what it tasted like, where I got it, what I ate with it, and whether I’d buy it again. And because every post goes through a preview and a YES, I trust it completely!',
      },
      {
        type: 'p',
        text: 'It’s also a nice reminder that small personal projects are a great place to practice doing things carefully. Most of this project wasn’t the texting. It was making sure only the right texts can ever publish anything. (My cork waiter is still on duty, though. Some habits are too cute to give up!)',
      },
    ],
  },
]
