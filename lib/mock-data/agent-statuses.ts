import type { AgentStatusEntry } from '@/types';

export const agentStatuses: AgentStatusEntry[] = [
  // collect
  { agentId: 'booking_confirmation_collector', status: 'active', lastAction: 'Recibió 3 confirmaciones · hace 1h' },
  { agentId: 'doc_deadline_guardian',          status: 'active', lastAction: 'Alerta de cierre DUS enviada · hace 18h' },
  { agentId: 'invoice_fetcher',                status: 'active', lastAction: 'Obtuvo 2 facturas · hace 3h' },
  { agentId: 'bl_tracker',                     status: 'active', lastAction: 'BL confirmado emitido · hace 6h' },
  // validate
  { agentId: 'invoice_validator',              status: 'active', lastAction: 'Validó MSCU-7842156 · hace 2h' },
  { agentId: 'phyto_validator',                status: 'active', lastAction: 'Certificado válido · hace 4h' },
  { agentId: 'weight_reconciler',              status: 'active', lastAction: 'Discrepancia resuelta · hace 1d' },
  { agentId: 'customs_check',                  status: 'active', lastAction: 'DUS pendiente de presentación · ahora' },
  { agentId: 'lc_discrepancy_catcher',         status: 'idle',   lastAction: 'Esperando borrador L/C · inactivo' },
  // monitor
  { agentId: 'vessel_tracker',                 status: 'active', lastAction: 'MAEU en horario · hace 30m' },
  { agentId: 'port_congestion_watcher',        status: 'active', lastAction: 'Yangshan: congestion moderada · hace 1h' },
  { agentId: 'cutoff_sentinel',                status: 'active', lastAction: '18h para cierre de documentos · activo' },
  { agentId: 'eta_monitor',                    status: 'active', lastAction: 'ETA sin cambios · hace 2h' },
  { agentId: 'lunar_new_year_window_watcher',  status: 'idle',   lastAction: '27d para ventana Año Nuevo Lunar · observando' },
  // orchestrate
  { agentId: 'export_workflow_orchestrator',   status: 'active', lastAction: '2 flujos activos · en ejecución' },
  { agentId: 'approval_router',                status: 'idle',   lastAction: 'Esperando aprobación · inactivo' },
  { agentId: 'document_assembler',             status: 'active', lastAction: 'Armó 4 sets de documentos · hace 3h' },
  // reconcile
  { agentId: 'po_invoice_reconciler',          status: 'active', lastAction: '3 OCs conciliadas · hoy' },
  { agentId: 'freight_cost_reconciler',        status: 'active', lastAction: 'Variación $240 marcada · hace 4h' },
  // cold chain sentinels
  { agentId: 'pre_cooling_tracker',            status: 'active', lastAction: 'Preenfriamiento completo · verificado' },
  { agentId: 'cold_storage_monitor',           status: 'active', lastAction: '−0.5°C estable · hace 15m' },
  { agentId: 'reefer_pti_validator',           status: 'active', lastAction: 'PTI aprobado · hace 2d' },
  { agentId: 'in_transit_telemetry_watcher',   status: 'active', lastAction: 'Sin excursiones · hace 1h' },
  { agentId: 'cold_treatment_auditor',         status: 'active', lastAction: 'Día 10/15 en curso · activo' },
  { agentId: 'arrival_cold_chain_coordinator', status: 'active', lastAction: 'Prep llegada Yangshan · 5d restantes' },
];
