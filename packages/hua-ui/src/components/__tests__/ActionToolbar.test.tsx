import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionToolbar } from '../ActionToolbar';

describe('ActionToolbar', () => {
  const mockAction = {
    label: 'Mark all read',
    labelMobile: 'Read',
    onClick: vi.fn(),
  };

  it('should render normal mode actions', () => {
    render(<ActionToolbar actions={[mockAction]} />);
    expect(screen.getByText('Mark all read')).toBeInTheDocument();
  });

  it('should render select mode toggle button', () => {
    const onToggle = vi.fn();
    render(<ActionToolbar onToggleSelectMode={onToggle} totalCount={5} />);
    const btn = screen.getByText('선택');
    fireEvent.click(btn);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should disable select button when totalCount is 0', () => {
    render(<ActionToolbar onToggleSelectMode={vi.fn()} totalCount={0} />);
    const btn = screen.getByTitle('항목이 없습니다');
    expect(btn).toBeDisabled();
  });

  it('should render select mode UI', () => {
    const onCancel = vi.fn();
    render(
      <ActionToolbar
        isSelectMode
        selectedCount={2}
        totalCount={5}
        onCancelSelect={onCancel}
      />
    );
    expect(screen.getByText('취소')).toBeInTheDocument();
  });

  it('should call onToggleSelectAll', () => {
    const onSelectAll = vi.fn();
    render(
      <ActionToolbar
        isSelectMode
        selectedCount={0}
        totalCount={5}
        onToggleSelectAll={onSelectAll}
      />
    );
    fireEvent.click(screen.getByText('전체 선택'));
    expect(onSelectAll).toHaveBeenCalledTimes(1);
  });

  it('should show 전체 해제 when all selected', () => {
    render(
      <ActionToolbar
        isSelectMode
        selectedCount={5}
        totalCount={5}
        onToggleSelectAll={vi.fn()}
      />
    );
    expect(screen.getByText('전체 해제')).toBeInTheDocument();
  });

  it('should call onCancelSelect', () => {
    const onCancel = vi.fn();
    render(<ActionToolbar isSelectMode onCancelSelect={onCancel} />);
    fireEvent.click(screen.getByText('취소'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should render badge with count', () => {
    const action = {
      label: 'Delete',
      onClick: vi.fn(),
      badge: { count: 3, color: 'red' as const },
    };
    render(<ActionToolbar actions={[action]} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should disable actions when loading', () => {
    const action = { label: 'Do it', onClick: vi.fn() };
    render(<ActionToolbar actions={[action]} loading />);
    const btns = screen.getAllByRole('button');
    const actionBtn = btns.find(b => b.textContent?.includes('Do it'));
    expect(actionBtn).toBeDisabled();
  });

  it('should apply custom className', () => {
    const { container } = render(<ActionToolbar className="my-toolbar" />);
    expect(container.querySelector('.my-toolbar')).toBeInTheDocument();
  });
});
