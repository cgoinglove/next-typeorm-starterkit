import { Todo } from '@/server/entities/todo.entity';

export default function Card(props: {
  todo: Todo;
  onComplete: (id: string) => void;
}) {
  return (
    <div
      onClick={() => props.onComplete(props.todo.id)}
      style={{
        cursor: 'pointer',
        padding: '1rem 1.2rem',
        borderRadius: '10px',
        background: props.todo.complete ? '#7ef39cb0' : '#9a9aadc7',
        margin: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{String(props.todo.createdAt)}</span>
      <span>{props.todo.content}</span>
      <button>{props.todo.complete ? '완료' : ' 진행중 '}</button>
    </div>
  );
}
