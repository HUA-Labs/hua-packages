import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Upload } from '../Upload';
import type { UploadedFile } from '../Upload';

// Helper to create a mock File
function createMockFile(name: string, size: number, type: string): File {
  const content = new Array(size).fill('a').join('');
  return new File([content], name, { type });
}

// Helper to create an UploadedFile
function createUploadedFile(overrides: Partial<UploadedFile> = {}): UploadedFile {
  const file = createMockFile('test.txt', 1024, 'text/plain');
  return {
    id: '1',
    file,
    name: 'test.txt',
    size: 1024,
    type: 'text/plain',
    ...overrides,
  };
}

describe('Upload', () => {
  it('should render with default placeholder', () => {
    render(<Upload />);

    expect(screen.getByText('파일을 선택하거나 여기에 드래그하세요')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<Upload placeholder="Drop files here" />);

    expect(screen.getByText('Drop files here')).toBeInTheDocument();
  });

  it('should render file list', () => {
    const files = [
      createUploadedFile({ id: '1', name: 'file1.txt', size: 1024 }),
      createUploadedFile({ id: '2', name: 'file2.pdf', size: 2048 }),
    ];

    render(<Upload files={files} />);

    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('file2.pdf')).toBeInTheDocument();
  });

  it('should apply size classes', () => {
    const { container, rerender } = render(<Upload size="sm" />);

    expect(container.querySelector('.p-4')).toBeInTheDocument();

    rerender(<Upload size="lg" />);

    expect(container.querySelector('.p-8')).toBeInTheDocument();
  });

  it('should open file input on click', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<Upload />);

    const fileInput = screen.getByLabelText('파일 선택') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    const uploadArea = screen.getByText('파일을 선택하거나 여기에 드래그하세요').closest('div[class*="border-dashed"]')!;
    await user.click(uploadArea);

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should call onChange when files are selected', () => {
    const handleChange = vi.fn();

    render(<Upload onChange={handleChange} />);

    const fileInput = screen.getByLabelText('파일 선택') as HTMLInputElement;
    const file = createMockFile('test.txt', 100, 'text/plain');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(handleChange).toHaveBeenCalledWith([file]);
  });

  it('should support multiple file selection', () => {
    render(<Upload multiple />);

    const fileInput = screen.getByLabelText('파일 선택') as HTMLInputElement;
    expect(fileInput.multiple).toBe(true);
  });

  it('should apply accept attribute', () => {
    render(<Upload accept="image/*" />);

    const fileInput = screen.getByLabelText('파일 선택') as HTMLInputElement;
    expect(fileInput.accept).toBe('image/*');
  });

  it('should show accepted formats hint', () => {
    render(<Upload accept="image/*" />);

    expect(screen.getByText(/지원 형식: image\/\*/)).toBeInTheDocument();
  });

  it('should apply drag over state', () => {
    const { container } = render(<Upload />);

    const dropZone = container.querySelector('[class*="border-dashed"]')!;
    fireEvent.dragOver(dropZone);

    expect(dropZone.className).toContain('border-primary');
  });

  it('should remove drag state on drag leave', () => {
    const { container } = render(<Upload />);

    const dropZone = container.querySelector('[class*="border-dashed"]')!;
    fireEvent.dragOver(dropZone);
    fireEvent.dragLeave(dropZone);

    expect(dropZone.className).not.toContain('border-primary');
  });

  it('should handle file drop', () => {
    const handleChange = vi.fn();

    const { container } = render(<Upload onChange={handleChange} />);

    const dropZone = container.querySelector('[class*="border-dashed"]')!;
    const file = createMockFile('dropped.txt', 100, 'text/plain');

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(handleChange).toHaveBeenCalledWith([file]);
  });

  it('should not handle drop when dragDrop is false', () => {
    const handleChange = vi.fn();

    const { container } = render(<Upload onChange={handleChange} dragDrop={false} />);

    const dropZone = container.querySelector('[class*="border-dashed"]')!;
    const file = createMockFile('dropped.txt', 100, 'text/plain');

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should alert when maxSize is exceeded', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const handleChange = vi.fn();

    render(<Upload onChange={handleChange} maxSize={100} />);

    const fileInput = screen.getByLabelText('파일 선택') as HTMLInputElement;
    const bigFile = createMockFile('big.txt', 200, 'text/plain');

    fireEvent.change(fileInput, { target: { files: [bigFile] } });

    expect(alertSpy).toHaveBeenCalled();
    expect(handleChange).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('should alert when maxFiles is exceeded', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const existingFiles = [createUploadedFile({ id: '1' })];

    render(<Upload files={existingFiles} maxFiles={1} />);

    const fileInput = screen.getByLabelText('파일 선택') as HTMLInputElement;
    const newFile = createMockFile('new.txt', 100, 'text/plain');

    fireEvent.change(fileInput, { target: { files: [newFile] } });

    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('1'));

    alertSpy.mockRestore();
  });

  it('should display file name and size', () => {
    const files = [createUploadedFile({ id: '1', name: 'document.pdf', size: 1024 })];

    render(<Upload files={files} />);

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('should call onRemove when remove button is clicked', async () => {
    const handleRemove = vi.fn();
    const user = userEvent.setup();
    const file = createUploadedFile({ id: '1', name: 'test.txt' });

    render(<Upload files={[file]} onRemove={handleRemove} />);

    const removeButton = screen.getByRole('button', { name: '파일 제거' });
    await user.click(removeButton);

    expect(handleRemove).toHaveBeenCalledWith(file);
  });

  it('should show upload progress', () => {
    const file = createUploadedFile({
      id: '1',
      name: 'uploading.txt',
      status: 'uploading',
      progress: 65,
    });

    render(<Upload files={[file]} />);

    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('should show success status', () => {
    const file = createUploadedFile({ id: '1', status: 'success' });

    render(<Upload files={[file]} />);

    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('should show error status', () => {
    const file = createUploadedFile({ id: '1', status: 'error', error: '업로드 중 오류' });

    render(<Upload files={[file]} />);

    expect(screen.getByText('업로드 중 오류')).toBeInTheDocument();
  });

  it('should be disabled', () => {
    const { container } = render(<Upload disabled />);

    const fileInput = screen.getByLabelText('파일 선택') as HTMLInputElement;
    expect(fileInput.disabled).toBe(true);

    const dropZone = container.querySelector('[class*="border-dashed"]')!;
    expect(dropZone.className).toContain('cursor-not-allowed');
  });
});
