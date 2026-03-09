function flipPixels(pixels: Uint8Array, width: number, height: number) {
    const rowBytes = width * 4
    const tmp = new Uint8Array(rowBytes)
    for (let y = 0; y < height / 2; y++) {
        const top = y * rowBytes
        const bottom = (height - 1 - y) * rowBytes
        tmp.set(pixels.subarray(top, top + rowBytes))
        pixels.copyWithin(top, bottom, bottom + rowBytes)
        pixels.set(tmp, bottom)
    }
}

export function renderResult(gl: WebGL2RenderingContext) {
    const canvas = gl.canvas
    const pixels = new Uint8Array(canvas.width * canvas.height * 4)
    gl.readPixels(
        0,
        0,
        canvas.width,
        canvas.height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels
    )
    flipPixels(pixels, canvas.width, canvas.height)
    return {
        width: canvas.width,
        height: canvas.height,
        pixels: pixels
    }
}


export function saveRenderResult(gl: WebGL2RenderingContext) {
    window.__rendered = renderResult(gl)
}