
export type AttributeType = keyof typeof TYPE_INFO


// limit attribute types depending on use
// e.g. no bool/bvec types in vertex attributes
export type VertexAttributeType = Exclude<
    AttributeType, 'bool' | 'bvec2' | 'bvec3' | 'bvec4'
>

export const TYPE_INFO = {
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
    mat3x2: { row: 2, col: 3 },
    mat2x4: { row: 4, col: 2 },
    mat4x2: { row: 2, col: 4 },
    mat3x4: { row: 4, col: 3 },
    mat4x3: { row: 3, col: 4 }
} as const