import { Expose } from 'class-transformer';

export class NINResult {
  @Expose()
  firstname: string;

  @Expose()
  lastname: string;

  @Expose()
  dob: string;

  @Expose()
  phone: string;

  @Expose()
  gender: string;

  @Expose()
  state_orgin: string;

  @Expose()
  lga_orgin: string;

  @Expose()
  photo: string;

  status: number;
}
