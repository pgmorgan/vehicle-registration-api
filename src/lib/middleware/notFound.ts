import { Request, Response } from "express";

import ErrorOutput from "../interfaces/IErrorOutput";

export default async function notFound(req: Request, res: Response): Promise<void> {
  const errRes: ErrorOutput = {
    code: 404,
    message: "Not Found",
  };
  res.status(404).send(errRes);
}
