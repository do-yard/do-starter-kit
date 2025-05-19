import { render, screen } from '@testing-library/react';
import Hello from './Hello';

describe('Hello Component', () => {
  it('renders correctly with provided name', () => {
    const testName = 'Lorenzo';

    render(<Hello name={testName} />);

    expect(screen.getByText(`Hello, ${testName}!`)).toBeInTheDocument();
  });

  it('has correct styling', () => {
    render(<Hello name="Test" />);

    const element = screen.getByText('Hello, Test!');

    expect(element).toHaveClass('text-xl font-bold text-blue-600');
  });
});
