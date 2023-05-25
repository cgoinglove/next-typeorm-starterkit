import { connectionHolder, getDataSource } from '@/server/database/datasource';

import { ObjectLiteral, Repository } from 'typeorm';

interface Class {
  new (...args: any[]): any;
}

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

export function Inject<Service extends ObjectLiteral>(
  service: new (...args: any[]) => Service,
): any {
  return (target: ObjectLiteral, filedName: string, index?: number) => {
    Object.defineProperty(target, filedName, {
      writable: false,
      value: Provider.getService(service),
    });
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
