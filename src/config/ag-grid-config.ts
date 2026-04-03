import type { GridOptions } from 'ag-grid-community';

export const defaultGridOptions: GridOptions = {
  pagination: true,
  paginationPageSize: 50,
  paginationPageSizeSelector: [25, 50, 100, 250],
  animateRows: true,
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 80,
  },
  rowHeight: 40,
  headerHeight: 44,
};

export function getGridTheme(isDark: boolean): string {
  return isDark ? 'ag-theme-alpine-dark' : 'ag-theme-alpine';
}
