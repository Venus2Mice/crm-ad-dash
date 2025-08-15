
export const exportToCsv = (filename: string, rows: object[]): void => {
  if (!rows || rows.length === 0) {
    alert("No data available to export.");
    return;
  }

  const processRow = (row: any): string => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : String(row[j]);
      if (String(row[j]).includes(',')) {
        innerValue = '"' + innerValue + '"';
      }
      if (j > 0) {
        finalVal += ',';
      }
      finalVal += innerValue;
    }
    return finalVal + '\r\n';
  };

  const headers = Object.keys(rows[0]);
  let csvFile = processRow(headers);

  for (const item of rows) {
    const rowValues = headers.map(header => (item as any)[header]);
    csvFile += processRow(rowValues);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename + ".csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    alert("CSV export is not supported in your browser.");
  }
};
