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

  // ── Table ─────────────────────────────────────────────────
  const rows = records.map((r) => [
    formatDate(r.checkIn),
    formatTime(r.checkIn),
    r.checkOut ? formatTime(r.checkOut) : '—',
    r.breakMinutes > 0 ? `${r.breakMinutes}m` : '—',
    formatHours(r.hours),
    r.isHoliday ? '🎉 Holiday' : '—',
  ]);

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

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(
    14,
    finalY,
    182,
    summary.holidayBonus > 0 ? 38 : 28,
    3,
    3,
    'F',
  );

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Summary', 20, finalY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Normal hours: ${formatHours(summary.normalHours)}`,
    20,
    finalY + 17,
  );
  doc.text(
    `Holiday hours: ${formatHours(summary.holidayHours)}`,
    80,
    finalY + 17,
  );
  doc.text(`Total hours: ${formatHours(summary.totalHours)}`, 150, finalY + 17);

  if (summary.holidayBonus > 0) {
    doc.setTextColor(217, 119, 6); // amber
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Holiday bonus (+50%): +${formatHours(summary.holidayBonus)}`,
      20,
      finalY + 28,
    );
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
