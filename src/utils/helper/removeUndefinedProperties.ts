export default function removeUndefinedProperties<T>(obj: T): T {
  Object.keys(obj).forEach((key: string) => {
    if (obj[key as keyof T] === undefined) {
      delete obj[key as keyof T];
    }
  });
  return obj;
}
