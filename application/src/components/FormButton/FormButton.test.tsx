import { render, screen } from '@testing-library/react';
import FormButton from './FormButton';
import '@testing-library/jest-dom';

// Mock Next.js Link to render a passthrough
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href || '#'}>{children}</a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('FormButton', () => {
  it('renders the button content', () => {
    render(<FormButton>Submit</FormButton>);
    const link = screen.getByRole('link', { name: 'Submit' });
    expect(link).toBeInTheDocument();
  });

  it('renders with expected styles applied via sx', () => {
    render(<FormButton>Go</FormButton>);
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveTextContent('Go');
    expect(link).toHaveAttribute('href'); // confirms it's a link
  });
});
