import Head from 'next/head';

import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import { getService } from '@/server/provider';
import { TodoService } from '@/server/service/todo.service';
import { Todo } from '@/server/entities/todo.entity';
import Card from '@/components/Card';
import { useRef, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const getServerSideProps = async () => {
  const todoService = await getService(TodoService).findAll();
  return {
    props: {
      items: JSON.parse(JSON.stringify(todoService)),
    },
  };
};

export default function Home(props: { items: Todo[] }) {
  const [todoList, setTodo] = useState([...props.items]);

  const input = useRef<HTMLInputElement>(null);
  const createTodo = () => {
    const content = input.current?.value;
    if (!content) return alert('내용을 작성하세요~');
    fetch('http://localhost:3000/api/todo', {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
      .then(response => {
        if (response.status == 200) {
          response.json().then((data: Todo) => {
            setTodo(before => [...before, data]);
          });
        }
      })
      .catch(error => {
        // error 처리
        console.error(error);
      });
  };

  const todoComplete = (id: string) => {
    fetch('http://localhost:3000/api/todo', {
      method: 'PUT',
      body: JSON.stringify({ id }),
    }).then(() => {
      setTodo(before => {
        const list = [...before];
        list.find(todo => id == todo.id)!.complete = true;
        return list;
      });
    });
  };

  return (
    <>
      <Head>
        <title>use typeorm</title>
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <div style={{}}>
          <input ref={input} />
          <button onClick={createTodo}>등록</button>
        </div>
        {todoList.length ? (
          <div
            style={{
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {todoList.map(todo => (
              <Card todo={todo} key={todo.id} onComplete={todoComplete} />
            ))}
          </div>
        ) : (
          <span>todo를 작성해주세요.</span>
        )}
      </main>
    </>
  );
}
