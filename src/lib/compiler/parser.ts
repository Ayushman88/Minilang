import { Token, TokenType } from './lexer';

export type ASTNode =
  | { type: 'Program'; body: ASTNode[] }
  | { type: 'Assignment'; id: string; value: ASTNode }
  | { type: 'Conditional'; test: ASTNode; consequent: ASTNode; alternate?: ASTNode }
  | { type: 'WhileLoop'; test: ASTNode; body: ASTNode }
  | { type: 'Print'; value: ASTNode }
  | { type: 'Block'; body: ASTNode[] }
  | { type: 'BinaryExpression'; left: ASTNode; operator: string; right: ASTNode }
  | { type: 'Literal'; value: number | string; kind: 'number' | 'identifier' };

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType, value?: string): Token {
    const token = this.peek();
    if (token.type !== type || (value && token.value !== value)) {
      throw new Error(
        `Syntax Error: Expected ${type}${value ? ` '${value}'` : ''} at line ${token.line}, column ${token.column}, but found '${token.value}'`
      );
    }
    return this.advance();
  }

  public parse(): ASTNode {
    const body: ASTNode[] = [];
    while (this.peek().type !== 'EOF') {
      body.push(this.parseStatement());
    }
    return { type: 'Program', body };
  }

  private parseStatement(): ASTNode {
    const token = this.peek();
    if (token.type === 'KEYWORD') {
      switch (token.value) {
        case 'let':
          return this.parseAssignment();
        case 'if':
          return this.parseConditional();
        case 'while':
          return this.parseWhileLoop();
        case 'print':
          return this.parsePrint();
      }
    }
    if (token.type === 'DELIMITER' && token.value === '{') {
      return this.parseBlock();
    }
    throw new Error(`Syntax Error: Unexpected token '${token.value}' at line ${token.line}`);
  }

  private parseBlock(): ASTNode {
    this.expect('DELIMITER', '{');
    const body: ASTNode[] = [];
    while (this.peek().type !== 'EOF' && this.peek().value !== '}') {
      body.push(this.parseStatement());
    }
    this.expect('DELIMITER', '}');
    return { type: 'Block', body };
  }

  private parseAssignment(): ASTNode {
    this.expect('KEYWORD', 'let');
    const id = this.expect('IDENTIFIER').value;
    this.expect('OPERATOR', '=');
    const value = this.parseExpression();
    this.expect('DELIMITER', ';');
    return { type: 'Assignment', id, value };
  }

  private parseConditional(): ASTNode {
    this.expect('KEYWORD', 'if');
    this.expect('DELIMITER', '(');
    const test = this.parseExpression();
    this.expect('DELIMITER', ')');
    const consequent = this.parseStatement();
    let alternate: ASTNode | undefined;
    if (this.peek().type === 'KEYWORD' && this.peek().value === 'else') {
      this.advance();
      alternate = this.parseStatement();
    }
    return { type: 'Conditional', test, consequent, alternate };
  }

  private parseWhileLoop(): ASTNode {
    this.expect('KEYWORD', 'while');
    this.expect('DELIMITER', '(');
    const test = this.parseExpression();
    this.expect('DELIMITER', ')');
    const body = this.parseStatement();
    return { type: 'WhileLoop', test, body };
  }

  private parsePrint(): ASTNode {
    this.expect('KEYWORD', 'print');
    const value = this.parseExpression();
    this.expect('DELIMITER', ';');
    return { type: 'Print', value };
  }

  private parseExpression(): ASTNode {
    return this.parseComparison();
  }

  private parseComparison(): ASTNode {
    let left = this.parseAddition();
    while (this.peek().type === 'OPERATOR' && ['==', '<', '>'].includes(this.peek().value)) {
      const operator = this.advance().value;
      const right = this.parseAddition();
      left = { type: 'BinaryExpression', left, operator, right };
    }
    return left;
  }

  private parseAddition(): ASTNode {
    let left = this.parseMultiplication();
    while (this.peek().type === 'OPERATOR' && ['+', '-'].includes(this.peek().value)) {
      const operator = this.advance().value;
      const right = this.parseMultiplication();
      left = { type: 'BinaryExpression', left, operator, right };
    }
    return left;
  }

  private parseMultiplication(): ASTNode {
    let left = this.parsePrimary();
    while (this.peek().type === 'OPERATOR' && ['*', '/'].includes(this.peek().value)) {
      const operator = this.advance().value;
      const right = this.parsePrimary();
      left = { type: 'BinaryExpression', left, operator, right };
    }
    return left;
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();
    if (token.type === 'NUMBER') {
      this.advance();
      return { type: 'Literal', value: parseInt(token.value), kind: 'number' };
    }
    if (token.type === 'IDENTIFIER') {
      this.advance();
      return { type: 'Literal', value: token.value, kind: 'identifier' };
    }
    if (token.type === 'DELIMITER' && token.value === '(') {
      this.advance();
      const expr = this.parseExpression();
      this.expect('DELIMITER', ')');
      return expr;
    }
    throw new Error(`Syntax Error: Unexpected token '${token.value}' at line ${token.line}`);
  }
}
