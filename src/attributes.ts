import type { ArrayOfLength, ScalarOrArray, RepeatTuple } from './types.ts'

export type GlType = typeof GL_TYPES[AttributeType]
export type AttributeType = keyof typeof GL_TYPES

// limit attribute types depending on use
// e.g. no bool/bvec or sampler types in vertex attributes
export type VertexAttributeType = Exclude<
    AttributeType, 
    'bool' | 'bvec2' | 'bvec3' | 'bvec4' | 'sampler2D' | 'samplerCube'
>

// TODO: should this return a repeated tuple, or an array of arrays?
// uniforms currently use repeated tuple, but not sure if the DX is quite right
export type AttributeValueTypes<C extends number = 1> = {
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
    mat2: RepeatTuple<ArrayOfLength<number, 4>, C>
    mat3: RepeatTuple<ArrayOfLength<number, 9>, C>
    mat4: RepeatTuple<ArrayOfLength<number, 16>, C>
    mat2x3: RepeatTuple<ArrayOfLength<number, 6>, C>
    mat2x4: RepeatTuple<ArrayOfLength<number, 8>, C>
    mat3x2: RepeatTuple<ArrayOfLength<number, 6>, C>
    mat3x4: RepeatTuple<ArrayOfLength<number, 12>, C>
    mat4x2: RepeatTuple<ArrayOfLength<number, 8>, C>
    mat4x3: RepeatTuple<ArrayOfLength<number, 12>, C>
    sampler2D: ScalarOrArray<number, C>
    samplerCube: ScalarOrArray<number, C>
}

const GL = WebGL2RenderingContext
export const GL_TYPES = {
    float: GL.FLOAT, vec2: GL.FLOAT_VEC2, vec3: GL.FLOAT_VEC3, vec4: GL.FLOAT_VEC4,
    int: GL.INT, ivec2: GL.INT_VEC2, ivec3: GL.INT_VEC3, ivec4: GL.INT_VEC4,
    uint: GL.UNSIGNED_INT, uvec2: GL.UNSIGNED_INT_VEC2, uvec3: GL.UNSIGNED_INT_VEC3, uvec4: GL.UNSIGNED_INT_VEC4,
    bool: GL.BOOL, bvec2: GL.BOOL_VEC2, bvec3: GL.BOOL_VEC3, bvec4: GL.BOOL_VEC4,
    mat2: GL.FLOAT_MAT2, mat3: GL.FLOAT_MAT3, mat4: GL.FLOAT_MAT4,
    mat2x3: GL.FLOAT_MAT2x3, mat2x4: GL.FLOAT_MAT2x4,
    mat3x2: GL.FLOAT_MAT3x2, mat3x4: GL.FLOAT_MAT3x4,
    mat4x2: GL.FLOAT_MAT4x2, mat4x3: GL.FLOAT_MAT4x3,
    sampler2D: GL.SAMPLER_2D, 
    samplerCube: GL.SAMPLER_CUBE
} as const

export const TYPE_SIZE = {
    float: { row: 1, col: 1 },
    vec2: { row: 2, col: 1 },
    vec3: { row: 3, col: 1 },
    vec4: { row: 4, col: 1 },
    int: { row: 1, col: 1 },
    ivec2: { row: 2, col: 1 },
    ivec3: { row: 3, col: 1 },
    ivec4: { row: 4, col: 1 },
    uint: { row: 1, col: 1 },
    uvec2: { row: 2, col: 1 },
    uvec3: { row: 3, col: 1 },
    uvec4: { row: 4, col: 1 },
    bool: { row: 1, col: 1 },
    bvec2: { row: 2, col: 1 },
    bvec3: { row: 3, col: 1 },
    bvec4: { row: 4, col: 1 },
    mat2: { row: 2, col: 2 },
    mat3: { row: 3, col: 3 },
    mat4: { row: 4, col: 4 },
    mat2x3: { row: 3, col: 2 },
    mat2x4: { row: 4, col: 2 },
    mat3x2: { row: 2, col: 3 },
    mat3x4: { row: 4, col: 3 },
    mat4x2: { row: 2, col: 4 },
    mat4x3: { row: 3, col: 4 }
}

export const STD140_ALIGN = {
    float: 4, vec2: 8, vec3: 16, vec4: 16,
    int: 4, ivec2: 8, ivec3: 16, ivec4: 16,
    uint: 4, uvec2: 8, uvec3: 16, uvec4: 16,
    bool: 4, bvec2: 8, bvec3: 16, bvec4: 16,
    mat2: 16, mat3: 16, mat4: 16,
    mat2x3: 16, mat2x4: 16,
    mat3x2: 16, mat3x4: 16,
    mat4x2: 16, mat4x3: 16,
} as const
