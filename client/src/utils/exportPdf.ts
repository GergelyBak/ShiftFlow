import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportAttendancePdf = (
  user: { firstName: string; lastName: string; email: string },
  records: any[],
  monthLabel: string,
  summary: {
    normalHours: number;
    holidayHours: number;
    totalHours: number;
    holidayBonus: number;
    vacationDays?: number;
    sickDays?: number;
    timeOffDays?: number;
    expectedHours?: number | null;
    overtime?: number | null;
    overtimeBalance?: number | null;
  },
) => {
  const doc = new jsPDF();

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatHours = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.round((h - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  // ── Header ────────────────────────────────────────────────
  doc.setFillColor(22, 163, 74); // green-600
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ShiftFlow', 14, 13);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Attendance Report', 14, 21);

  doc.setFontSize(10);
  doc.text(monthLabel, 210 - 14, 13, { align: 'right' });
  doc.text(
    `Generated: ${new Date().toLocaleDateString('de-DE')}`,
    210 - 14,
    21,
    { align: 'right' },
  );

  // ── User info ─────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${user.firstName} ${user.lastName}`, 14, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(user.email, 14, 49);

  const typeLabel = (type: string) => {
    if (type === 'paid_vacation') return 'Paid Vacation';
    if (type === 'sick_leave') return 'Sick Leave';
    return '';
  };

  // ── Table ─────────────────────────────────────────────────
  const rows = records.map((r) => {
    const isAbsence = r.type === 'paid_vacation' || r.type === 'sick_leave';
    const note = isAbsence
      ? typeLabel(r.type)
      : r.isHoliday
        ? 'Holiday'
        : '—';
    return [
      formatDate(r.date),
      isAbsence ? '—' : (r.checkIn ? formatTime(r.checkIn) : '—'),
      isAbsence ? '—' : (r.checkOut ? formatTime(r.checkOut) : '—'),
      isAbsence ? '—' : (r.breakMinutes > 0 ? `${r.breakMinutes}m` : '—'),
      formatHours(r.hours),
      note,
    ];
  });

  autoTable(doc, {
    startY: 56,
    head: [['Date', 'Check-in', 'Check-out', 'Break', 'Hours', 'Note']],
    body: rows,
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Summary ───────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  const hasBonus = summary.holidayBonus > 0;
  const hasAbsences = (summary.vacationDays ?? 0) > 0 || (summary.sickDays ?? 0) > 0 || (summary.timeOffDays ?? 0) > 0;
  const hasOvertime = summary.overtime != null && summary.expectedHours != null;
  const hasBalance = summary.overtimeBalance != null;
  const boxHeight = 28 + (hasBonus ? 11 : 0) + (hasAbsences ? 11 : 0) + (hasOvertime ? 11 : 0) + (hasBalance ? 11 : 0);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY, 182, boxHeight, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Summary', 20, finalY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Normal hours: ${formatHours(summary.normalHours)}`, 20, finalY + 17);
  doc.text(`Holiday hours: ${formatHours(summary.holidayHours)}`, 80, finalY + 17);
  doc.text(`Total hours: ${formatHours(summary.totalHours)}`, 150, finalY + 17);

  let nextY = finalY + 17;

  if (hasBonus) {
    nextY += 11;
    doc.setTextColor(217, 119, 6);
    doc.setFont('helvetica', 'bold');
    doc.text(`Holiday bonus (+50%): +${formatHours(summary.holidayBonus)}`, 20, nextY);
  }

  if (hasAbsences) {
    nextY += 11;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    if ((summary.vacationDays ?? 0) > 0) {
      doc.text(`Paid Vacation: ${summary.vacationDays} day(s) (${formatHours((summary.vacationDays ?? 0) * 8)})`, 20, nextY);
    }
    if ((summary.sickDays ?? 0) > 0) {
      const col = (summary.vacationDays ?? 0) > 0 ? 110 : 20;
      doc.text(`Sick Leave: ${summary.sickDays} day(s) (${formatHours((summary.sickDays ?? 0) * 8)})`, col, nextY);
    }
    if ((summary.timeOffDays ?? 0) > 0) {
      const col = (summary.vacationDays ?? 0) > 0 || (summary.sickDays ?? 0) > 0 ? 110 : 20;
      doc.text(`Time Off: ${summary.timeOffDays} day(s) (${formatHours((summary.timeOffDays ?? 0) * 8)})`, col, nextY);
    }
  }

  if (hasOvertime) {
    nextY += 11;
    const ot = summary.overtime!;
    const sign = ot >= 0 ? '+' : '';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(ot >= 0 ? 22 : 220, ot >= 0 ? 163 : 38, ot >= 0 ? 74 : 38);
    doc.text(
      `Overtime: ${sign}${formatHours(Math.abs(ot))}  (Expected: ${formatHours(summary.expectedHours!)})`,
      20,
      nextY,
    );
  }

  if (hasBalance) {
    nextY += 11;
    const bal = summary.overtimeBalance!;
    const sign = bal >= 0 ? '+' : '';
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(bal >= 0 ? 22 : 220, bal >= 0 ? 163 : 38, bal >= 0 ? 74 : 38);
    doc.text(`Overall balance: ${sign}${formatHours(Math.abs(bal))}`, 20, nextY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('(cumulative overtime incl. all months)', 80, nextY);
  }

  // ── Footer ────────────────────────────────────────────────
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('© ShiftFlow 2026', 105, 290, { align: 'center' });

  // ── Save ──────────────────────────────────────────────────
  const fileName = `ShiftFlow_${user.lastName}_${monthLabel.replace(' ', '_')}.pdf`;
  doc.save(fileName);
};
