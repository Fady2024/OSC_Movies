import { Request, Response } from "express";
import * as reviewService from "./review.service";
import { AuthPayload } from "@/common/types";

const authUser = (req: Request): AuthPayload => req.user as AuthPayload;

export const createReview = async (req: Request, res: Response) => {
  const review = await reviewService.createReview(
    authUser(req).sub,
    String(req.params.id),
    req.body
  );
  res.status(201).json({ data: review });
};

export const listReviews = async (req: Request, res: Response) => {
  const result = await reviewService.listReviews(String(req.params.id), {
    page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
    limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 10,
  });
  res.json({ ...result });
};

export const getMyReview = async (req: Request, res: Response) => {
  const result = await reviewService.getMyReview(
    authUser(req).sub,
    String(req.params.id)
  );
  res.json({ ...result });
};

export const updateReview = async (req: Request, res: Response) => {
  const review = await reviewService.updateReview(
    authUser(req).sub,
    String(req.params.id),
    req.body
  );
  res.json({ data: review });
};

export const deleteReview = async (req: Request, res: Response) => {
  await reviewService.deleteReview(authUser(req).sub, String(req.params.id));
  res.status(204).send();
};