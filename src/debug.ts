
// TODO: allow debug builds without this code

export function prettyConsole(log: string, source: string, isTrimmed: boolean) {
    log = log.split('\n').map(x => x.trim()).filter(Boolean).join('\n')
    const trim = (string: string) => (string.match(/^\s*/)?.[0] || '').split('\n').at(-1) || ''
    const trimmedSpaces = isTrimmed ? trim(source) : source
    
    const errors = log.split('\n').filter(Boolean).map(err => {
        const match = err.match(/ERROR:\s*(\d+):(\d+): '([^']+)' : (.*)/)
        const line = match?.[2] ? parseInt(match[2]) - 1 : -1
        const term = match?.[3] || ''
        const message = match?.[4] ? `${match[4]}` : ''
        return { line, term, message }
    })

    let size = 10
    const lineInfo = (line: number) => {
        const errs = errors.find(err => err.line === line)
        const outOfRange = errors.map(err => line < err.line - size - 1 || line > err.line + size + 1).filter(Boolean).length === errors.length
        const ellip = errors.map(err => line < err.line - size || line > err.line + size).filter(Boolean).length === errors.length
        return { outOfRange, ellip, error: errs }
    }

    let styles: string[] = []
    const style = 'font-weight:normal; font-size:0.95em;'
    const styledLines = source.trimStart().split('\n').map((line, i) => {
        const { outOfRange, ellip, error } = lineInfo(i)
        const num = (i + 1).toString().padStart(3, ' ')
        let code = line.startsWith(trimmedSpaces) ? line.slice(trimmedSpaces.length) : line
        if (outOfRange) return false
        if (ellip && lineInfo(i - 1).ellip) return false
        if (ellip) code = '...';
        styles.push(style + 'color:#b3b3b3;')
        
        if (error?.line === i) {
            let errorPos = code.indexOf(error.term)
            if (errorPos < 0 && error.term === 'constructor') errorPos = code.indexOf('(')
            if (errorPos < 0) errorPos = trim(code).length
            styles.push(style + 'color:#C72B4F; font-weight:500;')
            styles.push(style + 'font-style:italic; color:#F31D4F; font-weight:bold;')
            return [`%c${num}  %c${code}%c\n     ${' '.repeat(errorPos)}^${error.message}`]
        } else {
            styles.push(style + 'color:#525151;')
            return `%c${num}  %c${code}`
        }
    }).filter(Boolean).flat(Infinity).join('\n')
    return [styledLines].concat(styles)
}