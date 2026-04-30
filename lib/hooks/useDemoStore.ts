'use client';

import { useSyncExternalStore } from 'react';
import type { Booking, BookingStatus, Container } from '@/types';
import { getContainersByBookingId as getSeedContainers } from '@/lib/mock-data/containers';

interface DemoState {
  bookingOverrides: Record<string, Partial<Booking>>;
  newBookings: Booking[];
  newContainers: Container[];
}

const state: DemoState = {
  bookingOverrides: {},
  newBookings: [],
  newContainers: [],
};

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  for (const l of listeners) l();
}

export function getBookingOverride(id: string): Partial<Booking> | undefined {
  return state.bookingOverrides[id];
}

export function transitionBooking(id: string, next: BookingStatus, patch: Partial<Booking> = {}) {
  state.bookingOverrides[id] = {
    ...state.bookingOverrides[id],
    ...patch,
    status: next,
  };
  emit();
}

export function addBooking(booking: Booking) {
  state.newBookings = [booking, ...state.newBookings];
  emit();
}

export function addContainer(container: Container) {
  state.newContainers = [container, ...state.newContainers];
  emit();
}

export function getContainersByBookingId(bookingId: string): Container[] {
  const storeIds = new Set(
    state.newContainers.filter((c) => c.bookingId === bookingId).map((c) => c.id)
  );
  const fromSeed = getSeedContainers(bookingId).filter((c) => !storeIds.has(c.id));
  return [...state.newContainers.filter((c) => c.bookingId === bookingId), ...fromSeed];
}

export function updateContainer(id: string, patch: Partial<Container>) {
  const existing = state.newContainers.find((c) => c.id === id);
  if (existing) {
    state.newContainers = state.newContainers.map((c) =>
      c.id === id ? { ...c, ...patch } : c
    );
  } else {
    // promote seed container to newContainers on first edit
    const seedEntry = getSeedContainers(patch.bookingId ?? '').find((c) => c.id === id);
    if (seedEntry) {
      state.newContainers = [{ ...seedEntry, ...patch }, ...state.newContainers];
    }
  }
  emit();
}

function snapshot() {
  return state;
}

function serverSnapshot() {
  return state;
}

export function useDemoStore() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

export function getNewBookingById(id: string): Booking | undefined {
  return state.newBookings.find((b) => b.id === id);
}

export function applyBookingOverride(b: Booking): Booking {
  const patch = state.bookingOverrides[b.id];
  return patch ? { ...b, ...patch } : b;
}
