import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { ContainerType, FreightTerm } from '@/types';
import { SCAC_TO_NAVIERA_ID } from '@/lib/mock-data/navieras';
import { POL, POD } from '@/lib/mock-data/lanes';

const client = new Anthropic();

function resolveCoords(
  portName: string,
  map: Record<string, { name: string; coords: [number, number] }>,
): [number, number] {
  const entry = Object.values(map).find(
    (p) =>
      p.name.toLowerCase().includes(portName.toLowerCase()) ||
      portName.toLowerCase().includes(p.name.toLowerCase().split(',')[0] ?? ''),
  );
  return entry?.coords ?? [0, 0];
}

function normalizeEmissionType(raw?: string): 'BL' | 'Seawaybill' {
  if (!raw) return 'BL';
  return raw.toLowerCase().includes('seaway') ? 'Seawaybill' : 'BL';
}

function normalizeFreightTerm(raw?: string): FreightTerm {
  if (!raw) return 'COLLECT';
  return raw.toUpperCase().includes('PREPAID') ? 'PREPAID' : 'COLLECT';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = await (file as File).arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `Extract the booking confirmation data from this PDF and return a JSON object with exactly this shape. Use null for fields not found. Dates should be ISO 8601 strings (YYYY-MM-DD or full ISO). Container count should be an integer.

{
  "bookingNumber": string,
  "scacCode": string,
  "shipper": string,
  "consignee": string,
  "referenciaCliente": string | null,
  "vesselName": string,
  "voyage": string,
  "pol": string,
  "pod": string,
  "transshipmentPort": string | null,
  "etd": string | null,
  "eta": string | null,
  "cutOff": string | null,
  "stackingFrom": string | null,
  "stackingTo": string | null,
  "containerType": "40RF" | "40HC" | "40DV" | "20RF" | "20DV",
  "containerCount": number,
  "isReefer": boolean,
  "setpointC": number | null,
  "ventilation": number | null,
  "freightTerm": "COLLECT" | "PREPAID" | null,
  "emissionType": string | null,
  "containers": [
    {
      "containerNumber": string | null,
      "cargoDescription": string | null
    }
  ]
}

Return ONLY the JSON object, no markdown, no explanation.`,
            },
          ],
        },
      ],
    });

    const firstBlock = message.content[0];
    const text = firstBlock?.type === 'text' ? firstBlock.text.trim() : '';
    const raw = JSON.parse(text);

    if (!raw.bookingNumber || !raw.scacCode) {
      return NextResponse.json(
        { error: 'Could not extract required fields from PDF' },
        { status: 400 },
      );
    }

    const navieraId = SCAC_TO_NAVIERA_ID[raw.scacCode] ?? 'NAV-UNKNOWN';
    const polCoords = resolveCoords(raw.pol ?? '', POL);
    const podCoords = resolveCoords(raw.pod ?? '', POD);

    const containers = (
      raw.containers ?? [{ containerNumber: null, cargoDescription: null }]
    ).map((c: { containerNumber: string | null; cargoDescription: string | null }) => ({
      containerNumber: c.containerNumber ?? undefined,
      cargoDescription: c.cargoDescription ?? undefined,
    }));

    if (containers.length === 0) {
      return NextResponse.json({ error: 'No containers found in PDF' }, { status: 400 });
    }

    return NextResponse.json({
      booking: {
        navieraId,
        bookingNumber: raw.bookingNumber,
        shipper: raw.shipper ?? '',
        consignee: raw.consignee ?? '',
        referenciaCliente: raw.referenciaCliente ?? undefined,
        vesselName: raw.vesselName ?? '',
        voyage: raw.voyage ?? '',
        pol: raw.pol ?? '',
        polCoords,
        pod: raw.pod ?? '',
        podCoords,
        transshipmentPort: raw.transshipmentPort ?? undefined,
        etd: raw.etd ?? undefined,
        eta: raw.eta ?? undefined,
        cutOff: raw.cutOff ?? undefined,
        stackingFrom: raw.stackingFrom ?? undefined,
        stackingTo: raw.stackingTo ?? undefined,
        containerType: (raw.containerType as ContainerType) ?? '40RF',
        isReefer: raw.isReefer ?? false,
        setpointC: raw.setpointC ?? undefined,
        ventilation: raw.ventilation ?? undefined,
        freightTerm: normalizeFreightTerm(raw.freightTerm),
        emissionType: normalizeEmissionType(raw.emissionType),
      },
      containers,
    });
  } catch (err) {
    console.error('[/api/bookings/parse]', err);
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 400 });
  }
}
