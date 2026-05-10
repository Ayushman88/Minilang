'use client';

import React, { useState, useEffect } from 'react';
import { Lexer, Token } from '@/lib/compiler/lexer';
import { Parser, ASTNode } from '@/lib/compiler/parser';
import { IRGenerator, formatTAC, TACInstruction } from '@/lib/compiler/ir';
import { SemanticAnalyzer, SemanticError } from '@/lib/compiler/semantic';
import { Optimizer } from '@/lib/compiler/optimizer';
import { CodeGenerator } from '@/lib/compiler/codegen';

const DEFAULT_CODE = `let x = 10;
let y = 20;

if (x < y) {
  print x + y;
} else {
  print y - x;
}

while (x > 0) {
  let x = x - 1;
  print x;
}`;

export default function Terminal() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<ASTNode | null>(null);
  const [semanticErrors, setSemanticErrors] = useState<SemanticError[]>([]);
  const [tac, setTac] = useState<TACInstruction[]>([]);
  const [optimizedTac, setOptimizedTac] = useState<TACInstruction[]>([]);
  const [assembly, setAssembly] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    compile(code);
  }, [code]);

  const compile = (input: string) => {
    setError(null);
    try {
      // 1. Lexical Analysis
      const lexer = new Lexer(input);
      const lexedTokens = lexer.tokenize();
      setTokens(lexedTokens);

      const lexicalError = lexedTokens.find(t => t.type === 'ERROR');
      if (lexicalError) {
        throw new Error(`Lexical Error: ${lexicalError.value} at line ${lexicalError.line}`);
      }

      // 2. Syntax Analysis
      const parser = new Parser(lexedTokens);
      const parsedAst = parser.parse();
      setAst(parsedAst);

      // 3. Semantic Analysis
      const semanticAnalyzer = new SemanticAnalyzer();
      const semErrors = semanticAnalyzer.analyze(parsedAst);
      setSemanticErrors(semErrors);
      if (semErrors.length > 0) {
        throw new Error(semErrors[0].message);
      }

      // 4. Intermediate Code Generation
      const irGen = new IRGenerator();
      const generatedTac = irGen.generate(parsedAst);
      setTac(generatedTac);

      // 5. Optimization
      const optimizer = new Optimizer();
      const optimized = optimizer.optimize(generatedTac);
      setOptimizedTac(optimized);

      // 6. Code Generation
      const codeGen = new CodeGenerator();
      const asm = codeGen.generate(optimized);
      setAssembly(asm);

    } catch (err: any) {
      setError(err.message);
      setAst(null);
      setTac([]);
      setOptimizedTac([]);
      setAssembly([]);
    }
  };

  return (
    <div className="terminal-container">
      <div className="scanline"></div>
      
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h1 className="header-title">
            MINILANG <span>v1.2.0-PRO</span>
          </h1>
          <button 
            className={`expand-btn ${isExpanded ? 'active' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse Full Pipeline' : 'Expand Full Pipeline'}
          </button>
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          Advanced Compiler Architecture
        </div>
      </header>

      <div className="main-grid">
        {/* Source Code Panel */}
        <div className="glass-panel">
          <div className="panel-header">
            <div className="dot dot-red"></div>
            <div className="dot dot-yellow"></div>
            <div className="dot dot-green"></div>
            <span style={{ marginLeft: '0.5rem' }}>source_code.ml</span>
          </div>
          <textarea
            className="editor-area"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Compiler Output Panel */}
        <div className="glass-panel">
          <div className="panel-header">
            <span>compiler_output.log</span>
          </div>
          <div className="output-area">
            {error ? (
              <div className="error-msg">
                <strong>[COMPILATION FAILED]</strong>
                <p>{error}</p>
              </div>
            ) : (
              <>
                <section>
                  <h3 style={{ color: 'var(--text-dim)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>1. LEXICAL TOKENS</h3>
                  <div className="token-list">
                    {tokens.filter(t => t.type !== 'EOF').map((t, i) => (
                      <span key={i} className={`token token-${t.type}`} title={`Line ${t.line}, Col ${t.column}`}>
                        {t.value}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 style={{ color: 'var(--text-dim)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>2. SYNTAX & SEMANTIC ANALYSIS</h3>
                  <p style={{ color: '#50fa7b', fontSize: '0.9rem' }}>
                    &gt; Syntax Analysis: VALID (AST Generated)<br/>
                    &gt; Semantic Analysis: PASSED (Symbol Table Verified)
                  </p>
                </section>

                <section>
                  <h3 style={{ color: 'var(--text-dim)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>3. INTERMEDIATE CODE (TAC)</h3>
                  <pre className="tac-code">
                    {formatTAC(tac)}
                  </pre>
                </section>

                {isExpanded && (
                  <>
                    <section className="fade-in">
                      <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>4. OPTIMIZED CODE (Constant Folding)</h3>
                      <pre className="tac-code" style={{ color: '#ffb86c' }}>
                        {formatTAC(optimizedTac)}
                      </pre>
                    </section>

                    <section className="fade-in">
                      <h3 style={{ color: '#ff79c6', marginBottom: '0.5rem', fontSize: '0.8rem' }}>5. TARGET CODE (x86 Assembly)</h3>
                      <pre className="tac-code" style={{ color: '#f8f8f2', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px' }}>
                        {assembly.join('\n')}
                      </pre>
                    </section>
                  </>
                )}

                <section>
                  <h3 style={{ color: 'var(--text-dim)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>{isExpanded ? '6' : '4'}. SYSTEM STATUS</h3>
                  <p style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                    &gt; Lexical: OK<br/>
                    &gt; Syntax: OK<br/>
                    &gt; Semantic: OK<br/>
                    &gt; Optimization: {isExpanded ? 'APPLIED' : 'PENDING'}<br/>
                    &gt; Codegen: {isExpanded ? 'COMPLETE' : 'STANDBY'}
                  </p>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 0', color: 'var(--text-dim)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>Design: Compiler Core v1.0 | MiniLang Specification</div>
        <div>SPCC Final Project &copy; 2025-26</div>
      </footer>
    </div>
  );
}
