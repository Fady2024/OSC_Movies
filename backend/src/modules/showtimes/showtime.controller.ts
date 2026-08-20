import { Request, Response } from "express";
import * as showtimeService from "./showtime.service";

export const getShowtimes = async (req: Request, res: Response) => {
  const { movie, date, hallName, search, status, sort, page, limit } = req.query;

  const result = await showtimeService.getShowtimes({
    movie: movie as string,
    date: date as string,
    hallName: hallName as string,
    search: search as string,
    status: status as "all" | "upcoming" | "past",
    sort: sort as "date-asc" | "date-desc" | "seats-asc" | "seats-desc",
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 50,
  });

  res.json(result);
};

export const getShowtimeById = async (req: Request, res: Response) => {
  const showtime = await showtimeService.getShowtimeById(String(req.params.id));
  res.json({ data: showtime });
};

export const createShowtime = async (req: Request, res: Response) => {
  const showtime = await showtimeService.createShowtime(req.body);
  res.status(201).json({ data: showtime });
};

export const updateShowtime = async (req: Request, res: Response) => {
  const showtime = await showtimeService.updateShowtime(String(req.params.id), req.body);
  res.json({ data: showtime });
};

export const deleteShowtime = async (req: Request, res: Response) => {
  await showtimeService.deleteShowtime(String(req.params.id));
  res.status(204).send();
};

export const getAvailableSeats = async (req: Request, res: Response) => {
  const seats = await showtimeService.getAvailableSeats(String(req.params.id));
  res.json({ data: seats });
};
