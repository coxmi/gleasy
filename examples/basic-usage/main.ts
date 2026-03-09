import { setGLViewport } from '../../src/html/index.ts'
import { Shader, Texture, FrameBuffer, VertexBuffer, VertexIndex, VAO } from '../../src/index.ts'
import { saveRenderResult } from '../../test/common/render.ts'

// init canvas and gl

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const gl = canvas.getContext('webgl2')!
setGLViewport(gl, canvas)

// basic shaders 

const vertexSrc = `
    #version 300 es
    in vec3 aPosition;
    in vec3 aColor;
    out vec3 vColor;
    void main() {
        gl_Position = vec4(aPosition, 1.0);
        vColor = aColor;
    }
`

const fragmentSrc = `
    #version 300 es
    precision highp float;
    in vec3 vColor;
    out vec4 outColor;
    void main() {
        outColor = vec4(vColor, 1.0);
    }
`

// programs

function interleavedAttributes() {
    const shader = new Shader(gl, vertexSrc, fragmentSrc)    
    const buffer = new VertexBuffer(gl, new Float32Array([
         // x,y,z / r,g,b
         0.0,  0.5, 0.0,  1.0, 0.0, 0.0, 
        -0.5, -0.5, 0.0,  0.0, 1.0, 0.0, 
         0.5, -0.5, 0.0,  0.0, 0.0, 1.0 
    ]))
    const vao = new VAO(gl, shader, {
        buffer,
        layout: {
            aPosition: { type: 'vec3' },
            aColor: { type: 'vec3' },
        }
    })
    shader.use()
    vao.bind()
    vao.draw()
}


function multipleBuffers() {
    const shader = new Shader(gl, vertexSrc, fragmentSrc)
    const vertex = new VertexBuffer(gl, new Float32Array([
         0.0,  0.5, 0.0,  
        -0.5, -0.5, 0.0,  
         0.5, -0.5, 0.0,  
    ]))
    const color = new VertexBuffer(gl, new Float32Array([
        1.0, 0.0, 0.0, 
        0.0, 1.0, 0.0, 
        0.0, 0.0, 1.0 
    ]))
    const vao = new VAO(gl, shader, {
        layout: {
            aPosition: { type: 'vec3', buffer: vertex },
            aColor: { type: 'vec3', buffer: color },
        }
    })
    shader.use()
    vao.bind()
    vao.draw()
}


function definedAttributeLocations() {
    const vertexSrcWithLocationSpecifiers = `
        #version 300 es
        layout(location = 0) in vec3 aPosition;
        layout(location = 1) in vec3 aColor;
        out vec3 vColor;
        void main() {
            gl_Position = vec4(aPosition, 1.0);
            vColor = aColor;
        }
    `
    const shader = new Shader(gl, vertexSrcWithLocationSpecifiers, fragmentSrc)

    const buffer = new VertexBuffer(gl, [
         0.0,  0.5, 0.0,  1.0, 0.0, 0.0, 
        -0.5, -0.5, 0.0,  0.0, 1.0, 0.0, 
         0.5, -0.5, 0.0,  0.0, 0.0, 1.0 
    ]);

    // when buffer.bind() is called, the described attribute pointers are bound for the shader
    buffer.layout = [
        { type: 'vec3', location: 0 },
        { type: 'vec3', location: 1 },
    ]

    shader.use()
    // call buffer.bind() and buffer.draw() directly without a VAO
    // (this has some overhead over using a VAO, so use VAOs where you can)
    buffer.bind()
    buffer.draw()
}


function vertexIndices() {
    const shader = new Shader(gl, vertexSrc, fragmentSrc)
    const buffer = new VertexBuffer(gl, new Float32Array([
         0.0,  0.5, 0.0,  1.0, 0.0, 0.0, 
        -0.5, -0.5, 0.0,  0.0, 1.0, 0.0, 
         0.5, -0.5, 0.0,  0.0, 0.0, 1.0 
    ]))

    // use unsigned int TypedArrays for indices:
    // (e.g. Uint8Array, Uint16Array, Uint32Array, Uint8ClampedArray)
    const index = new VertexIndex(gl, new Uint8Array([0, 1, 2]))
    const index2 = new VertexIndex(gl, new Uint8Array([2, 1, 0]))

    const vao = new VAO(gl, shader, {
        // the first index is bound in the 
        // vertex array object
        index, 
        buffer,
        layout: {
            aPosition: { type: 'vec3' },
            aColor: { type: 'vec3' },
        }
    })
    shader.use()
    // no need to bind/draw the first index, as 
    // it's bound implicitly within the VAO
    vao.bind()
    vao.draw()

    // but if you have multiple indexes, 
    // these can be bound/drawn explicitly
    vao.bind()
    index2.bind()
    index2.draw()
}


function uniforms() {
    const vertexSrc = `
        #version 300 es
        // uniform added to move position
        uniform vec3 uMovePos; 
        in vec3 APOS;
        in vec3 aPosition;
        in vec3 aColor;
        out vec3 vColor;

        void main() {
            gl_Position = vec4(aPosition + uMovePos, 1.0);
            vColor = aColor;
        }
    `

    // use type hints for uniforms, and set initial values
    type Uniforms = { uMovePos: 'vec3' }
    const shader = new Shader<Uniforms>(gl, vertexSrc, fragmentSrc, {
        uMovePos: [0, 0, 0]
    })

    const buffer = new VertexBuffer(gl, [
         0.0,  0.5, 0.0,  1.0, 0.0, 0.0, 
        -0.5, -0.5, 0.0,  0.0, 1.0, 0.0, 
         0.5, -0.5, 0.0,  0.0, 0.0, 1.0 
    ])
    const vao = new VAO(gl, shader, {
        buffer,
        layout: {
            aPosition: { type: 'vec3' },
            aColor: { type: 'vec3' },
        }
    })
    shader.use()
    // update uniforms before each draw call
    shader.uniforms.uMovePos = [0.2, 0.2, 0.2]
    vao.bind()
    vao.draw()
}


// @ts-ignore expose to html
window.saveRenderResult = () => saveRenderResult(gl)
// @ts-ignore expose to html
window.interleavedAttributes = interleavedAttributes
// @ts-ignore expose to html
window.multipleBuffers = multipleBuffers
// @ts-ignore expose to html
window.definedAttributeLocations = definedAttributeLocations
// @ts-ignore expose to html
window.vertexIndices = vertexIndices
// @ts-ignore expose to html
window.uniforms = uniforms