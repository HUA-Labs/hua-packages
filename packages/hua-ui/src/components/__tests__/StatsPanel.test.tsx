import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsPanel } from '../StatsPanel';

describe('StatsPanel', () => {
  const items = [
    { label: 'Total Users', value: '1,234' },
    { label: 'Active', value: '567' },
  ];

  it('should render stat items', () => {
    render(<StatsPanel items={items} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('567')).toBeInTheDocument();
  });

  it('should render title', () => {
    render(<StatsPanel title="Dashboard Stats" items={items} />);
    expect(screen.getByText('Dashboard Stats')).toBeInTheDocument();
  });

  it('should render trend indicator', () => {
    render(
      <StatsPanel
        items={[{ label: 'Revenue', value: '$10K', trend: 'up', trendValue: '+12%' }]}
      />
    );
    const trendEl = screen.getByText(/↑\+12%/);
    expect(trendEl).toBeInTheDocument();
  });

  it('should render down trend', () => {
    render(
      <StatsPanel
        items={[{ label: 'Churn', value: '5%', trend: 'down', trendValue: '-3%' }]}
      />
    );
    const trendEl = screen.getByText(/↓-3%/);
    expect(trendEl).toBeInTheDocument();
  });

  it('should render description', () => {
    render(
      <StatsPanel
        items={[{ label: 'Users', value: '100', description: 'Last 30 days' }]}
      />
    );
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(
      <StatsPanel
        items={[{ label: 'Users', value: '100', icon: <span data-testid="stat-icon">📊</span> }]}
      />
    );
    expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
  });

  it('should show loading skeleton', () => {
    const { container } = render(<StatsPanel items={[]} loading columns={3} />);
    expect(container.querySelectorAll('div[style*="pulse"]').length).toBe(3);
  });

  it('should apply column count', () => {
    const { container } = render(<StatsPanel items={items} columns={2} />);
    const grid = (container.firstElementChild as HTMLElement).querySelector(':scope > div') as HTMLElement;
    expect(grid.style.display).toBe('grid');
  });

  it('should apply custom className', () => {
    const { container } = render(<StatsPanel items={items} className="my-stats" />);
    expect(container.querySelector('.my-stats')).toBeInTheDocument();
  });
});
