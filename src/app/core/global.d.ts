declare module 'jspdf' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface jsPDF {
    autoTable: (options: any) => void;
  }
}
