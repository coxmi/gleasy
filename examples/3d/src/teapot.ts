import { Shader, VAO, setGLViewport } from 'gleasy'
import { saveRenderResult } from '../../../test/common/render.ts'
import { loadGlb, meshFromGlb } from './lib/glb.ts'
import { identity, lookAt, perspective, normalize3 } from './lib/matrix.ts'


// setup

const canvas = document.getElementById('canvas') as HTMLCanvasElement
const gl = canvas.getContext('webgl2')!
setGLViewport(gl, canvas)


// shaders

const vertexSrc = `
    #version 300 es
    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;
    in vec3 POSITION;
    in vec3 NORMAL;
    out vec3 vNormal;
    out vec3 vWorldPos;
    void main() {
        vec4 worldPos = uModel * vec4(POSITION, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = mat3(uModel) * NORMAL;
        gl_Position = uProjection * uView * worldPos;
    }
`

const fragmentSrc = `
    #version 300 es
    precision highp float;
    uniform vec3 uLightDir;
    uniform vec3 uColor;
    in vec3 vNormal;
    in vec3 vWorldPos;
    out vec4 outColor;
    void main() {
        vec3 n = normalize(vNormal);
        float diff = max(dot(n, normalize(uLightDir)), 0.0);
        float ambient = 0.15;
        vec3 color = uColor * (ambient + diff);
        outColor = vec4(color, 1.0);
    }
`


// render

async function renderTeapot() {
    const glb = await loadGlb('../assets/teapot.glb')
    const mesh = meshFromGlb(gl, glb, ['POSITION', 'NORMAL'])

    console.log(mesh)

    const shader = new Shader(gl, vertexSrc, fragmentSrc, {
        uModel: identity(),
        uView: lookAt([0, 3.5, 10], [0, 1.5, 0], [0, 1, 0]),
        uProjection: perspective(Math.PI / 4, canvas.width / canvas.height, 0.1, 100),
        uLightDir: normalize3([1, 2, 1]),
        uColor: [0.6, 0.65, 0.7]
    })

    const vao = new VAO(gl, shader, { ...mesh })

    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0.12, 0.12, 0.15, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    shader.use()
    vao.bind()
    mesh.index?.draw()
}


renderTeapot().then(() => saveRenderResult(gl))
