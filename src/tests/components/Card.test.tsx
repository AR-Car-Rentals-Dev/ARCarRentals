import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { Card } from '@components/ui/Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    expect(getByText('Card content')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white', 'rounded-xl');
  });

  it('applies hoverable styles when hoverable prop is true', () => {
    const { container } = render(<Card hoverable>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:-translate-y-1');
  });

  it('applies bordered styles when bordered prop is true', () => {
    const { container } = render(<Card bordered>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border', 'border-neutral-200');
  });

  it('applies different padding sizes', () => {
    const { container, rerender } = render(<Card padding="none">Content</Card>);
    let card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');

    rerender(<Card padding="sm">Content</Card>);
    card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-4');

    rerender(<Card padding="md">Content</Card>);
    card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-6');

    rerender(<Card padding="lg">Content</Card>);
    card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-8');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });
});
