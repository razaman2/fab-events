import ArrayPaginator from './ArrayPaginator';
import FirestorePaginator from './FirestorePaginator';

export default class Paginator {
  static paginate(data: any, controller?: {page: number}) {
    if (Array.isArray(data)) {
      return new ArrayPaginator(data, controller);
    } else if (typeof data == 'object') {
      return new FirestorePaginator(data, controller);
    } else {
      throw new Error('The provided data cannot be paginated!');
    }
  }
}
