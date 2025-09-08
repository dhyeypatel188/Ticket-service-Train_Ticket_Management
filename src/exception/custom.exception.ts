import { IResponse } from "../Interface/response.inerfaces";
import { ResponseUtil } from "../utils/response.utils";

export class CustomException extends Error {
  public response: IResponse<null>;

  constructor(statusCode: number, message: string, errorDetails?: any) {
    super(message);
    this.response = ResponseUtil.error(statusCode, message, errorDetails);
  }

  static fromError(error: Error, statusCode: number = 500): CustomException {
    return new CustomException(statusCode, error.message, error.stack);
  }
}
