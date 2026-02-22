
export type AttributeType = keyof typeof TYPE_LENGTH

export const TYPE_LENGTH = { 
    float: 1, vec2: 2, vec3: 3, vec4: 4,
    int: 1, ivec2: 2, ivec3: 3, ivec4: 4,
    uint: 1, uvec2: 2, uvec3: 3, uvec4: 4,
    bool: 1, bvec2: 2, bvec3: 3, bvec4: 4,
    mat2: 4, mat3: 9, mat4: 16, 
    mat2x3: 6, mat3x2: 6, mat2x4: 8, 
    mat4x2: 8, mat3x4: 12, mat4x3: 12
} as const

export const TYPE_COLUMNS = {
    mat2: 2, mat3: 3, mat4: 4,
    mat2x3: 2, mat3x2: 3, mat2x4: 2, 
    mat4x2: 4, mat3x4: 3, mat4x3: 4
} as const