import { Router } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

// TODO: Student implementation - Part 1: Ticket Routes
// GET /tickets
router.get('/', async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const offset = req.query.offset ? Number(req.query.offset) : undefined;
  const status = req.query.status as string | undefined;

  const tickets = await getAllTickets({ limit, offset, status });
  res.json(tickets);
});

// GET /tickets/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const ticket = await getTicketById(id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.json(ticket);
});
// POST /tickets
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  try {
    const ticket = await createTicket({
      title,
      description,
      creator_id: res.locals.userId,
    });
    res.status(201).json(ticket);
  } catch {
    res.status(400).json({ error: 'Could not crete ticket' });
  }
});
// PATCH /tickets/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    res
      .status(400)
      .json({ error: 'status must be TODO, IN_PROGRESS, or DONE' });
    return;
  }

  const ticket = await updateTicketStatus(id, status);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.json(ticket);
});
// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
// GET /tickets/:id/time

export default router;
