export interface IStatus {
  statusCode: number;
  statusType: "success" | "error" | "warning";
  statusDesc: string;
}

export interface IResponseStatus {
  statusList: IStatus[];
}

export interface IResponse<T> {
  responseStatusList: IResponseStatus;
  responseObject: {
    data?: T;
    pagination?:IPagination;
    error?: any;
  };
}

export interface IPagination {
  currentPage: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}
