import type { MNASystem as MNASystemSpec } from '../types';

/**
 * Modified Nodal Analysis (MNA) system with dense Gaussian elimination
 * and partial pivoting. Sized for educational circuits (< ~200 unknowns),
 * where a dense solve costs well under a millisecond.
 *
 * Unknown vector x = [ V_1 .. V_n , I_branch_1 .. I_branch_m ]
 * Node index -1 denotes ground (0 V) and is never part of the matrix.
 */
export class MNASystem implements MNASystemSpec {
  numNodes = 0;
  numBranches = 0;
  private dim: number;
  private G: Float64Array;
  private b: Float64Array;
  private frozen = false;

  /**
   * @param capacityNodes  upper bound on nodes (nets + device-internal nodes)
   * @param capacityBranches upper bound on voltage-source branch unknowns
   */
  constructor(capacityNodes: number, capacityBranches = 4) {
    this.dim = Math.max(1, capacityNodes) + Math.max(1, capacityBranches);
    this.G = new Float64Array(this.dim * this.dim);
    this.b = new Float64Array(this.dim);
  }

  /** allocate one more node index (compile phase, before freeze) */
  allocNode(): number {
    if (this.frozen || this.numNodes >= this.dim) throw new Error('node allocation overflow');
    return this.numNodes++;
  }

  /** lock layout: branch-row indexing becomes stable */
  freeze(): void {
    this.frozen = true;
  }

  addBranch(): number {
    if (this.frozen) throw new Error('addBranch after freeze');
    const k = this.numBranches;
    this.numBranches += 1;
    if (this.numNodes + this.numBranches > this.dim) throw new Error('branch capacity exceeded');
    return k;
  }

  /** conductance between node a and c (Siemens); either may be -1 (ground) */
  stampG(a: number, c: number, g: number): void {
    if (g === 0) return;
    if (a >= 0) this.G[a * this.dim + a] += g;
    if (c >= 0) this.G[c * this.dim + c] += g;
    if (a >= 0 && c >= 0) {
      this.G[a * this.dim + c] -= g;
      this.G[c * this.dim + a] -= g;
    }
  }

  /** current source: i flows a→c through the source (i.e. leaves node a, enters node c) */
  stampI(a: number, c: number, i: number): void {
    if (a >= 0) this.b[a] -= i;
    if (c >= 0) this.b[c] += i;
  }

  /** VCCS: current gm·(V(c+)−V(c−)) flows out+→out− */
  stampVCCS(op: number, om: number, cp: number, cm: number, gm: number): void {
    if (gm === 0) return;
    if (op >= 0) {
      if (cp >= 0) this.G[op * this.dim + cp] += gm;
      if (cm >= 0) this.G[op * this.dim + cm] -= gm;
    }
    if (om >= 0) {
      if (cp >= 0) this.G[om * this.dim + cp] -= gm;
      if (cm >= 0) this.G[om * this.dim + cm] += gm;
    }
  }

  /** ideal voltage source between plus and minus terminals (call after freeze) */
  stampV(plus: number, minus: number, volts: number, branch: number): void {
    const r = this.numNodes + branch; // frozen layout: branch rows start after all nodes
    if (plus >= 0) this.G[plus * this.dim + r] += 1;
    if (minus >= 0) this.G[minus * this.dim + r] -= 1;
    // branch constraint row: V(plus) - V(minus) = volts
    const row = r * this.dim;
    if (plus >= 0) this.G[row + plus] += 1;
    if (minus >= 0) this.G[row + minus] -= 1;
    this.b[r] += volts;
  }

  reset(): void {
    this.G.fill(0);
    this.b.fill(0);
  }

  solve(): Float64Array | null {
    const n = this.numNodes + this.numBranches;
    if (n === 0) return new Float64Array(0);
    // work on copies so the system can be re-stamped each iteration
    const A = new Float64Array(n * n);
    const rhs = new Float64Array(n);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) A[r * n + c] = this.G[r * this.dim + c];
      rhs[r] = this.b[r];
    }

    // forward elimination with partial pivoting
    for (let col = 0; col < n; col++) {
      let piv = col;
      let best = Math.abs(A[col * n + col]);
      for (let r = col + 1; r < n; r++) {
        const v = Math.abs(A[r * n + col]);
        if (v > best) {
          best = v;
          piv = r;
        }
      }
      if (best < 1e-14) return null; // singular
      if (piv !== col) {
        for (let c = col; c < n; c++) {
          const t = A[col * n + c];
          A[col * n + c] = A[piv * n + c];
          A[piv * n + c] = t;
        }
        const t = rhs[col];
        rhs[col] = rhs[piv];
        rhs[piv] = t;
      }
      const d = A[col * n + col];
      for (let r = col + 1; r < n; r++) {
        const f = A[r * n + col] / d;
        if (f === 0) continue;
        A[r * n + col] = 0;
        for (let c = col + 1; c < n; c++) A[r * n + c] -= f * A[col * n + c];
        rhs[r] -= f * rhs[col];
      }
    }

    // back substitution
    const x = new Float64Array(n);
    for (let r = n - 1; r >= 0; r--) {
      let s = rhs[r];
      for (let c = r + 1; c < n; c++) s -= A[r * n + c] * x[c];
      x[r] = s / A[r * n + r];
    }
    return x;
  }
}
