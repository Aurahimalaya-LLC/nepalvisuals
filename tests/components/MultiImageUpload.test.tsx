import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MultiImageUpload } from '../../components/common/MultiImageUpload';

describe('MultiImageUpload', () => {
  it('uploads files via onUpload and stores returned URLs', async () => {
    const onChange = vi.fn();
    const onUpload = vi.fn().mockResolvedValue(['https://example.com/a.png']);

    const { container } = render(
      <MultiImageUpload
        images={[]}
        onChange={onChange}
        onUpload={onUpload}
        acceptedFormats={['image/png']}
        maxSizeMB={10}
      />
    );

    const input = container.querySelector('#multi-image-upload') as HTMLInputElement;
    expect(input).toBeTruthy();

    const file = new File(['hello'], 'a.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(['https://example.com/a.png']);
    });
  });

  it('rejects invalid formats before uploading', async () => {
    const onChange = vi.fn();
    const onUpload = vi.fn().mockResolvedValue(['https://example.com/a.png']);

    const { container } = render(
      <MultiImageUpload
        images={[]}
        onChange={onChange}
        onUpload={onUpload}
        acceptedFormats={['image/png']}
        maxSizeMB={10}
      />
    );

    const input = container.querySelector('#multi-image-upload') as HTMLInputElement;
    const file = new File(['hello'], 'a.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onUpload).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it('rejects files larger than maxSizeMB before uploading', async () => {
    const onChange = vi.fn();
    const onUpload = vi.fn().mockResolvedValue(['https://example.com/a.png']);

    const { container } = render(
      <MultiImageUpload
        images={[]}
        onChange={onChange}
        onUpload={onUpload}
        acceptedFormats={['image/png']}
        maxSizeMB={1}
      />
    );

    const input = container.querySelector('#multi-image-upload') as HTMLInputElement;
    const big = new File([new Uint8Array(2 * 1024 * 1024)], 'big.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [big] } });

    await waitFor(() => {
      expect(onUpload).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
