export function getFirestoreTimestamp(timestamp: { toMillis: Function }) {
  try {
    return timestamp.toMillis();
  } catch (e) {
    return Date.now();
  }
}

/**
 * lowercase the input string then uppercase only the first character.
 */
export function ucf(string: string) {
  return string.split(/\s+/).map((string) => {
      return string.toLowerCase().replace(/^(\w)/, ($1) => $1.toUpperCase());
  }).join(' ');
}

export class FirestoreArray {
  constructor(protected firestore: { FieldValue: { arrayRemove: Function, arrayUnion: Function } }) {}

  public replace(ref: object, item: { before: any, after: any, key: string }, batch: { update: Function }) {
    batch.update(ref, {
      [item.key]: this.firestore.FieldValue.arrayRemove(item.before)
    });
    batch.update(ref, {
      [item.key]: this.firestore.FieldValue.arrayUnion(item.after)
    });
  }
}
