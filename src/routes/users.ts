import { Router } from 'express';
import { getAllUsers, getUserById, createUser } from '../dal/users.js';

const router = Router();

// TODO: Student implementation - Part 1: User Routes
// GET /users
router.get('/', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await getUserById(id);

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
});

// POST /users
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'name and email are required' });
    return;
  }

  const user = await createUser({ name, email });
  res.status(201).json(user);
});

export default router;
