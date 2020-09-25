export default class FirestoreUpdate {
  public constructor(protected database: any) {
  }

  public create(params: { data: Update, batch?: { set: Function } }) {
    const doc = this.database().collection('updates').doc();

    const { batch, data } = params;

    const payload = {
      ...data,
      id: doc.id
    };

    return batch ? batch.set(doc, payload) : doc.set(payload);
  }
}

interface Update {
  before: any,
  after: any,
  createdBy?: string,
  belongsTo: Array<string>,
  createdAt: object,
  type: string,
  operation: string
}
