import type { Expand } from "./util.ts"
import type { UniformAttributeType } from "./attributes.ts"


/**
 * Allowed values in uniform setters
 */
type UniformValueMap<C extends number> = {
    float: ScalarOrArray<number, C>
    vec2: RepeatTuple<[number, number], C>
    vec3: RepeatTuple<[number, number, number], C>
    vec4: RepeatTuple<[number, number, number, number], C>

    int: ScalarOrArray<number, C>
    ivec2: RepeatTuple<[number, number], C>
    ivec3: RepeatTuple<[number, number, number], C>
    ivec4: RepeatTuple<[number, number, number, number], C>

    uint: ScalarOrArray<number, C>
    uvec2: RepeatTuple<[number, number], C>
    uvec3: RepeatTuple<[number, number, number], C>
    uvec4: RepeatTuple<[number, number, number, number], C>

    bool: ScalarOrArray<number, C>
    bvec2: RepeatTuple<[number, number], C>
    bvec3: RepeatTuple<[number, number, number], C>
    bvec4: RepeatTuple<[number, number, number, number], C>

    mat2: RepeatTuple<ArrayLength<number, 4>, C>
    mat3: RepeatTuple<ArrayLength<number, 9>, C>
    mat4: RepeatTuple<ArrayLength<number, 16>, C>
    mat2x3: RepeatTuple<ArrayLength<number, 6>, C>
    mat2x4: RepeatTuple<ArrayLength<number, 8>, C>
    mat3x2: RepeatTuple<ArrayLength<number, 6>, C>
    mat3x4: RepeatTuple<ArrayLength<number, 12>, C>
    mat4x2: RepeatTuple<ArrayLength<number, 8>, C>
    mat4x3: RepeatTuple<ArrayLength<number, 12>, C>

    sampler2D: ScalarOrArray<number, C>
    samplerCube: ScalarOrArray<number, C>
}


/*
 * Type helpers for handling uniform arrays:
 * e.g. vec3[4] -> number[12]
 * e.g. vec3 -> number[3]
 * e.g. float[2] -> number[2]
 * e.g. float -> number
 */

// parse out the base uniform type (e.g. vec3 from 'vec3[4]')
type ParseUniformType<S extends string> = S extends `${infer U}[${string}]` ? U : S

// parse out the array length (e.g. 4 from 'vec3[4]')
type ParseArrayLength<S extends string> = S extends `${string}[${infer N extends number}]` ? N : never

// array of type T, length L
type ArrayLength<T, L extends number, R extends T[] = []> = 
    R['length'] extends L 
        ? R 
        : ArrayLength<T, L, [...R, T]>

// wrap in array if over 1
type ScalarOrArray<T extends any, C extends number> = C extends 1 ? T : ArrayLength<T, C>

// repeat a tuple's contents e.g. RepeatTuple<[number], 2> = [number, number]
type RepeatTuple<
    T extends unknown[], 
    N extends number, 
    Count extends unknown[] = [], 
    R extends unknown[] = []
> = Count['length'] extends N 
    ? R 
    : RepeatTuple<T, N, [...Count, unknown], [...R, ...T]>

// detect array length vec3[x], or fall back to single vec3
type UniformValue<T extends string> =
    ParseUniformType<T> extends UniformAttributeType
        ? ParseArrayLength<T> extends never
            ? T extends `${string}[]`
                ? number[]
                : UniformValueMap<1>[ParseUniformType<T> & keyof UniformValueMap<1>]
            : UniformValueMap<ParseArrayLength<T>>[ParseUniformType<T> & keyof UniformValueMap<ParseArrayLength<T>>]
        : never

// deal with struct types recursively
type NestedStructs<T> =
    T extends string ? UniformValue<T> : // basic GL type
    T extends Array<infer U> ? NestedStructs<U>[] : // array of structs
    T extends object ? { [K in keyof T]: NestedStructs<T[K]> } : // nested struct
    never

// allowed user input vec3 / vec3[] / vec3[4]
export type UniformTypeWithSizes = 
    | UniformAttributeType
    | `${UniformAttributeType}[${number}]`
    | `${UniformAttributeType}[]`


export type UniformArgValue =
    | UniformTypeWithSizes
    | { [key: string]: UniformArgValue }
    | UniformArgValue[]

export type UniformArgs = Record<string, UniformArgValue>


export type Uniforms<T extends Record<string, any>> = {
    [K in keyof T]: NestedStructs<T[K]>
}


// create setters

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


/**
 * create uniforms with typed setters
 * Works with:
 *  - Arrays with a specific length: vec3[8]
 *  - Or an unspecified length: vec3[]
 *  - Nested structs or struct arrays: { color: 'vec3' }[]
 * 
 */
export function createUniforms<T extends UniformArgs>(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    initial?: Uniforms<T>
): Expand<Uniforms<T>> {

    const values: Record<string, any> = {}
    const uniformInfo: Record<string, { loc: WebGLUniformLocation, type: number }> = {}

    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < n; i++) {
        const { name, type } = gl.getActiveUniform(program, i)!
        const loc = gl.getUniformLocation(program, name)!
        // normalize array names for setters
        const n = name.endsWith('[0]') ? name.slice(0, -3) : name
        uniformInfo[n] = { loc, type }
    }

    function setUniform(path: string, value: any) {
        const info = uniformInfo[path]
        if (info) {
            // leaf node, call the setter
            const setter = setters[info.type]
            if (!setter) return console.warn('Unsupported uniform type:', info.type, path)
            setter(gl, info.loc, value)
        } else if (Array.isArray(value)) {
            // struct array
            value.map((v, i) => setUniform(`${path}[${i}]`, v))
        } else if (value && typeof value === 'object') {
            // struct fields
            for (const k in value) setUniform(path ? `${path}.${k}` : k, value[k])
        } else {
            console.warn(`Uniform '${path}' not used in shader`)
        }
    }

    function createProxy(obj: any, path = ''): any {
        return new Proxy(obj, {
            get(_, prop: string) {
                const val = obj[prop]
                if (Array.isArray(val)) return val.map((v, i) => createProxy(v, `${path}${prop}[${i}]`))
                if (val && typeof val === 'object') return createProxy(val, path ? `${path}${prop}.` : `${prop}.`)
                return val
            },
            set(_, prop: string, v: any) {
                obj[prop] = v
                const fullPath = path ? `${path}.${prop}` : prop
                setUniform(fullPath, v)
                return true
            }
        })
    }
    
    if (initial) {
        for (const key in initial) {
            setUniform(key, initial[key])
            values[key] = initial[key]
        }
    }
    return createProxy(values) as Expand<Uniforms<T>>
}