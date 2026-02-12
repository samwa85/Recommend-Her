import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Contact from '../Contact';

// Mock GSAP
vi.mock('gsap', async (importOriginal) => {
  const actual = await importOriginal<typeof import('gsap')>();
  return {
    ...actual,
    registerPlugin: vi.fn(),
    context: vi.fn(() => ({
      fromTo: vi.fn(),
      revert: vi.fn(),
    })),
    fromTo: vi.fn(),
    set: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
    })),
  };
});

vi.mock('gsap/ScrollTrigger', async (importOriginal) => {
  const actual = await importOriginal<typeof import('gsap/ScrollTrigger')>();
  return {
    ...actual,
    create: vi.fn(),
    refresh: vi.fn(),
    getAll: vi.fn(() => []),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Contact Page', () => {
  it('renders contact page with all elements', () => {
    renderWithRouter(<Contact />);

    // Check header
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();

    // Check contact information
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('hello@recommendher.org')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('New York, NY')).toBeInTheDocument();

    // Check form
    expect(screen.getByText('Send us a Message')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderWithRouter(<Contact />);

    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);

    // Wait for validation to appear
    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    renderWithRouter(<Contact />);

    const emailInput = screen.getByLabelText(/Email Address/);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email address/)).toBeInTheDocument();
    });
  });

  it('shows validation error for short message', async () => {
    renderWithRouter(<Contact />);

    const messageInput = screen.getByLabelText(/Message/);
    fireEvent.change(messageInput, { target: { value: 'short' } });

    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Message must be at least 10 characters/)).toBeInTheDocument();
    });
  });

  it('shows loading state when submitting', async () => {
    renderWithRouter(<Contact />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: 'This is a test message that is long enough' } });

    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });
  });

  it('shows success dialog after successful submission', async () => {
    renderWithRouter(<Contact />);

    // Fill form with valid data
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Message/), { target: { value: 'This is a test message that is long enough' } });

    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);

    // Wait for success dialog
    await waitFor(() => {
      expect(screen.getByText('Message Sent!')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
