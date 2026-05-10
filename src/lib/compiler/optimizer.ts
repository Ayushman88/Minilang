import { TACInstruction } from './ir';

export class Optimizer {
  public optimize(instructions: TACInstruction[]): TACInstruction[] {
    let current = instructions;
    // Apply constant folding multiple times if needed
    for (let i = 0; i < 2; i++) {
      current = this.constantFolding(current);
    }
    return current;
  }

  private constantFolding(instructions: TACInstruction[]): TACInstruction[] {
    const optimized: TACInstruction[] = [];
    const constants = new Map<string, string>();

    for (const inst of instructions) {
      // Track assignments to constants
      if (inst.op === '=' && inst.arg1 && !isNaN(Number(inst.arg1))) {
        constants.set(inst.result!, inst.arg1);
      } else {
        // If it's a re-assignment to a variable that is now unknown, remove it from constants
        if (inst.result) constants.delete(inst.result);
      }

      // Perform folding for binary operations
      if (['+', '-', '*', '/'].includes(inst.op)) {
        const val1 = constants.get(inst.arg1!) || inst.arg1;
        const val2 = constants.get(inst.arg2!) || inst.arg2;

        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
          const n1 = Number(val1);
          const n2 = Number(val2);
          let res: number;
          switch (inst.op) {
            case '+': res = n1 + n2; break;
            case '-': res = n1 - n2; break;
            case '*': res = n1 * n2; break;
            case '/': res = n1 / n2; break;
            default: res = 0;
          }
          optimized.push({ op: '=', arg1: res.toString(), result: inst.result });
          constants.set(inst.result!, res.toString());
          continue;
        }
      }

      // Replace variables with constants if available
      const newInst = { ...inst };
      if (inst.arg1 && constants.has(inst.arg1)) newInst.arg1 = constants.get(inst.arg1);
      if (inst.arg2 && constants.has(inst.arg2)) newInst.arg2 = constants.get(inst.arg2);
      
      optimized.push(newInst);
    }
    return optimized;
  }
}
