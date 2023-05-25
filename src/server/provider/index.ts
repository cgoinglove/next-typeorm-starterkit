import { connectionHolder, getDataSource } from '@/server/database/datasource';

import { ObjectLiteral, Repository } from 'typeorm';

interface Class {
  new (...args: any[]): any;
}

/** @Read Service 의 함수는 async 하지 않을 일이 없어서 무조건 커넥션 홀더를 거치고 실행시킨다 async 한 connection 과정을 bootstrap 하기 힘든 프레임워크다 여럿 시도를 했는데 이게 최선인 것 같다.*/
const serviceAsyncProxy = (obj: any) =>
  new Proxy(obj, {
    get(target, key) {
      const value = target[key];
      if (typeof value == 'function') {
        return async function (...args: any) {
          await connectionHolder.promise;
          return value.call(target, ...args);
        };
      }
      return value;
    },
  });

class Provider {
  private static repositories: Map<string, Repository<ObjectLiteral>> =
    new Map();
  private static services: Map<string, ObjectLiteral> = new Map();

  static registerService<T extends ObjectLiteral>(
    constructor: new () => T,
    obj?: any,
  ) {
    console.log(`register services ${constructor.name}`);
    if (!Provider.services.has(constructor.name))
      Provider.services.set(
        constructor.name,
        obj ?? serviceAsyncProxy(new constructor()),
      );
  }
  static registerRepository<Entity extends Class>(entity: Entity) {
    console.log(`register repository ${entity.name}`);
    if (!Provider.repositories.has(entity.name))
      Provider.repositories.set(
        entity.name,
        getDataSource().getRepository(entity),
      );
  }

  static getService<Service extends ObjectLiteral>(
    constructor: new (...args: any[]) => Service,
  ): Service {
    !Provider.services.has(constructor.name) &&
      Provider.registerService(constructor);
    return Provider.services.get(constructor.name) as Service;
  }
  static getRepository<Entity extends Class>(
    constructor: new (...args: any[]) => Entity,
  ): Repository<Entity> {
    !Provider.repositories.has(constructor.name) &&
      Provider.registerRepository(constructor);
    return Provider.repositories.get(constructor.name) as Repository<Entity>;
  }
}

export const getService = <Service extends ObjectLiteral>(
  service: new (...args: any[]) => Service,
): Service => Provider.getService(service);

export function Service(constructor: new (...args: any[]) => any) {
  Provider.registerService(constructor);
}

export function Inject<T extends Class>(target: T): any {
  return function (constructor: Function) {
    constructor.prototype[target.name] = Provider.getService(target);
  };
}

export function InjectRepository<Entity extends Class>(entity: Entity): any {
  return (target: ObjectLiteral, filedName: string, index?: number) => {
    Object.defineProperty(target, filedName, {
      writable: false,
      value: Provider.getRepository(entity),
    });
  };
}
