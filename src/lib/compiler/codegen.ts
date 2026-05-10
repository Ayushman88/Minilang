import { TACInstruction } from './ir';

export class CodeGenerator {
  public generate(instructions: TACInstruction[]): string[] {
    const asm: string[] = [];
    asm.push('section .text');
    asm.push('global _start');
    asm.push('_start:');

    for (const inst of instructions) {
      switch (inst.op) {
        case '=':
          asm.push(`  MOV EAX, ${this.formatOperand(inst.arg1!)}`);
          asm.push(`  MOV [${inst.result}], EAX`);
          break;
        case '+':
          asm.push(`  MOV EAX, ${this.formatOperand(inst.arg1!)}`);
          asm.push(`  ADD EAX, ${this.formatOperand(inst.arg2!)}`);
          asm.push(`  MOV [${inst.result}], EAX`);
          break;
        case '-':
          asm.push(`  MOV EAX, ${this.formatOperand(inst.arg1!)}`);
          asm.push(`  SUB EAX, ${this.formatOperand(inst.arg2!)}`);
          asm.push(`  MOV [${inst.result}], EAX`);
          break;
        case '*':
          asm.push(`  MOV EAX, ${this.formatOperand(inst.arg1!)}`);
          asm.push(`  IMUL EAX, ${this.formatOperand(inst.arg2!)}`);
          asm.push(`  MOV [${inst.result}], EAX`);
          break;
        case '/':
          asm.push(`  MOV EAX, ${this.formatOperand(inst.arg1!)}`);
          asm.push(`  MOV EBX, ${this.formatOperand(inst.arg2!)}`);
          asm.push(`  IDIV EBX`);
          asm.push(`  MOV [${inst.result}], EAX`);
          break;
        case 'print':
          asm.push(`  PUSH ${this.formatOperand(inst.arg1!)}`);
          asm.push(`  CALL _print_num`);
          asm.push(`  ADD ESP, 4`);
          break;
        case 'label':
          asm.push(`${inst.label}:`);
          break;
        case 'goto':
          asm.push(`  JMP ${inst.result}`);
          break;
        case 'ifFalse':
          asm.push(`  CMP ${this.formatOperand(inst.arg1!)}, 0`);
          asm.push(`  JE ${inst.result}`);
          break;
        case '==':
          asm.push(`  MOV EAX, ${this.formatOperand(inst.arg1!)}`);
          asm.push(`  CMP EAX, ${this.formatOperand(inst.arg2!)}`);
          asm.push(`  SETE AL`);
          asm.push(`  MOVZX EAX, AL`);
          asm.push(`  MOV [${inst.result}], EAX`);
          break;
        case '<':
          asm.push(`  MOV EAX, ${this.formatOperand(inst.arg1!)}`);
          asm.push(`  CMP EAX, ${this.formatOperand(inst.arg2!)}`);
          asm.push(`  SETL AL`);
          asm.push(`  MOVZX EAX, AL`);
          asm.push(`  MOV [${inst.result}], EAX`);
          break;
        case '>':
          asm.push(`  MOV EAX, ${this.formatOperand(inst.arg1!)}`);
          asm.push(`  CMP EAX, ${this.formatOperand(inst.arg2!)}`);
          asm.push(`  SETG AL`);
          asm.push(`  MOVZX EAX, AL`);
          asm.push(`  MOV [${inst.result}], EAX`);
          break;
      }
    }

    asm.push('  MOV EAX, 1'); // exit syscall
    asm.push('  MOV EBX, 0');
    asm.push('  INT 0x80');

    return asm;
  }

  private formatOperand(op: string): string {
    if (isNaN(Number(op))) {
      return `[${op}]`;
    }
    return op;
  }
}
