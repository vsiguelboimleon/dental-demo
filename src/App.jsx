import { useState, useEffect, useRef } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, LineChart, Line, AreaChart, Area } from "recharts"

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  teal: "#0D9E7E", tealL: "#E6F7F3", tealD: "#0A7D64",
  navy: "#1E3A5F", navyL: "#EFF4FB",
  amber: "#F59E0B", amberL: "#FFF7ED",
  red: "#EF4444", redL: "#FEF2F2",
  purple: "#8B5CF6", purpleL: "#F5F3FF",
  blue: "#3B82F6", blueL: "#EFF6FF",
  green: "#10B981", greenL: "#ECFDF5",
  gray: "#64748B", grayL: "#F8FAFC",
  border: "#E2E8F0", text: "#0F172A", muted: "#64748B", bg: "#F8FAFC"
}

// ─── Dummy data ───────────────────────────────────────────────────────────────
const NAMES = ["María García","Carlos López","Ana Martínez","José Rodríguez","Laura Sánchez","Miguel Fernández","Sofía Pérez","David Gómez","Carmen Díaz","Pablo Moreno","Isabel Álvarez","Alejandro Jiménez","Marta Torres","Fernando Ruiz","Elena Navarro","Javier Morales","Patricia Herrero","Roberto Molina","Cristina Ramírez","Antonio Ortega","Beatriz Castro","Sergio Reyes","Natalia Vega","Diego Ramos","Valentina Cruz","Hugo Soto","Lucía Mendoza","Álvaro Blanco","Rosa Peña","Tomás Aguilar"]
const TREATMENTS = ["Limpieza","Ortodoncia","Implante","Blanqueamiento","Empaste","Extracción","Revisión","Endodoncia"]
const DOCTORS = ["Dr. García","Dra. López","Dr. Martínez"]
const CHANNELS = ["WhatsApp","Web","Llamada","Instagram","Referido"]
const STATUSES = ["Activo","Activo","Activo","Seguimiento","Nuevo","Nuevo","Inactivo"]
const SPARK_PRODUCTS = ["Spark 10","Spark 20","Spark 35","Spark Advanced"]

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

const PATIENTS = NAMES.map((name, i) => {
  const treatment = TREATMENTS[i % TREATMENTS.length]
  const isOrtho = treatment === "Ortodoncia"
  return {
    id: i + 1, name,
    phone: `+34 6${String(11000000 + i * 7919321 % 88999999).slice(0, 8)}`,
    lastVisit: i < 10 ? `${rnd(1,28)}/10/2024` : i < 20 ? `${rnd(1,28)}/04/2024` : `${rnd(1,28)}/06/2023`,
    nextVisit: i < 15 ? `${rnd(1,28)}/${rnd(1,3)}/2025` : null,
    treatment,
    status: i > 22 ? "Inactivo" : STATUSES[i % STATUSES.length],
    doctor: DOCTORS[i % DOCTORS.length],
    viaAgent: i % 3 !== 0,
    value: rnd(120, 3800),
    hygieneDate: i < 8 ? `${rnd(1,28)}/12/2024` : `${rnd(1,28)}/06/2024`,
    treatmentDone: i % 4 !== 1,
    channel: CHANNELS[i % CHANNELS.length],
    sparkProduct: isOrtho ? SPARK_PRODUCTS[i % SPARK_PRODUCTS.length] : null,
    refinements: rnd(0, 4),
  }
})

const MONTH_REVENUE = [
  { mes: "Ene", ingresos: 18400, ano_ant: 15200, limpieza: 3200, ortodoncia: 5800, implantes: 4600, estetica: 2100, otros: 2700 },
  { mes: "Feb", ingresos: 21300, ano_ant: 17800, limpieza: 3800, ortodoncia: 6200, implantes: 5100, estetica: 2800, otros: 3400 },
  { mes: "Mar", ingresos: 19800, ano_ant: 18400, limpieza: 3500, ortodoncia: 5900, implantes: 4800, estetica: 2400, otros: 3200 },
  { mes: "Abr", ingresos: 23100, ano_ant: 19200, limpieza: 4100, ortodoncia: 7100, implantes: 5600, estetica: 3100, otros: 3200 },
  { mes: "May", ingresos: 22500, ano_ant: 20100, limpieza: 3900, ortodoncia: 6800, implantes: 5200, estetica: 3200, otros: 3400 },
  { mes: "Jun", ingresos: 20800, ano_ant: 18900, limpieza: 3600, ortodoncia: 6100, implantes: 4900, estetica: 2900, otros: 3300 },
  { mes: "Jul", ingresos: 17200, ano_ant: 15600, limpieza: 3000, ortodoncia: 5100, implantes: 4000, estetica: 2400, otros: 2700 },
  { mes: "Ago", ingresos: 14800, ano_ant: 13200, limpieza: 2600, ortodoncia: 4400, implantes: 3400, estetica: 2100, otros: 2300 },
  { mes: "Sep", ingresos: 22400, ano_ant: 20800, limpieza: 3900, ortodoncia: 6700, implantes: 5400, estetica: 3100, otros: 3300 },
  { mes: "Oct", ingresos: 24600, ano_ant: 21400, limpieza: 4300, ortodoncia: 7400, implantes: 5900, estetica: 3400, otros: 3600 },
  { mes: "Nov", ingresos: 26800, ano_ant: 23100, limpieza: 4700, ortodoncia: 8100, implantes: 6400, estetica: 3700, otros: 3900 },
  { mes: "Dic", ingresos: 29200, ano_ant: 24800, limpieza: 5100, ortodoncia: 8800, implantes: 7000, estetica: 4100, otros: 4200 },
]

const TREAT_MARGIN = [
  { name: "Implantes", ingreso: 7000, coste: 2800, margen: 60, color: C.teal },
  { name: "Ortodoncia", ingreso: 8800, coste: 4200, margen: 52, color: C.navy },
  { name: "Endodoncia", ingreso: 2100, coste: 840, margen: 60, color: C.purple },
  { name: "Estética", ingreso: 4100, coste: 1800, margen: 56, color: C.blue },
  { name: "Limpieza", ingreso: 5100, coste: 2040, margen: 60, color: C.green },
  { name: "Empastes", ingreso: 1800, coste: 900, margen: 50, color: C.amber },
]

const TODAY_APPTS = [
  { time: "09:00", patient: "María García", treatment: "Revisión", doctor: "Dr. García", status: "confirmada", viaAgent: true },
  { time: "09:30", patient: "Carlos López", treatment: "Limpieza", doctor: "Dra. López", status: "confirmada", viaAgent: false },
  { time: "10:00", patient: "Ana Martínez", treatment: "Ortodoncia", doctor: "Dr. García", status: "pendiente", viaAgent: true },
  { time: "10:30", patient: "José Rodríguez", treatment: "Empaste", doctor: "Dr. Martínez", status: "confirmada", viaAgent: true },
  { time: "11:00", patient: "Laura Sánchez", treatment: "Implante", doctor: "Dr. García", status: "confirmada", viaAgent: false },
  { time: "11:30", patient: "Miguel Fernández", treatment: "Blanqueamiento", doctor: "Dra. López", status: "cancelada", viaAgent: true },
  { time: "12:00", patient: "Sofía Pérez", treatment: "Extracción", doctor: "Dr. Martínez", status: "confirmada", viaAgent: false },
  { time: "16:00", patient: "David Gómez", treatment: "Revisión", doctor: "Dr. García", status: "pendiente", viaAgent: true },
  { time: "16:30", patient: "Carmen Díaz", treatment: "Limpieza", doctor: "Dra. López", status: "confirmada", viaAgent: false },
  { time: "17:00", patient: "Pablo Moreno", treatment: "Ortodoncia", doctor: "Dr. García", status: "confirmada", viaAgent: true },
]

