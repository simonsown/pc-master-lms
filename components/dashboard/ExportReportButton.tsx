'use client';

import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Download, FileText, Table as TableIcon } from 'lucide-react';

// PDF Styles
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff' },
  header: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCell: { margin: 'auto', marginTop: 5, fontSize: 10 }
});

// PDF Content
const MyDocument = ({ data }: { data: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>STUDENT PROGRESS REPORT - PC MASTER LMS</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Student</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Progress (%)</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Avg Score</Text></View>
          <View style={styles.tableCol}><Text style={styles.tableCell}>Status</Text></View>
        </View>
        {data.map((row, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.progress}%</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.avgScore}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{row.status}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function ExportReportButton({ data, filename = 'report' }: { data: any[], filename?: string }) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const exportCSV = () => {
    const headers = ['Student,Progress(%),AvgScore,Status\n'];
    const rows = data.map(r => `${r.name},${r.progress},${r.avgScore},${r.status}\n`);
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={exportCSV}
        className="flex items-center gap-2 px-4 py-2 bg-bg-elevated text-text-primary rounded-lg border border-border-default hover:bg-bg-hover transition-all text-sm font-bold"
      >
        <TableIcon size={16} /> CSV
      </button>

      {isMounted && (
        <PDFDownloadLink document={<MyDocument data={data} />} fileName={`${filename}.pdf`}>
          {({ loading }) => (
            <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-black rounded-lg font-bold hover:brightness-110 shadow-lg transition-all text-sm">
              <FileText size={16} /> {loading ? '...' : 'PDF'}
            </button>
          )}
        </PDFDownloadLink>
      )}
    </div>
  );
}
