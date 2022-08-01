// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface IErrorOutput<T = any> {
  code: number;
  data?: T;
  message: string;
}

export default IErrorOutput;
