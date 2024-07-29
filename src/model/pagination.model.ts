export class PaginationResponse<T> {
    results: T[];
    currentPage: number;
    pageCount: number;
    pageSize: number;
    rowCount: number;
    firstRowOnPage: number;
    lastRowOnPage: number;

    constructor(data: T[], rowCount: number, currentPage: number, pageSize: number) {
        this.results = data;
        this.rowCount = rowCount;
        this.pageSize = pageSize;
        this.currentPage = currentPage;
        this.pageCount = Math.ceil(rowCount / pageSize);
        this.firstRowOnPage = ((currentPage - 1) * pageSize) + 1;
        this.lastRowOnPage = currentPage * pageSize;
        if (this.lastRowOnPage > rowCount) {
            this.lastRowOnPage = rowCount;
        }
    }
}