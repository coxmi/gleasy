// GLB loading. Eventually this will move into gleasy, so treat it as library code
// (not user code) and keep it tucked away from the example itself.

import { VertexBuffer, VertexIndex } from 'gleasy'


// parse a raw glb into its JSON manifest and binary chunk

function parseGlb(buffer: ArrayBuffer): { gltf: any, bin: ArrayBuffer } {
    const view = new DataView(buffer)

    const magic = view.getUint32(0, true)
    if (magic !== 0x46546c67) throw new Error('Invalid GLB format')

    let offset = 12
    const jsonLength = view.getUint32(offset, true)
    const jsonType = view.getUint32(offset + 4, true)
    if (jsonType !== 0x4e4f534a) throw new Error('Invalid JSON chunk type')

    offset += 8
    const jsonText = new TextDecoder().decode(new Uint8Array(buffer, offset, jsonLength))
    const gltf = JSON.parse(jsonText)
    offset += jsonLength

    const binLength = view.getUint32(offset, true)
    const binType = view.getUint32(offset + 4, true)
    if (binType !== 0x004e4942) throw new Error('Invalid BIN chunk type')
    offset += 8

    return { gltf, bin: buffer.slice(offset, offset + binLength) }
}


export async function loadGlb(path: string): Promise<ArrayBuffer> {
    const res = await fetch(path)
    return await res.arrayBuffer()
}


type TypedArrayLike = Float32Array | Int8Array | Uint8Array | Int16Array | Uint16Array | Uint32Array

const TYPE_MAP: Record<number, new (buffer: ArrayBuffer, byteOffset?: number, length?: number) => TypedArrayLike> = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
}

const TYPE_COMPONENTS: Record<string, number> = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
}

export function getTypedArray(
    bin: ArrayBuffer,
    accessor: { bufferView: number, byteOffset?: number, componentType: number, type: string, count: number },
    gltf: { bufferViews: { byteOffset?: number, byteStride?: number }[] }
): TypedArrayLike {
    const bv = gltf.bufferViews[accessor.bufferView]
    const start = (bv.byteOffset || 0) + (accessor.byteOffset || 0)
    const componentCount = TYPE_COMPONENTS[accessor.type]
    const TypedArrayCtor = TYPE_MAP[accessor.componentType]
    const length = accessor.count * componentCount
    return new TypedArrayCtor(bin, start, length)
}


// build a VertexBuffer, VertexIndex, and layout description for a mesh, from a
// raw glb. handles both separate and interleaved attribute bufferViews

type MeshAttributeType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'mat2' | 'mat3' | 'mat4'

const ACCESSOR_TYPE: Record<string, MeshAttributeType> = {
    SCALAR: 'float',
    VEC2: 'vec2',
    VEC3: 'vec3',
    VEC4: 'vec4',
    MAT2: 'mat2',
    MAT3: 'mat3',
    MAT4: 'mat4'
}

type MeshLayoutValue = { offset: number, stride: number } & {
    [K in MeshAttributeType]: { type: K }
}[MeshAttributeType]

export type MeshLayout = Record<string, MeshLayoutValue>

export type Mesh = {
    buffer: VertexBuffer
    index?: VertexIndex
    layout: MeshLayout
}

export function meshFromGlb(gl: WebGL2RenderingContext, glb: ArrayBuffer, attributes?: string[]): Mesh {
    const { gltf, bin } = parseGlb(glb)
    const primitive = gltf.meshes[0].primitives[0]

    // only load the attributes the shader uses (e.g. ['POSITION', 'NORMAL']),
    // defaulting to the full set of attributes on the primitive
    const names = attributes
        ? Object.keys(primitive.attributes).filter(name => attributes.includes(name))
        : Object.keys(primitive.attributes)

    // byte position of each attribute within the bin, and its stride between vertices
    const attrs = names.map(name => {
        const index = primitive.attributes[name]
        const accessor = gltf.accessors[index]
        if (accessor.componentType !== 5126) {
            throw new Error(`Unsupported component type for ${name} (${accessor.componentType}), only float32 attributes are supported`)
        }
        const type = ACCESSOR_TYPE[accessor.type]
        if (!type) throw new Error(`Unsupported attribute type for ${name} (${accessor.type})`)
        const size = TYPE_COMPONENTS[accessor.type] * 4
        const stride = gltf.bufferViews[accessor.bufferView].byteStride || size
        const start = (gltf.bufferViews[accessor.bufferView].byteOffset || 0) + (accessor.byteOffset || 0)
        const end = start + (accessor.count - 1) * stride + size
        return { name, type, start, end, stride }
    })

    // upload all attributes as a single zero-copy buffer over the bin
    const start = Math.min(...attrs.map(a => a.start))
    const end = Math.max(...attrs.map(a => a.end))
    const buffer = new VertexBuffer(gl, new Float32Array(bin, start, (end - start) / 4))

    const layout: MeshLayout = {}
    for (const attr of attrs) {
        layout[attr.name] = { type: attr.type, offset: attr.start - start, stride: attr.stride }
    }

    const mesh: Mesh = { buffer, layout }
    if (primitive.indices !== undefined) {
        const accessor = gltf.accessors[primitive.indices]
        const indices = getTypedArray(bin, accessor, gltf) as Uint8Array | Uint16Array | Uint32Array
        mesh.index = new VertexIndex(gl, indices)
    }
    return mesh
}
