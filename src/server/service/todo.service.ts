import { Repository } from 'typeorm';
import { Todo } from '../entities/todo.entity';
import { Inject, InjectRepository, Service } from '../provider';

@Service
export class TodoService {
  @InjectRepository(Todo) todoRepository: Repository<Todo>;
  //  @Inject(UserService) userService:UserService; // 서비스 inject

  async findAll() {
    return this.todoRepository.find({});
  }
  async createTodo(content: string) {
    return this.todoRepository.save({ content });
  }
  async updateComplete(id: string, complete: boolean) {
    const todo = await this.todoRepository.findOneBy({ id });
    if (!todo) throw new Error('400');
    todo.complete = complete;
    return this.todoRepository.save(todo);
  }
  async deleteTodo(id: string) {
    const exist = await this.todoRepository.exist({ where: { id } });
    if (!exist) throw new Error('400');
    return this.todoRepository.delete({ id });
  }
}
