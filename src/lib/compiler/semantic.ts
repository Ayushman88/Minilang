import { ASTNode } from './parser';

export interface SemanticError {
  message: string;
  line?: number;
}

export class SemanticAnalyzer {
  private symbols: Set<string> = new Set();
  private errors: SemanticError[] = [];

  public analyze(node: ASTNode): SemanticError[] {
    this.errors = [];
    this.symbols = new Set();
    this.visit(node);
    return this.errors;
  }

  private visit(node: ASTNode) {
    switch (node.type) {
      case 'Program':
        node.body.forEach((n) => this.visit(n));
        break;
      case 'Assignment':
        this.visit(node.value);
        this.symbols.add(node.id); // Register variable
        break;
      case 'Print':
        this.visit(node.value);
        break;
      case 'BinaryExpression':
        this.visit(node.left);
        this.visit(node.right);
        break;
      case 'Literal':
        if (node.kind === 'identifier') {
          if (!this.symbols.has(node.value as string)) {
            this.errors.push({ message: `Semantic Error: Variable '${node.value}' used before assignment.` });
          }
        }
        break;
      case 'Block':
        node.body.forEach((n) => this.visit(n));
        break;
      case 'Conditional':
        this.visit(node.test);
        this.visit(node.consequent);
        if (node.alternate) this.visit(node.alternate);
        break;
      case 'WhileLoop':
        this.visit(node.test);
        this.visit(node.body);
        break;
    }
  }
}
