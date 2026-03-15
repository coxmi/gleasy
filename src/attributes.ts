
export type AttributeType = keyof typeof TYPE_INFO

// limit attribute types depending on use
// e.g. no bool/bvec types in vertex attributes
export type VertexAttributeType = Exclude<
    AttributeType, 
    'bool' | 'bvec2' | 'bvec3' | 'bvec4'
>

// limit attribute types depending on use
// e.g. no bool/bvec types in vertex attributes
export type UniformAttributeType = AttributeType | 'sampler2D' | 'samplerCube'

export const TYPE_INFO = {
    float:  { row: 1, col: 1, align: 4 },
    vec2:   { row: 2, col: 1, align: 8 },
    vec3:   { row: 3, col: 1, align: 16 },
    vec4:   { row: 4, col: 1, align: 16 },
    
    int:    { row: 1, col: 1, align: 4 },
    ivec2:  { row: 2, col: 1, align: 8 },
    ivec3:  { row: 3, col: 1, align: 16 },
    ivec4:  { row: 4, col: 1, align: 16 },
    
    uint:   { row: 1, col: 1, align: 4 },
    uvec2:  { row: 2, col: 1, align: 8 },
    uvec3:  { row: 3, col: 1, align: 16 },
    uvec4:  { row: 4, col: 1, align: 16 },
    
    bool:   { row: 1, col: 1, align: 4 },
    bvec2:  { row: 2, col: 1, align: 8 },
    bvec3:  { row: 3, col: 1, align: 16 },
    bvec4:  { row: 4, col: 1, align: 16 },
    
    mat2:   { row: 2, col: 2, align: 16 },
    mat3:   { row: 3, col: 3, align: 16 },
    mat4:   { row: 4, col: 4, align: 16 },
    mat2x3: { row: 3, col: 2, align: 16 },
    mat3x2: { row: 2, col: 3, align: 16 },
    mat2x4: { row: 4, col: 2, align: 16 },
    mat4x2: { row: 2, col: 4, align: 16 },
    mat3x4: { row: 4, col: 3, align: 16 },
    mat4x3: { row: 3, col: 4, align: 16 }
} as const

