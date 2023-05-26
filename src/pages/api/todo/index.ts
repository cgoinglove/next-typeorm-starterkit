// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getService } from '@/server/provider';
import { TodoService } from '@/server/service/todo.service';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const todoService = getService(TodoService);
  const { content, id } = req.body;

  if (req.method == 'POST') {
    console.log(content);
    const entity = await todoService.createTodo(content);
    res.send(JSON.parse(JSON.stringify(entity)));
  } else if (req.method == 'PUT') {
    await todoService.updateComplete(id, true);
  } else return res.status(400).send('error');

  res.send('ok');
}
