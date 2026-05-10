export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'OPERATOR'
  | 'DELIMITER'
  | 'EOF'
  | 'ERROR';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS = new Set(['let', 'if', 'else', 'while', 'print']);
const OPERATORS = new Set(['=', '+', '-', '*', '/', '==', '<', '>', '!']);
const DELIMITERS = new Set(['(', ')', '{', '}', ';']);

export class Lexer {
  private input: string;
  private pos: number = 0;
  private line: number = 1;
  private col: number = 1;

  constructor(input: string) {
    this.input = input;
  }

  private peek(): string {
    return this.input[this.pos] || '';
  }

  private advance(): string {
    const char = this.peek();
    this.pos++;
    if (char === '\n') {
      this.line++;
      this.col = 1;
    } else {
      this.col++;
    }
    return char;
  }

  private isAlpha(char: string): boolean {
    return /[a-zA-Z]/.test(char);
  }

  private isAlnum(char: string): boolean {
    return /[a-zA-Z0-9]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private skipWhitespace() {
    while (/\s/.test(this.peek())) {
      this.advance();
    }
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const char = this.peek();
      const startLine = this.line;
      const startCol = this.col;

      if (this.isAlpha(char)) {
        let value = '';
        while (this.isAlnum(this.peek())) {
          value += this.advance();
        }
        tokens.push({
          type: KEYWORDS.has(value) ? 'KEYWORD' : 'IDENTIFIER',
          value,
          line: startLine,
          column: startCol,
        });
      } else if (this.isDigit(char)) {
        let value = '';
        while (this.isDigit(this.peek())) {
          value += this.advance();
        }
        tokens.push({
          type: 'NUMBER',
          value,
          line: startLine,
          column: startCol,
        });
      } else if (OPERATORS.has(char)) {
        let value = this.advance();
        if (value === '=' && this.peek() === '=') {
          value += this.advance();
        }
        tokens.push({
          type: 'OPERATOR',
          value,
          line: startLine,
          column: startCol,
        });
      } else if (DELIMITERS.has(char)) {
        tokens.push({
          type: 'DELIMITER',
          value: this.advance(),
          line: startLine,
          column: startCol,
        });
      } else {
        tokens.push({
          type: 'ERROR',
          value: `Unexpected character: ${char}`,
          line: startLine,
          column: startCol,
        });
        this.advance();
      }
    }
    tokens.push({ type: 'EOF', value: '', line: this.line, column: this.col });
    return tokens;
  }
}
