import { glob } from 'glob'
import { updateScreenshots, getExampleInfo } from '../test/common/playwright.ts'

// npm run screenshots {searchterm} or
// npm run screenshots all

const colors = new Proxy({
	reset: '\x1b[0m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	cyan: '\x1b[36m',
	dim: '\x1b[2m'
}, {
	get: (target, prop) => {
		if (process.stdout.isTTY) return target[prop]
		return ''
	}
})


function main() {
	// only run when called via cli
	if (import.meta.url !== `file://${process.argv[1]}`) return
	const args = process.argv.slice(2)
	
	// help
	if (!args.length) {
		console.error(`${colors.red}No search term provided${colors.reset}`)
		console.log(
			`\n${colors.dim} To update specific examples, use a search term, e.g.:${colors.reset}\n` +
			`npm run screenshots ${colors.yellow}vertex${colors.reset}\n` +
			`\n${colors.dim}Or to update all, use: ${colors.reset}\n` + 
			`npm run screenshots ${colors.yellow}all${colors.reset}`
		)
		process.exit(1)
	}

	const runAll = args[0] === 'all'
	let searchTerms = runAll ? [] : args
    const htmlFiles = glob.sync('examples/*/*.html').filter(filepath => {
        if (runAll) return true
        return searchTerms.some(w => filepath.replace('examples/', '').includes(w))
    })

    if (!htmlFiles.length) {
    	console.warn(`No examples found in ${colors.red}examples/*${colors.reset} with search terms: ${colors.yellow}${searchTerms.join(', ')}${colors.reset}`)
    	return
    }

    console.log(`${colors.yellow}→${colors.reset} Press ${colors.yellow}enter${colors.reset} to create screenshots for:`)
    const pad = htmlFiles.length > 9 ? 2 : 1
    htmlFiles.map((file, index) => {
    	const number = (index + '').padStart(pad, '0')
    	const info = getExampleInfo(file)
    	console.log(`${colors.green} - ${info.name}${colors.reset}`)
    })

    promptOpen(async () => {
     	await updateScreenshots(htmlFiles)
     	const plural = arr => arr.length === 1 ? '' : 's'
     	console.log(`created ${htmlFiles.length} screenshot${plural(htmlFiles)}`)
    })
}


function promptOpen(callback: (...args: any[]) => any) {
	const { stdin } = process
	if (stdin.isTTY) stdin.setRawMode(true)
	stdin.once('data', async keyBuffer => {
		const key = keyBuffer.toString()
		if (key === '\r' || key === '\n') await callback()
		process.exit(0)
	})
}

main()