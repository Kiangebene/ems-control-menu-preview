/** All entries below are examples, not information from a connected sensor or API. */
export interface EnergyDevice {
  id: string;
  name: string;
  location: string;
  status: "active" | "paused";
  ratedPower: number;
}
export const defaultDevices: EnergyDevice[] = [
  { id: "device-001", name: "Main Power Panel A", location: "Building A · Floor 1", status: "active", ratedPower: 125 },
  { id: "device-002", name: "HVAC Control Unit", location: "Building A · Floor 2", status: "active", ratedPower: 65 },
  { id: "device-003", name: "Manufacturing Line 1", location: "Production Floor", status: "active", ratedPower: 180 },
  { id: "device-004", name: "Lighting Circuit B", location: "Building B · All Floors", status: "active", ratedPower: 28 },
  { id: "device-005", name: "Server Room UPS", location: "Data Center", status: "paused", ratedPower: 45 },
];
export const simulatedDaily = [
  { day: "Seg", energy: 468, peak: 80 }, { day: "Ter", energy: 523, peak: 94 },
  { day: "Qua", energy: 492, peak: 89 }, { day: "Qui", energy: 551, peak: 102 },
  { day: "Sex", energy: 536, peak: 97 }, { day: "Sáb", energy: 332, peak: 62 },
  { day: "Dom", energy: 289, peak: 54 }
];
export function downloadCsv(filename: string, lines: Array<Array<string | number>>) {
  const csv = "\uFEFF" + lines.map(line => line.map(item => `"${String(item).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}
