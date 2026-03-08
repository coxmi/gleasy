import { TYPE_LENGTH, TYPE_COLUMNS, type AttributeType } from './attributes.ts'
import { glTypeFromTypedArray } from './util.ts'
import type { TypedArray, DrawMode } from './types.ts'
import type { Shader } from './shader.ts'

/**
 * ```ts
 * // create a VertexBuffer with a typed array
 * const vertexBuffer = new VertexBuffer(gl, new Float32Array([0, 0.5, 1]))
 *
 * // usage:
 * vertexBuffer.bind/unbind/delete()
 * ```
 */
export class VertexBuffer {
    buffer: WebGLBuffer
    vertices: TypedArray
    gl: WebGL2RenderingContext

    constructor(gl: WebGL2RenderingContext, vertices: TypedArray) {
        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        this.buffer = buffer
        this.vertices = vertices
        this.gl = gl
    }

    get count() {
        return this.vertices.length
    }

    get bytes() {
        return this.vertices.BYTES_PER_ELEMENT
    }

    get glType() {
        return glTypeFromTypedArray(this.gl, this.vertices)
    }

    bind() {
        const gl = this.gl
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    }

    unbind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)
    }

    delete() {
        this.gl.deleteBuffer(this.buffer)
        // @ts-expect-error
        this.buffer = undefined
        // @ts-expect-error
        this.vertices = undefined
        // @ts-expect-error
        this.gl = undefined
    }
}


/**
 * ```ts
 * // Create an index for use with gl.drawElements()
 * const index = new VertexIndex(gl, new Uint8Array[0, 1, 2, 3])
 * 
 * // usage:
 * index.bind/unbind/delete()
 * ```
 */
export class VertexIndex {
    buffer: WebGLBuffer
    indices: TypedArray
    gl: WebGL2RenderingContext

    constructor(gl: WebGL2RenderingContext, indices: TypedArray) {
        this.buffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
        this.indices = indices
        this.gl = gl
    }

    get count() {
        return this.indices.length
    }

    get bytes() {
        return this.indices.BYTES_PER_ELEMENT
    }

    get glType() {
        return glTypeFromTypedArray(this.gl, this.indices)
    }

    bind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer)
    }

    unbind() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null)
    }

    draw(mode: DrawMode = this.gl.TRIANGLES, offset = 0) {
        this.gl.drawElements(mode, this.count, this.glType, offset)
    }

    delete() {
        this.gl.deleteBuffer(this.buffer)
        // @ts-expect-error
        this.buffer = undefined
        // @ts-expect-error
        this.indices = undefined
        // @ts-expect-error
        this.gl = undefined
    }
}


type LayoutArgs = {
    buffer?: VertexBuffer
    // indices: Record<string, VertexIndex>
    layout: Record<string, {
        type: AttributeType
        buffer?: VertexBuffer
        location?: number
    }>
}

type ParsedLayout = { 
    buffer: VertexBuffer
    stride: number
    layout: Record<string,ParsedAttributeInfo>
}

type ParsedAttributeInfo = { 
    length: number
    columns: number
    offset: number
    location?: number
}

function parseLayouts(input: LayoutArgs) {
    const layouts: ParsedLayout[] = []
    const buffers = new Map<VertexBuffer, number>()

    for (const name in input.layout) {
        const schema = input.layout[name]
        const buffer = schema.buffer || input.buffer
        if (!buffer) throw new Error('No buffer set for ' + name)
        let index = buffers.get(buffer)
        if (index === undefined) buffers.set(buffer, index = buffers.size)
        const layout = layouts[index] ?? (layouts[index] = { buffer, stride: 0, layout: {} })
        const length = TYPE_LENGTH[schema.type]
        layout.layout[name] = {
            length,
            // @ts-expect-error: any unset have 1 column
            columns: TYPE_COLUMNS[schema.type] ?? 1,
            offset: layout.stride,
            location: schema.location
        }
        layout.stride += length
    }

    let vertices = 0
    for (const { buffer, stride } of layouts) {
        const elements = buffer.count / stride
        if (!vertices) vertices = elements
        // validate stride length as a factor of the overall buffer length
        const name = `${buffer.constructor.name} – ${buffer.buffer.constructor.name}(elements:${buffer.count})`
        if (buffer.count % stride !== 0) {
            const message = `${name}: attribute stride (${stride}) is not a factor of buffer size (${buffer.count}).`
            console.warn(message, buffer)
        }
        // validate vertex length is equal for all sibling buffers
        if (elements !== vertices) {
            console.warn(`${name}: Vertex count (${vertices}) does not match other buffers (${elements})`)
        }
    }
    return layouts
}

function pointAttributes(gl: WebGL2RenderingContext, parsedLayouts: ParsedLayout[], program?: WebGLProgram): void {
    for (const item of parsedLayouts) {
        const { stride, buffer, layout } = item
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer)
        for (const name in layout) {
            const { length, columns, offset, location } = layout[name]
            const attribLocation = location ?? (program ? gl.getAttribLocation(program, name) : -1)
            if (attribLocation < 0) 
                throw new Error(`No location found for ${name}, set the location or pass in a shader`)
            const rows = length / columns
            const bytesPerCol = rows * buffer.bytes
            for (let i = 0; i < columns; i++) {
                gl.enableVertexAttribArray(attribLocation + i)
                gl.vertexAttribPointer(
                    attribLocation + i, rows, buffer.glType,
                    false, // TODO: normalized option if required
                    stride * buffer.bytes,
                    (offset * buffer.bytes) + (i * bytesPerCol)
                )
            }
        }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}

/**
 * Create a vertex array object, to easily bind/unbind sets of attributes.
 * ```ts
 * // Instantiate with a shader reference:
 * const vao = new VAO(gl, Shader, {
 *   buffer: VertexBuffer,
 *   layout: {
 *     aPos: { type: 'vec3' }
 *   }
 * })
 * 
 * // or with layout specifiers to reuse the VAO in multiple shaders:
 * const vao = new VAO(gl, {
 *   buffer: VertexBuffer,
 *   layout: {
 *     aPos: { type: 'vec3', location: 0 }
 *   }
 * })
 * 
 * vao.draw(gl.TRIANGLES)
 * ```
 */

export class VAO {
    layouts: ParsedLayout[]
    vao: WebGLVertexArrayObject
    gl: WebGL2RenderingContext

    constructor(gl: WebGL2RenderingContext, shader: Shader, config: LayoutArgs)
    constructor(gl: WebGL2RenderingContext, config: LayoutArgs)
    constructor(gl: WebGL2RenderingContext, a: Shader | LayoutArgs, b?: LayoutArgs) {
        const config = (b ?? a) as LayoutArgs
        const shader = b ? (a as Shader) : undefined
        this.layouts = parseLayouts(config)
        this.vao = gl.createVertexArray()
        gl.bindVertexArray(this.vao)
        pointAttributes(gl, this.layouts, shader?.program)
        gl.bindVertexArray(null)
        this.gl = gl
    }

    get vertexCount() {
        // only use the first element since they all match in element count
        const { buffer, stride } = this.layouts[0]
        return buffer.count / stride
    }

    bind() {
        this.gl.bindVertexArray(this.vao)
    }
    unbind() {
        this.gl.bindVertexArray(null)
    }

    draw(mode: DrawMode = this.gl.TRIANGLES) {
        this.gl.drawArrays(mode, 0, this.vertexCount)
    }

    delete() {
        this.gl.deleteVertexArray(this.vao)
        // @ts-expect-error
        this.layouts = undefined
        // @ts-expect-error
        this.vao = undefined
        // @ts-expect-error
        this.gl = undefined
    }
}