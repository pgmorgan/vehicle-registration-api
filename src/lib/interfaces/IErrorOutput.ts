// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default interface IErrorOutput<T = any> {
  code: number;
  data?: T;
  message: string;
}
