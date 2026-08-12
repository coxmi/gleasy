import { execSync } from 'node:child_process'
import path from 'node:path'

const input = process.argv[2]

if (!input) {
    console.error('Usage: npm run mesh input.obj')
    process.exit(1)
}

const parsedPath = path.parse(input)
const outBase = path.join(parsedPath.dir, parsedPath.name)

const glb = `${outBase}.glb`
const optimised = `${outBase}.opt.glb`

// OBJ → GLB
execSync(
    `obj2gltf -i "${input}" -o "${glb}"`,
    { stdio: 'inherit' }
)

// GLB → optimized GLB
execSync(
    `gltf-transform optimize "${glb}" "${optimised}" \
        --compress meshopt \
        --texture-compress webp`,
    { stdio: 'inherit' }
)

console.log(`Done: ${optimised}`)