interface Props {
  start: string;   // month abbreviation, e.g. 'Nov'
  end: string;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function MiniSeasonBar({ start, end }: Props) {
  const sIdx = MONTHS.indexOf(start);
  const eIdx = MONTHS.indexOf(end);
  const active = MONTHS.map((_, i) => {
    if (sIdx <= eIdx) return i >= sIdx && i <= eIdx;
    return i >= sIdx || i <= eIdx;   // wraps year boundary (e.g. Nov–Jan)
  });

  return (
    <div style={{ display: 'flex', gap: '2px', height: '8px' }}>
      {MONTHS.map((m, i) => (
        <div
          key={m}
          title={m}
          style={{
            flex: 1,
            height: '100%',
            borderRadius: '2px',
            backgroundColor: active[i] === true ? '#00E696' : '#ffffff18',
          }}
        />
      ))}
    </div>
  );
}
