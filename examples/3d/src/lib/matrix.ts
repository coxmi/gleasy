// Minimal matrix helpers for the example. Real user code would use a library
// like gl-matrix, so keep this as userland code separate from the rendering.


export type Mat4 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number]
export type Vec3 = [number, number, number]

export function identity(): Mat4 {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

export function perspective(fov: number, aspect: number, near: number, far: number): Mat4 {
    const f = 1.0 / Math.tan(fov / 2)
    const rangeInv = 1 / (near - far)
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ]
}

export function lookAt(eye: number[], center: number[], up: number[]): Mat4 {
    const z = normalize3(sub3(eye, center))
    const x = normalize3(cross3(up, z))
    const y = cross3(z, x)
    return [
        x[0], y[0], z[0], 0,
        x[1], y[1], z[1], 0,
        x[2], y[2], z[2], 0,
        -dot3(x, eye), -dot3(y, eye), -dot3(z, eye), 1
    ]
}

export function normalize3(v: number[]): Vec3 {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
    return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [v[0], v[1], v[2]]
}

function sub3(a: number[], b: number[]): number[] {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function cross3(a: number[], b: number[]): number[] {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ]
}

function dot3(a: number[], b: number[]): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
