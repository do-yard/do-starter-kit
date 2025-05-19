'use client';

import Hello from 'components/Hello';
import Button from '@mui/material/Button';

const Home = () => (
  <div className="grid min-h-screen place-items-center p-8 font-[family-name:var(--font-geist-sans)]">
    <main className="flex flex-col gap-4 items-center">
      <Hello name="Next.js Developer" />
      <p className="text-sm text-center font-[family-name:var(--font-geist-mono)]">
        Get started by editing{' '}
        <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
          src/app/page.tsx
        </code>{' '}
        and save to see your changes.
      </p>
      <Button
        variant="contained"
        color="primary"
        className="mt-4"
        onClick={() => window.open('https://nextjs.org/docs', '_blank')}
      >
        Next.js Documentation
      </Button>
    </main>
  </div>
);

export default Home;
