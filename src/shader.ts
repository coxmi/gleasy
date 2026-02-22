import { createUniforms } from './uniforms.ts'
import type { Uniforms, UniformArgs } from './uniforms.ts'
import type { Expand } from './util.ts'

/**
 * ```ts
 * // create a shader with automatic uniforms:
 * const shader = new Shader<{ uTex: 'sampler2D' }>(gl, vertex, fragment, {
 *   uTex: 0
 * })
 * 
 * // update the uniform values during rendering:
 * shader.uniforms.uTex = 1
 * ```
 */

export class Shader<U extends UniformArgs = {}> {
    program: WebGLProgram
    uniforms: Expand<Uniforms<U>>
    gl: WebGL2RenderingContext
    constructor(
        gl: WebGL2RenderingContext, 
        vertexShader: string, 
        fragmentShader: string, 
        uniformValues?: Uniforms<U>
    ) {
        this.program = createProgram(gl, vertexShader, fragmentShader)
        this.uniforms = createUniforms<U>(gl, this.program, uniformValues) 
        this.gl = gl
    }
    use() {
        this.gl.useProgram(this.program)
    }
    delete() {
        this.gl.deleteProgram(this.program)
        // @ts-expect-error
        this.program = undefined
        // @ts-expect-error
        this.uniforms = undefined
        // @ts-expect-error
        this.gl = undefined
    }
}


function createProgram(gl: WebGL2RenderingContext, vertexShader: string, fragmentShader: string) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShader.trimStart())
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader.trimStart())
    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    // cleanup
    gl.detachShader(program, vs)
    gl.detachShader(program, fs)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(program) as string)
    return program
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
        throw new Error(gl.getShaderInfoLog(shader) as string)
    return shader
}