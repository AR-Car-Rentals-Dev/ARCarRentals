import { describe, it, expect } from 'vitest';
import { render } from '../test-utils';
import { Rating } from '@components/ui/Rating';

describe('Rating Component', () => {
  it('renders correct number of stars', () => {
    const { getAllByRole } = render(<Rating value={3} />);
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(5); // Default maxValue is 5
  });

  it('renders with custom maxValue', () => {
    const { getAllByRole } = render(<Rating value={3} maxValue={10} />);
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });

  it('displays rating value when showValue is true', () => {
    const { getByText } = render(<Rating value={4.5} showValue />);
    expect(getByText('4.5')).toBeInTheDocument();
  });

  it('does not display rating value when showValue is false', () => {
    const { queryByText } = render(<Rating value={4.5} />);
    expect(queryByText('4.5')).not.toBeInTheDocument();
  });

  it('renders stars as disabled when readonly is true', () => {
    const { getAllByRole } = render(<Rating value={3} readonly />);
    const buttons = getAllByRole('button');
    buttons.forEach((button: HTMLElement) => {
      expect(button).toBeDisabled();
    });
  });

  it('renders stars as enabled when readonly is false', () => {
    const { getAllByRole } = render(<Rating value={3} readonly={false} onChange={() => { }} />);
    const buttons = getAllByRole('button');
    buttons.forEach((button: HTMLElement) => {
      expect(button).not.toBeDisabled();
    });
  });

  it('calls onChange when star is clicked and not readonly', () => {
    const handleChange = vi.fn();
    const { getAllByRole } = render(<Rating value={3} readonly={false} onChange={handleChange} />);

    const buttons = getAllByRole('button');
    buttons[4].click(); // Click 5th star

    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it('has proper accessibility labels', () => {
    const { getAllByRole } = render(<Rating value={3} />);
    const buttons = getAllByRole('button');
    expect(buttons[0]).toHaveAttribute('aria-label', 'Rate 1 out of 5');
    expect(buttons[4]).toHaveAttribute('aria-label', 'Rate 5 out of 5');
  });
});
