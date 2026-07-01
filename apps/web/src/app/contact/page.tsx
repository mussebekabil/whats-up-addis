'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { contactSchema, type ContactInput } from '@whats-up-addis/shared';
import { contactService } from '@/lib/contact';

const INPUT_CLASS =
  'w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20';
const LABEL_CLASS =
  'mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactInput) => {
    setServerError('');
    try {
      await contactService.submit(data);
      setSubmitted(true);
    } catch (err: any) {
      setServerError(
        err.message || 'Failed to send message. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <span className="font-mono text-xs uppercase tracking-widest text-ember">
              Get in touch
            </span>
            <h1 className="mt-2 font-display text-5xl md:text-6xl">
              Contact Us
            </h1>
            <p className="mt-3 text-muted-foreground">
              Questions, partnership ideas, or just want to say hello?
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-6 py-12">
          {submitted ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <span className="font-mono text-xs uppercase tracking-widest text-ember">
                Sent!
              </span>
              <h2 className="mt-2 font-display text-3xl">
                We got your message
              </h2>
              <p className="mt-3 text-muted-foreground">
                We&apos;ll get back to you soon.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-2xl border border-border bg-card p-8 space-y-6"
            >
              {serverError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <div>
                <label htmlFor="name" className={LABEL_CLASS}>
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="Your name"
                  className={INPUT_CLASS}
                />
                {errors.name && (
                  <p className="mt-1 font-mono text-[10px] text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className={LABEL_CLASS}>
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="your@email.com"
                  className={INPUT_CLASS}
                />
                {errors.email && (
                  <p className="mt-1 font-mono text-[10px] text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className={LABEL_CLASS}>
                  Subject *
                </label>
                <input
                  id="subject"
                  type="text"
                  {...register('subject')}
                  placeholder="What's this about?"
                  className={INPUT_CLASS}
                />
                {errors.subject && (
                  <p className="mt-1 font-mono text-[10px] text-destructive">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="message" className={LABEL_CLASS}>
                  Message *
                </label>
                <textarea
                  id="message"
                  {...register('message')}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  className={`${INPUT_CLASS} resize-none`}
                />
                {errors.message && (
                  <p className="mt-1 font-mono text-[10px] text-destructive">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-ember px-8 font-mono text-[11px] uppercase tracking-widest text-ember-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
