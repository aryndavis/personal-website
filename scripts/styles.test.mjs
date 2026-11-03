// Run with `npm test`. Guards for styles.css that are easy to break by accident.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

/** Each rule as { selector, body }, ignoring comments. */
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }))

test('small pink text uses --raspberry: --pink-deep is too light for text (about 3.8:1 on cream)', () => {
  const offenders = rules.filter((rule) => /(^|[\s;])color:\s*var\(--pink-deep\)/.test(rule.body)).map((rule) => rule.selector)
  assert.deepEqual(offenders, [], 'use var(--raspberry) for pink text')
})

test('light text never sits on --pink-deep (cream or white on it is about 3.8:1)', () => {
  const offenders = rules
    .filter((rule) => /background(-color)?:\s*var\(--pink-deep\)/.test(rule.body) && /(^|[\s;])color:\s*var\(--(cream|white)\)/.test(rule.body))
    .map((rule) => rule.selector)
  assert.deepEqual(offenders, [], 'use var(--raspberry) as the background behind light text')
})
