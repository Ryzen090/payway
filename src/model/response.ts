export default class APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;

  constructor(success: boolean, data?: T, message?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
  }

  toJSON() {
    return {
      success: this.success,
      data: this.data,
      message: this.message,
    };
  }

  promise(): Promise<APIResponse<T>> {
    return Promise.resolve(this);
  }
}
