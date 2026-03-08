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
    const buffer = new VertexBuffer(gl, new Float32Array([
         0.0,  0.5, 0.0,  1.0, 0.0, 0.0, 
        -0.5, -0.5, 0.0,  0.0, 1.0, 0.0, 
         0.5, -0.5, 0.0,  0.0, 0.0, 1.0 
    ]))

    const vao = new VAO(gl, {
        buffer,
        layout: {
            myPositionName: { type: 'vec3', location: 0 },
            myColorName: { type: 'vec3', location: 1 },
        }
    })
    shader.use()
    vao.bind()
    vao.draw()
}


function vertexIndices() {
    const shader = new Shader(gl, vertexSrc, fragmentSrc)
    const buffer = new VertexBuffer(gl, new Float32Array([
         0.0,  0.5, 0.0,  1.0, 0.0, 0.0, 
        -0.5, -0.5, 0.0,  0.0, 1.0, 0.0, 
         0.5, -0.5, 0.0,  0.0, 0.0, 1.0 
    ]))

    // use Uint-typed arrays
    const index = new VertexIndex(gl, new Uint16Array([
        0, 1, 2
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
    // bind and draw the index
    index.bind()
    index.draw()
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
    const buffer = new VertexBuffer(gl, new Float32Array([
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

    // update uniforms before each draw call
    shader.uniforms.uMovePos = [0.2, 0.2, 0.2]

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