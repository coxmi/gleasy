
export type TypedArray =
    | Float32Array
    | Int32Array
    | Uint32Array
    | Int16Array
    | Uint16Array
    | Int8Array
    | Uint8Array

export type GLType = 
    | WebGLRenderingContextBase['BYTE'] 
    | WebGLRenderingContextBase['UNSIGNED_BYTE']
    | WebGLRenderingContextBase['SHORT'] 
    | WebGLRenderingContextBase['UNSIGNED_SHORT'] 
    | WebGLRenderingContextBase['INT'] 
    | WebGLRenderingContextBase['UNSIGNED_INT'] 
    | WebGLRenderingContextBase['FLOAT'] 

export type DrawMode = 
    | WebGLRenderingContextBase['POINTS']
    | WebGLRenderingContextBase['LINES']
    | WebGLRenderingContextBase['LINE_LOOP']
    | WebGLRenderingContextBase['LINE_STRIP']
    | WebGLRenderingContextBase['TRIANGLES']
    | WebGLRenderingContextBase['TRIANGLE_STRIP']
    | WebGLRenderingContextBase['TRIANGLE_FAN']

