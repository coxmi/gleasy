import test from 'node:test'
import assert from 'node:assert'
import { compareExamplesWithScreenshots } from './common/playwright.ts' 

test("WebGL renders match saved references", async () => {
    await assert.doesNotReject(compareExamplesWithScreenshots)
})