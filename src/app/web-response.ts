export class WebResponse<T> {
  data?: T;
  accessToken?: string;
  errors?: string;
  paging?: Paging;
}

class Paging {
  size: number;
  total_page: number;
  current_page: number;
}