const TOMORROW_APPTS = [
  { time: "09:00", patient: "Isabel Álvarez", treatment: "Limpieza", doctor: "Dra. López", status: "pendiente", reminder: true },
  { time: "09:30", patient: "Alejandro Jiménez", treatment: "Ortodoncia", doctor: "Dr. García", status: "confirmada", reminder: false },
  { time: "10:00", patient: "Marta Torres", treatment: "Revisión", doctor: "Dr. Martínez", status: "pendiente", reminder: true },
  { time: "10:30", patient: "Fernando Ruiz", treatment: "Implante", doctor: "Dr. García", status: "confirmada", reminder: false },
  { time: "11:00", patient: "Elena Navarro", treatment: "Empaste", doctor: "Dra. López", status: "pendiente", reminder: true },
  { time: "16:00", patient: "Javier Morales", treatment: "Blanqueamiento", doctor: "Dr. García", status: "confirmada", reminder: false },
  { time: "17:00", patient: "Patricia Herrero", treatment: "Endodoncia", doctor: "Dr. Martínez", status: "pendiente", reminder: true },
]

const FREE_SLOTS = [
  { date: "Hoy", time: "13:00", doctor: "Dra. López" },
  { date: "Mañana", time: "11:30", doctor: "Dr. Martínez" },
  { date: "Mañana", time: "15:00", doctor: "Dr. García" },
  { date: "Mañana", time: "18:00", doctor: "Dra. López" },
  { date: "Jue 16", time: "09:00", doctor: "Dr. García" },
  { date: "Jue 16", time: "16:30", doctor: "Dr. Martínez" },
]

const LEADS = [
  { name: "Roberto Molina", channel: "WhatsApp", date: "Hoy 09:14", status: "nuevo", treatment: "Ortodoncia", budget: 3200, responseMin: 4 },
  { name: "Cristina Ramírez", channel: "Instagram", date: "Hoy 08:31", status: "cita_agendada", treatment: "Blanqueamiento", budget: 350, responseMin: 12 },
  { name: "Antonio Ortega", channel: "Web", date: "Ayer 18:22", status: "presupuesto", treatment: "Implante", budget: 1800, responseMin: 8 },
  { name: "Beatriz Castro", channel: "Referido", date: "Ayer 11:05", status: "aceptado", treatment: "Ortodoncia", budget: 2800, responseMin: 6 },
  { name: "Sergio Reyes", channel: "Llamada", date: "Lun 15:30", status: "perdido", treatment: "Limpieza", budget: 60, responseMin: 0 },
  { name: "Natalia Vega", channel: "WhatsApp", date: "Lun 10:12", status: "presupuesto", treatment: "Endodoncia", budget: 420, responseMin: 3 },
  { name: "Diego Ramos", channel: "Web", date: "Vie 16:48", status: "aceptado", treatment: "Implante", budget: 2400, responseMin: 15 },
  { name: "Valentina Cruz", channel: "Instagram", date: "Vie 12:00", status: "cita_agendada", treatment: "Estética", budget: 650, responseMin: 7 },
]

const FUNNEL_DATA = [
  { stage: "Leads recibidos", value: 148, color: C.navy },
  { stage: "Cita agendada", value: 112, color: C.blue },
  { stage: "Diagnóstico realizado", value: 89, color: C.teal },
  { stage: "Presupuesto enviado", value: 74, color: C.amber },
  { stage: "Presupuesto aceptado", value: 51, color: C.green },
]

const CHANNEL_DATA = [
  { name: "WhatsApp", leads: 62, color: C.teal },
  { name: "Web", leads: 38, color: C.navy },
  { name: "Instagram", leads: 27, color: C.purple },
  { name: "Referido", leads: 14, color: C.green },
  { name: "Llamada", leads: 7, color: C.amber },
]

const WORD_DATA = [
  { word: "pedir cita", freq: 98, color: C.teal },
  { word: "precio", freq: 82, color: C.navy },
  { word: "limpieza", freq: 76, color: C.amber },
  { word: "horario", freq: 71, color: C.blue },
  { word: "disponibilidad", freq: 68, color: C.teal },
  { word: "ortodoncia", freq: 60, color: C.purple },
  { word: "implantes", freq: 54, color: C.red },
  { word: "cancelar", freq: 49, color: C.muted },
  { word: "seguro", freq: 45, color: C.teal },
  { word: "blanqueamiento", freq: 42, color: C.amber },
  { word: "empaste", freq: 38, color: C.navy },
  { word: "urgencia", freq: 35, color: C.red },
  { word: "recordatorio", freq: 32, color: C.blue },
  { word: "reprogramar", freq: 30, color: C.muted },
  { word: "presupuesto", freq: 28, color: C.purple },
  { word: "dolor", freq: 22, color: C.red },
  { word: "factura", freq: 18, color: C.muted },
  { word: "financiación", freq: 13, color: C.purple },
]

const AI_MONTHLY = [
  { mes: "Jul", pct: 48 }, { mes: "Ago", pct: 52 }, { mes: "Sep", pct: 57 },
  { mes: "Oct", pct: 61 }, { mes: "Nov", pct: 65 }, { mes: "Dic", pct: 71 },
]

const TREAT_SOLD_AI = [
  { name: "Limpieza", ia: 82 }, { name: "Blanqueamiento", ia: 78 },
  { name: "Ortodoncia", ia: 64 }, { name: "Implantes", ia: 58 },
  { name: "Empaste", ia: 71 }, { name: "Endodoncia", ia: 45 },
]

