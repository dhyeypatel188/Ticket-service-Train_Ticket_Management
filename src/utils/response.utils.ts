import { IResponse, IStatus , IPagination } from "../Interface/response.inerfaces";

export class ResponseUtil {
  static success<T>(
    data: T,
    message: string = "Operation successful",
    pagination?:IPagination
  ): IResponse<T> {
    return {
      responseStatusList: {
        statusList: [
          {
            statusCode: 200,
            statusType: "success",
            statusDesc: message,
          },
        ],
      },
      responseObject: {
        data,
 ...(pagination && { pagination }),      },
    };
  }

  static error(
    statusCode: number,
    message: string,
    error?: any
  ): IResponse<null> {
    return {
      responseStatusList: {
        statusList: [
          {
            statusCode,
            statusType: "error",
            statusDesc: message,
          },
        ],
      },
      responseObject: {
        error,
      },
    };
  }

  static customStatus(statusList: IStatus[], data?: any): IResponse<any> {
    return {
      responseStatusList: {
        statusList,
      },
      responseObject: {
        data,
      },
    };
  }
}
