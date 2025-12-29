    // @ts-nocheck

export type Vec3 = [number, number, number];

export const Mat4 = {
    identity: (): Float32Array => {
        return new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ])
    },
    perspective: (fov: number, aspect: number, near: number, far: number): Float32Array => {
        const f = 1.0 / Math.tan(fov / 2);
        const out = new Float32Array(16);
        out[0] = f / aspect; out[5] = f;
        out[10] = (far + near) / (near - far); out[11] = -1;
        out[14] = (2 * far * near) / (near - far);
        return out;
    },

    lookAt: (eye: Vec3, target: Vec3, up: Vec3): Float32Array => {
        const z = normalize(sub(eye, target));
        const x = normalize(cross(up, z));
        const y = normalize(cross(z, x));
        return new Float32Array([
            x[0], y[0], z[0], 0,
            x[1], y[1], z[1], 0,
            x[2], y[2], z[2], 0,
            -(x[0]*eye[0] + x[1]*eye[1] + x[2]*eye[2]),
            -(y[0]*eye[0] + y[1]*eye[1] + y[2]*eye[2]),
            -(z[0]*eye[0] + z[1]*eye[1] + z[2]*eye[2]), 1
        ]);
    },

    rotationX: (angle: number) => {
        const c = Math.cos(angle), s = Math.sin(angle);
        return new Float32Array([1,0,0,0, 0,c,-s,0, 0,s,c,0, 0,0,0,1]);
    },
    rotationY: (angle: number) => {
        const c = Math.cos(angle), s = Math.sin(angle);
        return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
    },
    rotationZ: (angle: number) => {
        const c = Math.cos(angle), s = Math.sin(angle);
        return new Float32Array([c,-s,0,0, s,c,0,0, 0,0,1,0, 0,0,0,1]);
    },
    scale: (sx: number, sy: number, sz: number) => {
        return new Float32Array([sx,0,0,0, 0,sy,0,0, 0,0,sz,0, 0,0,0,1]);
    },
    translation: (tx: number, ty: number, tz: number) => {
        return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, tx,ty,tz,1]);
    },

    multiply: (a: Float32Array, b: Float32Array): Float32Array => {
        const out = new Float32Array(16);
        for (let i=0; i<4; i++) for (let j=0; j<4; j++) {
            let s=0; for(let k=0; k<4; k++) s+= a[k*4+i]!*b[j*4+k]!;
            out[j*4+i]=s;
        }
        return out;
    },

    invert: (m: Float32Array): Float32Array => {
        const out = new Float32Array(16);
        const m00 = m[0]!, m01 = m[1]!, m02 = m[2]!, m03 = m[3]!;
        const m10 = m[4]!, m11 = m[5]!, m12 = m[6]!, m13 = m[7]!;
        const m20 = m[8]!, m21 = m[9]!, m22 = m[10]!, m23 = m[11]!;
        const m30 = m[12]!, m31 = m[13]!, m32 = m[14]!, m33 = m[15]!;

        out[0] = m11 * m22 * m33 - m11 * m23 * m32 - m21 * m12 * m33 + m21 * m13 * m32 + m31 * m12 * m23 - m31 * m13 * m22;
        out[4] = -m10 * m22 * m33 + m10 * m23 * m32 + m20 * m12 * m33 - m20 * m13 * m32 - m30 * m12 * m23 + m30 * m13 * m22;
        out[8] = m10 * m21 * m33 - m10 * m23 * m31 - m20 * m11 * m33 + m20 * m13 * m31 + m30 * m11 * m23 - m30 * m13 * m21;
        out[12] = -m10 * m21 * m32 + m10 * m22 * m31 + m20 * m11 * m32 - m20 * m12 * m31 - m30 * m11 * m22 + m30 * m12 * m21;
        out[1] = -m01 * m22 * m33 + m01 * m23 * m32 + m21 * m02 * m33 - m21 * m03 * m32 - m31 * m02 * m23 + m31 * m03 * m22;
        out[5] = m00 * m22 * m33 - m00 * m23 * m32 - m20 * m02 * m33 + m20 * m03 * m32 + m30 * m02 * m23 - m30 * m03 * m22;
        out[9] = -m00 * m21 * m33 + m00 * m23 * m31 + m20 * m01 * m33 - m20 * m03 * m31 - m30 * m01 * m23 + m30 * m03 * m21;
        out[13] = m00 * m21 * m32 - m00 * m22 * m31 - m20 * m01 * m32 + m20 * m02 * m31 + m30 * m01 * m22 - m30 * m02 * m21;
        out[2] = m01 * m12 * m33 - m01 * m13 * m32 - m11 * m02 * m33 + m11 * m03 * m32 + m31 * m02 * m13 - m31 * m03 * m12;
        out[6] = -m00 * m12 * m33 + m00 * m13 * m32 + m10 * m02 * m33 - m10 * m03 * m32 - m30 * m02 * m13 + m30 * m03 * m12;
        out[10] = m00 * m11 * m33 - m00 * m13 * m31 - m10 * m01 * m33 + m10 * m03 * m31 + m30 * m01 * m13 - m30 * m03 * m11;
        out[14] = -m00 * m11 * m32 + m00 * m12 * m31 + m10 * m01 * m32 - m10 * m02 * m31 - m30 * m01 * m12 + m30 * m02 * m11;
        out[3] = -m01 * m12 * m23 + m01 * m13 * m22 + m11 * m02 * m23 - m11 * m03 * m22 - m21 * m02 * m13 + m21 * m03 * m12;
        out[7] = m00 * m12 * m23 - m00 * m13 * m22 - m10 * m02 * m23 + m10 * m03 * m22 + m20 * m02 * m13 - m20 * m03 * m12;
        out[11] = -m00 * m11 * m23 + m00 * m13 * m21 + m10 * m01 * m23 - m10 * m03 * m21 - m20 * m01 * m13 + m20 * m03 * m11;
        out[15] = m00 * m11 * m22 - m00 * m12 * m21 - m10 * m01 * m22 + m10 * m02 * m21 + m20 * m01 * m12 - m20 * m02 * m11;

        let det = m00 * out[0] + m01 * out[4] + m02 * out[8] + m03 * out[12];
        if (det === 0) return out;
        det = 1.0 / det;
        for (let i = 0; i < 16; i++) out[i]! *= det;
        return out!;
    }
};

