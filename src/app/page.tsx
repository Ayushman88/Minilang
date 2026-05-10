import Terminal from '@/components/Terminal';

export const metadata = {
  title: 'MiniLang Compiler | SPCC Project',
  description: 'A simple compiler for a toy language with lexical analysis, syntax parsing, and IR generation.',
};

export default function Home() {
  return (
    <main>
      <Terminal />
    </main>
  );
}
