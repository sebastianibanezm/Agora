'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Container } from '@/types';
import { updateContainer } from '@/lib/hooks/useDemoStore';

interface Props {
  container: Container;
}

type EditableField = keyof Omit<Container, 'id' | 'bookingId'>;

const NUMERIC_FIELDS: EditableField[] = ['netWeightKg', 'grossWeightKg'];

export function ContainerCard({ container }: Props) {
  const t = useTranslations('containers');
  const [editing, setEditing] = useState<EditableField | null>(null);
  const [draft, setDraft] = useState('');

  function startEdit(field: EditableField) {
    const current = container[field];
    setDraft(current !== undefined ? String(current) : '');
    setEditing(field);
  }

  function commitEdit() {
    if (!editing) return;
    if (draft.trim() === '') {
      updateContainer(container.id, { [editing]: undefined, bookingId: container.bookingId });
    } else if (NUMERIC_FIELDS.includes(editing)) {
      const num = parseFloat(draft);
      if (!isNaN(num) && num >= 0) {
        updateContainer(container.id, { [editing]: num, bookingId: container.bookingId });
      }
    } else {
      updateContainer(container.id, { [editing]: draft.trim(), bookingId: container.bookingId });
    }
    setEditing(null);
  }

  function renderField(
    field: EditableField,
    labelKey: string,
    value: string | number | undefined,
  ) {
    const isActive = editing === field;
    const displayValue = value !== undefined ? String(value) : undefined;
    const isNumeric = NUMERIC_FIELDS.includes(field);

    return (
      <div key={field}>
        <dt className="text-ink-3">{t(labelKey as Parameters<typeof t>[0])}</dt>
        <dd>
          {isActive ? (
            <span className="flex items-center gap-1">
              <input
                autoFocus
                type={isNumeric ? 'number' : 'text'}
                min={isNumeric ? 0 : undefined}
                step={isNumeric ? 0.01 : undefined}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditing(null);
                }}
                className="w-full rounded border border-[var(--line-soft)] bg-bg-2 px-1.5 py-0.5 text-xs text-ink-1 outline-none focus:border-mint-500"
              />
              {isNumeric && <span className="shrink-0 text-ink-3">{t('unitKg')}</span>}
            </span>
          ) : (
            <button
              onClick={() => startEdit(field)}
              className="text-left text-ink-1 hover:text-mint-500"
            >
              {displayValue !== undefined ? (
                <span>
                  {displayValue}
                  {isNumeric && <span className="ml-1 text-ink-3">{t('unitKg')}</span>}
                </span>
              ) : (
                <span className="italic text-ink-4">{t('notAssigned')}</span>
              )}
            </button>
          )}
        </dd>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--line-soft)] bg-bg-1 p-3">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        {renderField('containerNumber', 'containerNumber', container.containerNumber)}
        {renderField('sealNumber', 'sealNumber', container.sealNumber)}
        {renderField('blNumber', 'blNumber', container.blNumber)}
        {renderField('netWeightKg', 'netWeight', container.netWeightKg)}
        {renderField('grossWeightKg', 'grossWeight', container.grossWeightKg)}
        <div className="col-span-2">
          {renderField('cargoDescription', 'cargoDescription', container.cargoDescription)}
        </div>
      </dl>
    </div>
  );
}
