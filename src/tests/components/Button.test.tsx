import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { Button } from '@components/ui/Button';

describe('Button Component', () => {
  it('renders with children', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    expect(getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('renders with primary variant by default', () => {
    const { getByRole } = render(<Button>Primary Button</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('renders with secondary variant', () => {
    const { getByRole } = render(<Button variant="secondary">Secondary Button</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('bg-neutral-800');
  });

  it('renders with outline variant', () => {
    const { getByRole } = render(<Button variant="outline">Outline Button</Button>);
    const button = getByRole('button');
    expect(button).toHaveClass('border-primary-600');
  });

  it('renders with different sizes', () => {
    const { getByRole, rerender } = render(<Button size="sm">Small</Button>);
    expect(getByRole('button')).toHaveClass('px-4', 'py-2');

    rerender(<Button size="md">Medium</Button>);
    expect(getByRole('button')).toHaveClass('px-6', 'py-3');

    rerender(<Button size="lg">Large</Button>);
    expect(getByRole('button')).toHaveClass('px-8', 'py-4');
  });

  it('shows loading state', () => {
    const { getByRole } = render(<Button isLoading>Loading</Button>);
    const button = getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('can be disabled', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    expect(getByRole('button')).toBeDisabled();
  });

  it('renders with full width', () => {
    const { getByRole } = render(<Button fullWidth>Full Width</Button>);
    expect(getByRole('button')).toHaveClass('w-full');
  });

  it('renders with left icon', () => {
    const { getByTestId } = render(
      <Button leftIcon={<span data-testid="left-icon">←</span>}>
        With Icon
      </Button>
    );
    expect(getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const { getByTestId } = render(
      <Button rightIcon={<span data-testid="right-icon">→</span>}>
        With Icon
      </Button>
    );
    expect(getByTestId('right-icon')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<Button onClick={handleClick}>Clickable</Button>);

    const button = getByRole('button');
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click when disabled', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = getByRole('button');
    button.click();

    expect(handleClick).not.toHaveBeenCalled();
  });
});
