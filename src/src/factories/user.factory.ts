import { setSeederFactory } from 'typeorm-extension';
import { User } from '../entities/user.entity';
import { faker } from '@faker-js/faker';
import { genSaltSync, hashSync } from 'bcrypt';
import { Status } from '../core/constants/enums';

export default setSeederFactory(User, () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const middleName = faker.person.middleName();
  const salt = genSaltSync(parseInt(process.env.SALT_ROUND));
  const email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@mailinator.com';
  const phone = faker.phone.number({
    style: 'international',
  });
  const password = hashSync('password', salt);

  const userObject = {
    firstName,
    lastName,
    middleName,
    email,
    phone,
    password,
    isActive: Status.Active,
  };
  const user = new User();
  return Object.assign(user, userObject);
});
