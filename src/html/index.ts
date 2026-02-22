
/**
 * Set the GL viewport to the currently displayed dimensions of the canvas
 */
export function setGLViewport(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const width = rect.width * dpr
    const height = rect.height * dpr
    canvas.width = width
    canvas.height = height
    gl.viewport(0, 0, width, height)    
}