export function sub(a: Vec3, b: Vec3): Vec3 { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
export function cross(a: Vec3, b: Vec3): Vec3 { return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]]; }
export function normalize(v: Vec3): Vec3 {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return len > 0 ? [v[0]/len, v[1]/len, v[2]/len] : [0,0,0];
}
export function dot(a: Vec3, b: Vec3): number { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }

// Funkcja do transformowania punktu przez macierz (Local Space -> World Space)
export function transformPoint(v: Vec3, m: Float32Array): Vec3 {
    const x = v[0], y = v[1], z = v[2];
    const w = m[3]! * x + m[7]! * y + m[11]! * z + m[15]!;
    const rx = (m[0]! * x + m[4]! * y + m[8]! * z + m[12]!) / w;
    const ry = (m[1]! * x + m[5]! * y + m[9]! * z + m[13]!) / w;
    const rz = (m[2]! * x + m[6]! * y + m[10]! * z + m[14]!) / w;
    return [rx, ry, rz];
}

export function intersectRayAABB(rayO: number[], rayD: number[], boxMin: number[], boxMax: number[]): number | null {
    let tmin = (boxMin[0] - rayO[0]) / rayD[0];
    let tmax = (boxMax[0] - rayO[0]) / rayD[0];

    if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

    let tymin = (boxMin[1] - rayO[1]) / rayD[1];
    let tymax = (boxMax[1] - rayO[1]) / rayD[1];

    if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

    if ((tmin > tymax) || (tymin > tmax)) return null;

    if (tymin > tmin) tmin = tymin;
    if (tymax < tmax) tmax = tymax;

    let tzmin = (boxMin[2] - rayO[2]) / rayD[2];
    let tzmax = (boxMax[2] - rayO[2]) / rayD[2];

    if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

    if ((tmin > tzmax) || (tzmin > tmax)) return null;

    if (tzmin > tmin) tmin = tzmin;

    return tmin > 0 ? tmin : null;
}

export function closestPointLines(
    rayO: number[], rayD: number[], 
    lineO: number[], lineD: number[]
): number {
    const w0 = sub(rayO, lineO);
    const a = dot(rayD, rayD);
    const b = dot(rayD, lineD);
    const c = dot(lineD, lineD);
    const d = dot(rayD, w0);
    const e = dot(lineD, w0);

    const denom = a * c - b * b;
    if (Math.abs(denom) < 0.00001) return 0;

    const t = (a * e - b * d) / denom;
    return t;
}