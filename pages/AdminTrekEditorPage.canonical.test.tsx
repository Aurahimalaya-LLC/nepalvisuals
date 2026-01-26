import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminTrekEditorPage from './AdminTrekEditorPage';

vi.mock('../lib/services/tourService', () => ({
  TourService: {
    getTourById: vi.fn(async () => ({
      id: 'test-trek',
      name: 'Test Trek',
    })),
    updateTour: vi.fn(async () => ({ success: true })),
  },
}));

describe('AdminTrekEditorPage canonical tags', () => {
  beforeEach(() => {
    document.head
      .querySelectorAll('link[rel="canonical"][data-canonical-section="seo-settings"]')
      .forEach((el) => el.parentElement?.removeChild(el));
  });

  it('injects a single head canonical for SEO section', async () => {
    const origin = 'http://localhost';
    Object.defineProperty(window, 'location', {
      value: { origin },
      writable: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin/trek/edit/test-trek']}>
        <Routes>
          <Route path="/admin/trek/edit/:trekId" element={<AdminTrekEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const links = document.head.querySelectorAll(
        'link[rel="canonical"][data-canonical-section="seo-settings"]'
      );
      expect(links.length).toBe(1);
      const href = links[0].getAttribute('href');
      expect(href).toBe(
        `${origin}/#/admin/trek/edit/test-trek?section=seo-settings`
      );
    });
  });

  it('dedupes previously managed canonical tags', async () => {
    const pre = document.createElement('link');
    pre.setAttribute('rel', 'canonical');
    pre.setAttribute('href', 'http://example.com/old');
    pre.setAttribute('data-canonical-section', 'seo-settings');
    document.head.appendChild(pre);

    const origin = 'http://localhost';
    Object.defineProperty(window, 'location', {
      value: { origin },
      writable: true,
    });

    render(
      <MemoryRouter initialEntries={['/admin/trek/edit/test-trek']}>
        <Routes>
          <Route path="/admin/trek/edit/:trekId" element={<AdminTrekEditorPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const links = document.head.querySelectorAll(
        'link[rel="canonical"][data-canonical-section="seo-settings"]'
      );
      expect(links.length).toBe(1);
      const href = links[0].getAttribute('href');
      expect(href).toBe(
        `${origin}/#/admin/trek/edit/test-trek?section=seo-settings`
      );
    });
  });
});

