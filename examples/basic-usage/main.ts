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

    // when buffer.bind() is called, the described  
    // attribute pointers are bound for the shader
    buffer.setLayout([
        { type: 'vec3', location: 0 },
        { type: 'vec3', location: 1 },
    ])

    shader.use()
    // to call buffer.draw() directly without a VAO, bind the layout, then draw.
    // binding the layout has some overhead, so use VAOs where you can
    buffer.bind()
    buffer.bindLayout()
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
        // uniform added to transform position attribute
        uniform vec3 uMovePos; 
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
        uMovePos: [0.2, 0.2, 0.2]
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
    // update uniforms before each draw call with:
    // shader.uniforms.uMovePos = [0.4, 0.4, 0.4]
    vao.bind()
    vao.draw()
}

function uniformArrays() {
    const vertexSrc = `
        #version 300 es
        uniform vec3 uColors[4]; // array of 4 colors
        in vec2 aPosition;
        out vec3 vColor;
        void main() {
            gl_Position = vec4(aPosition, 1.0, 1.0);
            // pick a color based on vertex index
            int idx = gl_VertexID % 4; 
            vColor = uColors[idx];
        }
    `
    type Uniforms = { uColors: 'vec3' }
    const shader = new Shader<Uniforms>(gl, vertexSrc, fragmentSrc, {
        uColors: [
            // red, green, blue, yellow
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,
            1.0, 1.0, 0.0 
        ]
    })
    // 4 vertices for a quad, using gl.TRIANGLE_STRIP
    const buffer = new VertexBuffer(gl, [
        -0.5, -0.5,
         0.5, -0.5,
        -0.5,  0.5,
         0.5,  0.5
    ])

    const vao = new VAO(gl, shader, {
        buffer,
        layout: {
            aPosition: { type: 'vec2' },
        }
    })

    shader.use()
    vao.bind()
    vao.draw(gl.TRIANGLE_STRIP)
}

function uniformMatrices() {

    function rotate(radians: number) {
        var c = Math.cos(radians)
        var s = Math.sin(radians)
        return [
          c, -s, 0,
          s, c, 0,
          0, 0, 1,
        ];
    }    

    const vertexSrc = `
        #version 300 es
        uniform mat3 uTransform; // matrix transform
        in vec3 aPosition;
        in vec3 aColor;
        out vec3 vColor;
        void main() {
            gl_Position = vec4(aPosition * uTransform, 1.0);
            vColor = aColor;
        }
    `
    type Uniforms = { uTransform: 'mat3' }
    const shader = new Shader<Uniforms>(gl, vertexSrc, fragmentSrc, {
        uTransform: rotate(10)
    })

    // 4 vertices for a quad using gl.TRIANGLE_STRIP, with colors
    const buffer = new VertexBuffer(gl, [
        -0.5, -0.5, 0,  1.0, 0.0, 0.0,
         0.5, -0.5, 0,  0.0, 1.0, 0.0,
        -0.5,  0.5, 0,  0.0, 0.0, 1.0,
         0.5,  0.5, 0,  0.0, 0.0, 0.0,
    ])

    const vao = new VAO(gl, shader, {
        buffer,
        layout: {
            aPosition: { type: 'vec3' },
            aColor: { type: 'vec3' },
        }
    })

    shader.use()
    vao.bind()
    vao.draw(gl.TRIANGLE_STRIP)
}


// @ts-ignore: expose functions to html files
window.saveRenderResult = () => saveRenderResult(gl)
// @ts-ignore
window.interleavedAttributes = interleavedAttributes
// @ts-ignore
window.multipleBuffers = multipleBuffers
// @ts-ignore
window.definedAttributeLocations = definedAttributeLocations
// @ts-ignore
window.vertexIndices = vertexIndices
// @ts-ignore
window.uniforms = uniforms
// @ts-ignore
window.uniformArrays = uniformArrays
// @ts-ignore
window.uniformMatrices = uniformMatrices