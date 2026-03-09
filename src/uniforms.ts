import type { Expand } from "./util.ts"

export type UniformType =
    | 'float' | 'vec2' | 'vec3' | 'vec4'
    | 'int' | 'ivec2' | 'ivec3' | 'ivec4'
    | 'uint' | 'uvec2' | 'uvec3' | 'uvec4'
    | 'bool' | 'bvec2' | 'bvec3' | 'bvec4'
    | 'mat2' | 'mat3' | 'mat4'
    | 'mat2x3' | 'mat2x4'
    | 'mat3x2' | 'mat3x4'
    | 'mat4x2' | 'mat4x3'
    | 'sampler2D' | 'samplerCube'


const GL = WebGL2RenderingContext
const setters: Record<GLenum, (gl: WebGL2RenderingContext, loc: WebGLUniformLocation, v: any) => void> = {
    [GL.FLOAT]: (gl, loc, v) => gl.uniform1f(loc, v),
    [GL.FLOAT_VEC2]: (gl, loc, v) => gl.uniform2fv(loc, v),
    [GL.FLOAT_VEC3]: (gl, loc, v) => gl.uniform3fv(loc, v),
    [GL.FLOAT_VEC4]: (gl, loc, v) => gl.uniform4fv(loc, v),
    [GL.INT]: (gl, loc, v) => gl.uniform1i(loc, v),
    [GL.INT_VEC2]: (gl, loc, v) => gl.uniform2iv(loc, v),
    [GL.INT_VEC3]: (gl, loc, v) => gl.uniform3iv(loc, v),
    [GL.INT_VEC4]: (gl, loc, v) => gl.uniform4iv(loc, v),
    [GL.UNSIGNED_INT]: (gl, loc, v) => gl.uniform1ui(loc, v),
    [GL.UNSIGNED_INT_VEC2]: (gl, loc, v) => gl.uniform2uiv(loc, v),
    [GL.UNSIGNED_INT_VEC3]: (gl, loc, v) => gl.uniform3uiv(loc, v),
    [GL.UNSIGNED_INT_VEC4]: (gl, loc, v) => gl.uniform4uiv(loc, v),
    [GL.BOOL]: (gl, loc, v) => gl.uniform1i(loc, v),
    [GL.BOOL_VEC2]: (gl, loc, v) => gl.uniform2iv(loc, v),
    [GL.BOOL_VEC3]: (gl, loc, v) => gl.uniform3iv(loc, v),
    [GL.BOOL_VEC4]: (gl, loc, v) => gl.uniform4iv(loc, v),
    [GL.FLOAT_MAT2]: (gl, loc, v) => gl.uniformMatrix2fv(loc, false, v),
    [GL.FLOAT_MAT3]: (gl, loc, v) => gl.uniformMatrix3fv(loc, false, v),
    [GL.FLOAT_MAT4]: (gl, loc, v) => gl.uniformMatrix4fv(loc, false, v),
    [GL.FLOAT_MAT2x3]: (gl, loc, v) => gl.uniformMatrix2x3fv(loc, false, v),
    [GL.FLOAT_MAT2x4]: (gl, loc, v) => gl.uniformMatrix2x4fv(loc, false, v),
    [GL.FLOAT_MAT3x2]: (gl, loc, v) => gl.uniformMatrix3x2fv(loc, false, v),
    [GL.FLOAT_MAT3x4]: (gl, loc, v) => gl.uniformMatrix3x4fv(loc, false, v),
    [GL.FLOAT_MAT4x2]: (gl, loc, v) => gl.uniformMatrix4x2fv(loc, false, v),
    [GL.FLOAT_MAT4x3]: (gl, loc, v) => gl.uniformMatrix4x3fv(loc, false, v),
    [GL.SAMPLER_2D]: (gl, loc, v) => gl.uniform1i(loc, v),
    [GL.SAMPLER_CUBE]: (gl, loc, v) => gl.uniform1i(loc, v)
}

type UniformValueMap = {
    float: number
    vec2: Float32List | [number, number]
    vec3: Float32List | [number, number, number]
    vec4: Float32List | [number, number, number, number]

    int: number
    ivec2: Int32List | [number, number]
    ivec3: Int32List | [number, number, number]
    ivec4: Int32List | [number, number, number, number]

    uint: number
    uvec2: Uint32List | [number, number]
    uvec3: Uint32List | [number, number, number]
    uvec4: Uint32List | [number, number, number, number]

    bool: number
    bvec2: Int8Array | Uint8Array | [number, number]
    bvec3: Int8Array | Uint8Array | [number, number, number]
    bvec4: Int8Array | Uint8Array | [number, number, number, number]

    mat2: Float32List
    mat3: Float32List
    mat4: Float32List
    mat2x3: Float32List
    mat2x4: Float32List
    mat3x2: Float32List
    mat3x4: Float32List
    mat4x2: Float32List
    mat4x3: Float32List

    sampler2D: number
    samplerCube: number
}

export type UniformArgs = Record<string, UniformType>

export type Uniforms<T extends UniformArgs> = { 
    [K in keyof T]: UniformValueMap[T[K]] 
}

export function createUniforms<T extends UniformArgs>(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    initial?: Uniforms<T>
): Expand<Uniforms<T>> {
    const values: Record<string, any> = {}
    const uniformInfo: Record<string, { loc: WebGLUniformLocation, type: number }> = {}
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < numUniforms; i++) {
        const { name, type } = gl.getActiveUniform(program, i)!
        const loc = gl.getUniformLocation(program, name)
        const setter = loc && setters[type]
        if (!setter) {
            console.warn('Unsupported uniform type:', type, name)
            continue
        }
        // normalize array names for setters
        const setterName = name.endsWith('[0]') ? name.slice(0, -3) : name
        uniformInfo[setterName] = { loc, type: type }
        if (initial && setterName in initial) {
            values[setterName] = initial[setterName as keyof typeof initial]
        }
    }

    if (initial) {
        for (const key in initial) {
            if (!(key in uniformInfo)) console.warn(`Uniform '${key}' not used in shader`)
            const uniform = uniformInfo[key]
            if (uniform) setters[uniform.type](gl, uniform.loc, initial[key])
        }
    }

    return new Proxy(values, {
        get: (_, prop: string) => values[prop],
        set (_, prop: string, v: any) {
            const info = uniformInfo[prop]
            if (!info) throw new Error(`Uniform '${prop}' not used in shader`)
            values[prop] = v
            setters[info.type](gl, info.loc, v)
            return true
        }
    }) as Expand<Uniforms<T>>
}