const SCRIPT = [
  { from: "patient", text: "Hola, me gustaría pedir cita para una limpieza dental" },
  { from: "agent", text: "¡Hola! Soy el asistente virtual de la clínica. Encantada de ayudarte 😊\n\n¿Cuál es tu nombre completo?" },
  { from: "patient", text: "Soy María García" },
  { from: "agent", text: "Perfecto, María 🦷 Tenemos disponibilidad esta semana:\n\n🕙 Martes: 9:00, 10:30, 12:00\n🕐 Jueves: 16:00, 17:30\n\n¿Qué horario te viene mejor?" },
  { from: "patient", text: "El jueves a las 10:30 me viene bien" },
  { from: "agent", text: "✅ ¡Reservado!\n\n📅 Jueves, 16 enero · 10:30h\n👩‍⚕️ Dra. López\n🦷 Limpieza dental\n\nTe enviaré un recordatorio 24h antes. ¿Necesitas algo más?" },
  { from: "patient", text: "¿Cuánto cuesta la limpieza?" },
  { from: "agent", text: "La limpieza dental completa son 60€. Incluye revisión, tartrectomía y pulido.\n\n¿Tienes seguro dental? 😊" },
  { from: "patient", text: "Sí, tengo Sanitas" },
  { from: "agent", text: "¡Perfecto! Con Sanitas queda cubierta al 100% 🎉\n\nSolo trae tu tarjeta el día de la cita. ¡Hasta el jueves, María!" },
]

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function Badge({ s, map }) {
  const defaults = {
    confirmada: [C.greenL, "#065F46"], pendiente: [C.amberL, "#92400E"],
    cancelada: [C.redL, "#991B1B"], "no-show": [C.redL, "#991B1B"],
    Activo: [C.greenL, "#065F46"], Inactivo: [C.redL, "#991B1B"],
    Seguimiento: [C.amberL, "#92400E"], Nuevo: [C.blueL, "#1E40AF"],
    nuevo: [C.blueL, "#1E40AF"], cita_agendada: [C.tealL, "#065F46"],
    presupuesto: [C.amberL, "#92400E"], aceptado: [C.greenL, "#065F46"],
    perdido: [C.redL, "#991B1B"],
  }
  const labels = { cita_agendada: "Cita agendada", "no-show": "No-show" }
  const m = (map || defaults)[s] || ["#F3F4F6","#374151"]
  return <span style={{ background: m[0], color: m[1], padding: "2px 8px", borderRadius: 9999, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{labels[s] || s}</span>
}

function KpiCard({ label, value, sub, subColor, icon, accent, small }) {
  return (
    <div style={{ background: "#FFF", border: `1px solid ${C.border}`, borderRadius: 12, padding: small ? "12px 14px" : "16px 20px", flex: 1, minWidth: small ? 110 : 130 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{label}</span>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: small ? 20 : 24, fontWeight: 700, color: accent || C.text, letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor || C.green, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function RadialKpi({ value, label, color, sub }) {
  const r = 36, circ = 2 * Math.PI * r, dash = (value / 100) * circ
  return (
    <div style={{ background: "#FFF", border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 14px", flex: 1, minWidth: 140, textAlign: "center" }}>
      <svg width={88} height={88} style={{ display: "block", margin: "0 auto 8px" }}>
        <circle cx={44} cy={44} r={r} fill="none" stroke={C.border} strokeWidth={7} />
        <circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 44 44)" />
        <text x={44} y={49} textAnchor="middle" fontSize={16} fontWeight={700} fill={color}>{value}%</text>
      </svg>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>{children}</h2>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>{sub}</p>}
    </div>
  )
}

function Card({ children, style }) {
  return <div style={{ background: "#FFF", border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, ...style }}>{children}</div>
}

function euro(n) { return n >= 1000 ? `${(n / 1000).toFixed(1).replace(".", ",")}k €` : `${n} €` }

// ─── RESUMEN ──────────────────────────────────────────────────────────────────
function Resumen({ role }) {
  const ytd = MONTH_REVENUE.slice(0, 11).reduce((s, m) => s + m.ingresos, 0)
  const ytdAnt = MONTH_REVENUE.slice(0, 11).reduce((s, m) => s + m.ano_ant, 0)
  const thisMes = MONTH_REVENUE[11]
  const lastMes = MONTH_REVENUE[10]
  const activos = PATIENTS.filter(p => p.status === "Activo").length
  const activity = [
    "María García confirmó cita para el jueves 16 vía WhatsApp",
    "Carlos López reprogramó su cita de ortodoncia automáticamente",
    "3 recordatorios enviados sin intervención humana",
    "Nuevo lead de Instagram — Cristina Ramírez, blanqueamiento",
    "Presupuesto de implante aceptado — Diego Ramos (2.400€)",
  ]
  const times = ["hace 5 min","hace 23 min","hace 1 h","hace 2 h","hace 3 h"]
  return (
    <div style={{ padding: 24 }}>
      <SectionTitle sub="Vista general del negocio">Resumen ejecutivo</SectionTitle>

      {role === "admin" ? (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <KpiCard label="Ingresos diciembre" value={euro(thisMes.ingresos)} sub={`↑ +${Math.round((thisMes.ingresos/lastMes.ingresos-1)*100)}% vs noviembre`} icon="💰" accent={C.teal} />
          <KpiCard label="Acumulado 2024" value={euro(ytd)} sub={`↑ +${Math.round((ytd/ytdAnt-1)*100)}% vs 2023`} icon="📈" accent={C.navy} />
          <KpiCard label="Presupuestos pendientes" value="7" sub="38.400 € en juego" icon="📋" subColor={C.amber} />
          <KpiCard label="Aceptación presupuestos" value="69%" sub="↑ +4 pts este mes" icon="✅" accent={C.green} />
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <KpiCard label="Citas hoy" value="10" sub="8 confirmadas · 2 pendientes" icon="📅" accent={C.teal} />
          <KpiCard label="Citas mañana" value="7" sub="4 pendientes de confirmar" icon="📆" subColor={C.amber} />
          <KpiCard label="Huecos libres 48h" value="6" sub="disponibles para rellenar" icon="🕐" subColor={C.blue} />
          <KpiCard label="Pacientes activos" value={activos} sub="de 30 en total" icon="👥" accent={C.navy} />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <KpiCard label="Citas mañana" value="7" sub="4 pendientes de confirmar" icon="📆" subColor={C.amber} small />
        <KpiCard label="No-shows del mes" value="4" sub="↓ -2 vs noviembre" icon="🚫" subColor={C.amber} small />
        <KpiCard label="Pacientes nuevos" value="17" sub="↑ +3 vs noviembre" icon="🆕" accent={C.teal} small />
        <KpiCard label="Sin próxima cita" value="12" sub="requieren seguimiento" icon="⏳" subColor={C.red} small />
        {role === "admin" && <KpiCard label="Ticket medio" value="462 €" sub="↑ +28€ vs mes ant." icon="🎫" accent={C.purple} small />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Evolución de ingresos mensuales</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTH_REVENUE}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v/1000}k`} />
              <Tooltip formatter={v => [`${v.toLocaleString("es")} €`]} />
              <Area type="monotone" dataKey="ingresos" stroke={C.teal} strokeWidth={2} fill="url(#gi)" name="2024" />
              <Area type="monotone" dataKey="ano_ant" stroke={C.border} strokeWidth={1.5} fill="none" strokeDasharray="4 3" name="2023" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Pacientes nuevos vs recurrentes</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MONTH_REVENUE.slice(6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="limpieza" fill={C.teal} radius={[3,3,0,0]} name="Nuevos" stackId="a" />
              <Bar dataKey="ortodoncia" fill={C.navyL} radius={[3,3,0,0]} name="Recurrentes" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Actividad reciente del agente IA</div>
        {activity.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
            <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", minWidth: 78, paddingTop: 1 }}>{times[i]}</span>
            <span style={{ fontSize: 13, color: C.text }}>{a}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── DIRECCIÓN ────────────────────────────────────────────────────────────────
function Direccion() {
  const ytd = MONTH_REVENUE.slice(0, 11).reduce((s, m) => s + m.ingresos, 0)
  const ytdAnt = MONTH_REVENUE.slice(0, 11).reduce((s, m) => s + m.ano_ant, 0)
  const cur = MONTH_REVENUE[11]
  const prev = MONTH_REVENUE[10]
  const pct = v => `${v > 0 ? "↑" : "↓"} ${Math.abs(v)}%`
  const diff = Math.round((cur.ingresos / prev.ingresos - 1) * 100)
  const EQUILIBRIO = 14200
  const pctEq = Math.round((cur.ingresos / EQUILIBRIO) * 100)

  return (
    <div style={{ padding: 24 }}>
      <SectionTitle sub="Análisis financiero y rentabilidad">Vista Dirección</SectionTitle>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <KpiCard label="Ingresos diciembre" value={euro(cur.ingresos)} sub={`${pct(diff)} vs noviembre`} icon="💰" accent={C.teal} />
        <KpiCard label="vs dic. año pasado" value={euro(cur.ano_ant)} sub={`${pct(Math.round((cur.ingresos/cur.ano_ant-1)*100))} crecimiento YoY`} icon="📅" accent={C.navy} />
        <KpiCard label="Acumulado 2024" value={euro(ytd)} sub={`${pct(Math.round((ytd/ytdAnt-1)*100))} vs 2023`} icon="📈" accent={C.green} />
        <KpiCard label="Acumulado 2023" value={euro(ytdAnt)} sub="referencia año anterior" icon="📊" accent={C.muted} />
        <KpiCard label="Ticket medio" value="462 €" sub="↑ +28€ vs mes ant." icon="🎫" accent={C.purple} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Ingresos por tratamiento — diciembre</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>vs mes anterior</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TREAT_MARGIN} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v/1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={72} />
              <Tooltip formatter={v => [`${v.toLocaleString("es")} €`]} />
              <Bar dataKey="ingreso" radius={[0,4,4,0]} name="Ingreso">
                {TREAT_MARGIN.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Margen por línea de tratamiento</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>% sobre ingreso bruto</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {TREAT_MARGIN.map(({ name, margen, ingreso, coste, color }) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: C.text }}>{name}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{euro(ingreso)} ingreso · <strong style={{ color }}>{margen}%</strong> margen</span>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 4, height: 7, overflow: "hidden" }}>
                  <div style={{ width: `${margen}%`, height: "100%", background: color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Mix de tratamientos</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Distribución de ingresos — dependencia por línea</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={TREAT_MARGIN} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="ingreso" paddingAngle={2}>
                  {TREAT_MARGIN.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={v => [`${v.toLocaleString("es")} €`]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {TREAT_MARGIN.map(t => {
                const total = TREAT_MARGIN.reduce((s, m) => s + m.ingreso, 0)
                const pct = Math.round(t.ingreso / total * 100)
                return (
                  <div key={t.name} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: t.color, display: "inline-block" }} />{t.name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: pct > 28 ? C.red : C.text }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
          {(() => { const total = TREAT_MARGIN.reduce((s,m) => s + m.ingreso, 0); const top = Math.max(...TREAT_MARGIN.map(m => m.ingreso)); const topName = TREAT_MARGIN.find(m => m.ingreso === top).name; const pct = Math.round(top/total*100); return pct > 30 ? (
            <div style={{ marginTop: 12, background: C.amberL, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#92400E" }}>
              ⚠️ {topName} representa el {pct}% de los ingresos — riesgo de concentración
            </div>
          ) : null })()}
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Punto de equilibrio</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Costes fijos estimados: {euro(EQUILIBRIO)}/mes</div>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: pctEq >= 100 ? C.green : C.amber }}>{pctEq}%</div>
            <div style={{ fontSize: 13, color: C.muted }}>del punto de equilibrio cubierto</div>
          </div>
          <div style={{ background: "#F1F5F9", borderRadius: 6, height: 12, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ width: `${Math.min(pctEq, 100)}%`, height: "100%", background: pctEq >= 100 ? C.green : C.amber, borderRadius: 6 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: C.muted }}>Costes fijos: {euro(EQUILIBRIO)}</span>
            <span style={{ color: C.green, fontWeight: 600 }}>Superávit: {euro(cur.ingresos - EQUILIBRIO)}</span>
          </div>
          <div style={{ marginTop: 12, background: C.greenL, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#065F46" }}>
            ✅ {cur.ingresos > EQUILIBRIO ? `La clínica cubre costes fijos con margen de ${euro(cur.ingresos - EQUILIBRIO)}` : "Atención: ingresos por debajo del punto de equilibrio"}
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Ortodoncia Spark — detalle de casos</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Distribución por producto y refinamientos medios por caso</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>Casos por producto Spark</div>
            {(() => {
              const orthoPatients = PATIENTS.filter(p => p.sparkProduct)
              const counts = ["Spark 10","Spark 20","Spark 35","Spark Advanced"].map(prod => ({
                name: prod, count: orthoPatients.filter(p => p.sparkProduct === prod).length,
                color: [C.teal, C.blue, C.navy, C.purple][["Spark 10","Spark 20","Spark 35","Spark Advanced"].indexOf(prod)]
              }))
              const max = Math.max(...counts.map(c => c.count))
              return counts.map(({ name, count, color }) => (
                <div key={name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />{name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color }}>{count} casos</span>
                  </div>
                  <div style={{ background: "#F1F5F9", borderRadius: 4, height: 7 }}>
                    <div style={{ width: max ? `${Math.round(count/max*100)}%` : "0%", height: "100%", background: color, borderRadius: 4 }} />
                  </div>
                </div>
              ))
            })()}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 10 }}>Refinamientos por paciente</div>
            {(() => {
              const ortho = PATIENTS.filter(p => p.sparkProduct)
              const avg = ortho.length ? (ortho.reduce((s, p) => s + p.refinements, 0) / ortho.length).toFixed(1) : 0
              const max = Math.max(...ortho.map(p => p.refinements))
              const dist = [0,1,2,3,4].map(n => ({ label: `${n} ref.`, count: ortho.filter(p => p.refinements === n).length }))
              return (
                <>
                  <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: C.navy }}>{avg}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>promedio</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: max >= 3 ? C.red : C.amber }}>{max}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>máximo</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: C.teal }}>{ortho.length}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>casos activos</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 60 }}>
                    {dist.map(({ label, count }) => {
                      const maxCount = Math.max(...dist.map(d => d.count))
                      const h = maxCount ? Math.round(count / maxCount * 52) : 0
                      return (
                        <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ width: "100%", height: h, background: C.navy, borderRadius: "3px 3px 0 0", minHeight: count ? 4 : 0 }} />
                          <div style={{ fontSize: 10, color: C.muted }}>{label}</div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Evolución ingresos 2024 vs 2023 por mes</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MONTH_REVENUE}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v/1000}k`} />
            <Tooltip formatter={v => [`${v.toLocaleString("es")} €`]} />
            <Bar dataKey="ingresos" fill={C.teal} radius={[3,3,0,0]} name="2024" />
            <Bar dataKey="ano_ant" fill={C.border} radius={[3,3,0,0]} name="2023" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function Agenda() {
  const [dayTab, setDayTab] = useState("hoy")
  const appointments = dayTab === "hoy" ? TODAY_APPTS : TOMORROW_APPTS
  const confirmed = appointments.filter(a => a.status === "confirmada").length
  const pending = appointments.filter(a => a.status === "pendiente").length
  const cancelled = TODAY_APPTS.filter(a => a.status === "cancelada").length
  const barColor = { confirmada: C.teal, pendiente: C.amber, cancelada: C.red }
  const docLoad = DOCTORS.map(d => ({
    name: d, total: appointments.filter(a => a.doctor === d).length,
    confirmed: appointments.filter(a => a.doctor === d && a.status === "confirmada").length
  }))

  return (
    <div style={{ padding: 24 }}>
      <SectionTitle sub="Operación diaria · gestión de citas">Vista Agenda</SectionTitle>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <KpiCard label="Citas hoy" value={TODAY_APPTS.length} sub={`${TODAY_APPTS.filter(a=>a.status==="confirmada").length} confirmadas`} icon="📅" accent={C.teal} small />
        <KpiCard label="Citas mañana" value={TOMORROW_APPTS.length} sub={`${TOMORROW_APPTS.filter(a=>a.status==="pendiente").length} pendientes de confirmar`} icon="📆" subColor={C.amber} small />
        <KpiCard label="Cancelaciones hoy" value={cancelled} sub="1 en espera de reprogramar" icon="🚫" subColor={C.red} small />
        <KpiCard label="No-shows mes" value="4" sub="↓ -2 vs noviembre" icon="👻" subColor={C.amber} small />
        <KpiCard label="Huecos libres 72h" value={FREE_SLOTS.length} sub="disponibles para rellenar" icon="🕐" subColor={C.blue} small />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 0 }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 20px" }}>
            {[["hoy","Citas de hoy"],["manana","Citas de mañana"]].map(([id, label]) => (
              <button key={id} onClick={() => setDayTab(id)}
                style={{ padding: "14px 16px", background: "transparent", border: "none", borderBottom: dayTab === id ? `2px solid ${C.teal}` : "2px solid transparent", color: dayTab === id ? C.teal : C.muted, fontWeight: dayTab === id ? 600 : 400, fontSize: 13, cursor: "pointer" }}>
                {label} {id === "manana" && pending > 0 && <span style={{ background: C.amber, color: "#FFF", borderRadius: 9999, padding: "1px 6px", fontSize: 10, marginLeft: 4 }}>{TOMORROW_APPTS.filter(a=>a.status==="pendiente").length}</span>}
              </button>
            ))}
          </div>
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {appointments.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, minWidth: 44 }}>{a.time}</span>
                <div style={{ width: 3, height: 36, background: barColor[a.status] || C.border, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.patient}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{a.treatment} · {a.doctor}{a.viaAgent ? " · 🤖 vía IA" : ""}</div>
                </div>
                <Badge s={a.status} />
                {dayTab === "manana" && a.reminder && (
                  <span style={{ fontSize: 11, background: C.blueL, color: C.blue, padding: "2px 7px", borderRadius: 6 }}>📤 recordatorio</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Ocupación por doctor</div>
            {docLoad.map(d => (
              <div key={d.name} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: C.text }}>{d.name}</span>
                  <span style={{ color: C.muted }}>{d.confirmed}/{d.total}</span>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 4, height: 7 }}>
                  <div style={{ width: d.total ? `${Math.round(d.confirmed/d.total*100)}%` : "0%", height: "100%", background: C.teal, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Huecos libres próximas 72h</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {FREE_SLOTS.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: C.tealL, borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.tealD }}>{s.date} · {s.time}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{s.doctor}</div>
                  </div>
                  <span style={{ fontSize: 16 }}>📲</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Automatización de recordatorios</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>El agente enviará esta tarde recordatorio por WhatsApp a los pacientes de mañana pendientes de confirmar</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TOMORROW_APPTS.filter(a => a.reminder).map((a, i) => (
            <div key={i} style={{ background: C.blueL, border: `1px solid ${C.blue}20`, borderRadius: 8, padding: "8px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{a.patient}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{a.time} · {a.treatment}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── PACIENTES ────────────────────────────────────────────────────────────────
function Pacientes() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("Todos")
  const [viewTab, setViewTab] = useState("lista")
  const inactive = PATIENTS.filter(p => p.status === "Inactivo")
  const noNext = PATIENTS.filter(p => !p.nextVisit && p.status !== "Inactivo")
  const incomplete = PATIENTS.filter(p => !p.treatmentDone)

  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) && (filter === "Todos" || p.status === filter)
  )

  return (
    <div style={{ padding: 24 }}>
      <SectionTitle sub="Seguimiento, recurrencia y reactivación">Vista Pacientes</SectionTitle>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <KpiCard label="Nuevos este mes" value="17" sub="↑ +3 vs noviembre" icon="🆕" accent={C.teal} small />
        <KpiCard label="Recurrentes" value="21" sub="visita en últimos 3 meses" icon="🔄" accent={C.navy} small />
        <KpiCard label="Activos" value={PATIENTS.filter(p=>p.status==="Activo").length} sub="en seguimiento activo" icon="✅" accent={C.green} small />
        <KpiCard label="Inactivos" value={inactive.length} sub="+6 meses sin visita" icon="😴" subColor={C.red} small />
        <KpiCard label="Sin próxima cita" value={noNext.length} sub="requieren reactivación" icon="⏳" subColor={C.amber} small />
        <KpiCard label="Trat. incompleto" value={incomplete.length} sub="empezado pero no terminado" icon="⚠️" subColor={C.red} small />
      </div>

      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
        {[["lista","Lista completa"],["inactivos","Inactivos"],["sin_cita","Sin próxima cita"],["incompleto","Trat. incompleto"]].map(([id, label]) => (
          <button key={id} onClick={() => setViewTab(id)}
            style={{ padding: "10px 16px", background: "transparent", border: "none", borderBottom: viewTab === id ? `2px solid ${C.teal}` : "2px solid transparent", color: viewTab === id ? C.teal : C.muted, fontWeight: viewTab === id ? 600 : 400, fontSize: 13, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {viewTab === "lista" && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Buscar paciente..."
              style={{ padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, flex: 1, minWidth: 180, outline: "none" }} />
            {["Todos","Activo","Seguimiento","Nuevo","Inactivo"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "7px 12px", border: `1.5px solid ${filter===f ? C.teal : C.border}`, background: filter===f ? C.tealL : "#FFF", color: filter===f ? C.teal : C.text, borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>{f}</button>
            ))}
          </div>
          <Card style={{ padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {["Paciente","Tratamiento","Producto Spark","Refinamientos","Médico","Próxima cita","Estado","Valor"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} style={{ background: i % 2 === 0 ? "#FFF" : C.bg }}>
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: C.text, whiteSpace: "nowrap" }}>{p.name}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: C.text }}>{p.treatment}</td>
                      <td style={{ padding: "10px 14px" }}>
                        {p.sparkProduct ? (
                          <span style={{ background: C.purpleL, color: C.purple, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999 }}>{p.sparkProduct}</span>
                        ) : <span style={{ color: C.border }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center" }}>
                        {p.sparkProduct ? (
                          <span style={{ fontSize: 13, fontWeight: 700, color: p.refinements >= 3 ? C.red : p.refinements >= 2 ? C.amber : C.green }}>{p.refinements}</span>
                        ) : <span style={{ color: C.border }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{p.doctor}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: p.nextVisit ? C.text : C.red }}>{p.nextVisit || "Sin agendar"}</td>
                      <td style={{ padding: "10px 14px" }}><Badge s={p.status} /></td>
                      <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: C.text }}>{euro(p.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
              {filtered.length} de {PATIENTS.length} pacientes · valor total: {euro(filtered.reduce((s, p) => s + p.value, 0))}
            </div>
          </Card>
        </>
      )}

      {viewTab === "inactivos" && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Pacientes inactivos — más de 6 meses sin visita</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>El agente puede enviar un mensaje de reactivación automático</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {inactive.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Última visita: {p.lastVisit} · {p.treatment}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.red }}>+12 meses</span>
                  <span style={{ background: C.tealL, color: C.teal, fontSize: 12, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}>📲 Reactivar</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {viewTab === "sin_cita" && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Pacientes sin próxima cita agendada</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Oportunidad de reactivación y llenado de agenda</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {noNext.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Última visita: {p.lastVisit} · {p.treatment} · {p.doctor}</div>
                </div>
                <span style={{ background: C.amberL, color: "#92400E", fontSize: 12, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}>📅 Agendar</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {viewTab === "incompleto" && (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Tratamientos empezados sin completar</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Ingresos pendientes de recuperar con seguimiento activo</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {incomplete.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>Tratamiento: {p.treatment} · {p.doctor}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.red }}>{euro(p.value)} pendiente</span>
                  <span style={{ background: C.redL, color: C.red, fontSize: 12, padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}>💬 Contactar</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── COMERCIAL ────────────────────────────────────────────────────────────────
function Comercial() {
  const pendingBudget = LEADS.filter(l => l.status === "presupuesto")
  const pendingTotal = pendingBudget.reduce((s, l) => s + l.budget, 0)
  const accepted = LEADS.filter(l => l.status === "aceptado")
  const acceptedTotal = accepted.reduce((s, l) => s + l.budget, 0)
  const avgResponse = Math.round(LEADS.filter(l=>l.responseMin>0).reduce((s,l)=>s+l.responseMin,0) / LEADS.filter(l=>l.responseMin>0).length)

  const statusLabel = { nuevo:"Nuevo lead", cita_agendada:"Cita agendada", presupuesto:"Presupuesto enviado", aceptado:"Aceptado", perdido:"Perdido" }
  const channelIcon = { WhatsApp:"💬", Web:"🌐", Llamada:"📞", Instagram:"📸", Referido:"🤝" }

  return (
    <div style={{ padding: 24 }}>
      <SectionTitle sub="Conversión de leads y presupuestos">Vista Comercial</SectionTitle>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <KpiCard label="Leads este mes" value="148" sub="↑ +18 vs noviembre" icon="🎯" accent={C.navy} small />
        <KpiCard label="Tiempo medio resp." value={`${avgResponse} min`} sub="↓ -3 min vs mes ant." icon="⚡" accent={C.green} small />
        <KpiCard label="Lead → cita" value="76%" sub="↑ +4 pts" icon="📅" accent={C.teal} small />
        <KpiCard label="Presup. pendientes" value={pendingBudget.length} sub={`${euro(pendingTotal)} en juego`} icon="📋" subColor={C.amber} small />
        <KpiCard label="Aceptación (€)" value={euro(acceptedTotal)} sub={`${accepted.length} presupuestos cerrados`} icon="✅" accent={C.green} small />
        <KpiCard label="Aceptación (%)" value="69%" sub="↑ +4 pts este mes" icon="📈" accent={C.purple} small />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Embudo de conversión — diciembre</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FUNNEL_DATA.map((f, i) => {
              const pct = Math.round(f.value / FUNNEL_DATA[0].value * 100)
              const conv = i > 0 ? Math.round(f.value / FUNNEL_DATA[i-1].value * 100) : 100
              return (
                <div key={f.stage}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: C.text }}>{f.stage}</span>
                    <span style={{ fontSize: 12, color: C.muted }}><strong style={{ color: f.color }}>{f.value}</strong>{i > 0 ? ` · ${conv}% conversión` : ""}</span>
                  </div>
                  <div style={{ background: "#F1F5F9", borderRadius: 4, height: 28, overflow: "hidden", display: "flex", alignItems: "center" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: f.color, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                      <span style={{ fontSize: 11, color: "#FFF", fontWeight: 600, whiteSpace: "nowrap" }}>{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Leads por canal</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={CHANNEL_DATA} cx="50%" cy="50%" innerRadius={34} outerRadius={54} dataKey="leads" paddingAngle={2}>
                  {CHANNEL_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {CHANNEL_DATA.map(c => {
                const total = CHANNEL_DATA.reduce((s,d)=>s+d.leads, 0)
                const pct = Math.round(c.leads/total*100)
                return (
                  <div key={c.name} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, display: "inline-block" }} />
                      {channelIcon[c.name]} {c.name}
                    </span>
                    <span style={{ fontSize: 12 }}><strong>{c.leads}</strong> <span style={{ color: C.muted }}>({pct}%)</span></span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Pipeline de leads recientes</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.bg }}>
                {["Paciente","Canal","Tratamiento","Presupuesto","Estado","Respuesta","Fecha"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEADS.map((l, i) => (
                <tr key={i} style={{ background: i%2===0?"#FFF":C.bg }}>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500, color: C.text }}>{l.name}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>{channelIcon[l.channel]} {l.channel}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12 }}>{l.treatment}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600, color: C.text }}>{euro(l.budget)}</td>
                  <td style={{ padding: "10px 14px" }}><Badge s={l.status} /></td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: l.responseMin <= 5 ? C.green : C.amber }}>{l.responseMin > 0 ? `${l.responseMin} min` : "—"}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{l.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── WHATSAPP IA ──────────────────────────────────────────────────────────────
function WhatsAppIA({ clinicName }) {
  const [messages, setMessages] = useState([])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, typing])

  useEffect(() => {
    if (!playing || step >= SCRIPT.length) { setPlaying(false); return }
    const isAgent = SCRIPT[step].from === "agent"
    const t1 = setTimeout(() => {
      if (isAgent) setTyping(true)
      const t2 = setTimeout(() => {
        setTyping(false)
        setMessages(prev => [...prev, SCRIPT[step]])
        setStep(s => s + 1)
      }, isAgent ? 1000 : 0)
      return () => clearTimeout(t2)
    }, messages.length === 0 ? 400 : 700)
    return () => clearTimeout(t1)
  }, [playing, step])

  const reset = () => { setMessages([]); setStep(0); setPlaying(false); setTyping(false) }

  const sendManual = async () => {
    if (!input.trim() || typing) return
    const userText = input.trim()
    const newHistory = [...messages, { from: "patient", text: userText }]
    setMessages(newHistory)
    setInput("")
    setTyping(true)
    const apiMessages = newHistory.map(m => ({ role: m.from === "patient" ? "user" : "assistant", content: m.text }))
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Eres el asistente virtual de WhatsApp de "${clinicName}", una clínica dental en España. Gestionas citas, respondes dudas sobre tratamientos y precios. Personalidad cercana y profesional. Máximo 5-6 líneas por respuesta. Emojis con moderación.

Info: horario L-V 9-20h, S 9-14h. Doctores: Dr. García (implantes), Dra. López (ortodoncia/estética), Dr. Martínez (endodoncia). Precios: limpieza 60€, empaste desde 80€, blanqueamiento 350€, ortodoncia invisible desde 2.800€, implante desde 1.200€, endodoncia desde 280€. Seguros: Sanitas, Adeslas, Asisa, Mapfre, DKV. Primera visita gratuita.`,
          messages: apiMessages
        })
      })
      const data = await res.json()
      setTyping(false)
      setMessages(prev => [...prev, { from: "agent", text: data.content?.[0]?.text || "Disculpa, ha habido un error. ¿Puedes repetirlo?" }])
    } catch {
      setTyping(false)
      setMessages(prev => [...prev, { from: "agent", text: "Disculpa, problema de conexión. ¿Puedes intentarlo de nuevo? 😊" }])
    }
  }

  const now = new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
  const max = WORD_DATA[0].freq

  return (
    <div style={{ padding: 24 }}>
      <SectionTitle sub="Métricas del agente y simulador en vivo">Vista WhatsApp IA</SectionTitle>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <RadialKpi value={71} label="Citas gestionadas por IA" color={C.teal} sub="↑ +6 pts vs mes anterior" />
        <RadialKpi value={63} label="Tratamientos vendidos por IA" color={C.navy} sub="sin intervención humana" />
        <RadialKpi value={12} label="Derivadas a humano" color={C.amber} sub="↓ meta: menos del 10%" />
        <Card style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Adopción IA — tendencia</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>% citas gestionadas automáticamente</div>
          <ResponsiveContainer width="100%" height={72}>
            <LineChart data={AI_MONTHLY}>
              <Line type="monotone" dataKey="pct" stroke={C.teal} strokeWidth={2.5} dot={{ r: 3, fill: C.teal, strokeWidth: 0 }} />
              <Tooltip formatter={v => [`${v}%`, "IA"]} labelStyle={{ fontSize: 11 }} contentStyle={{ fontSize: 12 }} />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>% tratamientos vendidos por IA</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Primera consulta cerrada sin intervención del equipo</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TREAT_SOLD_AI.map(({ name, ia }) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12 }}>{name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: ia >= 70 ? C.teal : ia >= 55 ? C.amber : C.muted }}>{ia}%</span>
                </div>
                <div style={{ background: "#F1F5F9", borderRadius: 4, height: 7 }}>
                  <div style={{ width: `${ia}%`, height: "100%", borderRadius: 4, background: ia >= 70 ? C.teal : ia >= 55 ? C.amber : C.navy }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>¿Qué preguntan los pacientes?</div>
            <span style={{ fontSize: 11, color: C.muted, background: C.bg, padding: "3px 8px", borderRadius: 6 }}>1.847 consultas</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center", justifyContent: "center", padding: "4px 0 10px" }}>
            {WORD_DATA.map(({ word, freq, color }) => {
              const ratio = freq / max
              return (
                <span key={word} title={`${freq} consultas`} style={{
                  fontSize: Math.round(11 + ratio * 14), fontWeight: ratio > 0.7 ? 700 : ratio > 0.4 ? 600 : 400,
                  color, opacity: 0.5 + ratio * 0.5, lineHeight: 1.3,
                  padding: ratio > 0.6 ? "2px 5px" : "1px 2px", borderRadius: 4,
                  background: ratio > 0.7 ? color + "18" : "transparent",
                }}>{word}</span>
              )
            })}
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, fontSize: 11, color: C.muted, textAlign: "center" }}>
            tamaño = frecuencia · color = categoría temática
          </div>
        </Card>
      </div>

      <Card style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0 }}>
          <div style={{ background: "#1a1a1a", borderRadius: 40, padding: "12px 10px", boxShadow: "0 16px 48px rgba(0,0,0,0.22)", width: 264 }}>
            <div style={{ background: "#FFF", borderRadius: 30, overflow: "hidden", height: 480, display: "flex", flexDirection: "column" }}>
              <div style={{ background: "#075E54", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, background: C.teal, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🦷</div>
                <div>
                  <div style={{ color: "#FFF", fontWeight: 600, fontSize: 13 }}>{clinicName}</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Agente IA · en línea</div>
                </div>
              </div>
              <div style={{ flex: 1, background: "#ECE5DD", padding: "8px 6px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
                {messages.length === 0 && !playing && (
                  <div style={{ textAlign: "center", marginTop: 60, color: "#777", fontSize: 12 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>Pulsa Reproducir para ver la demo
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.from === "agent" ? "flex-start" : "flex-end" }}>
                    <div style={{ background: m.from === "agent" ? "#FFF" : "#DCF8C6", padding: "6px 10px", borderRadius: m.from === "agent" ? "0 10px 10px 10px" : "10px 0 10px 10px", maxWidth: "84%", fontSize: 12, lineHeight: 1.55, color: "#111", whiteSpace: "pre-wrap", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
                      {m.text}
                      <div style={{ fontSize: 9, color: "#aaa", textAlign: "right", marginTop: 2 }}>{now}{m.from === "patient" && " ✓✓"}</div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div style={{ display: "flex" }}>
                    <div style={{ background: "#FFF", padding: "8px 12px", borderRadius: "0 10px 10px 10px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", display: "flex", gap: 4, alignItems: "center" }}>
                      {[0,1,2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "#aaa", display: "inline-block", animation: `bounce 1s ${j * 0.2}s infinite` }} />)}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
              <div style={{ background: "#F0F0F0", padding: "6px 8px", display: "flex", gap: 6, alignItems: "center" }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendManual()}
                  placeholder="Escribe un mensaje..." disabled={typing}
                  style={{ flex: 1, padding: "7px 10px", border: "none", borderRadius: 18, fontSize: 12, outline: "none", opacity: typing ? 0.6 : 1 }} />
                <button onClick={sendManual} disabled={typing} style={{ width: 32, height: 32, background: "#075E54", border: "none", borderRadius: "50%", cursor: typing ? "not-allowed" : "pointer", color: "#FFF", fontSize: 13, flexShrink: 0, opacity: typing ? 0.6 : 1 }}>➤</button>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>Simulador en vivo</h3>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 16, lineHeight: 1.7 }}>Reproduce la demo o escribe tú mismo — responde con IA real conectada a Claude.</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <button onClick={() => { if (step >= SCRIPT.length) reset(); else setPlaying(p => !p) }}
              style={{ padding: "9px 16px", background: playing ? C.amberL : C.teal, color: playing ? "#92400E" : "#FFF", border: `1.5px solid ${playing ? C.amber : C.teal}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {playing ? "⏸ Pausar" : step === 0 ? "▶ Reproducir" : step >= SCRIPT.length ? "↺ Repetir" : "▶ Continuar"}
            </button>
            {step > 0 && <button onClick={reset} style={{ padding: "9px 14px", background: "#FFF", color: C.text, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, cursor: "pointer" }}>↺</button>}
          </div>
          {[["📅","Reserva de cita","Consulta disponibilidad y confirma en tiempo real"],["🔔","Recordatorios","Aviso 24h antes · gestión de confirmaciones"],["💬","Seguimiento","Post-tratamiento y detección de nuevas necesidades"],["📊","CRM automático","Cada interacción queda registrada en el historial"],["🤝","Derivación","Escala a humano solo cuando es necesario (12%)"]].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, background: C.tealL, borderRadius: 10, padding: 12 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#065F46", lineHeight: 1.7 }}><strong>Tip:</strong> Escribe en el chat del teléfono para simular preguntas en directo ante el cliente. Responde con IA real.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── CONFIG + ROLE SCREENS ────────────────────────────────────────────────────
function ConfigScreen({ onNext }) {
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const ok = name.trim().length > 0
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.tealL} 0%, #fff 55%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#FFF", borderRadius: 20, border: `1px solid ${C.border}`, padding: "48px 40px", maxWidth: 460, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: C.tealL, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32 }}>🦷</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Demo Agente Dental IA</h1>
          <p style={{ color: C.muted, marginTop: 8, fontSize: 14 }}>Configura los datos antes de la reunión</p>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Nombre de la clínica *</label>
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && ok && onNext(name.trim(), city.trim())}
            placeholder="Ej: Clínica Dental Sonrisa"
            style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${ok ? C.teal : C.border}`, borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 6 }}>Ciudad <span style={{ color: C.muted, fontWeight: 400 }}>(opcional)</span></label>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ej: Sevilla"
            style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box" }} />
        </div>
        <button onClick={() => ok && onNext(name.trim(), city.trim())} disabled={!ok}
          style={{ width: "100%", padding: 14, background: ok ? C.teal : "#CBD5E1", color: "#FFF", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: ok ? "pointer" : "not-allowed" }}>
          Seleccionar rol →
        </button>
      </div>
    </div>
  )
}

function RoleScreen({ clinic, onSelect }) {
  const roles = [
    { id: "admin", icon: "👑", title: "Admin / Dirección", desc: "Acceso completo — finanzas, rentabilidad, comercial y operativa", tabs: "Resumen · Dirección · Agenda · Pacientes · Comercial · WhatsApp IA", color: C.navy, colorL: C.navyL },
    { id: "auxiliar", icon: "🗓️", title: "Auxiliar / Recepción", desc: "Vista operativa — agenda diaria, pacientes y agente IA", tabs: "Resumen · Agenda · Pacientes · WhatsApp IA", color: C.teal, colorL: C.tealL },
  ]
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.tealL} 0%, #fff 55%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 20 }}>🦷</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "8px 0 4px" }}>{clinic}</h1>
          <p style={{ color: C.muted, fontSize: 14 }}>Selecciona el rol para esta sesión</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {roles.map(r => (
            <button key={r.id} onClick={() => onSelect(r.id)}
              style={{ background: "#FFF", border: `2px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", textAlign: "left", cursor: "pointer", transition: "border 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.border = `2px solid ${r.color}`}
              onMouseLeave={e => e.currentTarget.style.border = `2px solid ${C.border}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, background: r.colorL, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{r.icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{r.title}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{r.desc}</div>
                  <div style={{ fontSize: 11, color: r.color, marginTop: 6, fontWeight: 500 }}>{r.tabs}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 20 }}>Puedes cambiar de rol en cualquier momento desde la barra superior</p>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("config")
  const [config, setConfig] = useState(null)
  const [role, setRole] = useState(null)
  const [tab, setTab] = useState("resumen")

  const TABS_ADMIN = [
    { id: "resumen", label: "📊 Resumen" },
    { id: "direccion", label: "💰 Dirección" },
    { id: "agenda", label: "📅 Agenda" },
    { id: "pacientes", label: "👥 Pacientes" },
    { id: "comercial", label: "🎯 Comercial" },
    { id: "whatsapp", label: "💬 WhatsApp IA" },
  ]
  const TABS_AUX = [
    { id: "resumen", label: "📊 Resumen" },
    { id: "agenda", label: "📅 Agenda" },
    { id: "pacientes", label: "👥 Pacientes" },
    { id: "whatsapp", label: "💬 WhatsApp IA" },
  ]

  if (screen === "config") return <ConfigScreen onNext={(name, city) => { setConfig({ name, city }); setScreen("role") }} />
  if (screen === "role") return <RoleScreen clinic={config.name} onSelect={r => { setRole(r); setTab("resumen"); setScreen("app") }} />

  const tabs = role === "admin" ? TABS_ADMIN : TABS_AUX
  const roleInfo = { admin: ["👑", C.navy, C.navyL, "Admin"], auxiliar: ["🗓️", C.teal, C.tealL, "Auxiliar"] }
  const [rIcon, rColor, rColorL, rLabel] = roleInfo[role]

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ background: "#FFF", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "stretch", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>🦷</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{config.name}</div>
            {config.city && <div style={{ fontSize: 11, color: C.muted }}>{config.city}</div>}
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, overflowX: "auto" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "0 16px", minHeight: 48, background: "transparent", border: "none", borderBottom: tab === t.id ? `2.5px solid ${C.teal}` : "2.5px solid transparent", color: tab === t.id ? C.teal : C.muted, fontWeight: tab === t.id ? 600 : 400, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: rColorL, borderRadius: 20, padding: "4px 10px", cursor: "pointer" }}
            onClick={() => setScreen("role")}>
            <span style={{ fontSize: 14 }}>{rIcon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: rColor }}>{rLabel}</span>
          </div>
          <button onClick={() => { setConfig(null); setRole(null); setScreen("config") }}
            style={{ padding: "5px 10px", border: `1px solid ${C.border}`, background: "#FFF", borderRadius: 6, fontSize: 11, cursor: "pointer", color: C.muted }}>
            ⚙
          </button>
        </div>
      </div>

      {tab === "resumen" && <Resumen role={role} />}
      {tab === "direccion" && role === "admin" && <Direccion />}
      {tab === "agenda" && <Agenda />}
      {tab === "pacientes" && <Pacientes />}
      {tab === "comercial" && role === "admin" && <Comercial />}
      {tab === "whatsapp" && <WhatsAppIA clinicName={config.name} />}
    </div>
  )
}