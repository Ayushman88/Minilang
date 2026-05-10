import { ASTNode } from './parser';

export interface TACInstruction {
  op: string;
  arg1?: string;
  arg2?: string;
  result?: string;
  label?: string;
}

export class IRGenerator {
  private instructions: TACInstruction[] = [];
  private tempCount: number = 0;
  private labelCount: number = 0;

  private newTemp(): string {
    return `t${this.tempCount++}`;
  }

  private newLabel(): string {
    return `L${this.labelCount++}`;
  }

  public generate(node: ASTNode): TACInstruction[] {
    this.visit(node);
    return this.instructions;
  }

  private visit(node: ASTNode): string | undefined {
    switch (node.type) {
      case 'Program':
        node.body.forEach((n) => this.visit(n));
        return undefined;
      case 'Assignment':
        const val = this.visit(node.value);
        this.instructions.push({ op: '=', arg1: val, result: node.id });
        return node.id;
      case 'Print':
        const pVal = this.visit(node.value);
        this.instructions.push({ op: 'print', arg1: pVal });
        return undefined;
      case 'BinaryExpression':
        const left = this.visit(node.left);
        const right = this.visit(node.right);
        const res = this.newTemp();
        this.instructions.push({ op: node.operator, arg1: left, arg2: right, result: res });
        return res;
      case 'Literal':
        return node.value.toString();
      case 'Block':
        node.body.forEach((n) => this.visit(n));
        return undefined;
      case 'Conditional':
        const testLabel = this.newLabel();
        const endLabel = this.newLabel();
        const cond = this.visit(node.test);
        this.instructions.push({ op: 'ifFalse', arg1: cond, result: testLabel });
        this.visit(node.consequent);
        this.instructions.push({ op: 'goto', result: endLabel });
        this.instructions.push({ op: 'label', label: testLabel });
        if (node.alternate) {
          this.visit(node.alternate);
        }
        this.instructions.push({ op: 'label', label: endLabel });
        return undefined;
      case 'WhileLoop':
        const startLoop = this.newLabel();
        const endLoop = this.newLabel();
        this.instructions.push({ op: 'label', label: startLoop });
        const wCond = this.visit(node.test);
        this.instructions.push({ op: 'ifFalse', arg1: wCond, result: endLoop });
        this.visit(node.body);
        this.instructions.push({ op: 'goto', result: startLoop });
        this.instructions.push({ op: 'label', label: endLoop });
        return undefined;
      default:
        return undefined;
    }
  }
}

export function formatTAC(instructions: TACInstruction[]): string {
  return instructions
    .map((inst) => {
      if (inst.op === 'label') return `${inst.label}:`;
      if (inst.op === 'goto') return `  goto ${inst.result}`;
      if (inst.op === 'ifFalse') return `  ifFalse ${inst.arg1} goto ${inst.result}`;
      if (inst.op === '=') return `  ${inst.result} = ${inst.arg1}`;
      if (inst.op === 'print') return `  print ${inst.arg1}`;
      return `  ${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`;
    })
    .join('\n');
}
